# Dokgen — Generator Dokumen Bisnis

Aplikasi web untuk membuat dokumen bisnis **dalam satu pintu**: **Surat Penawaran, Quotation, Invoice, BAST, dan Kontrak/SPK**.

- Download langsung dalam format **PDF** (server-side, kualitas cetak)
- **Export DOCX** untuk diedit di Word / Google Docs
- **Kirim via email** dengan PDF ter-lampir otomatis (Resend)
- **History dokumen** tersimpan, bisa diduplikasi, status (draft / terkirim / lunas / selesai / batal)
- **Login tim** — anggota bergabung dengan kode perusahaan
- Logo, data bank, dan penandatangan dikonfigurasi sekali di Pengaturan

## Tech Stack (semua gratis)

| Komponen       | Pilihan                                                    | Alasan                            |
| -------------- | ---------------------------------------------------------- | --------------------------------- |
| Framework      | Next.js 16 (App Router)                                    | Serverless di Vercel              |
| Database       | [Neon Postgres](https://neon.tech) (free tier)             | Postgres serverless, 500MB gratis |
| ORM            | Drizzle ORM                                                | Type-safe, migrasi otomatis       |
| Auth           | [Better Auth](https://better-auth.com) (open source)       | Email/password, tanpa biaya       |
| Email          | [Resend](https://resend.com) (free tier)                   | 3.000 email/bulan gratis          |
| Storage (logo) | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) | Gratis 1GB                        |
| PDF            | @react-pdf/renderer                                        | Render server-side                |
| DOCX           | docx                                                       | Export Word asli                  |

## Setup Lokal

### 1. Environment variables

```bash
cp .env.example .env.local
```

Isi `DATABASE_URL` (dari dashboard Neon), lalu:

```bash
openssl rand -base64 32   # untuk BETTER_AUTH_SECRET
```

### 2. Install & migrasi database

```bash
npm install
npm run db:migrate    # apply migrasi ke Neon (jalankan sekali)
npm run dev           # http://localhost:3000
```

### 3. Setup email (Resend)

1. Daftar di [resend.com](https://resend.com) → buat API Key → isi `RESEND_API_KEY`
2. Verifikasi domain (atau pakai domain `resend.dev` saat uji coba) → isi `RESEND_FROM`:
   ```
   RESEND_FROM="Nama Perusahaan <kirim@domain-anda.com>"
   ```

### 4. Setup logo (Vercel Blob)

- Local: `npx vercel link` lalu `npx vercel env pull` — atau buat token di
  [vercel.com/docs/storage/vercel-blob](https://vercel.com/docs/storage/vercel-blob) dan isi `BLOB_READ_WRITE_TOKEN`

## Deploy ke Vercel

1. Push repo ke GitHub → import di [vercel.com](https://vercel.com)
2. Di dashboard Vercel → **Storage** → **Blob** → _Create_ (token otomatis masuk ke env)
3. Isi environment variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
   (URL production, contoh `https://dokgen.vercel.app`), `BETTER_AUTH_TRUSTED_ORIGINS`,
   `RESEND_API_KEY`, `RESEND_FROM`
4. Jalankan migrasi sekali: terminal → `npx vercel env pull` lalu `npm run db:migrate`
   (atau jalankan `drizzle-kit migrate` dari local dengan `DATABASE_URL` production)

> Neon free tier menidurkan database setelah idle beberapa menit — request pertama
> setelah idle butuh ~1 detik lebih lama. Normal.

## Alur Penggunaan

1. **Registrasi** → buat perusahaan baru (jadi pemilik) atau gabung tim pakai kode
2. **Pengaturan** → isi profil, logo, rekening bank, penandatangan, kode tim
3. **Klien** → tambahkan data pelanggan
4. **Buat Dokumen** → pilih jenis (Surat Penawaran / Quotation / Invoice / BAST / Kontrak),
   isi rincian & item, simpan — nomor dokumen otomatis (mis. `001/INV/08/2026`)
5. **Di halaman dokumen** → lihat preview, **Download PDF**, **Export DOCX**,
   **Kirim Email** (PDF otomatis terlampir), duplikat, edit, ubah status

## Struktur Penting

```
app/
  (app)/dashboard          → ringkasan & statistik
  (app)/documents          → daftar dokumen (history) + filter
  (app)/documents/new      → form dokumen (5 jenis)
  (app)/documents/[id]     → detail + aksi (PDF/DOCX/email)
  (app)/clients            → manajemen klien
  (app)/settings           → profil perusahaan, bank, penandatangan, tim
  api/documents/[id]/pdf   → generate PDF (GET)
  api/documents/[id]/docx  → export DOCX (GET)
  api/documents/[id]/email → kirim via Resend (POST)
components/documents/templates → template HTML (preview & cetak)
lib/pdf/                  → rendering PDF per jenis dokumen
lib/docx/                 → builder DOCX per jenis dokumen
db/schema.ts              → skema Drizzle (migrasi: npm run db:generate)
```

## Catatan

- Nomor dokumen: `001/INV/MM/YYYY` — urut otomatis per jenis per bulan (aman untuk tim kecil)
- Keamanan data: semua query dokumen selalu difilter `company_id` milik pengguna login
- Invoice "Tagihan Berjalan" di dashboard dihitung dari invoice berstatus selain lunas/batal
