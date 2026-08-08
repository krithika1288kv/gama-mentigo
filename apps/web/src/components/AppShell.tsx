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
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--ust-white)]">
        <div className="full-band flex items-center justify-between gap-4 py-3">
          <Link href="/" className="no-underline hover:opacity-90">
            <div className="sec-label">{copy.brand.org}</div>
            <div className="font-[family-name:var(--font-body)] text-[1.05rem] font-semibold text-[color:var(--ust-black)]">
              {copy.brand.suiteName}
            </div>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Primary">
            <NavLink href="/" label={copy.nav.home} current={active === "home"} />
            <NavLink href="/tutor" label={copy.nav.tutor} current={active === "tutor"} />
            <NavLink href="/coach" label={copy.nav.coach} current={active === "coach"} />
          </nav>
        </div>
        {bypass ? (
          <div
            className="full-band py-2 text-sm bg-[color:var(--ust-off)] text-[color:var(--ust-muted)] border-t border-[color:var(--border)]"
            role="status"
          >
            {copy.auth.bypassBanner}
          </div>
        ) : null}
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
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
      className={`px-3 py-2 text-sm font-semibold rounded-[8px] no-underline transition-colors ${
        current
          ? "bg-[color:var(--ust-dark-teal)] text-white"
          : "text-[color:var(--ust-dark-teal)] hover:bg-[color:var(--ust-off)]"
      }`}
    >
      {label}
    </Link>
  );
}
