import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { CoinProvider } from "@/contexts/CoinContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ヒカリノ タロット",
    description: "あなたの心にそっと寄り添います。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="ja">
            <body className={inter.className + " bg-white dark:bg-gray-900"}>
                <CoinProvider>
                    <div className="flex flex-col min-h-screen">
                        <main className="flex-grow">
        {children}
                        </main>
                        <Footer />
                    </div>
                </CoinProvider>
      </body>
    </html>
  );
}
