import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { getCompany, getMembers } from "@/lib/data";
import { SettingsForm } from "@/components/settings/settings-form";
import { Card, CardContent } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function SettingsPage() {
  const companyData = await getCompany();
  if (!companyData) redirect("/register");
  const company = companyData.company;
  const members = await getMembers(company.id);

  return (
    <div className="space-y-6">
      <SettingsForm company={company} members={members} isOwner={companyData.isOwner} />

      <Card className="border-slate-200/80 shadow-xs rounded-2xl overflow-hidden bg-rose-50/30 border-l-4 border-l-rose-500">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Keluar dari Docgen</p>
              <p className="text-xs text-slate-500">Akhiri sesi aktif akun Anda di perangkat ini.</p>
            </div>
          </div>
          <LogoutButton
            variant="outline"
            className="w-full sm:w-auto text-rose-600 hover:bg-rose-100/60 hover:text-rose-700 border-rose-200 rounded-xl font-semibold text-xs h-10 px-4"
          />
        </CardContent>
      </Card>
    </div>
  );
}
