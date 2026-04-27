import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '900'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "Delraw — Supplier Portal",
  description: "A structured onboarding portal for verified suppliers. Submit, review, and go live — all in one place.",
  keywords: ["B2B", "supplier portal", "verification", "onboarding", "marketplace"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>ḥ
      </body>
    </html>
  );
}
