import { Geist, Geist_Mono } from "next/font/google";
import React from "react";
import { ChatProvider } from "@/lib/ChatContent";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider"; // ✅ Use the new client SessionProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ChatProvider>{children}</ChatProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
