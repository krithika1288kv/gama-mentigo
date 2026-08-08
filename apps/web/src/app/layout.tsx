import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Factory Learning Suite | UST",
  description:
    "UST AI Factory Tutor and Coach agents for employee AI learning.",
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
