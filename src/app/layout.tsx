import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KeralamBot.com — Kerala’s Smarter Home Solution Platform",
  description:
    "Kerala-wide home services marketplace: appliance repair, AC, plumbing, electrical, painting, pest control and more. Pay after job. No cost to request a booking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-[#0A192F] text-white antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
