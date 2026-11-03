import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubGuard — AI-Powered Subscription Intelligence",
  description: "Detect, track, understand, and optimize recurring subscriptions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-[#FAFAF8] text-[#0F172A]">
        {children}
      </body>
    </html>
  );
}
