import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GAMA Mentigo — AI Factory Learning Suite | UST | G.A. MENON ACADEMY",
  description:
    "GAMA Mentigo — AI Factory Learning Suite. Tutor and Coach agents for AI learning at UST | G.A. Menon Academy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Typography: Source Serif 4 + Source Sans 3 approximate UST brand fonts. See https://brand.ust.com/typography */}
      <body className="antialiased">{children}</body>
    </html>
  );
}
