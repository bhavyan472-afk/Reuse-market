/**
 * Re-mounts on every navigation, so each page gets a soft 260ms fade-in.
 * Pure CSS (no JS needed) — content is never hidden if scripts are slow, and
 * prefers-reduced-motion collapses the animation (see globals.css).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
