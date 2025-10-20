"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useProdutosHomem } from "@/hooks/api/useProdutos";
import type { ProdutoDTO } from "@/hooks/api/types";
import ClientMarcasIndex from "@/app/produtos/marcas/ClientMarcasIndex";
import SimpleLoader from "@/app/components/SimpleLoader";

type ProdutoComTipo = ProdutoDTO & {
  __tipo: "bolsas" | "roupas" | "sapatos";
};

export default function HomemPage() {
  const { produtos = [], isLoading } = useProdutosHomem(0, 100);

  // Adicionar campo __tipo baseado na categoria do produto
  const produtosComTipo: ProdutoComTipo[] = useMemo(() => {
    return produtos.map((produto) => {
      let tipo: "bolsas" | "roupas" | "sapatos" = "roupas";
      
      const categoria = produto.categoria?.toLowerCase() || "";
      if (categoria.includes("bolsa")) {
        tipo = "bolsas";
      } else if (categoria.includes("sapato") || categoria.includes("calçado")) {
        tipo = "sapatos";
      }

      return {
        ...produto,
        __tipo: tipo,
      };
    });
  }, [produtos]);

  if (isLoading) {
    return <SimpleLoader isLoading={isLoading} />;
  }

  const marcas = Array.from(
    new Set(produtosComTipo.map((p) => p.titulo).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, "pt-BR", { sensitivity: "base" })) as string[];

  const categorias = Array.from(
    new Set(produtosComTipo.map((p) => p.subtitulo).filter(Boolean))
  ).sort((a, b) => a!.localeCompare(b!, "pt-BR", { sensitivity: "base" })) as string[];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section 
        className="relative w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Primeira Imagem - Deitada */}
        <div className="relative w-full h-[70vh] md:h-[85vh]">
          <Image
            src="/HOMENS_Deitados_Estilo.png"
            alt="Estilo Masculino - Elegância Relaxada"
            fill
            className="object-cover"
            style={{ objectPosition: 'center 35%' }}
            priority
            quality={95}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Texto Sobreposto */}
          <div className="absolute inset-0 flex flex-col justify-end items-start p-8 md:p-16 lg:p-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-2xl"
            >
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight"
                style={{
                  fontFamily: "'Playfair Display', 'Times New Roman', serif",
                  letterSpacing: '0.08em',
                }}
              >
                MODA MASCULINA
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
                Sofisticação atemporal para o homem moderno
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="#colecao"
                  className="inline-block bg-white text-black px-8 py-4 text-sm font-semibold tracking-wider hover:bg-gray-100 transition-all duration-300 shadow-lg"
                >
                  EXPLORAR COLEÇÃO
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Segunda Imagem - Em Pé */}
        <div className="relative w-full h-[70vh] md:h-[85vh] mt-1">
          <Image
            src="/HOMENS_Elegância_em_Contraste.png"
            alt="Elegância em Contraste"
            fill
            className="object-cover object-center"
            quality={95}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          
          {/* Texto Centralizado */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h2 
                className="text-3xl md:text-5xl lg:text-6xl font-light text-white mb-6"
                style={{
                  fontFamily: "'Playfair Display', 'Times New Roman', serif",
                  letterSpacing: '0.1em',
                }}
              >
                Elegância <span className="font-bold">em Contraste</span>
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-8">
                Onde alfaiataria clássica encontra design contemporâneo, <br className="hidden md:block" />
                criando o equilíbrio perfeito entre tradição e modernidade
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Seção de Descrição */}
      <motion.section 
        className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-gray-50 to-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h3 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
              O Poder do <span className="font-semibold">Refinamento</span>
            </h3>
            <div className="w-24 h-[2px] bg-black mx-auto mb-8" />
            <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto mb-6">
              Nossa coleção masculina é dedicada ao homem que valoriza qualidade, elegância e atenção 
              aos detalhes. Cada peça é selecionada para criar um guarda-roupa versátil e sofisticado.
            </p>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              Das maiores casas de moda do mundo, trazemos o que há de melhor em alfaiataria, 
              streetwear de luxo e acessórios refinados.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Coleção de Produtos */}
      <section id="colecao" className="py-12">
        <ClientMarcasIndex
          titulo="Nossa Coleção Masculina"
          produtos={produtosComTipo}
          marcas={marcas}
          categorias={categorias}
          tamanhosDisponiveis={[]}
        />
      </section>
    </div>
  );
}
