import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "アンヘルシーレース（仮）",
  description: "生活習慣の乱れを見える化して、少しずつ整え直すための記録アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

