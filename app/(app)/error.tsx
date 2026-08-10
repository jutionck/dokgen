"use client";

import { useEffect } from "react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-blue-600">Terjadi kendala</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Halaman belum dapat ditampilkan</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Muat ulang bagian ini. Jika masalah tetap muncul, kembali ke dashboard lalu coba lagi.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Coba lagi
        </button>
      </div>
    </main>
  );
}
