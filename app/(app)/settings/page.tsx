import { redirect } from "next/navigation";
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

      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-6">
          <div>
            <p className="text-sm font-semibold">Keluar dari Dokgen</p>
            <p className="text-xs text-muted-foreground">Akhiri sesi di perangkat ini.</p>
          </div>
          <LogoutButton
            variant="outline"
            className="w-full sm:w-auto text-red-600 hover:bg-red-50 hover:text-red-700 border-slate-200"
          />
        </CardContent>
      </Card>
    </div>
  );
}
