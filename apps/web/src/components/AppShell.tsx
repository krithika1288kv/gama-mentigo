"use client";

import Link from "next/link";
import { copy } from "@/lib/copy";
import { isAuthBypassEnabled } from "@/lib/auth-client";

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: "home" | "tutor" | "coach";
}) {
  const bypass = isAuthBypassEnabled();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="full-band app-header-inner">
          <Link href="/" className="brand-link">
            <div className="sec-label">{copy.brand.org}</div>
            <div className="brand-title">{copy.brand.suiteName}</div>
          </Link>
          <nav className="app-nav" aria-label="Primary">
            <NavLink href="/" label={copy.nav.home} current={active === "home"} />
            <NavLink href="/tutor" label={copy.nav.tutor} current={active === "tutor"} />
            <NavLink href="/coach" label={copy.nav.coach} current={active === "coach"} />
          </nav>
        </div>
        {bypass ? (
          <div className="full-band auth-banner" role="status">
            {copy.auth.bypassBanner}
          </div>
        ) : null}
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  label,
  current,
}: {
  href: string;
  label: string;
  current?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`nav-link${current ? " is-active" : ""}`}
    >
      {label}
    </Link>
  );
}
