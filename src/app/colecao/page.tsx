"use client";

import Navbar from "../components/Header/NavBar/NavBar";
import Hero from "../components/Hero/Hero";

import SectionBolsas from "../components/SectionBolsas";
import SectionSapatos from "../components/SectionSapatos";
import SectionRoupas from "../components/SectionRoupas";

export default function ColecaoPage() {
  return (
    <div className="bg-white text-zinc-900">
      {/* Navbar fixa no topo */}
      <Navbar />

      {/* Hero */}
      <Hero
        title="O Poder da Moda"
        subtitle="A moda surge no encontro entre necessidade e desejo. Protege contra o frio, mas também afirma quem somos. Nasce como ritual de pertencimento, mas cresce como espaço de liberdade individual. Ela pode ser efêmera, mas seu significado é eterno: a moda é memória, identidade e futuro condensados em tecido e forma. Está esperando o que para ter a sensação da preciosidade? Clique no botão abaixo e sinta o poder!"
        ctaText="Compre agora"
        ctaHref="/colecao"
      />

      {/* Sessões */}
      <main className="space-y-20">
        <SectionBolsas
          title="Bolsas Icônicas"
          subtitle="Modelos exclusivos das maisons mais desejadas"
          ctaText="Ver todas as bolsas"
          ctaHref="/produtos/bolsas"
        />

        <SectionSapatos
          title="Sapatos de Luxo"
          subtitle="Dos clássicos aos modernos — escolha seu estilo"
          ctaText="Ver todos os sapatos"
          ctaHref="/produtos/sapatos"
        />

        <SectionRoupas
          title="Roupas Selecionadas"
          subtitle="Peças refinadas das casas mais famosas"
          ctaText="Ver todas as roupas"
          ctaHref="/produtos/roupas"
        />
      </main>

      {/* Footer */}
    </div>
  );
}
