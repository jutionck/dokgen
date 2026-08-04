"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Receipt,
  FileSpreadsheet,
  FileCheck,
  Scale,
  CheckCircle2,
  ArrowRight,
  Download,
  Mail,
  ChevronDown,
  Landmark,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  isLoggedIn: boolean;
  hasCompany: boolean;
  stats?: {
    totalDocuments: number;
    totalCompanies: number;
  };
}

export function LandingPage({ isLoggedIn, hasCompany, stats }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activePreviewTab, setActivePreviewTab] = useState<"invoice" | "penawaran" | "quotation" | "bast" | "kontrak">(
    "invoice"
  );

  const actionUrl = !isLoggedIn ? "/register" : !hasCompany ? "/register" : "/dashboard";
  const actionText = !isLoggedIn ? "Mulai Buat Dokumen" : !hasCompany ? "Daftarkan Perusahaan" : "Buka Dashboard";

  const formattedDocCount = (stats?.totalDocuments ?? 0).toLocaleString("id-ID");
  const formattedCompanyCount = (stats?.totalCompanies ?? 0).toLocaleString("id-ID");

  const docTypes = [
    {
      id: "penawaran",
      title: "Surat Penawaran",
      desc: "Penawaran harga resmi dengan rincian lingkup pekerjaan 3 kolom & ketentuan masa berlaku.",
      icon: FileText,
      badge: "Penawaran",
    },
    {
      id: "invoice",
      title: "Faktur (Invoice)",
      desc: "Tagihan profesional dengan status pembayaran, multi-rekening bank transfer, & terbilang otomatis.",
      icon: Receipt,
      badge: "Tagihan",
    },
    {
      id: "quotation",
      title: "Estimasi Biaya",
      desc: "Estimasi biaya ringkas (quotation) untuk respon cepat ke calon klien prospektif.",
      icon: FileSpreadsheet,
      badge: "Estimasi",
    },
    {
      id: "bast",
      title: "Berita Acara Serah Terima (BAST)",
      desc: "Berita Acara Serah Terima pekerjaan antara Pihak Pertama dan Pihak Kedua secara sah.",
      icon: FileCheck,
      badge: "Serah Terima",
    },
    {
      id: "kontrak",
      title: "Kontrak Kerja",
      desc: "Perjanjian kerjasama bisnis lengkap dengan pasal-pasal standar hukum Indonesia.",
      icon: Scale,
      badge: "Perjanjian",
    },
  ];

  const faqs = [
    {
      q: "Apakah hasil ekspor PDF dan Word (.docx) sama persis dengan preview di layar?",
      a: "Ya, 100% identik. Tata letak, tabel, informasi bank, dan tanda tangan berada di posisi vertikal yang presisi tanpa pergeseran.",
    },
    {
      q: "Bisakah saya menambahkan dan memilih lebih dari 1 rekening bank?",
      a: "Tentu. Anda dapat mendaftarkan beberapa rekening bank di menu Pengaturan Bank dan memilih rekening mana saja yang ingin ditampilkan per dokumen.",
    },
    {
      q: "Apakah dokumen Dokgen sesuai dengan standar bisnis di Indonesia?",
      a: "Ya. Seluruh template dokumen telah disesuaikan dengan struktur dan format standar korespondensi bisnis di Indonesia.",
    },
    {
      q: "Apakah saya bisa mengirim dokumen langsung ke email atau WhatsApp klien?",
      a: "Bisa. Dokgen menyediakan fitur kirim email otomatis berlampiran PDF serta tautan berbagi via WhatsApp.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans dot-grid selection:bg-blue-600 selection:text-white">
      {/* ---------- HEADER / NAVIGATION ---------- */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/icon.svg"
              alt="Dokgen"
              className="h-7 w-7 rounded-md shadow-2xs group-hover:scale-105 transition-transform"
            />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Dokgen<span className="text-blue-600">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-semibold text-slate-600 md:flex">
            <a href="#fitur" className="transition-colors hover:text-blue-600">
              Fitur Utama
            </a>
            <a href="#jenis-dokumen" className="transition-colors hover:text-blue-600">
              Jenis Dokumen
            </a>
            <a href="#cara-kerja" className="transition-colors hover:text-blue-600">
              Cara Kerja
            </a>
            <a href="#faq" className="transition-colors hover:text-blue-600">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {!isLoggedIn ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-slate-700 hover:bg-slate-100">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-blue-600 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700"
                  >
                    Daftar Gratis
                  </Button>
                </Link>
              </>
            ) : (
              <Link href={actionUrl}>
                <Button size="sm" className="bg-blue-600 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700">
                  {actionText} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ---------- HERO SECTION ---------- */}
      <section className="pt-8 pb-12 sm:pt-12 sm:pb-20 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <div className="inline-flex max-w-[95%] items-center justify-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 sm:text-xs mb-4 sm:mb-6 leading-tight">
            <img src="/icon.svg" alt="Dokgen" className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-xs shadow-2xs shrink-0" />
            <span className="truncate sm:whitespace-normal">Generator Dokumen Bisnis & Invoice Standar Indonesia</span>
          </div>

          <h1 className="mx-auto max-w-3xl text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl leading-tight sm:leading-tight">
            Buat Faktur, Penawaran & Kontrak Bisnis{" "}
            <span className="text-blue-600 block sm:inline">Lebih Cepat dan Rapi</span>
          </h1>

          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-xs sm:text-base text-slate-600 leading-relaxed px-1">
            Platform manajemen dokumen keuangan & legal perusahaan. Format standar resmi, ekspor PDF & Word (.docx)
            presisi, dukungan multi-rekening bank, dan pengiriman langsung via WA / Email.
          </p>

          <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
            <Link href={actionUrl} className="w-full sm:w-auto">
              <Button
                size="default"
                className="w-full sm:w-auto bg-blue-600 font-semibold text-white px-6 text-xs sm:text-sm shadow-2xs hover:bg-blue-700 py-2.5 sm:py-2"
              >
                {actionText} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#fitur" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="default"
                className="w-full sm:w-auto border-slate-300 bg-white text-slate-700 px-6 text-xs sm:text-sm hover:bg-slate-50 py-2.5 sm:py-2"
              >
                Pelajari Fitur Utama
              </Button>
            </a>
          </div>

          {/* Quick Trust Indicators (Inline Horizontal) */}
          <div className="mt-5 sm:mt-8 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-1.5 text-[11px] sm:text-xs text-slate-600 font-medium px-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
              <span>Ekspor PDF & Word Presisi</span>
            </span>
            <span className="text-slate-300 font-light hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
              <span>Multi-Rekening Bank</span>
            </span>
            <span className="text-slate-300 font-light hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
              <span>Format Legal Indonesia</span>
            </span>
          </div>

          {/* Social Proof & Document Counter Stats Bar (Dynamic DB Data) */}
          <div className="mx-auto mt-6 sm:mt-8 max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white shadow-2xs text-center">
            <div className="p-1">
              <p className="text-lg sm:text-2xl font-extrabold text-blue-600">{formattedDocCount}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Dokumen Diterbitkan</p>
            </div>
            <div className="p-1 border-l border-slate-100">
              <p className="text-lg sm:text-2xl font-extrabold text-blue-600">{formattedCompanyCount}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Perusahaan & UMKM</p>
            </div>
            <div className="p-1 border-t sm:border-t-0 sm:border-l border-slate-100">
              <p className="text-lg sm:text-2xl font-extrabold text-blue-600">100%</p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Ekspor Presisi PDF/DOCX</p>
            </div>
            <div className="p-1 border-t sm:border-t-0 border-l border-slate-100">
              <p className="text-lg sm:text-2xl font-extrabold text-blue-600">&lt; 1 Menit</p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Proses Buat Dokumen</p>
            </div>
          </div>

          {/* Document Type Selector Tabs (Single-Row Horizontal Scroll on Mobile, Flex Wrap on Desktop) */}
          <div className="mx-auto mt-6 sm:mt-10 max-w-4xl flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 px-1 py-1 -mx-1 sm:mx-auto">
            {docTypes.map((dt) => {
              const isActive = activePreviewTab === dt.id;
              return (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() =>
                    setActivePreviewTab(dt.id as "invoice" | "penawaran" | "quotation" | "bast" | "kontrak")
                  }
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="sm:hidden">
                    {dt.badge === "Serah Terima"
                      ? "BAST"
                      : dt.badge === "Tagihan"
                        ? "Faktur (Invoice)"
                        : dt.badge === "Penawaran"
                          ? "Surat Penawaran"
                          : dt.title}
                  </span>
                  <span className="hidden sm:inline">{dt.title}</span>
                </button>
              );
            })}
          </div>

          {/* Hero Admin Panel Card Mockup */}
          <div className="mx-auto mt-3 max-w-4xl rounded-xl border border-slate-200 bg-white p-3 sm:p-6 shadow-sm text-left overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3 sm:mb-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-slate-300" />
                <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-slate-300" />
                <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-slate-300" />
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 ml-1">
                  Pratinjau {docTypes.find((d) => d.id === activePreviewTab)?.title} Dokgen
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">PDF & DOCX Siap Ekspor</span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 sm:p-6 space-y-4 sm:space-y-5 text-xs">
              {/* Kop Sample */}
              <div className="flex flex-col sm:flex-row justify-between gap-2 border-b-2 border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">PT MAJU SEJAHTERA DIGITAL</h3>
                  <p className="text-slate-500 text-[10px] sm:text-[11px]">
                    Digital Services & Solution · Jakarta Pusat
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="font-serif text-sm sm:text-base font-bold text-slate-800 uppercase">
                    {activePreviewTab === "invoice" && "INVOICE"}
                    {activePreviewTab === "penawaran" && "SURAT PENAWARAN"}
                    {activePreviewTab === "quotation" && "ESTIMASI BIAYA (QUOTATION)"}
                    {activePreviewTab === "bast" && "BERITA ACARA SERAH TERIMA"}
                    {activePreviewTab === "kontrak" && "SURAT PERJANJIAN KERJA"}
                  </span>
                  <p className="font-mono text-[10px] sm:text-[11px] text-slate-600 font-semibold">
                    {activePreviewTab === "invoice" && "No. 001/INV/08/2026"}
                    {activePreviewTab === "penawaran" && "No. 005/SP/08/2026"}
                    {activePreviewTab === "quotation" && "No. 012/QUO/08/2026"}
                    {activePreviewTab === "bast" && "No. 002/BAST/08/2026"}
                    {activePreviewTab === "kontrak" && "No. 001/SPK/08/2026"}
                  </p>
                </div>
              </div>

              {/* Client & Metadata Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Kepada Yth.</p>
                  <p className="font-bold text-slate-800 text-xs">PT CONTOH KLIEN NUSANTARA</p>
                  <p className="text-slate-600 text-[10px] sm:text-[11px]">U.p. Budi Santoso · Surabaya</p>
                </div>
                <div className="sm:text-right space-y-0.5">
                  <p className="text-slate-600 text-[11px]">
                    Tanggal Dokumen: <span className="font-medium text-slate-900">4 Agustus 2026</span>
                  </p>
                  {activePreviewTab === "invoice" && (
                    <>
                      <p className="text-slate-600 text-[11px]">
                        Jatuh Tempo: <span className="font-medium text-slate-900">18 Agustus 2026</span>
                      </p>
                      <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        BELUM DIBAYAR
                      </span>
                    </>
                  )}
                  {activePreviewTab === "penawaran" && (
                    <p className="text-slate-600 text-[11px]">
                      Masa Berlaku: <span className="font-medium text-slate-900">14 Hari Kerja</span>
                    </p>
                  )}
                  {activePreviewTab === "quotation" && (
                    <p className="text-slate-600 text-[11px]">
                      Estimasi Pelaksanaan: <span className="font-medium text-slate-900">10 Hari Kerja</span>
                    </p>
                  )}
                  {activePreviewTab === "bast" && (
                    <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      SELESAI (100%)
                    </span>
                  )}
                  {activePreviewTab === "kontrak" && (
                    <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                      SAH & BERLAKU
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Sample Content based on activePreviewTab */}
              {activePreviewTab === "bast" ? (
                /* BAST Sample View */
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Pada hari ini <strong>Selasa, 4 Agustus 2026</strong>, telah dilaksanakan serah terima hasil
                    pekerjaan antara <strong>PIHAK PERTAMA</strong> (PT MAJU SEJAHTERA DIGITAL) dan{" "}
                    <strong>PIHAK KEDUA</strong> (PT CONTOH KLIEN NUSANTARA).
                  </p>
                  <div className="rounded border border-slate-200 bg-white p-3 space-y-1">
                    <p className="font-bold text-slate-900 text-xs">Rincian Serah Terima Pekerjaan:</p>
                    <p className="text-slate-600 text-[11px]">
                      1. Pengembangan Web Company Profile & CMS (Selesai 100%)
                    </p>
                    <p className="text-slate-600 text-[11px]">2. Pelatihan Administrator & Serah Terima Akun Akses</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 text-center text-[11px]">
                    <div className="border border-slate-200 bg-white rounded p-2">
                      <p className="text-slate-500">PIHAK PERTAMA</p>
                      <div className="h-10 my-1 flex items-center justify-center text-slate-400 italic text-[10px]">
                        [Tanda Tangan Digital]
                      </div>
                      <p className="font-bold text-slate-900">Jution Candra</p>
                    </div>
                    <div className="border border-slate-200 bg-white rounded p-2">
                      <p className="text-slate-500">PIHAK KEDUA</p>
                      <div className="h-10 my-1 flex items-center justify-center text-slate-400 italic text-[10px]">
                        [Tanda Tangan Digital]
                      </div>
                      <p className="font-bold text-slate-900">Budi Santoso</p>
                    </div>
                  </div>
                </div>
              ) : activePreviewTab === "kontrak" ? (
                /* Kontrak Sample View */
                <div className="space-y-3">
                  <div className="rounded border border-slate-200 bg-white p-3 space-y-2 text-[11px]">
                    <div>
                      <span className="font-bold text-slate-900">Pasal 1 - Lingkup Pekerjaan</span>
                      <p className="text-slate-600">
                        Pihak Pertama berkewajiban menyelesaikan perancangan sistem informasi sesuai spesifikasi teknis
                        yang disepakati.
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Pasal 2 - Nilai Kontrak & Pembayaran</span>
                      <p className="text-slate-600">
                        Nilai kontrak disepakati sebesar Rp 25.000.000 yang dibayarkan dalam 2 tahap termin pembayaran.
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Pasal 3 - Kerahasiaan Data</span>
                      <p className="text-slate-600">
                        Para pihak sepakat untuk menjaga kerahasiaan seluruh data dan informasi perusahaan.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-1 text-center text-[11px]">
                    <div className="border border-slate-200 bg-white rounded p-2">
                      <p className="text-slate-500">PIHAK PERTAMA</p>
                      <div className="h-8 my-1 flex items-center justify-center text-slate-400 italic text-[10px]">
                        [Stempel & TTD]
                      </div>
                      <p className="font-bold text-slate-900">PT MAJU SEJAHTERA</p>
                    </div>
                    <div className="border border-slate-200 bg-white rounded p-2">
                      <p className="text-slate-500">PIHAK KEDUA</p>
                      <div className="h-8 my-1 flex items-center justify-center text-slate-400 italic text-[10px]">
                        [Stempel & TTD]
                      </div>
                      <p className="font-bold text-slate-900">PT CONTOH KLIEN</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Invoice, Penawaran & Quotation Table View */
                <>
                  <div className="overflow-x-auto -mx-1 sm:mx-0">
                    <table className="w-full text-left border border-slate-300 min-w-[440px]">
                      <thead className="bg-slate-800 text-white font-semibold text-[11px]">
                        <tr>
                          <th className="p-2 w-8 text-center">No</th>
                          <th className="p-2">Uraian / Deskripsi Pekerjaan</th>
                          <th className="p-2 text-center w-14">Qty</th>
                          <th className="p-2 text-right w-24">Harga Satuan</th>
                          <th className="p-2 text-right w-24">Jumlah</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-700 bg-white text-[11px]">
                        {activePreviewTab === "penawaran" ? (
                          <>
                            <tr>
                              <td className="p-2 text-center font-medium text-slate-500">1</td>
                              <td className="p-2 font-medium text-slate-900">
                                Perancangan Sistem Aplikasi e-Procurement
                              </td>
                              <td className="p-2 text-center">1 paket</td>
                              <td className="p-2 text-right">Rp 15.000.000</td>
                              <td className="p-2 text-right font-semibold text-slate-900">Rp 15.000.000</td>
                            </tr>
                            <tr>
                              <td className="p-2 text-center font-medium text-slate-500">2</td>
                              <td className="p-2 font-medium text-slate-900">
                                Pelatihan User & Pemeliharaan System (6 Bulan)
                              </td>
                              <td className="p-2 text-center">1 paket</td>
                              <td className="p-2 text-right">Rp 5.000.000</td>
                              <td className="p-2 text-right font-semibold text-slate-900">Rp 5.000.000</td>
                            </tr>
                          </>
                        ) : activePreviewTab === "quotation" ? (
                          <>
                            <tr>
                              <td className="p-2 text-center font-medium text-slate-500">1</td>
                              <td className="p-2 font-medium text-slate-900">
                                Audit Keamanan Sistem & Web Vulnerability Assessment
                              </td>
                              <td className="p-2 text-center">1 unit</td>
                              <td className="p-2 text-right">Rp 2.500.000</td>
                              <td className="p-2 text-right font-semibold text-slate-900">Rp 2.500.000</td>
                            </tr>
                            <tr>
                              <td className="p-2 text-center font-medium text-slate-500">2</td>
                              <td className="p-2 font-medium text-slate-900">
                                Laporan Penilaian & Recommendations Report
                              </td>
                              <td className="p-2 text-center">1 set</td>
                              <td className="p-2 text-right">Rp 1.500.000</td>
                              <td className="p-2 text-right font-semibold text-slate-900">Rp 1.500.000</td>
                            </tr>
                          </>
                        ) : (
                          <>
                            <tr>
                              <td className="p-2 text-center font-medium text-slate-500">1</td>
                              <td className="p-2 font-medium text-slate-900">
                                Jasa Desain Branding & Graphic Identity
                              </td>
                              <td className="p-2 text-center">1 pcs</td>
                              <td className="p-2 text-right">Rp 1.500.000</td>
                              <td className="p-2 text-right font-semibold text-slate-900">Rp 1.500.000</td>
                            </tr>
                            <tr>
                              <td className="p-2 text-center font-medium text-slate-500">2</td>
                              <td className="p-2 font-medium text-slate-900">Pengembangan Web Company Profile & CMS</td>
                              <td className="p-2 text-center">1 pcs</td>
                              <td className="p-2 text-right">Rp 3.500.000</td>
                              <td className="p-2 text-right font-semibold text-slate-900">Rp 3.500.000</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {activePreviewTab === "penawaran" && (
                    <div className="rounded border border-slate-200 bg-white p-2.5 space-y-1.5">
                      <p className="font-bold text-slate-900 text-xs">
                        Spesifikasi & Lingkup Pekerjaan (Scope of Work):
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 font-medium border-t border-slate-100 pt-1.5">
                        <div>
                          <strong>1. Analisis:</strong> Identifikasi alur kerja & kebutuhan sistem
                        </div>
                        <div>
                          <strong>2. UI/UX:</strong> Desain antarmuka responsif & interaktif
                        </div>
                        <div>
                          <strong>3. Backend:</strong> Integrasi API & Enkripsi data PostgreSQL
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank & Total Sample */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                    <div className="rounded border border-slate-200 bg-white p-2.5 space-y-1 w-full sm:w-auto">
                      <p className="font-bold text-slate-600 text-[10px] uppercase">Pembayaran dapat ditransfer ke</p>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-[10px] text-slate-500">Bank BCA</p>
                          <p className="font-mono font-bold text-slate-900 text-xs">123-456-7890</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Atas Nama</p>
                          <p className="font-semibold text-slate-800 text-xs">PT MAJU SEJAHTERA</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto flex justify-between sm:block">
                      <span className="sm:hidden text-xs font-semibold text-slate-500">Total:</span>
                      <div>
                        <p className="hidden sm:block text-[11px] text-slate-500">Total Tagihan / Estimasi</p>
                        <p className="text-base sm:text-lg font-bold text-slate-900">
                          {activePreviewTab === "penawaran"
                            ? "Rp 20.000.000"
                            : activePreviewTab === "quotation"
                              ? "Rp 4.000.000"
                              : "Rp 5.000.000"}
                        </p>
                        <p className="text-[10px] text-slate-500 italic hidden sm:block">
                          Terbilang:{" "}
                          {activePreviewTab === "penawaran"
                            ? "Dua Puluh Juta Rupiah"
                            : activePreviewTab === "quotation"
                              ? "Empat Juta Rupiah"
                              : "Lima Juta Rupiah"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FEATURES SECTION (`#fitur`) ---------- */}
      <section id="fitur" className="border-t border-slate-200 bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Keunggulan Utama</span>
            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-3xl">Fitur Utama Generator Dokumen Dokgen</h2>
            <p className="mt-1.5 text-slate-600 text-xs sm:text-sm">
              Semua yang Anda butuhkan untuk mengelola korespondensi bisnis secara efisien.
            </p>
          </div>

          <div className="mt-8 sm:mt-10 grid gap-3.5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 hover:border-slate-300 hover:bg-white transition-all shadow-2xs">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mb-3 sm:mb-4">
                <Download className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Ekspor PDF & Word (.docx)</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Ekspor file PDF atau Word dengan hasil 100% presisi tanpa pergeseran layout atau font.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 hover:border-slate-300 hover:bg-white transition-all shadow-2xs">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 mb-3 sm:mb-4">
                <Landmark className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Multi-Rekening Bank</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Kelola banyak bank di pengaturan dan tentukan pilihan bank transfer per dokumen.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 hover:border-slate-300 hover:bg-white transition-all shadow-2xs">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 mb-3 sm:mb-4">
                <Layers className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Tabel Lingkup Pekerjaan</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Sajikan rincian pekerjaan & spesifikasi teknis dalam tabel 3 kolom yang rapi.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 hover:border-slate-300 hover:bg-white transition-all shadow-2xs">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 mb-3 sm:mb-4">
                <Mail className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Kirim via WhatsApp & Email</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Kirim invoice langsung ke email klien atau bagikan link instan via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- DOCUMENT TYPES SECTION (`#jenis-dokumen`) ---------- */}
      <section id="jenis-dokumen" className="py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Dukungan Dokumen</span>
            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-3xl">5 Jenis Dokumen Standar Bisnis</h2>
          </div>

          <div className="mt-8 sm:mt-10 grid gap-3.5 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {docTypes.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-blue-500/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <IconComp className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS (`#cara-kerja`) ---------- */}
      <section id="cara-kerja" className="border-t border-slate-200 bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Langkah Mudah</span>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-3xl">Cara Kerja Dokgen</h2>

          <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 text-center shadow-2xs">
              <div className="mx-auto flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs mb-3 sm:mb-4">
                1
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Pilih Jenis Dokumen</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Pilih apakah ingin membuat Faktur (Invoice), Surat Penawaran, Estimasi Biaya, BAST, atau Kontrak.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 text-center shadow-2xs">
              <div className="mx-auto flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs mb-3 sm:mb-4">
                2
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Isi Formulir & Rekening</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Masukkan rincian item, lingkup kerja, dan pilih rekening bank transfer yang ingin ditampilkan.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 text-center shadow-2xs">
              <div className="mx-auto flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs mb-3 sm:mb-4">
                3
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Ekspor atau Kirim</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Ekspor file PDF/Word atau kirimkan langsung via Email & WhatsApp dalam 1 klik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ SECTION (`#faq`) ---------- */}
      <section id="faq" className="py-10 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">FAQ</span>
            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-3xl">Pertanyaan Umum</h2>
          </div>

          <div className="mt-6 sm:mt-8 space-y-2.5 sm:space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-3.5 sm:p-4 text-left text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    <span className="pr-2">{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180 text-blue-600" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 text-xs text-slate-600 border-t border-slate-100 pt-2.5 sm:pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- CTA BANNER ---------- */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 text-center sm:text-left shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="max-w-xl">
              <h2 className="text-lg font-bold text-slate-900 sm:text-2xl">Mulai Buat Dokumen Bisnis Anda Sekarang</h2>
              <p className="mt-1 text-xs text-slate-600">
                Kelola invoice dan surat penawaran perusahaan dengan rapi, otomatis, dan profesional.
              </p>
            </div>
            <Link href={actionUrl} className="shrink-0 w-full sm:w-auto">
              <Button
                size="default"
                className="w-full sm:w-auto bg-blue-600 font-semibold text-white px-6 text-xs sm:text-sm shadow-2xs hover:bg-blue-700 py-2.5 sm:py-2"
              >
                {actionText} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-slate-200 bg-white py-6 text-slate-500 text-xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="Dokgen" className="h-5 w-5 rounded-md shadow-2xs" />
            <span className="font-bold text-slate-900">Dokgen.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600 font-medium text-xs">
            <a href="#fitur" className="hover:text-blue-600 transition-colors">
              Fitur
            </a>
            <a href="#jenis-dokumen" className="hover:text-blue-600 transition-colors">
              Jenis Dokumen
            </a>
            <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">
              Cara Kerja
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </a>
            <Link href="/login" className="hover:text-blue-600 transition-colors">
              Masuk
            </Link>
          </div>

          <p className="text-slate-400">
            © {new Date().getFullYear()} Dokgen. Seluruh hak cipta dilindungi undang-undang.
          </p>
        </div>
      </footer>
    </div>
  );
}
