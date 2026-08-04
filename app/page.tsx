import { getCompany, getSessionUser, getLandingPageStats } from "@/lib/data";
import { LandingPage } from "@/components/landing/landing-page";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();
  const companyData = user ? await getCompany() : null;
  const stats = await getLandingPageStats();

  const isLoggedIn = !!user;
  const hasCompany = !!companyData?.company;

  return <LandingPage isLoggedIn={isLoggedIn} hasCompany={hasCompany} stats={stats} />;
}