import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { copy } from "@/lib/copy";

export default function HomePage() {
  return (
    <AppShell active="home">
      <div className="page-head home animate-fade-up">
        <div className="sec-label">{copy.brand.org}</div>
        <h1>{copy.home.title}</h1>
        <p className="sub">{copy.home.subtitle}</p>
      </div>

      <div className="full-band animate-fade-up-delay">
        <div className="card-grid">
          <Link href="/tutor" className="agent-card">
            <h2>{copy.nav.tutor} Agent</h2>
            <p>
              Conversational Q&amp;A with level adaptation and comprehension checks.
            </p>
            <span className="agent-card-cta">{copy.home.tutorCta} →</span>
          </Link>
          <Link href="/coach" className="agent-card">
            <h2>{copy.nav.coach} Agent</h2>
            <p>
              Structured critique: what worked, what to improve, suggested rewrite.
            </p>
            <span className="agent-card-cta">{copy.home.coachCta} →</span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
