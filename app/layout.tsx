import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./provider";
import { ThemeSwitcher } from "@/components/ThemeSwitch";
import LandingPage from "@/components/LandingPage";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "FaucetGen",
  description: "Create and mint tokens on the Solana blockchain with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black transition-all delay-75 text-black dark:text-gray-200`}
      >
        {children}  
      <ThemeSwitcher />
      </body>
      </Providers>
    </html>
  );
}
