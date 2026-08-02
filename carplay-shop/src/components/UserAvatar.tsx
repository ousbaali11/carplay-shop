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
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      style={{
        position: "relative",
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "var(--bg-elevated)",
        border: "1px solid var(--line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 14,
        flexShrink: 0,
        cursor: "pointer",
        padding: 0,
      }}
    >
      <span style={{ color: "var(--cyan)" }}>{letters[0]}</span>
      <span style={{ color: "var(--amber)" }}>{letters[1]}</span>

      {showAdminBadge && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "var(--bg-card)",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
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
    <div
      className="card"
      style={{
        position: "absolute",
        top: 48,
        right: 0,
        minWidth: 180,
        padding: 8,
        zIndex: 100,
        display: "grid",
        gap: 4,
      }}
    >
      <Link
        href={accountHref}
        onClick={onClose}
        style={{
          padding: "8px 10px",
          borderRadius: 6,
          fontSize: 14,
          color: "var(--text)",
          textDecoration: "none",
          display: "block",
        }}
      >
        {accountLabel}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{
          padding: "8px 10px",
          borderRadius: 6,
          fontSize: 14,
          color: "var(--danger)",
          background: "none",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
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
export default function UserAvatar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
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
      <div ref={ref} style={{ position: "relative" }}>
        <CircleButton letters={["A", "D"]} onClick={() => setOpen((o) => !o)} ariaLabel="Menu admin" showAdminBadge />
        {open && <DropdownMenu accountHref="/admin" accountLabel="Admin" onClose={() => setOpen(false)} />}
      </div>
    );
  }

  if (role === "CLIENT" && session?.user?.name) {
    return (
      <div ref={ref} style={{ position: "relative" }}>
        <CircleButton letters={getInitials(session.user.name)} onClick={() => setOpen((o) => !o)} ariaLabel="Mon compte" />
        {open && <DropdownMenu accountHref="/compte" accountLabel="Mon compte" onClose={() => setOpen(false)} />}
      </div>
    );
  }

  return (
    <Link
      href="/compte/connexion"
      aria-label="Se connecter"
      title="Se connecter"
      style={{
        width: 38, height: 38, borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--line)",
        display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, flexShrink: 0,
      }}
    >
      <span style={{ color: "var(--cyan)" }}>C</span>
      <span style={{ color: "var(--amber)" }}>A</span>
    </Link>
  );
}