import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PyroScope — Fire & Smoke Detection",
  description: "Real-time fire and smoke detection powered by AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />
      </head>
      <body className={`${inter.className} bg-[#0a0a0a] text-gray-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
