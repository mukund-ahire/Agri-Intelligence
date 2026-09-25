import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agri-Intelligence — AI-Powered Crop Advisory",
  description:
    "Localized AI-powered agricultural advisory for Indian farmers. Analyse crop health by photo, location and weather with Google Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#f5f7f2] text-gray-900 min-h-screen font-sans antialiased">
        {/* ── Header ───────────────────────────────────────── */}
        <header className="bg-green-800 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Leaf icon */}
              <svg
                className="w-7 h-7 text-green-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M7 13s1-5 5-5 5 5 5 5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 8v8"
                />
              </svg>
              <div>
                <p className="text-[11px] font-medium text-green-300 leading-none tracking-widest uppercase">
                  Agri-Intelligence
                </p>
                <p className="text-white font-bold text-base leading-tight">
                  Crop Advisory
                </p>
              </div>
            </div>

            <span className="text-[11px] bg-green-700 border border-green-600 text-green-200 px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">
              Powered by Gemini
            </span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
