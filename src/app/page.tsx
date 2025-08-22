import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Navbar from "./components/Header/NavBar/NavBar";

export const metadata: Metadata = {
  title: "Luigara – Moda de Luxo",
  description: "Roupas, sapatos e bolsas de grifes renomadas"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-zinc-900">
        <Navbar />      
        {children}
      </body>
    </html>
  );
}
