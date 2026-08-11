"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <main
          style={{
            alignItems: "center",
            display: "flex",
            fontFamily: "Arial, sans-serif",
            justifyContent: "center",
            minHeight: "100vh",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 480 }}>
            <h1 style={{ fontSize: 28, marginBottom: 12 }}>Docgen mengalami kendala</h1>
            <p style={{ color: "#475569", lineHeight: 1.6 }}>
              Aplikasi tidak dapat dimuat saat ini. Silakan coba kembali.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#2563eb",
                border: 0,
                borderRadius: 8,
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                marginTop: 20,
                padding: "10px 18px",
              }}
            >
              Coba lagi
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
