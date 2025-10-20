import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carreiras | Luigarah - Faça Parte da Nossa História",
  description: "Conheça as histórias inspiradoras de nossa equipe e descubra oportunidades para modelos, designers, programadores e analistas na Luigarah.",
  keywords: "carreiras luigarah, vagas moda luxo, modelo, designer, programador, analista, trabalhe conosco",
};

export default function CarreirasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
