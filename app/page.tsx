import { getCompany, getSessionUser, getLandingPageStats } from "@/lib/data";
import { LandingPage } from "@/components/landing/landing-page";

export const dynamic = "force-dynamic";

async function getLandingViewer() {
  try {
    const user = await getSessionUser();
    if (!user) return { isLoggedIn: false, hasCompany: false };

    const companyData = await getCompany();
    return { isLoggedIn: true, hasCompany: !!companyData?.company };
  } catch (error) {
    // Landing page harus tetap tersedia saat session store/database mengalami
    // gangguan sementara. Route terproteksi tetap menangani error secara normal.
    console.error("[HomePage] Gagal memuat sesi landing page:", error);
    return { isLoggedIn: false, hasCompany: false };
  }
}

export default async function HomePage() {
  const [viewer, stats] = await Promise.all([getLandingViewer(), getLandingPageStats()]);

  return <LandingPage isLoggedIn={viewer.isLoggedIn} hasCompany={viewer.hasCompany} stats={stats} />;
}
