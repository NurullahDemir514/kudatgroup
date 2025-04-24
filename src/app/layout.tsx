import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kudat Steel Jewelry | Zarif Çelik Takı Tasarımları",
  description: "Kudat Steel Jewelry'nin zarif çelik takı koleksiyonundan seçkin parçalar. Özel tasarım çelik takılar ve mücevherler.",
  keywords: "Kudat Steel Jewelry, çelik takı, çelik bileklik, çelik kolye, çelik yüzük, çelik küpe, özel tasarım",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
