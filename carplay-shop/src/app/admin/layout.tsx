import { getSiteSettings } from "@/lib/orders";
import SiteBrand from "@/components/SiteBrand";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div>
      <header style={{ borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", height: 72 }}>
          <SiteBrand siteName={settings.siteName} logoUrl={settings.logoUrl} logoHeight={settings.logoHeight} href="/admin" />
        </div>
      </header>
      {children}
    </div>
  );
}