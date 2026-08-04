import { redirect } from "next/navigation";
import { getCompany, getSessionUser } from "@/lib/data";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [session, companyData] = await Promise.all([getSessionUser(), getCompany()]);

  if (!session) redirect("/login");
  if (!companyData) redirect("/register");

  return (
    <div className="flex min-h-screen">
      <Sidebar companyName={companyData.company.name} isOwner={companyData.isOwner} />
      <main className="dot-grid min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
