import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <p className="text-sm font-bold tracking-widest text-blue-600">404</p>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Alamat mungkin sudah berubah, atau Anda tidak memiliki akses ke halaman tersebut.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Kembali ke dashboard
        </Link>
      </div>
    </main>
  );
}
