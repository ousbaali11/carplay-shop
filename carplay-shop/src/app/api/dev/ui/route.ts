import { NextResponse } from "next/server";
import { isValidInterfaceVersion } from "@/lib/ui";

// Outil de développement UNIQUEMENT : pose un cookie "ui-preview" qui force
// l'interface affichée sur localhost (standard ou premium), sans toucher au
// réglage global en base (partagée avec le site en ligne).
//
//   http://localhost:3000/api/dev/ui?set=premium   -> prévisualiser Premium
//   http://localhost:3000/api/dev/ui?set=standard  -> prévisualiser Standard
//   http://localhost:3000/api/dev/ui?clear=1       -> revenir au réglage réel
//
// En production, cette route répond 404 et le cookie est ignoré par le layout.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const set = url.searchParams.get("set");
  const clear = url.searchParams.get("clear");
  const redirectTo = url.searchParams.get("to") || "/";
  const res = NextResponse.redirect(new URL(redirectTo.startsWith("/") ? redirectTo : "/", req.url), 303);

  if (clear) {
    res.cookies.set("ui-preview", "", { path: "/", maxAge: 0 });
    return res;
  }
  if (!isValidInterfaceVersion(set)) {
    return NextResponse.json({ error: "Utilise ?set=premium, ?set=standard ou ?clear=1" }, { status: 400 });
  }
  res.cookies.set("ui-preview", set, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
