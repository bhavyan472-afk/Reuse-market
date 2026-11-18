"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#F5F0E6",
          color: "#1F1D1A",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 44, fontWeight: 500, margin: 0 }}>ReUse Market is taking a breather.</h1>
          <p style={{ fontFamily: "system-ui, sans-serif", color: "#6E675C", marginTop: 16 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 28px",
              borderRadius: 999,
              border: 0,
              background: "#1E3A2F",
              color: "#F5F0E6",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
