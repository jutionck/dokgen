import { Coffee, Heart } from "lucide-react";

/**
 * Footer identitas aplikasi — dipakai di halaman login & register.
 * Selalu satu baris (desktop & mobile), font mengecil di mobile.
 */
export function AuthFooter() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground sm:gap-x-3 sm:text-xs">
      <p className="flex items-center gap-1">
        Dukung developer{" "}
        <a
          href="https://saweria.co/jutionck"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-semibold text-blue-700 hover:underline"
        >
          <Coffee className="h-3 w-3" /> Saweria
        </a>
      </p>
      <span className="h-3 w-px shrink-0 bg-slate-300" />
      <p className="flex items-center gap-1">
        Dibuat dengan <Heart className="h-2.5 w-2.5 text-red-500" /> oleh{" "}
        <a
          href="https://mipdevp.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-700 hover:underline"
        >
          MIPDEVP
        </a>
      </p>
    </div>
  );
}
