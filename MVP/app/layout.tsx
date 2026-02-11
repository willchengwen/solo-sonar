import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import { dmSans, playfair } from "./fonts";

export const metadata: Metadata = {
  title: "Solo Sonar — Find the Signal in the Noise",
  description:
    "Find quality stories across Royal Road, SpaceBattles, and more. Curated by readers, for readers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
