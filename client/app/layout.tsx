import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import {LanguageProvider} from './context/LanguageContext';
import {AuthProvider} from './context/UserContext'
import Providers from "./context/providers";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AgriMarket",
  description: "AI- powered decision support for Ethiopian farmers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoEthiopic.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
        <AuthProvider>
        <LanguageProvider>
    {children}

        </LanguageProvider>
    </AuthProvider>
    </Providers>
      </body>
    </html>
  );
}
