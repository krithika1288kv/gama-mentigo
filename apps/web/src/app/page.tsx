import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { copy } from "@/lib/copy";

export default function HomePage() {
  return (
    <AppShell active="home">
      <div className="page-head pt-10 pb-6 animate-fade-up">
        <div className="sec-label">{copy.brand.org} · AI Factory</div>
        <h1>{copy.home.title}</h1>
        <p className="sub">{copy.home.subtitle}</p>
      </div>

      <div className="full-band pb-12 animate-fade-up-delay">
        <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
          <Link
            href="/tutor"
            className="block rounded-[14px] border border-[color:var(--border)] bg-[color:var(--ust-white)] p-5 no-underline transition-shadow hover:shadow-[0_8px_28px_rgba(0,110,116,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--ust-light-teal)]"
          >
            <h2 className="mt-0 mb-2 text-[15px]">{copy.nav.tutor} Agent</h2>
            <p className="m-0 text-[15px] leading-[1.62] text-[color:var(--ust-muted)]">
              Conversational Q&amp;A with level adaptation and comprehension checks.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[color:var(--ust-dark-teal)]">
              {copy.home.tutorCta} →
            </span>
          </Link>
          <Link
            href="/coach"
            className="block rounded-[14px] border border-[color:var(--border)] bg-[color:var(--ust-white)] p-5 no-underline transition-shadow hover:shadow-[0_8px_28px_rgba(0,110,116,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--ust-light-teal)]"
          >
            <h2 className="mt-0 mb-2 text-[15px]">{copy.nav.coach} Agent</h2>
            <p className="m-0 text-[15px] leading-[1.62] text-[color:var(--ust-muted)]">
              Structured critique: what worked, what to improve, suggested rewrite.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[color:var(--ust-dark-teal)]">
              {copy.home.coachCta} →
            </span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
