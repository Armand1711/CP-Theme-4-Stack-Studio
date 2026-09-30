import type { Metadata, Viewport } from "next";
import { Archivo, Geist_Mono } from "next/font/google";
import { ClickSpark } from "@/components/ClickSpark";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { RevealObserver } from "@/components/RevealObserver";
import { ScrollToTop } from "@/components/ScrollToTop";
import "./globals.css";

const sans = Archivo({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const description =
  "Web, software, UI/UX design, and mobile apps, scoped as a single project or run as your standing dev team.";

export const metadata: Metadata = {
  title: {
    default: "Stack Studio: Your dev team, without the hiring",
    template: "Stack Studio: %s",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "Stack Studio",
    title: "Stack Studio: Your dev team, without the hiring",
    description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior: Next 16 opt-in to suspend our smooth scrolling during route changes,
    // so page navigations jump instead of animating.
    <html lang="en" className={`${sans.variable} ${mono.variable}`} data-scroll-behavior="smooth">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ClickSpark sparkColor="#F5F3EF" sparkSize={10} sparkRadius={18} sparkCount={8} duration={400}>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </ClickSpark>
        <RevealObserver />
        <ScrollToTop />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
