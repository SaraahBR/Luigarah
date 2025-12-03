import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

import Providers from "./Providers";
import AuthSessionProvider from "./components/SessionProviders";
import Navbar from "./components/Header/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL('https://luigarah.vercel.app'),
  title: "Luigarah | Moda de Luxo",
  description: "Roupas, sapatos e bolsas de grifes renomadas",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://luigarah.vercel.app",
    siteName: "Luigarah",
    title: "Luigarah | Moda de Luxo",
    description: "Roupas, sapatos e bolsas de grifes renomadas",
    images: [
      {
        url: "/logos/LH_FUNDO_BRANCO.png",
        width: 1200,
        height: 630,
        alt: "Luigarah - Moda de Luxo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luigarah | Moda de Luxo",
    description: "Roupas, sapatos e bolsas de grifes renomadas",
    images: ["/logos/LH_FUNDO_BRANCO.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="overflow-x-hidden w-full">
      <body className="min-h-screen bg-white text-black antialiased font-inter overflow-x-hidden w-full m-0 p-0">
        <Providers>
          <AuthSessionProvider>
            <ScrollToTop />
            <Navbar />
            <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
              <main className="flex-1 overflow-x-hidden pt-[140px] w-full">{children}</main>
              <Footer />
            </div>
          </AuthSessionProvider>
        </Providers>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
