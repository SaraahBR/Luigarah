import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { LOCALE_TAGS, type Locale } from "@/i18n/config";
import { obterCotacoes } from "@/i18n/cotacoes";
import { CotacoesProvider } from "@/i18n/CotacoesProvider";

import Providers from "./Providers";
import AuthSessionProvider from "./components/SessionProviders";
import Navbar from "./components/Header/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "sonner";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("metadata");
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL('https://luigarah.vercel.app'),
    title,
    description,
    openGraph: {
      type: "website",
      locale: LOCALE_TAGS[locale].replace("-", "_"),
      url: "https://luigarah.vercel.app",
      siteName: "Luigarah",
      title,
      description,
      images: [
        {
          url: "/logos/LH_FUNDO_BRANCO.png",
          width: 1200,
          height: 630,
          alt: t("imageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logos/LH_FUNDO_BRANCO.png"],
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = (await getLocale()) as Locale;
  // Cotação do real (dólar/euro) para exibir os preços na moeda do idioma
  const cotacoes = await obterCotacoes();

  return (
    <html lang={LOCALE_TAGS[locale]} className="overflow-x-hidden w-full">
      <body className="min-h-screen bg-white text-black antialiased font-inter overflow-x-hidden w-full m-0 p-0">
        <NextIntlClientProvider>
        <CotacoesProvider cotacoes={cotacoes}>
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
        </CotacoesProvider>
        </NextIntlClientProvider>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
