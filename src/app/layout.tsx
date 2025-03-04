import { Geist, Geist_Mono } from "next/font/google";
import React from 'react';
import { ChatProvider } from "@/lib/ChatContent";
import "./globals.css";

import { GoogleOAuthProvider } from '@react-oauth/google';
import type { AppProps } from 'next/app';

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
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <ChatProvider>{children}</ChatProvider>
        </GoogleOAuthProvider>
    </body>
    </html>
  );
}
