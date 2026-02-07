import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  variable: "--font-dm-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Solo Sonar - Find the signal in the noise",
  description: "Human-curated reading lists replace algorithmic feeds, helping you find quality stories across Royal Road, SpaceBattles, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSerif.variable} font-sans antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
