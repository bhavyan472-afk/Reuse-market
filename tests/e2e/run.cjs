// End-to-end test for ReUse Market against a running server + the live Supabase project.
// Usage: npm run build && npm start   (in another terminal)  then  npm run test:e2e [baseUrl]
// Requires the seed data (demo accounts). Uses Rohan (seller) and Priya (buyer).
// Creates only data titled "E2E TEST …" (plus storage files under the seller's own folder) and removes it at the end.
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");
const APP = path.join(__dirname, "..", "..");
const BASE = process.argv[2] || "http://localhost:3000";
const { createClient } = require(path.join(APP, "node_modules/@supabase/supabase-js"));
const env = Object.fromEntries(
  fs.readFileSync(path.join(APP, ".env.local"), "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.split("=")[0], l.slice(l.indexOf("=") + 1).trim().replace(/^['"]|['"]$/g, "")]),
);
const sb = () => createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const IMG = path.join(__dirname, "img");
const SHOTS = path.join(__dirname, "shots");
// A >5 MB "image" to check the client-side size limit (generated, not committed).
const TOO_BIG = path.join(require("os").tmpdir(), "reuse-e2e-toobig.png");
fs.writeFileSync(TOO_BIG, Buffer.alloc(6 * 1024 * 1024, 1));
fs.mkdirSync(SHOTS, { recursive: true });

const SELLER = { email: "rohan.mehta@reusemarket.test", password: "ReUse@12345", id: "a1000000-0000-4000-8000-000000000003" };
const BUYER = { email: "priya.nair@reusemarket.test", password: "ReUse@12345", id: "a1000000-0000-4000-8000-000000000002" };
const SEED_MACBOOK = "b2000000-0000-4000-8000-000000000004";
const STAMP = Date.now().toString(36);
const TITLE = `E2E TEST Casio fx-991EX calculator ${STAMP}`;

const results = [];
const livePages = {};
const ready = async (p) => { await p.waitForLoadState("networkidle").catch(() => {}); };
const rec = (area, name, status, detail = "") => {
  results.push({ area, name, status, detail });
  console.log(`${status.padEnd(10)} [${area}] ${name}${detail ? " — " + detail : ""}`);
};
const step = async (area, name, fn) => {
  try {
    const d = await fn();
    rec(area, name, "PASS", typeof d === "string" ? d : "");
    return true;
  } catch (e) {
    for (const [label, pg] of Object.entries(livePages)) {
      await pg.screenshot({ path: path.join(SHOTS, `FAIL-${name.replace(/[^a-z0-9]+/gi, "_").slice(0, 40)}-${label}.png`) }).catch(() => {});
    }
    rec(area, name, "FAIL", String(e.message).split("\n")[0].slice(0, 200));
    return false;
  }
};
const assert = (c, m) => { if (!c) throw new Error(m); };

const consoleErrors = [];
function watch(page, label) {
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`${label}: ${m.text().slice(0, 200)}`); });
  page.on("pageerror", (e) => consoleErrors.push(`${label} pageerror: ${e.message.slice(0, 200)}`));
}

async function login(page, who, next = "/") {
  await page.goto(`${BASE}/login?next=${encodeURIComponent(next)}`);
  await page.fill("#email", who.email);
  await page.fill("#password", who.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 });
}

(async () => {
  const sellerApi = sb();
  await sellerApi.auth.signInWithPassword(SELLER);
  const { data: origProfile } = await sellerApi.from("profiles").select("bio").eq("id", SELLER.id).single();
  let listingId = null;

  const browser = await chromium.launch();
  const mk = async (opts = {}) => {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      geolocation: { latitude: 28.6139, longitude: 77.209 },
      permissions: ["geolocation", "clipboard-read", "clipboard-write"],
      ...opts,
    });
    return ctx;
  };

  try {
    // ------------------------------------------------------------ anonymous / routes
    const anonCtx = await mk();
    const anon = await anonCtx.newPage();
    watch(anon, "anon");
    livePages.anon = anon;

    await step("Pages", "home renders seeded listings", async () => {
      await anon.goto(BASE);
      await anon.getByRole("heading", { name: "Recently listed" }).waitFor();
      await anon.locator("article").nth(7).waitFor({ timeout: 30000 }); // grid streams in via Suspense
      const cards = await anon.locator("article").count();
      assert(cards >= 8, `only ${cards} cards`);
      assert(!(await anon.getByText("Setup needed").count()), "setup banner visible");
      return `${cards} cards`;
    });
    await step("Pages", "listing card shows distance (geolocation granted)", async () => {
      await anon.goto(`${BASE}/marketplace`);
      await anon.getByText(/km away/).first().waitFor({ timeout: 15000 });
    });
    for (const p of ["/sell", "/dashboard", "/messages", "/profile", "/saved", `/listings/${SEED_MACBOOK}/edit`]) {
      await step("Protected routes", `${p} → login with next`, async () => {
        await anon.goto(BASE + p);
        const u = new URL(anon.url());
        assert(u.pathname === "/login" && u.searchParams.get("next") === p, `landed on ${anon.url()}`);
      });
    }
    await step("Pages", "unknown listing → 404 page", async () => {
      const r = await anon.goto(`${BASE}/listings/00000000-0000-4000-8000-000000000000`);
      await anon.getByText("new home").waitFor();
      return `HTTP ${r.status()} (bots get 404 via metadata)`;
    });
    await step("Search", "keyword 'macbook' → 2 results", async () => {
      await anon.goto(`${BASE}/marketplace`);
      await anon.fill("#market-q", "macbook");
      await anon.press("#market-q", "Enter");
      await anon.waitForURL(/q=macbook/);
      await anon.getByText("1–2 of 2 listings").waitFor();
    });
    await step("Filters", "category pill Laptops → 3", async () => {
      await anon.goto(`${BASE}/marketplace`);
      await anon.locator("aside").getByRole("button", { name: "Laptops", exact: true }).click();
      await anon.waitForURL(/category=laptops/);
      await anon.getByText("1–3 of 3 listings").waitFor();
    });
    await step("Filters", "price range ₹1,000–₹10,000", async () => {
      await anon.goto(`${BASE}/marketplace`);
      await anon.locator("aside #min-price").fill("1000");
      await anon.locator("aside #max-price").fill("10000");
      await anon.locator("aside").getByRole("button", { name: "Go" }).click();
      await anon.waitForURL(/min=1000.*max=10000|max=10000.*min=1000/);
      await anon.getByText(/of 9 listings|1–9 of 9/).waitFor();
    });
    await step("Filters", "condition Like New", async () => {
      await anon.goto(`${BASE}/marketplace`);
      await anon.locator("aside").getByLabel(/Like New/).click();
      await anon.waitForURL(/condition=like_new/);
      await anon.getByText(/of \d+ listings/).waitFor();
    });
    await step("Filters", "distance 10 km (Delhi geolocation) + nearest sort", async () => {
      await anon.goto(`${BASE}/marketplace`);
      await anon.locator("aside").getByRole("button", { name: "10 km" }).click();
      await anon.waitForURL(/radius=10/);
      await anon.getByText(/of \d+ listings|1 listing/).first().waitFor();
      const cities = await anon.locator("article").allInnerTexts();
      assert(cities.length > 0 && cities.every((t) => /Delhi/.test(t)), `non-Delhi results: ${cities.length}`);
      return `${cities.length} Delhi listings`;
    });
    await step("Filters", "sort price low→high", async () => {
      await anon.goto(`${BASE}/marketplace?sort=price_asc`);
      const prices = (await anon.locator("article p.price").allInnerTexts()).map((t) => (t === "Free" ? 0 : Number(t.replace(/[^\d]/g, ""))));
      assert(prices.length > 2 && prices.every((p, i) => i === 0 || prices[i - 1] <= p), prices.join(","));
    });
    await step("Filters", "'Available only' off shows sold (24 total)", async () => {
      await anon.goto(`${BASE}/marketplace?sold=1`);
      await anon.getByText("1–12 of 24 listings").waitFor();
    });
    await step("Pages", "pagination page 2", async () => {
      await anon.goto(`${BASE}/marketplace`);
      await anon.getByRole("link", { name: "2", exact: true }).click();
      await anon.getByText("13–22 of 22 listings").waitFor();
    });
    await step("Maps (Leaflet/OSM)", "map view renders Leaflet map, markers and 22 list items", async () => {
      await anon.goto(`${BASE}/marketplace?view=map`);
      await anon.locator(".reuse-map .leaflet-container").first().waitFor({ timeout: 30000 });
      await anon.locator(".reuse-price-pill, .reuse-cluster-marker").first().waitFor({ timeout: 30000 });
      const markers = await anon.locator(".reuse-price-pill, .reuse-cluster-marker").count();
      const items = await anon.locator('button[aria-label^="Show "]').count();
      assert(items === 22, `${items} list items`);
      return `${markers} marker/cluster icons, 22 list items`;
    });
    await step("Detail page", "gallery, seller card, directions link, similar items", async () => {
      await anon.goto(`${BASE}/listings/${SEED_MACBOOK}`);
      await anon.getByRole("heading", { level: 1 }).waitFor();
      assert(await anon.getByText("Aarav Sharma").first().isVisible(), "seller");
      const href = await anon.getByRole("link", { name: /Get directions/ }).getAttribute("href");
      assert(/google\.com\/maps\/dir\/\?api=1&destination=12\.93/.test(href), href);
      await anon.getByRole("button", { name: "Show photo 2" }).click();
      await anon.getByRole("button", { name: /Open photo 2 of 2/ }).click();
      await anon.getByRole("button", { name: /Zoom in/ }).waitFor();
      await anon.keyboard.press("Escape");
      await anon.getByRole("heading", { name: /More in Laptops/ }).waitFor();
      assert(await anon.getByRole("link", { name: "View profile" }).isVisible(), "profile link");
    });
    await step("Privacy", "logged-out visitor sees no seller phone / Call / WhatsApp", async () => {
      await anon.getByRole("button", { name: /Chat with seller/ }).waitFor();
      const links = await anon.locator('a[href^="tel:"], a[href^="https://wa.me/"]').count();
      const html = await anon.content();
      assert(links === 0 && !html.includes("9876500001"), `${links} contact link(s); phone in HTML: ${html.includes("9876500001")}`);
    });
    await step("Auth", "favorite while logged out → login prompt", async () => {
      await anon.getByRole("button", { name: "Save item" }).first().click();
      await anon.waitForURL(/\/login\?next=/);
    });
    await step("Auth", "register form validation (client)", async () => {
      await anon.goto(`${BASE}/register`);
      await anon.getByRole("button", { name: "Create account" }).click();
      await anon.getByText("Enter your name").waitFor();
      await anon.fill("#password", "short");
      await anon.fill("#confirmPassword", "different");
      await anon.getByRole("button", { name: "Create account" }).click();
      await anon.getByText("Use at least 8 characters").waitFor();
    });
    await step("Auth", "register with existing email → clear error, no account created", async () => {
      await anon.goto(`${BASE}/register`);
      await anon.fill("#fullName", "Dup Test");
      await anon.fill("#email", BUYER.email);
      await anon.fill("#password", "Another123");
      await anon.fill("#confirmPassword", "Another123");
      await anon.getByRole("button", { name: "Create account" }).click();
      await anon.getByText(/already (registered|exists)/).first().waitFor({ timeout: 15000 });
    });
    await step("Auth", "wrong password shows error", async () => {
      await anon.goto(`${BASE}/login`);
      await anon.fill("#email", SELLER.email);
      await anon.fill("#password", "Wrong123");
      await anon.getByRole("button", { name: "Sign in", exact: true }).click();
      await anon.getByText("Incorrect email or password.").waitFor();
    });
    await step("Auth", "reset-password page without recovery session → expired notice", async () => {
      await anon.goto(`${BASE}/reset-password`);
      await anon.getByText("This reset link has expired").waitFor();
    });
    await step("Auth", "auth callback without code → friendly error", async () => {
      await anon.goto(`${BASE}/auth/callback`);
      await anon.getByText("Invalid link").waitFor();
    });

    // ------------------------------------------------------------ seller creates listing
    const sellerCtx = await mk();
    const seller = await sellerCtx.newPage();
    watch(seller, "seller");
    livePages.seller = seller;

    await step("Auth", "login via protected-route redirect returns to /sell", async () => {
      await seller.goto(`${BASE}/sell`);
      await seller.waitForURL(/\/login\?next=%2Fsell/);
      await seller.fill("#email", SELLER.email);
      await seller.fill("#password", SELLER.password);
      await seller.getByRole("button", { name: "Sign in", exact: true }).click();
      await seller.waitForURL(`${BASE}/sell`);
    });
    await step("Create listing", "empty submit shows inline errors", async () => {
      await seller.getByRole("button", { name: "Publish listing" }).click();
      await seller.getByText("Add at least one photo").first().waitFor();
      await seller.getByText("Title must be at least 3 characters").waitFor();
      await seller.getByText("Enter a price").waitFor();
    });
    await step("Create listing", "rejects image over 5 MB", async () => {
      await seller.locator("input[type=file]").setInputFiles(TOO_BIG);
      await seller.getByText(/larger than 5 MB/).first().waitFor();
    });
    await step("Create listing", "upload 3 photos (compressed to WebP)", async () => {
      await seller.locator("input[type=file]").setInputFiles(["one.jpg", "two.jpg", "three.jpg"].map((f) => path.join(IMG, f)));
      const list = seller.getByRole("list", { name: /Selected photos/ });
      await list.locator("li").nth(2).waitFor();
      await seller.waitForFunction(() => !document.body.innerText.includes("Compressing & uploading"), null, { timeout: 60000 });
      const srcs = await list.locator("img").evaluateAll((els) => els.map((e) => e.getAttribute("src") || ""));
      assert(srcs.length === 3 && srcs.every((s) => s.includes("listing-images") && s.includes(".webp")), srcs.join(" | "));
    });
    await step("Create listing", "reorder photos (make cover)", async () => {
      const list = seller.getByRole("list", { name: /Selected photos/ });
      const before = await list.locator("img").first().getAttribute("src");
      await list.locator("li").nth(1).hover();
      await list.locator("li").nth(1).getByRole("button", { name: "Make cover photo" }).click();
      const after = await list.locator("img").first().getAttribute("src");
      assert(before !== after, "cover unchanged");
    });
    await step("Create listing", "fill details + location (OSM address search) and publish", async () => {
      await seller.fill("#title", TITLE);
      await seller.locator("#category").click();
      await seller.getByRole("option", { name: "Calculators" }).click();
      await seller.fill("#price", "1234");
      await seller.getByRole("radio", { name: /Like New/ }).click();
      await seller.fill("#description", "Barely used scientific calculator. E2E automated test listing — will be deleted.");
      // Leaflet/Nominatim picker: search on Enter, pick the first result, then refine the buyer-facing address.
      await seller.fill("#location", "Arts Faculty, University of Delhi");
      await seller.press("#location", "Enter");
      await seller.locator('[role="listbox"] [role="option"]').first().waitFor({ timeout: 30000 });
      await seller.locator('[role="listbox"] [role="option"]').first().click();
      await seller.locator("#loc-address").waitFor();
      await seller.fill("#loc-address", "North Campus, Arts Faculty gate");
      await seller.getByRole("button", { name: "Publish listing" }).click();
      await seller.waitForURL(/\/listings\/[0-9a-f-]{36}$/, { timeout: 30000 });
      listingId = seller.url().split("/").pop();
      await seller.getByRole("heading", { name: TITLE }).waitFor();
      assert(await seller.getByText("₹1,234").first().isVisible(), "price");
      await seller.getByRole("button", { name: "Show photo 3" }).waitFor();
      return listingId;
    });
    await step("Storage", "3 files stored in seller's own folder", async () => {
      const { data, error } = await sellerApi.storage.from("listing-images").list(`${SELLER.id}/listings`);
      assert(!error && data.length === 3, error?.message ?? `${data.length} files`);
    });
    await step("Storage", "uploaded image publicly retrievable", async () => {
      const { data } = await sellerApi.from("listing_images").select("url").eq("listing_id", listingId);
      const codes = await Promise.all(data.map((d) => fetch(d.url).then((r) => r.status)));
      assert(codes.every((c) => c === 200), codes.join(","));
    });
    await step("Search", "new listing appears on home + marketplace search", async () => {
      await anon.goto(BASE);
      await anon.getByText(TITLE).first().waitFor();
      await anon.goto(`${BASE}/marketplace?q=${STAMP}`);
      await anon.getByText("1 listing").waitFor();
    });

    // ------------------------------------------------------------ edit
    await step("Edit listing", "change price, replace a photo, persist", async () => {
      await seller.goto(`${BASE}/listings/${listingId}/edit`);
      const list = seller.getByRole("list", { name: /Selected photos/ });
      await list.locator("li").nth(2).waitFor();
      await seller.getByRole("button", { name: "Remove photo 2" }).click();
      await seller.locator("input[type=file]").setInputFiles(path.join(IMG, "replace.jpg"));
      await seller.waitForFunction(() => !document.body.innerText.includes("Compressing & uploading"), null, { timeout: 60000 });
      await seller.fill("#price", "999");
      await seller.getByRole("button", { name: "Save changes" }).click();
      await seller.waitForURL(`${BASE}/listings/${listingId}`, { timeout: 30000 });
      await seller.reload();
      await seller.getByText("₹999").first().waitFor();
      await seller.getByRole("button", { name: "Show photo 3" }).waitFor();
    });
    await step("Storage", "replaced photo removed from storage (3 files remain)", async () => {
      const { data } = await sellerApi.storage.from("listing-images").list(`${SELLER.id}/listings`);
      assert(data.length === 3, `${data.length} files`);
    });

    // ------------------------------------------------------------ buyer: favorites, RLS, chat, report
    const buyerCtx = await mk();
    const buyer = await buyerCtx.newPage();
    watch(buyer, "buyer");
    livePages.buyer = buyer;
    await login(buyer, BUYER);

    await step("Favorites", "save → appears in /saved, persists after refresh", async () => {
      await buyer.goto(`${BASE}/listings/${listingId}`);
      await ready(buyer);
      await buyer.locator("aside").getByRole("button", { name: "Save item" }).click();
      await buyer.locator("aside").getByRole("button", { name: "Remove from saved items" }).waitFor();
      await buyer.getByText("Saved to your wishlist").first().waitFor();
      await buyer.goto(`${BASE}/saved`);
      await buyer.locator("main article").getByText(TITLE).waitFor();
      await buyer.reload();
      await buyer.locator("main article").getByText(TITLE).waitFor();
    });
    await step("Dashboard", "seller sees saved count = 1", async () => {
      await seller.goto(`${BASE}/dashboard`);
      const row = seller.locator("tr", { hasText: TITLE });
      const cells = await row.locator("td").allInnerTexts();
      assert(cells[4]?.trim() === "1", `saved cell ${cells[4]}`);
    });
    await step("Favorites", "remove → gone from /saved", async () => {
      await buyer.goto(`${BASE}/saved`);
      await ready(buyer);
      await buyer.getByRole("button", { name: "Remove from saved items" }).first().click();
      await buyer.getByText("Removed from your wishlist").first().waitFor();
      await buyer.reload();
      assert(!(await buyer.getByText(TITLE).count()), "still saved");
    });
    await step("RLS (UI)", "buyer cannot open edit page of seller's listing", async () => {
      await buyer.goto(`${BASE}/listings/${listingId}/edit`);
      await buyer.getByRole("heading", { name: "You can't edit this listing" }).waitFor();
    });
    await step("Detail page", "signed-in buyer sees WhatsApp + Call links (seller shared phone)", async () => {
      await buyer.goto(`${BASE}/listings/${SEED_MACBOOK}`);
      const wa = await buyer.getByRole("link", { name: /WhatsApp/ }).getAttribute("href");
      const tel = await buyer.getByRole("link", { name: /Call/ }).getAttribute("href");
      assert(wa.startsWith("https://wa.me/919876500001?text=") && tel === "tel:+919876500001", `${wa?.slice(0, 40)} ${tel}`);
    });
    await step("RLS (UI)", "buyer sees no owner controls", async () => {
      await buyer.goto(`${BASE}/listings/${listingId}`);
      assert(!(await buyer.getByRole("button", { name: "Mark as sold" }).count()), "owner controls visible");
    });

    let convUrl = null;
    await step("Messaging", "buyer starts chat and sends a message", async () => {
      await seller.goto(`${BASE}/dashboard`); // seller idle elsewhere, watching the navbar badge
      await buyer.goto(`${BASE}/listings/${listingId}`);
      await buyer.getByRole("button", { name: "Chat with seller" }).click();
      await buyer.waitForURL(/\/messages\/[0-9a-f-]{36}$/, { timeout: 20000 });
      convUrl = buyer.url();
      await buyer.waitForTimeout(1500);
      await buyer.fill("#chat-input", "Hi! Is the calculator still available? (E2E)");
      await buyer.press("#chat-input", "Enter");
      await buyer.getByLabel("Sent").first().waitFor({ timeout: 15000 });
    });
    await step("Messaging", "seller's unread badge updates in realtime (no reload)", async () => {
      await seller.locator("header").getByRole("link", { name: /Messages, 1 unread/ }).waitFor({ timeout: 20000 });
    });
    await step("Messaging", "seller inbox shows the listing context + message", async () => {
      await seller.goto(`${BASE}/messages`);
      const item = seller.getByRole("list", { name: "Conversations" }).locator("li", { hasText: TITLE });
      await item.waitFor();
      assert(/Selling/.test(await item.innerText()), "role label");
      await item.click();
      await seller.getByText("Is the calculator still available?").waitFor();
    });
    await step("Messaging", "unread clears after opening", async () => {
      await seller.locator("header").getByRole("link", { name: /^Messages$/ }).waitFor({ timeout: 15000 });
    });
    await step("Messaging", "read receipt reaches buyer in realtime", async () => {
      await buyer.getByLabel("Read").first().waitFor({ timeout: 20000 });
    });
    await step("Messaging", "seller reply arrives on buyer's screen in realtime", async () => {
      await seller.waitForTimeout(1000);
      await seller.fill("#chat-input", "Yes it is — free tomorrow at 5pm?");
      await seller.press("#chat-input", "Enter");
      await buyer.getByText("Yes it is — free tomorrow at 5pm?").waitFor({ timeout: 20000 });
    });
    await step("RLS", "third user cannot read the conversation", async () => {
      const third = sb();
      await third.auth.signInWithPassword({ email: "aarav.sharma@reusemarket.test", password: "ReUse@12345" });
      const convId = convUrl.split("/").pop();
      const { data: c } = await third.from("conversations").select("id").eq("id", convId);
      const { data: m } = await third.from("messages").select("id").eq("conversation_id", convId);
      assert(c.length === 0 && m.length === 0, `${c.length}/${m.length}`);
      const ctx = await mk();
      const p = await ctx.newPage();
      await login(p, { email: "aarav.sharma@reusemarket.test", password: "ReUse@12345" });
      const r = await p.goto(convUrl);
      await p.getByText("new home").waitFor();
      await ctx.close();
      await third.auth.signOut();
      return `UI 404 (HTTP ${r.status()})`;
    });
    await step("Messaging", "rate limit blocks bursts", async () => {
      await buyer.goto(convUrl);
      await buyer.waitForTimeout(1500);
      await ready(buyer);
      for (let i = 0; i < 7; i++) {
        await buyer.fill("#chat-input", `burst ${i}`);
        await buyer.press("#chat-input", "Enter");
        await buyer.waitForFunction(() => !document.querySelector('[aria-label="Sending"]'), null, { timeout: 8000 }).catch(() => {});
      }
      await buyer.getByText(/sending messages very quickly|too quickly/).first().waitFor({ timeout: 10000 });
    });
    await step("Reports", "buyer reports listing; duplicate refused", async () => {
      await buyer.goto(`${BASE}/listings/${listingId}`);
      await buyer.getByRole("button", { name: "Report listing" }).click();
      await buyer.getByRole("radio", { name: "Spam or duplicate" }).click();
      await buyer.getByRole("button", { name: "Submit report" }).click();
      await buyer.getByText("our team will review this listing").waitFor();
      await buyer.getByRole("button", { name: "Report listing" }).click();
      await buyer.getByRole("radio", { name: "Spam or duplicate" }).click();
      await buyer.getByRole("button", { name: "Submit report" }).click();
      await buyer.getByText(/already reported/).first().waitFor();
      await buyer.keyboard.press("Escape");
    });

    // ------------------------------------------------------------ sold / available
    await step("Sold status", "mark sold → SOLD ribbon, hidden from default search", async () => {
      await seller.goto(`${BASE}/listings/${listingId}`);
      await seller.getByRole("button", { name: "Mark as sold" }).click();
      await seller.getByRole("button", { name: "Mark as available" }).waitFor({ timeout: 15000 });
      await anon.goto(`${BASE}/listings/${listingId}`);
      await anon.getByText(/^sold$/i).first().waitFor();
      await anon.goto(`${BASE}/marketplace?q=${STAMP}`);
      await anon.getByText("No matches — yet").waitFor();
      await anon.goto(`${BASE}/marketplace?q=${STAMP}&sold=1`);
      await anon.getByText("1 listing").waitFor();
    });
    await step("Sold status", "mark available restores it", async () => {
      await seller.getByRole("button", { name: "Mark as available" }).click();
      await seller.getByRole("button", { name: "Mark as sold" }).waitFor({ timeout: 15000 });
      await anon.goto(`${BASE}/marketplace?q=${STAMP}`);
      await anon.getByText("1 listing").waitFor();
    });
    await step("Detail page", "view counter incremented by visitors", async () => {
      const { data } = await sellerApi.from("listings").select("views").eq("id", listingId).single();
      assert(data.views >= 1, `${data.views}`);
      return `${data.views} views`;
    });

    // ------------------------------------------------------------ profile
    await step("Profile", "edit bio, persists after reload (then restored)", async () => {
      await seller.goto(`${BASE}/profile`);
      await ready(seller);
      await seller.fill("#bio", "E2E temporary bio");
      await seller.getByRole("button", { name: "Save profile" }).click();
      await seller.getByText("Profile saved").waitFor();
      await seller.reload();
      await ready(seller);
      assert((await seller.inputValue("#bio")) === "E2E temporary bio", `bio not saved: "${await seller.inputValue("#bio")}"`);
      await seller.fill("#bio", origProfile.bio ?? "");
      await seller.getByRole("button", { name: "Save profile" }).click();
      await seller.getByText("Profile saved").waitFor();
    });
    await step("Profile", "public profile shows the new listing", async () => {
      await anon.goto(`${BASE}/users/${SELLER.id}`);
      await anon.getByText(TITLE).waitFor();
    });

    // ------------------------------------------------------------ delete
    await step("Delete listing", "confirm dialog → deleted, storage files removed", async () => {
      await seller.goto(`${BASE}/listings/${listingId}`);
      await seller.getByRole("button", { name: "Delete" }).click();
      await seller.getByRole("button", { name: "Delete permanently" }).click();
      await seller.waitForURL(`${BASE}/dashboard`, { timeout: 20000 });
      const { data: l } = await sellerApi.from("listings").select("id").eq("id", listingId);
      const { data: files } = await sellerApi.storage.from("listing-images").list(`${SELLER.id}/listings`);
      assert(l.length === 0 && files.length === 0, `rows ${l.length}, files ${files.length}`);
      const { data: conv } = await sellerApi.from("conversations").select("id").eq("listing_id", listingId);
      assert(conv.length === 0, "conversation not cascaded");
      listingId = null;
    });

    await step("Auth", "logout", async () => {
      await seller.getByRole("button", { name: "Account menu" }).click();
      await seller.getByRole("menuitem", { name: /Sign out/ }).click();
      await seller.getByRole("link", { name: "Join" }).waitFor();
      await seller.goto(`${BASE}/dashboard`);
      await seller.waitForURL(/\/login/);
    });

    // ------------------------------------------------------------ responsive + theme
    const pages = ["/", "/marketplace", `/listings/${SEED_MACBOOK}`, "/login", "/marketplace?view=map"];
    for (const scheme of ["light", "dark"]) {
      for (const width of [375, 768, 1440]) {
        await step("Responsive", `${width}px ${scheme}: no horizontal overflow`, async () => {
          const ctx = await mk({ viewport: { width, height: 900 }, colorScheme: scheme, isMobile: width < 500, hasTouch: width < 500 });
          const p = await ctx.newPage();
          watch(p, `${width}-${scheme}`);
          const over = [];
          for (const route of pages) {
            await p.goto(BASE + route);
            await p.waitForLoadState("networkidle").catch(() => {});
            const { sw, iw, dark, bottomNav } = await p.evaluate(() => ({
              sw: document.documentElement.scrollWidth,
              iw: window.innerWidth,
              dark: document.documentElement.classList.contains("dark"),
              bottomNav: !!document.querySelector('nav[aria-label="Mobile"]') && getComputedStyle(document.querySelector('nav[aria-label="Mobile"]')).display !== "none",
            }));
            if (sw > iw) over.push(`${route} ${sw}>${iw}`);
            if (dark !== (scheme === "dark")) over.push(`${route} theme mismatch`);
            if (bottomNav !== width < 768) over.push(`${route} bottom-nav ${bottomNav}`);
            if (route === "/" || route.startsWith("/listings")) {
              await p.screenshot({ path: path.join(SHOTS, `${scheme}-${width}-${route === "/" ? "home" : "listing"}.png`) });
            }
          }
          await ctx.close();
          assert(over.length === 0, over.join("; "));
        });
      }
    }
    await step("Theme", "toggle switches light ↔ dark", async () => {
      await anon.goto(BASE);
      const before = await anon.evaluate(() => document.documentElement.classList.contains("dark"));
      await anon.getByRole("button", { name: /Switch to (dark|light) mode/ }).click();
      const after = await anon.evaluate(() => document.documentElement.classList.contains("dark"));
      assert(before !== after, "no change");
    });

    await browser.close();
  } finally {
    // ------------------------------------------------------------ cleanup (only E2E-created data)
    const { data: leftovers } = await sellerApi.from("listings").select("id").eq("seller_id", SELLER.id).like("title", "E2E TEST%");
    for (const l of leftovers ?? []) await sellerApi.from("listings").delete().eq("id", l.id);
    for (const folder of ["listings", "avatars"]) {
      const { data: files } = await sellerApi.storage.from("listing-images").list(`${SELLER.id}/${folder}`);
      if (files?.length) await sellerApi.storage.from("listing-images").remove(files.map((f) => `${SELLER.id}/${folder}/${f.name}`));
    }
    const { data: prof } = await sellerApi.from("profiles").select("bio").eq("id", SELLER.id).single();
    if (prof && prof.bio !== origProfile.bio) await sellerApi.from("profiles").update({ bio: origProfile.bio }).eq("id", SELLER.id);
    const { count } = await sellerApi.from("listings").select("id", { count: "exact", head: true });
    console.log(`\ncleanup: removed ${leftovers?.length ?? 0} leftover test listing(s); total listings now ${count}`);

    const uniqueErrors = [...new Set(consoleErrors)];
    console.log(`browser console errors: ${uniqueErrors.length}`);
    uniqueErrors.slice(0, 25).forEach((e) => console.log("  ", e));
    const f = results.filter((r) => r.status === "FAIL").length;
    console.log(`\nE2E: ${results.length - f} PASS, ${f} FAIL`);
    fs.writeFileSync(path.join(SHOTS, "results.json"), JSON.stringify({ results, consoleErrors: uniqueErrors }, null, 1));
    process.exit(f ? 1 : 0);
  }
})();
