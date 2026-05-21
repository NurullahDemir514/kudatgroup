import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Cinzel } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/providers/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kudatgroup.com'),
  title: {
    default: "Kudat Bijuteri | Toptan Satış",
    template: "%s | Kudat Bijuteri",
  },
  description: "Kudat Bijuteri, 2018 Yılında Faaliyete Giren Toptan Bijuteri İthalat & İhracat Firmasıdır. Keyifli Alışverişler.",
  keywords: [
    "Kudat Bijuteri",
    "Kudat katalog",
    "bijuteri katalog",
    "toptan bijuteri",
    "çelik takı katalog",
    "toptan takı",
    "bijuteri ürünleri",
    "dijital katalog",
  ],
  authors: [{ name: "Kudat Group" }],
  creator: "Kudat Group",
  publisher: "Kudat Group",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://kudatgroup.com",
    siteName: "Kudat Bijuteri",
    title: "Kudat Bijuteri | Toptan Satış",
    description: "Kudat Bijuteri, 2018 Yılında Faaliyete Giren Toptan Bijuteri İthalat & İhracat Firmasıdır. Keyifli Alışverişler.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Kudat Bijuteri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kudat Bijuteri | Toptan Satış",
    description: "Kudat Bijuteri, 2018 Yılında Faaliyete Giren Toptan Bijuteri İthalat & İhracat Firmasıdır. Keyifli Alışverişler.",
    images: ["/icon.png"],
  },
  alternates: {
    canonical: "https://kudatgroup.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console verification code buraya eklenebilir
    // google: "your-google-verification-code",
  },
  other: {
    "preload-1": "/products/1.jpg",
    "preload-2": "/products/2.jpg",
    "preload-3": "/products/3.jpg",
    "preload-4": "/products/4.jpg",
    "preload-5": "/products/5.jpg",
    "preload-6": "/products/6.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Preload hero background images */}
        <link rel="preload" as="image" href="/products/1.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/products/2.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/products/3.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/products/4.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/products/5.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/products/6.jpg" fetchPriority="high" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${cinzel.variable} overflow-x-hidden antialiased bg-white text-gray-900`}
        style={{ backgroundColor: '#ffffff', color: '#171717' }}
      >
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
