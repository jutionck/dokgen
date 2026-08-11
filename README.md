# Docgen — Generator Dokumen Bisnis

Docgen adalah aplikasi web berbasis Next.js untuk membuat dan mengelola dokumen bisnis Indonesia dalam satu tempat: **Surat Penawaran, Quotation, Invoice, Berita Acara Serah Terima (BAST), dan Kontrak/SPK**.

## Fitur Utama

- Preview dokumen responsif dengan layout konsisten terhadap hasil ekspor.
- Download PDF server-side dengan pilihan kertas A4, Letter, dan Legal.
- Export DOCX untuk diedit kembali di Microsoft Word atau Google Docs.
- Filename PDF, DOCX, dan lampiran email menyertakan nama klien.
- Pengiriman email dengan PDF terlampir melalui Resend.
- Logo dan tanda tangan digital disimpan di private Vercel Blob.
- Multi-rekening bank dan pemilihan rekening per dokumen.
- Nomor dokumen otomatis berdasarkan jenis dan periode.
- Status, riwayat email, duplikasi, edit, dan penghapusan dokumen.
- Akses berbasis perusahaan/tenant dan keanggotaan tim.
- Footer identitas Docgen pada PDF, DOCX, hasil cetak, dan lampiran email.

## Teknologi

| Komponen       | Teknologi                                   |
| -------------- | ------------------------------------------- |
| Framework      | Next.js 16 App Router, React 19, TypeScript |
| UI             | Tailwind CSS, Radix UI, Lucide              |
| Database       | MySQL 8+                                    |
| ORM            | Drizzle ORM                                 |
| Authentication | Better Auth                                 |
| Object storage | Private Vercel Blob                         |
| Email          | Resend                                      |
| PDF            | `@react-pdf/renderer`                       |
| DOCX           | `docx`                                      |

## Persyaratan

- Node.js 20 atau lebih baru.
- npm.
- MySQL 8 atau layanan MySQL yang kompatibel.
- Vercel Blob store berakses **Private** untuk upload logo dan tanda tangan.
- Akun Resend jika fitur kirim email digunakan.

## Setup Lokal

### 1. Instal dependency

```bash
npm install
```

### 2. Siapkan environment

```bash
cp .env.example .env.local
```

Environment utama:

| Nama                          | Keterangan                                                |
| ----------------------------- | --------------------------------------------------------- |
| `DATABASE_URL`                | Connection string MySQL.                                  |
| `BETTER_AUTH_SECRET`          | Secret acak minimal 32 karakter.                          |
| `BETTER_AUTH_URL`             | Origin aplikasi, misalnya `http://localhost:3000`.        |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Daftar origin tepercaya dipisahkan koma.                  |
| `RESEND_API_KEY`              | API key Resend.                                           |
| `RESEND_FROM`                 | Identitas pengirim, misalnya `Docgen <kirim@domain.com>`. |
| `BLOB_READ_WRITE_TOKEN`       | Read-write token Vercel Blob.                             |

Buat secret autentikasi:

```bash
openssl rand -base64 32
```

Jika Vercel Blob dibuat dengan prefix `BLOB_READ_WRITE_TOKEN`, Vercel dapat menghasilkan `BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN`. Docgen mendukung nama standar dan nama hasil prefix tersebut.

Untuk menarik environment dari project Vercel yang sudah terhubung:

```bash
npx vercel link
npx vercel env pull .env.local
```

### 3. Siapkan database lokal baru

Untuk database development baru, sinkronkan schema MySQL saat ini:

```bash
npx drizzle-kit push
```

> Folder `db/migrations` menyimpan baseline historis yang sebagian berasal dari implementasi PostgreSQL lama. Jangan menjalankan seluruh migration tersebut pada database production MySQL tanpa meninjau SQL dan status schema target terlebih dahulu.

### 4. Jalankan aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Setup Private Vercel Blob

1. Buka project di Vercel.
2. Pilih **Storage → Create Database → Blob**.
3. Buat store dengan akses **Private**.
4. Hubungkan store ke environment Production, Preview, dan Development.
5. Redeploy aplikasi setelah environment ditambahkan.

Private Blob tidak diekspos langsung ke browser. Preview logo dan tanda tangan dilayani melalui `/api/company-assets/[kind]`, yang memverifikasi sesi dan perusahaan pengguna. PDF, DOCX, dan lampiran email mengambil aset langsung secara server-side.

## Setup Resend

1. Buat API key di Resend dan isi `RESEND_API_KEY`.
2. Verifikasi domain pengirim.
3. Isi `RESEND_FROM`, misalnya:

```env
RESEND_FROM="Docgen <kirim@domain-anda.com>"
```

## Deploy ke Vercel

1. Push repository ke GitHub dan import project ke Vercel.
2. Isi seluruh environment untuk Production dan Preview.
3. Pastikan schema database MySQL target sudah sesuai dengan `db/schema.ts`.
4. Buat dan hubungkan private Vercel Blob store.
5. Deploy aplikasi.

Environment production minimum:

```env
DATABASE_URL="mysql://user:password@host:3306/database"
BETTER_AUTH_SECRET="secret-acak-minimal-32-karakter"
BETTER_AUTH_URL="https://docgen.example.com"
BETTER_AUTH_TRUSTED_ORIGINS="https://docgen.example.com"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
RESEND_API_KEY="re_..."
RESEND_FROM="Docgen <kirim@example.com>"
```

Jangan commit file `.env` atau membagikan nilai secret/token.

## Alur Penggunaan

1. Registrasi dan buat perusahaan, atau bergabung memakai kode tim.
2. Lengkapi profil, rekening bank, penandatangan, logo, dan tanda tangan digital.
3. Tambahkan data klien.
4. Pilih jenis dokumen, isi rincian dan item, lalu simpan.
5. Preview dokumen, download PDF/DOCX, kirim email, atau bagikan melalui WhatsApp.

Contoh filename hasil download:

```text
Surat Penawaran-Warta Selatan-001-SP-08-2026-A4.pdf
```

## Struktur Project

```text
app/
  (app)/dashboard                 dashboard dan statistik
  (app)/documents                 daftar dan filter dokumen
  (app)/documents/[id]            detail, preview, dan aksi dokumen
  (app)/documents/new             wizard pembuatan dokumen
  (app)/clients                   manajemen klien
  (app)/settings                  profil, bank, penandatangan, dan tim
  api/company-assets/[kind]       proxy aset private per tenant
  api/documents/[id]/pdf          generator PDF
  api/documents/[id]/docx         generator DOCX
  api/documents/[id]/email        pengiriman email dan lampiran PDF
components/documents/templates    template preview HTML
lib/pdf                           renderer PDF
lib/docx                          builder DOCX
lib/documents                     loader, filename, paper, dan branding
db/schema.ts                      schema MySQL Drizzle
```

## Validasi Sebelum Release

```bash
npm run lint
npx tsc --noEmit
npm run build -- --webpack
```

## Keamanan

- Query bisnis difilter berdasarkan `company_id` pengguna aktif.
- Aset Blob private hanya dilayani setelah verifikasi sesi dan tenant.
- Server Action memvalidasi tipe serta ukuran file upload.
- PDF, DOCX, dan endpoint aset menggunakan cache private/no-store sesuai kebutuhan.
