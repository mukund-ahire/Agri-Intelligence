import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agricultural Intelligence",
  description: "AI-powered digital agriculture network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}>
        <header className="bg-green-700 text-white p-4 shadow-md sticky top-0 z-50">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">Agro AI Network</h1>
            <span className="text-sm bg-green-800 px-2 py-1 rounded-full border border-green-600">Beta</span>
          </div>
        </header>
        <main className="max-w-3xl mx-auto p-4 pb-20">
          {children}
        </main>
      </body>
    </html>
  );
}
