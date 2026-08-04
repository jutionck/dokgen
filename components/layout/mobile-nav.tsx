"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, Plus, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/documents", label: "Dokumen", icon: FileText },
  { href: "/documents/new", label: "Buat", icon: Plus, center: true },
  { href: "/clients", label: "Klien", icon: Users },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

/**
 * Bottom navigation ala aplikasi native — hanya tampil di layar < lg.
 * Tombol tengah "Buat" lebih menonjol (raised).
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Navigasi utama"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch">
        {items.map((item) => {
          const active =
            item.href !== "/documents/new" &&
            (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)));
          const Icon = item.icon;

          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-1 items-center justify-center"
                aria-label="Buat dokumen baru"
              >
                <span
                  className={cn(
                    "flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-transform active:scale-95"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                active ? "text-blue-700" : "text-slate-400"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "fill-blue-100")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}