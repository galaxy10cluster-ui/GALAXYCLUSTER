import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "../src/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "HK Singh Research Hub — Independent Theoretical Physics Research",
  description:
    "Research hub of H.K. Singh — student, analytical thinker, and independent theoretical researcher. Explore papers, videos, and discussions on spacetime curvature, negative mass, and the PJ-Orbit hypothesis.",
  keywords: [
    "theoretical physics",
    "negative mass",
    "spacetime curvature",
    "PJ-orbit hypothesis",
    "anti-gravity",
    "H K Singh",
    "independent research",
  ],
  openGraph: {
    title: "HK Singh Research Hub",
    description: "Independent theoretical physics research, papers, videos, and open debate.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable} font-body bg-void text-paper antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
