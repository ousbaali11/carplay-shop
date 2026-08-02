import { getSiteSettings } from "@/lib/orders";
import SiteBrand from "@/components/SiteBrand";
import UserAvatar from "@/components/UserAvatar";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div>
      <header style={{ borderBottom: "1px solid var(--line)", background: "var(--bg)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72, padding: "0 24px" }}>
          <SiteBrand siteName={settings.siteName} logoUrl={settings.logoUrl} logoHeight={settings.logoHeight} href="/admin" />
          <UserAvatar />
        </div>
      </header>
      {children}
    </div>
  );
}