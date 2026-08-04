import type { DocExtra, DocType, DocumentItem } from "@/lib/types";

export interface DocSeed {
  id: string;
  name: string;
  description: string;
  title?: string;
  terms?: string;
  notes?: string;
  extra?: Partial<DocExtra>;
  items?: DocumentItem[];
}

export const DOC_TYPE_META: Record<
  DocType,
  { icon: "receipt" | "file-text" | "spreadsheet" | "file-check" | "scale"; description: string }
> = {
  invoice: { icon: "receipt", description: "Tagihan ke klien — bisa dibuat bertahap per termin" },
  penawaran: { icon: "file-text", description: "Surat penawaran jasa/produk sebelum deal" },
  quotation: { icon: "spreadsheet", description: "Rincian harga & penawaran formal" },
  bast: { icon: "file-check", description: "Berita acara serah terima setelah pekerjaan selesai" },
  kontrak: { icon: "scale", description: "Perjanjian kerja / SPK antara dua pihak" },
};

export const DOC_TEMPLATES: Record<DocType, DocSeed[]> = {
  invoice: [
    {
      id: "inv-standar",
      name: "Invoice Standar",
      description: "Tagihan tunggal, jatuh tempo 30 hari",
      title: "Invoice",
      terms:
        "Mohon konfirmasi pembayaran setelah transfer dilakukan.\nJatuh tempo pembayaran 30 hari sejak tanggal invoice.",
      extra: {
        payment_terms: "Pembayaran dilakukan dengan transfer bank ke rekening yang tertera pada invoice.",
      },
      items: [
        { description: "Pekerjaan Pengembangan Aplikasi (Tahap 1)", qty: 1, unit: "paket", unit_price: 25000000 },
        { description: "Hosting & Domain (1 tahun)", qty: 1, unit: "paket", unit_price: 2500000 },
      ],
    },
    {
      id: "inv-dp",
      name: "Invoice DP 50%",
      description: "Termin 1 — pembayaran awal 50%",
      title: "Invoice Termin 1",
      terms:
        "Pembayaran tahap 1 (DP) sebesar 50% dari nilai pekerjaan.\nSisa pelunasan akan ditagih setelah pekerjaan selesai (BAST).",
      extra: {
        payment_terms: "DP 50% dibayarkan di awal pekerjaan.\nPelunasan 50% setelah pekerjaan selesai.",
      },
      items: [
        { description: "DP 50% — Pekerjaan Pembuatan Website Company Profile", qty: 1, unit: "ls", unit_price: 15000000 },
      ],
    },
    {
      id: "inv-pelunasan",
      name: "Invoice Pelunasan",
      description: "Termin akhir — sisa pembayaran setelah selesai",
      title: "Invoice Termin 2",
      terms:
        "Pembayaran tahap akhir (pelunasan) sebesar sisa nilai pekerjaan.\nMohon dilakukan setelah pekerjaan dinyatakan selesai.",
      extra: {
        payment_terms: "Pelunasan dibayarkan setelah pekerjaan selesai dan diterima (BAST).",
      },
      items: [
        { description: "Pelunasan 50% — Pekerjaan Pembuatan Website Company Profile", qty: 1, unit: "ls", unit_price: 15000000 },
      ],
    },
  ],
  penawaran: [
    {
      id: "sp-jasa",
      name: "Penawaran Jasa",
      description: "Penawaran jasa/proyek dengan lingkup pekerjaan",
      title: "Surat Penawaran",
      terms:
        "Penawaran ini sah selama masa berlaku penawaran yang tertera.\nHarga sudah termasuk semua biaya terkait kecuali dinyatakan lain.",
      extra: {
        project_title: "Pembuatan Website Company Profile",
        intro:
          "Merujuk pada kebutuhan perusahaan Bapak/Ibu, kami sampaikan penawaran layanan pembuatan website company profile dengan spesifikasi lengkap.",
        scope_of_work:
          "1. Desain UI/UX sesuai brand perusahaan\n2. Pengembangan front-end & back-end\n3. Integrasi content management system\n4. Pelatihan penggunaan & dokumentasi\n5. Support pemeliharaan 3 bulan",
        validity_days: 14,
        payment_terms: "DP 50% di awal pekerjaan, pelunasan 50% setelah pekerjaan selesai (BAST).",
      },
      items: [
        { description: "Pembuatan Website Company Profile (5 halaman + CMS)", qty: 1, unit: "paket", unit_price: 30000000 },
        { description: "Hosting & Domain (1 tahun)", qty: 1, unit: "paket", unit_price: 3000000 },
      ],
    },
    {
      id: "sp-barang",
      name: "Penawaran Produk / Barang",
      description: "Penawaran penjualan barang dengan harga satuan",
      title: "Surat Penawaran",
      terms:
        "Penawaran ini sah selama masa berlaku penawaran yang tertera.\nHarga belum termasuk PPN kecuali dinyatakan lain.",
      extra: {
        project_title: "Pengadaan Perangkat Komputer",
        intro:
          "Sehubungan dengan kebutuhan pengadaan perangkat di lingkungan Bapak/Ibu, bersama ini kami sampaikan penawaran sebagai berikut.",
        scope_of_work: "Barang dikirim setelah konfirmasi pembelian, dengan garansi resmi 1 tahun.",
        validity_days: 14,
        payment_terms: "Pembayaran 100% setelah barang diterima, atau sesuai kesepakatan.",
      },
      items: [
        { description: "Laptop Workstation 16GB/512GB", qty: 5, unit: "unit", unit_price: 14500000 },
        { description: "Monitor 24 inch FHD", qty: 5, unit: "unit", unit_price: 2100000 },
      ],
    },
  ],
  quotation: [
    {
      id: "quo-jasa",
      name: "Quotation Jasa",
      description: "Rincian harga penawaran jasa",
      title: "Quotation",
      terms:
        "Quotation ini berlaku 14 hari sejak tanggal terbit.\nPengerjaan dimulai setelah quotation ini disetujui dan DP diterima.",
      extra: {
        scope_of_work: "Jasa pengembangan aplikasi sesuai kebutuhan klien, termasuk dokumentasi dan pelatihan.",
        validity_days: 14,
        payment_terms: "DP 50% saat quotation disetujui, pelunasan 50% setelah pekerjaan selesai.",
      },
      items: [
        { description: "Pengembangan Aplikasi Mobile (iOS & Android)", qty: 1, unit: "paket", unit_price: 85000000 },
        { description: "Maintenance 6 bulan", qty: 6, unit: "bulan", unit_price: 2500000 },
      ],
    },
    {
      id: "quo-barang",
      name: "Quotation Barang",
      description: "Rincian harga penjualan barang",
      title: "Quotation",
      terms:
        "Quotation ini berlaku 14 hari sejak tanggal terbit.\nHarga belum termasuk PPN dan biaya pengiriman.",
      extra: {
        validity_days: 14,
        payment_terms: "Pembayaran 50% di muka, sisanya sebelum barang dikirim.",
      },
      items: [
        { description: "Printer Multifungsi A3", qty: 2, unit: "unit", unit_price: 8750000 },
        { description: "Tinta & Kertas (paket starter)", qty: 2, unit: "paket", unit_price: 750000 },
      ],
    },
  ],
  bast: [
    {
      id: "bast-selesai",
      name: "BAST Penyelesaian Pekerjaan",
      description: "Pernyataan pekerjaan selesai & diterima",
      title: "Berita Acara Serah Terima",
      extra: {
        work_description:
          "Pekerjaan pembuatan website company profile beserta seluruh fitur yang telah disepakati.",
        location: "Jakarta",
        result_text:
          "Bahwa seluruh pekerjaan tersebut telah diselesaikan dengan baik dan telah diterima oleh PIHAK KEDUA. Dengan diserahkannya pekerjaan tersebut, maka dianggap selesainya seluruh kewajiban PIHAK PERTAMA kepada PIHAK KEDUA.",
      },
      items: [],
    },
    {
      id: "bast-nilai",
      name: "BAST dengan Rincian Nilai",
      description: "Serah terima pekerjaan beserta nilai pekerjaan",
      title: "Berita Acara Serah Terima",
      extra: {
        work_description:
          "Pekerjaan pengadaan perangkat komputer beserta instalasi dan pengujian di lokasi klien.",
        location: "Bandung",
        contract_ref: "001/SPK/08/2026",
        result_text:
          "Seluruh pekerjaan telah diselesaikan sesuai spesifikasi kontrak dan diterima dengan baik oleh PIHAK KEDUA.",
      },
      items: [
        { description: "Pengadaan Laptop Workstation", qty: 5, unit: "unit", unit_price: 14500000 },
        { description: "Instalasi & Konfigurasi", qty: 1, unit: "ls", unit_price: 2000000 },
      ],
    },
  ],
  kontrak: [
    {
      id: "spk-lengkap",
      name: "SPK Jasa (Lengkap)",
      description: "Pasal ruang lingkup, waktu, nilai, pembayaran & penutup",
      title: "Surat Perjanjian Kerja (SPK)",
      terms: "",
      extra: {
        project_title: "Pembuatan Sistem Informasi Perusahaan",
        scope_of_work:
          "1. Analisis kebutuhan dan desain sistem\n2. Pengembangan aplikasi web\n3. Pengujian dan quality assurance\n4. Pelatihan pengguna\n5. Dokumentasi teknis",
        duration_text: "90 hari kalender",
        payment_terms: "DP 40% saat kontrak ditandatangani.\nTermin 2 30% setelah progres 50%.\nPelunasan 30% setelah BAST.",
        clauses:
          "1. Apabila terjadi keterlambatan penyelesaian pekerjaan di luar kesepakatan, PIHAK PERTAMA dikenakan denda sebesar 0,1% per hari keterlambatan dari nilai kontrak.\n2. Seluruh hasil pekerjaan menjadi hak milik PIHAK KEDUA setelah pelunasan.\n3. Kerahasiaan data perusahaan PIHAK KEDUA dijaga oleh PIHAK PERTAMA.",
      },
      items: [
        { description: "Pembuatan Sistem Informasi Perusahaan", qty: 1, unit: "paket", unit_price: 120000000 },
      ],
    },
    {
      id: "spk-sederhana",
      name: "SPK Sederhana",
      description: "Ringkas — tanpa klausul tambahan",
      title: "Surat Perjanjian Kerja (SPK)",
      terms: "",
      extra: {
        project_title: "Jasa Instalasi Jaringan & Server",
        scope_of_work: "Instalasi jaringan LAN, konfigurasi server, dan pemasangan access point di lokasi.",
        duration_text: "14 hari kerja",
        payment_terms: "Pembayaran 100% setelah pekerjaan selesai dan diterima.",
        clauses: "",
      },
      items: [
        { description: "Jasa Instalasi Jaringan & Server", qty: 1, unit: "paket", unit_price: 35000000 },
      ],
    },
  ],
};
