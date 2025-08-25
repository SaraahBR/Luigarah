import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

import Providers from "./Providers";
import AuthSessionProvider from "./components/SessionProviders";
import Navbar from "./components/Header/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Luigarah | Moda de Luxo",
  description: "Roupas, sapatos e bolsas de grifes renomadas",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white text-black antialiased">
        <Providers>
          <AuthSessionProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthSessionProvider>
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
