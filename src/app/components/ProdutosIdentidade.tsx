"use client";

import { useState, useEffect } from "react";
import { useProdutosPorIdentidade } from "@/hooks/api/useProdutos";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import HeartButton from "./HeartButton";

interface ProdutosIdentidadeProps {
  identidadeCodigo: "mulher" | "homem" | "unissex" | "kids";
  titulo: string;
  descricao?: string;
}

export default function ProdutosIdentidade({ 
  identidadeCodigo, 
  titulo,
  descricao 
}: ProdutosIdentidadeProps) {
  const [pagina, setPagina] = useState(0);
  const tamanho = 24;

  const { produtos, isLoading, error, total, totalPaginas, paginaAtual } = 
    useProdutosPorIdentidade(identidadeCodigo, pagina, tamanho);

  // Reseta a página quando muda a identidade
  useEffect(() => {
    setPagina(0);
  }, [identidadeCodigo]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">Erro ao carregar produtos. Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da página */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {titulo}
          </h1>
          {descricao && (
            <p className="text-gray-600 text-lg">{descricao}</p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            {total > 0 && `${total} ${total === 1 ? 'produto' : 'produtos'} encontrado${total === 1 ? '' : 's'}`}
          </div>
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="container mx-auto px-4 py-8">
        {isLoading && pagina === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-900"></div>
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              Nenhum produto encontrado nesta categoria.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence>
                {produtos.map((produto) => (
                  <motion.div
                    key={produto.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <Link href={`/produtos/${produto.categoria}/detalhes/${produto.id}`}>
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <Image
                          src={produto.imagem || "/placeholder.png"}
                          alt={produto.titulo}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                        
                        {/* Imagem hover */}
                        {produto.imagemHover && (
                          <Image
                            src={produto.imagemHover}
                            alt={`${produto.titulo} - hover`}
                            fill
                            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        )}

                        {/* Badge da identidade */}
                        {produto.identidade && (
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {produto.identidade.nome}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-medium text-sm md:text-base text-gray-900 mb-1 line-clamp-1 group-hover:text-gray-600 transition-colors">
                          {produto.titulo}
                        </h3>
                        
                        {produto.subtitulo && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                            {produto.subtitulo}
                          </p>
                        )}

                        <p className="text-lg font-bold text-gray-900">
                          R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </Link>

                    {/* Botão de favorito */}
                    <div className="absolute top-2 right-2 z-10">
                      <HeartButton 
                        id={produto.id!} 
                        label={produto.titulo}
                        tipo={produto.categoria}
                        img={produto.imagem}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPagina((prev) => Math.max(0, prev - 1))}
                  disabled={paginaAtual === 0 || isLoading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    let pageNum = i;
                    if (totalPaginas > 5) {
                      if (paginaAtual < 3) {
                        pageNum = i;
                      } else if (paginaAtual > totalPaginas - 3) {
                        pageNum = totalPaginas - 5 + i;
                      } else {
                        pageNum = paginaAtual - 2 + i;
                      }
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagina(pageNum)}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          paginaAtual === pageNum
                            ? "bg-black text-white"
                            : "bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPagina((prev) => Math.min(totalPaginas - 1, prev + 1))}
                  disabled={paginaAtual === totalPaginas - 1 || isLoading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
