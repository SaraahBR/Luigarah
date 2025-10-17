import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Nós | Luigarah - Moda de Luxo",
  description: "Conheça a história da Luigarah, nossa equipe e nosso compromisso com a excelência no universo da moda de luxo.",
  keywords: "sobre luigarah, moda de luxo, equipe luigarah, sarah hernandes, luigi rodrigo",
};

export default function SobreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
