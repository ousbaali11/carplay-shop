import { getSiteSettings } from "@/lib/orders";
import SiteBrand from "./SiteBrand";
import HeaderNav from "./HeaderNav";

export default async function Header() {
  const settings = await getSiteSettings();

  return (
    <header style={{ borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "rgba(16,19,23,0.85)", backdropFilter: "blur(8px)", zIndex: 50 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <SiteBrand siteName={settings.siteName} logoUrl={settings.logoUrl} logoHeight={settings.logoHeight} />
        <HeaderNav />
      </div>
    </header>
  );
}