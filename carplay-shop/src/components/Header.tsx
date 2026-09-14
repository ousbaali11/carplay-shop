import { getSiteSettings } from "@/lib/orders";
import SiteBrand from "./SiteBrand";
import HeaderNav from "./HeaderNav";

export default async function Header() {
  const settings = await getSiteSettings();

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <SiteBrand siteName={settings.siteName} logoUrl={settings.logoUrl} logoHeight={settings.logoHeight} />
        <HeaderNav />
      </div>
    </header>
  );
}
