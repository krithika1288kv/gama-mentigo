"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { isAuthBypassEnabled } from "@/lib/auth-client";

type Provider = "openrouter" | "anthropic" | "azure" | "demo";

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: "home" | "tutor" | "coach";
}) {
  const bypass = isAuthBypassEnabled();
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/status")
      .then((res) => res.json())
      .then((data: { provider?: Provider; llmConfigured?: boolean }) => {
        if (cancelled) return;
        if (data.provider) {
          setProvider(data.provider);
          return;
        }
        setProvider(data.llmConfigured ? "openrouter" : "demo");
      })
      .catch(() => {
        if (!cancelled) setProvider("demo");
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
        {provider === "demo" ? (
          <div className="full-band demo-banner" role="status">
            {copy.demo.banner}
          </div>
        ) : null}
        {provider && provider !== "demo" ? (
          <div className="full-band live-banner" role="status">
            {copy.provider[provider]}
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
