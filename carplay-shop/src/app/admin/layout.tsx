import { getSiteSettings } from "@/lib/orders";
import SiteBrand from "@/components/SiteBrand";
import UserAvatar from "@/components/UserAvatar";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div>
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <SiteBrand siteName={settings.siteName} logoUrl={settings.logoUrl} logoHeight={settings.logoHeight} href="/admin" />
          <UserAvatar context="admin" />
        </div>
      </header>
      {children}
    </div>
  );
}
