import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zendo — High Precision Project Management",
  description:
    "A Zen-inspired workspace for high-precision project planning and development pipelines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{ fontFamily: "Inter, sans-serif" }}
        className="bg-[#f8f9fa] text-[#2b3437] min-h-screen"
      >
        {children}
      </body>
    </html>
  );
}
