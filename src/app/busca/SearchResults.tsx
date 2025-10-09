"use client";

import { useSearchParams } from "next/navigation";
import { useLazyBuscarProdutosQuery } from "@/store/productsApi";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [buscarProdutos, { data: produtos, isLoading, error }] = useLazyBuscarProdutosQuery();

  useEffect(() => {
    if (query.trim()) {
      buscarProdutos(query);
    }
  }, [query, buscarProdutos]);

  if (!query.trim()) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Buscar Produtos
        </h1>
        <p className="text-gray-600">
          Digite algo no campo de busca para encontrar produtos incríveis.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-black rounded-full"></div>
        <span className="ml-3 text-gray-600">Buscando produtos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">
          Erro na busca
        </h1>
        <p className="text-gray-600">
          Ocorreu um erro ao buscar produtos. Tente novamente.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Resultados para &quot;{query}&quot;
        </h1>
        <p className="text-gray-600">
          {produtos?.length === 0 
            ? "Nenhum produto encontrado" 
            : `${produtos?.length} produto${produtos?.length !== 1 ? 's' : ''} encontrado${produtos?.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {produtos?.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Nenhum produto encontrado para &quot;{query}&quot;
          </h2>
          <p className="text-gray-600 mb-6">
            Tente termos como marca, cor, material ou tipo de produto
          </p>
          <div className="text-sm text-gray-500">
            <p>Sugestões:</p>
            <ul className="mt-2 space-y-1">
              <li>• Prada, Gucci, Versace</li>
              <li>• Bolsa, vestido, sapato</li>
              <li>• Preto, vermelho, couro</li>
              <li>• Scarpin, blazer, tote</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {produtos?.map((produto) => (
            <Link
              key={produto.id}
              href={`/produtos/${produto.categoria}/detalhes/${produto.id}`}
              className="group block"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 h-[480px] flex flex-col">
                <div className="aspect-square relative bg-gray-100 flex-shrink-0 overflow-hidden">
                  {/* Imagem principal */}
                  <Image
                    src={produto.imagem || "/placeholder.jpg"}
                    alt={produto.titulo || "Produto"}
                    fill
                    className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Imagem hover - só aparece se existir */}
                  {produto.imagemHover && (
                    <Image
                      src={produto.imagemHover}
                      alt={produto.titulo || "Produto"}
                      fill
                      className="object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between min-h-0">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {produto.categoria}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-black transition-colors">
                      {produto.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {produto.descricao}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(produto.preco || 0)}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {produto.dimensao}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}