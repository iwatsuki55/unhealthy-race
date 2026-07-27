import type { Metadata } from "next";

import { AppNav } from "@/components/layout/app-nav";

import "./globals.css";

export const metadata: Metadata = {
  title: "Health OS",
  description: "A modular personal health management system"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppNav />
        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
