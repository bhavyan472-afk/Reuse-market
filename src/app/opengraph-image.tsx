import { ImageResponse } from "next/og";

export const alt = "ReUse Market — Give Products a Second Life.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F5F0",
          padding: 72,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: "#104B3B", display: "flex" }} />
          <div style={{ fontSize: 34, color: "#292923" }}>ReUse Market</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, lineHeight: 1.02, color: "#292923", letterSpacing: -3 }}>Give Products</div>
          <div style={{ fontSize: 96, lineHeight: 1.02, color: "#292923", letterSpacing: -3, display: "flex" }}>
            a Second Life<span style={{ color: "#B9945B" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#6B675F", fontFamily: "sans-serif" }}>
          Pre-owned books, laptops, bicycles &amp; furniture from students and neighbours nearby.
        </div>
      </div>
    ),
    size,
  );
}
