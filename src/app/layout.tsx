import type { Metadata, Viewport } from "next";
import { currentLang } from "@/lib/lang";
import "./globals.css";

export const metadata: Metadata = {
  title: "GharSe",
  description: "From home kitchen to store shelf",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#075e54",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await currentLang();
  return (
    <html lang={lang}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
