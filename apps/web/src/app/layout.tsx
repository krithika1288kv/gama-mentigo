import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

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
      <body
        className={`${sourceSans.variable} ${sourceSerif.variable} antialiased`}
        style={
          {
            "--font-body": "var(--font-source-sans), system-ui, sans-serif",
            "--font-display": "var(--font-source-serif), Georgia, serif",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
