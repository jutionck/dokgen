import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/pwa/pwa-register";

const baseUrl = "https://docgen.mipdevp.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Docgen - Generator Dokumen Bisnis & Invoice Standar Indonesia",
    template: "%s | Docgen",
  },
  description:
    "Platform otomatisasi pembuatan Invoice, Surat Penawaran, Estimasi Biaya (Quotation), BAST, dan Kontrak Kerja profesional standar bisnis Indonesia. Ekspor PDF & Word (.docx) presisi.",
  applicationName: "Docgen",
  keywords: [
    "invoice generator indonesia",
    "buat invoice online",
    "surat penawaran harga",
    "quotation generator",
    "BAST berita acara serah terima",
    "kontrak kerja perjanjian",
    "dokumen bisnis indonesia",
    "docgen",
    "mipdevp",
  ],
  authors: [{ name: "MIPDEVP Digital", url: baseUrl }],
  creator: "MIPDEVP Digital",
  publisher: "MIPDEVP Digital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: baseUrl,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Docgen",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: baseUrl,
    siteName: "Docgen",
    title: "Docgen - Generator Dokumen Bisnis & Invoice Standar Indonesia",
    description:
      "Platform otomatisasi pembuatan Invoice, Surat Penawaran, Quotation, BAST, dan Kontrak Kerja profesional standar bisnis Indonesia. Ekspor PDF & Word presisi.",
    images: [
      {
        url: `${baseUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Docgen - Generator Dokumen Bisnis & Invoice Standar Indonesia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Docgen - Generator Dokumen Bisnis & Invoice Standar Indonesia",
    description:
      "Platform otomatisasi pembuatan Invoice, Surat Penawaran, Quotation, BAST, dan Kontrak Kerja profesional.",
    images: [`${baseUrl}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Docgen",
  url: baseUrl,
  description:
    "Generator Dokumen Bisnis & Invoice Standar Indonesia. Ekspor PDF & Word (.docx) presisi, multi-rekening bank, dan kirim via Email & WhatsApp.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "IDR",
  },
  publisher: {
    "@type": "Organization",
    name: "MIPDEVP Digital",
    url: baseUrl,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        {children}
        <PwaRegister />
        <Toaster />
      </body>
    </html>
  );
}
