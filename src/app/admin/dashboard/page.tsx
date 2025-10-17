
"use client";
// Utilitário para formatar preço igual aos produtos
const formatBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

import { useState, useEffect } from "react";
import { useAuthUser } from "@/app/login/useAuthUser";
import { useRouter } from "next/navigation";
import { FiPlus, FiPackage, FiEdit2, FiTrash2, FiImage } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import Image from "next/image";
import {
  useListarProdutosQuery,
  useDeletarProdutoMutation,
} from "@/hooks/api/produtosApi";
import { useBuscarProdutosPorIdentidadeQuery } from "@/hooks/api/identidadesApi";
import ProductModal from "./ProductModal";
import ProductOptionsModal from "./ProductOptionsModal";
import { ProdutoDTO } from "@/hooks/api/types";

export default function DashboardPage() {
  // Removido dropdownOpenId, não há mais dropdown
  const [optionsProduto, setOptionsProduto] = useState<ProdutoDTO | null>(null);
  const { profile, isAuthenticated, loading } = useAuthUser();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProdutoDTO | null>(null);
  const [filterCategoria, setFilterCategoria] = useState<string>("");
  const [filterIdentidade, setFilterIdentidade] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [authProgress, setAuthProgress] = useState(0);

  // Queries - usar API de identidade se filtro estiver ativo
  const { 
    data: produtosPorIdentidade, 
    isLoading: isLoadingIdentidade, 
    error: errorIdentidade 
  } = useBuscarProdutosPorIdentidadeQuery(
    { codigo: filterIdentidade },
    { skip: !filterIdentidade }
  );

  const { 
    data: produtosGerais, 
    isLoading: isLoadingGerais, 
    error: errorGerais 
  } = useListarProdutosQuery(
    {
      categoria: filterCategoria ? (filterCategoria as "bolsas" | "roupas" | "sapatos") : undefined,
      busca: searchTerm,
      tamanho: 100,
    },
    { skip: !!filterIdentidade } // Pular se filtro de identidade estiver ativo
  );

  // Combinar dados e estados
  const isLoading = filterIdentidade ? isLoadingIdentidade : isLoadingGerais;
  const error = filterIdentidade ? errorIdentidade : errorGerais;
  const produtosData = filterIdentidade ? produtosPorIdentidade : produtosGerais?.dados;

  // Filtrar adicionalmente por categoria e busca quando usar API de identidade
  let produtos: ProdutoDTO[] = produtosData || [];
  if (filterIdentidade) {
    // Aplicar filtros adicionais no client-side
    produtos = produtos.filter((p) => {
      const matchCategoria = !filterCategoria || p.categoria === filterCategoria;
      const matchBusca = !searchTerm || 
        (p.titulo && p.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.descricao && p.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.autor && p.autor.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCategoria && matchBusca;
    });
  }

  // Mutations
  const [deletarProduto] = useDeletarProdutoMutation();

  // Prevenir scroll quando modais estiverem abertos
  useEffect(() => {
    if (isModalOpen || editingProduct || optionsProduto) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isModalOpen, editingProduct, optionsProduto]);

  // Simula progresso de autenticação
  useEffect(() => {
    if (loading) {
      setAuthProgress(0);
      const interval = setInterval(() => {
        setAuthProgress((prev) => {
          if (prev >= 95) return prev; // Para em 95% até terminar de carregar
          return prev + 5;
        });
      }, 50);

      return () => clearInterval(interval);
    } else {
      setAuthProgress(100);
    }
  }, [loading]);

  // Loading state com barra de progresso
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="text-center">
          {/* Spinner - MESMO ESTILO DAS OUTRAS PÁGINAS */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-900 mx-auto mb-6"></div>
          
          {/* Texto */}
          <p className="text-gray-800 font-medium mb-4">Verificando autenticação...</p>
          
          {/* Barra de progresso */}
          <div className="w-64 mx-auto">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-black transition-all duration-300 ease-out"
                style={{ width: `${authProgress}%` }}
              />
            </div>
            {/* Porcentagem */}
            <p className="text-sm text-gray-600 font-mono">{authProgress}%</p>
          </div>
        </div>
      </div>
    );
  }

  // Proteção de rota
  if (!isAuthenticated || profile?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-8">Você não tem permissão para acessar esta área.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar este produto?")) {
      try {
        await deletarProduto(id).unwrap();
        alert("Produto deletado com sucesso!");
      } catch (err) {
        alert("Erro ao deletar produto");
      }
    }
  };

  const handleEdit = (produto: ProdutoDTO) => {
    setEditingProduct(produto);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600 mt-1">Gerencie os produtos da loja</p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <FiPlus className="text-xl" />
              <span className="font-medium">Novo Produto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Produto
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Título, descrição, autor..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              >
                <option value="">Todas as Categorias</option>
                <option value="bolsas">Bolsas</option>
                <option value="roupas">Roupas</option>
                <option value="sapatos">Sapatos</option>
              </select>
            </div>

            {/* Identity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identidade
              </label>
              <select
                value={filterIdentidade}
                onChange={(e) => setFilterIdentidade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              >
                <option value="">Todas as Identidades</option>
                <option value="homem">Masculino</option>
                <option value="mulher">Feminino</option>
                <option value="unissex">Unissex</option>
                <option value="infantil">Infantil</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Erro ao carregar produtos</p>
          </div>
        ) : produtos.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <FiPackage className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">Nenhum produto encontrado</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-black hover:underline font-medium"
            >
              Criar primeiro produto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtos.map((produto) => (
              <article key={produto.id} className="group">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden h-fit">
                  
                  {/* Imagem com hover effect */}
                  <div className="w-full aspect-square relative bg-gray-100 flex-shrink-0 overflow-hidden">
                    {produto.imagem ? (
                      <>
                        {/* Imagem principal */}
                        <Image
                          src={produto.imagem}
                          alt={produto.titulo}
                          fill
                          sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                          className="object-contain transition-opacity duration-300 group-hover:opacity-0"
                          placeholder="blur"
                          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                        />
                        {/* Imagem hover - só aparece se existir */}
                        {produto.imagemHover && (
                          <Image
                            src={produto.imagemHover}
                            alt={`${produto.titulo} (hover)`}
                            fill
                            sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                            className="object-contain absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                          />
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FiImage className="text-4xl text-gray-300" />
                      </div>
                    )}
                    
                    {/* Category Badge + ID */}
                    <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-medium rounded-full">
                        {produto.categoria}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-mono rounded-full">
                        ID: {produto.id}
                      </span>
                    </div>
                  </div>

                  {/* Informações do produto */}
                  <div className="p-3 flex flex-col flex-grow">
                    <p className="text-[9px] min-[525px]:text-[9.5px] sm:text-[10px] min-[723px]:text-[10px] min-[770px]:text-[11px] md:text-[11px] lg:text-[11px] text-gray-600 tracking-widest uppercase mb-0.5 min-[525px]:mb-1 sm:mb-1 min-[770px]:mb-1 md:mb-1 lg:mb-1.5">
                      {produto.subtitulo || produto.categoria}
                    </p>
                    <h3 className="text-[11px] min-[525px]:text-[12px] sm:text-[13px] min-[723px]:text-[13px] min-[746px]:text-[13px] min-[770px]:text-[13px] md:text-[14px] lg:text-[14px] font-bold text-gray-900 mb-1 min-[525px]:mb-1 sm:mb-1 min-[770px]:mb-1 md:mb-1 lg:mb-1 line-clamp-2">
                      {produto.titulo}
                    </h3>
                    {produto.autor && (
                      <p className="text-[8px] min-[525px]:text-[9px] sm:text-[9px] min-[723px]:text-[9.5px] min-[770px]:text-[10px] md:text-[10px] lg:text-[10px] text-gray-500 mb-1 min-[525px]:mb-1 sm:mb-1 min-[770px]:mb-1 md:mb-1 lg:mb-1 line-clamp-1">
                        {produto.autor}
                      </p>
                    )}
                    <p className="text-xs min-[525px]:text-sm sm:text-sm min-[723px]:text-base min-[770px]:text-base md:text-base lg:text-base font-bold text-black mb-2 min-[525px]:mb-2 sm:mb-2 min-[770px]:mb-2 md:mb-2 lg:mb-2">
                      {formatBRL(produto.preco)}
                    </p>

                    {/* Botões de ação */}
                    <div className="mt-auto flex justify-center items-center relative">
                      <button
                        onClick={() => setOptionsProduto(produto)}
                        className="group/btn flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white hover:from-black hover:via-gray-900 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-110 ring-2 ring-gray-900/20 hover:ring-gray-900/40"
                        aria-label="Abrir opções do produto"
                        style={{ zIndex: 10 }}
                      >
                        <FiEye className="text-lg group-hover/btn:scale-110 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={handleCloseModal}
        />
      )}
      {/* Modal de opções do produto */}
      {optionsProduto && (
        <ProductOptionsModal
          product={optionsProduto}
          onClose={() => setOptionsProduto(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
