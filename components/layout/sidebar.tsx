"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  Users,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Dokumen", icon: FileText },
  { href: "/clients", label: "Klien", icon: Users },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

function Brand({ companyName, compact }: { companyName?: string; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="Dokgen" className="h-9 w-9 rounded-lg shadow-sm" />
      <div className="min-w-0">
        <p className="text-sm font-bold tracking-tight">Dokgen</p>
        {companyName ? (
          <p className="truncate text-[11px] text-muted-foreground">{companyName}</p>
        ) : (
          !compact && <p className="truncate text-[11px] text-muted-foreground">Generator Dokumen Bisnis</p>
        )}
      </div>
    </div>
  );
}

function NavContent({ companyName, isOwner }: { companyName: string; isOwner: boolean }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-4">
        <Brand companyName={companyName} />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <Button
          asChild
          variant="outline"
          className="mb-2 w-full justify-start border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-50"
        >
          <Link href="/documents/new">
            <PlusCircle />
            Buat Dokumen
          </Link>
        </Button>
        {navItems.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 flex items-center gap-2 px-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {companyName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">
              {isOwner ? "Pemilik Perusahaan" : "Anggota Tim"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{companyName}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar({ companyName, isOwner }: { companyName: string; isOwner: boolean }) {
  return (
    <>
      {/* Desktop */}
      <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 border-r bg-white lg:block">
        <NavContent companyName={companyName} isOwner={isOwner} />
      </aside>

      {/* Mobile top bar */}
      <header className="no-print fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-white/95 px-4 backdrop-blur lg:hidden">
        <Brand compact />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full p-0.5 outline-none ring-offset-2 transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Menu akun"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {companyName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="truncate font-medium">{companyName}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {isOwner ? "Pemilik Perusahaan" : "Anggota Tim"}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" /> Pengaturan
              </Link>
            </DropdownMenuItem>
            <form action={logoutAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full text-red-600 focus:text-red-700">
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </>
  );
}