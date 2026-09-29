import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/Nav";
import { ClickSpark } from "@/components/ClickSpark";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Stack Studio: Your dev team, without the hiring",
    template: "Stack Studio: %s",
  },
  description:
    "Web, software, UI/UX design, and mobile apps, scoped as a single project or run as your standing dev team.",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClickSpark sparkColor="#F5F3EF" sparkSize={10} sparkRadius={18} sparkCount={8} duration={400}>
          <Nav />
          <main>{children}</main>
          <Footer />
        </ClickSpark>
      </body>
    </html>
  );
}
