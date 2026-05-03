import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Blogify",
  description: "Read and share stories",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", padding: "20px 24px", textAlign: "center" }}>
          <span style={{ color: "var(--ink-4)", fontSize: 13 }}>
            © {new Date().getFullYear()}{" "}
            <span style={{ color: "var(--indigo)", fontWeight: 600 }}>Blogify</span>
          </span>
        </footer>
      </body>
    </html>
  );
}
