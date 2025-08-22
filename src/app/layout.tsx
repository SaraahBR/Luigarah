import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer/Footer";
import NavBar from "./components/Header/NavBar/NavBar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LUIGARAH | Grife",
  description: "site de moda de grife de luxo",
  icons: { icon: [{ url: "/favicon.ico" }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-zinc-900`}>
        <header>
          <NavBar />
        </header>

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}
