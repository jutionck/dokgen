import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Dokgen — Generator Dokumen Bisnis & Invoice Standar Indonesia";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0f172a",
          backgroundImage: "radial-gradient(circle at 25px 25px, #1e293b 2px, transparent 0)",
          backgroundSize: "40px 40px",
          padding: "60px 80px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Header Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: "bold",
              color: "#ffffff",
              boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.4)",
            }}
          >
            D
          </div>
          <span style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Dokgen<span style={{ color: "#3b82f6" }}>.</span>
          </span>
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              borderRadius: "9999px",
              padding: "8px 20px",
              color: "#60a5fa",
              fontSize: "16px",
              fontWeight: 600,
              width: "fit-content",
            }}
          >
            dokgen.mipdevp.com
          </div>

          <div style={{ fontSize: "52px", fontWeight: 900, lineHeight: 1.15, color: "#f8fafc" }}>
            Buat Invoice, Penawaran & Kontrak Bisnis{" "}
            <span style={{ color: "#3b82f6" }}>Standar Indonesia</span>
          </div>

          <div style={{ fontSize: "22px", color: "#94a3b8", lineHeight: 1.4 }}>
            Ekspor PDF & Word (.docx) Presisi · Multi-Rekening Bank · Kirim WA & Email
          </div>
        </div>

        {/* Bottom Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", fontSize: "16px", color: "#cbd5e1" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span> Faktur (Invoice)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span> Surat Penawaran
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span> Estimasi Biaya
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span> BAST & Kontrak
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
