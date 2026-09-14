"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

// Découpe "Ahmed BAZAID" -> ["A", "B"] (première lettre du prénom, première
// lettre du nom). Se rabat sur la 2e lettre du prénom si pas de nom de famille.
function getInitials(name: string): [string, string] {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0]?.toUpperCase() || "?";
  const second = (parts[1]?.[0] || parts[0]?.[1] || "")?.toUpperCase() || "";
  return [first, second];
}

function CircleButton({
  letters,
  onClick,
  ariaLabel,
  showAdminBadge,
}: {
  letters: [string, string];
  onClick: () => void;
  ariaLabel: string;
  showAdminBadge?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} title={ariaLabel} className="avatar-circle">
      <span className="avatar-letter-1">{letters[0]}</span>
      <span className="avatar-letter-2">{letters[1]}</span>

      {showAdminBadge && (
        <span aria-hidden="true" className="avatar-admin-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6V11C4 16 7.5 20.5 12 22C16.5 20.5 20 16 20 11V6L12 2Z" fill="var(--amber)" />
          </svg>
        </span>
      )}
    </button>
  );
}

function DropdownMenu({ accountHref, accountLabel, onClose }: { accountHref: string; accountLabel: string; onClose: () => void }) {
  return (
    <div className="card avatar-menu" role="menu">
      <Link href={accountHref} onClick={onClose} className="avatar-menu-item" role="menuitem">
        {accountLabel}
      </Link>
      <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="avatar-menu-item avatar-menu-signout" role="menuitem">
        Se déconnecter
      </button>
    </div>
  );
}

// Cercle d'identité cliquable dans le menu : initiales du client connecté,
// "AD" (badge admin) pour un compte admin, ou "CA" (initiales du site) pour un
// visiteur non connecté. Pour un compte connecté (client ou admin), le clic
// ouvre un petit menu (compte + déconnexion), comme sur la plupart des
// réseaux sociaux/applications. Pour un visiteur, le clic va directement vers
// la connexion (rien à déconnecter).
//
// context="public" (par défaut) : sur les pages publiques du site, un compte
// admin n'est JAMAIS reconnu comme connecté — il apparaît comme un simple
// visiteur (cercle "CA"), pour ne jamais mélanger identité admin et navigation
// cliente. context="admin" : utilisé uniquement dans le panel admin lui-même,
// où l'identité admin doit au contraire être visible.
export default function UserAvatar({ context = "public" }: { context?: "public" | "admin" }) {
  const { data: session } = useSession();
  const rawRole = (session?.user as any)?.role;
  const role = context === "public" && rawRole === "ADMIN" ? null : rawRole;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  if (role === "ADMIN") {
    return (
      <div ref={ref} className="avatar-wrap">
        <CircleButton letters={["A", "D"]} onClick={() => setOpen((o) => !o)} ariaLabel="Menu admin" showAdminBadge />
        {open && <DropdownMenu accountHref="/admin" accountLabel="Admin" onClose={() => setOpen(false)} />}
      </div>
    );
  }

  if (role === "CLIENT" && session?.user?.name) {
    return (
      <div ref={ref} className="avatar-wrap">
        <CircleButton letters={getInitials(session.user.name)} onClick={() => setOpen((o) => !o)} ariaLabel="Mon compte" />
        {open && <DropdownMenu accountHref="/compte" accountLabel="Mon compte" onClose={() => setOpen(false)} />}
      </div>
    );
  }

  return (
    <Link href="/compte/connexion" aria-label="Se connecter" title="Se connecter" className="avatar-circle avatar-link">
      <span className="avatar-letter-1">C</span>
      <span className="avatar-letter-2">A</span>
    </Link>
  );
}
