import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wumpus World",
  description: "Created by Lasya and Sarthak",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="w-full flex justify-center bg-black/20 backdrop-blur-sm py-2">
          <img
            src="/title.png"
            alt="Wumpus World"
            className="h-12 md:h-16 object-contain"
          />
        </header>
        {children}
      </body>
    </html>
  );
}
