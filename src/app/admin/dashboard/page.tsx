
"use client";
// Utilitário para formatar preço igual aos produtos
const formatBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

import { useState, useEffect, useMemo } from "react";
import { useAuthUser } from "@/app/login/useAuthUser";
import { useRouter } from "next/navigation";
import { FiPlus, FiPackage, FiImage } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import Image from "next/image";
import Pagination from "@/app/components/Pagination";
import {
  useListarProdutosQuery,
  useDeletarProdutoMutation,
  useBuscarProdutoPorIdQuery,
  useListarProdutosPorCategoriaQuery,
  useListarProdutosPorPadraoQuery,
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
  const [filterDimensao, setFilterDimensao] = useState<string>("");
  const [filterPadrao, setFilterPadrao] = useState<string>("");
  const [filterMarca, setFilterMarca] = useState<string>("");
  const [filterAutor, setFilterAutor] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recente"); // recente, preco-asc, preco-desc
  const [authProgress, setAuthProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Detectar se searchTerm é um ID numérico
  const isSearchById = /^\d+$/.test(searchTerm.trim());
  const searchId = isSearchById ? parseInt(searchTerm.trim(), 10) : undefined;

  // Query para buscar por ID
  const { 
    data: produtoPorId, 
    isLoading: isLoadingPorId, 
    error: errorPorId
  } = useBuscarProdutoPorIdQuery(
    searchId!,
    { skip: !searchId }
  );

  // Query para buscar IDs de produtos por padrão
  const { 
    data: idsPorPadrao, 
    isLoading: isLoadingPadrao, 
    error: errorPadrao
  } = useListarProdutosPorPadraoQuery(
    filterPadrao === "null" ? null : (filterPadrao || null),
    { skip: !filterPadrao || !!searchId }
  );

  // Queries - sempre buscar todos os produtos para permitir filtros combinados
  const { 
    data: produtosPorIdentidade, 
    isLoading: isLoadingIdentidade, 
    error: errorIdentidade,
    refetch: refetchIdentidade
  } = useBuscarProdutosPorIdentidadeQuery(
    { codigo: filterIdentidade },
    { skip: !filterIdentidade || !!searchId || !!filterPadrao }
  );

  // Query para buscar por categoria
  const { 
    data: produtosPorCategoria, 
    isLoading: isLoadingPorCategoria, 
    error: errorPorCategoria
  } = useListarProdutosPorCategoriaQuery(
    { 
      categoria: filterCategoria, 
      tamanho: 100 
    },
    { skip: !filterCategoria || !!searchId || !!filterPadrao }
  );

  const { 
    data: produtosGerais, 
    isLoading: isLoadingGerais, 
    error: errorGerais,
    refetch: refetchGerais
  } = useListarProdutosQuery(
    {
      pagina: 0,
      tamanho: 100,
      busca: ""
    },
    { skip: !!searchId }
  );

  // Combinar dados e estados - priorizar busca por ID, depois padrão, depois categoria/identidade, depois geral
  const isLoading = searchId 
    ? isLoadingPorId 
    : filterPadrao
    ? isLoadingPadrao || isLoadingGerais
    : (filterCategoria || filterIdentidade)
    ? (isLoadingPorCategoria || isLoadingIdentidade)
    : isLoadingGerais;
    
  const error = searchId 
    ? errorPorId 
    : filterPadrao
    ? errorPadrao || errorGerais
    : (filterCategoria || filterIdentidade)
    ? (errorPorCategoria || errorIdentidade)
    : errorGerais;
    
  // Selecionar fonte de dados baseado nos filtros ativos
  let produtosData: ProdutoDTO[] | undefined;
  
  if (searchId) {
    // Busca por ID específico
    produtosData = produtoPorId?.dados ? [produtoPorId.dados] : [];
  } else if (filterPadrao && idsPorPadrao?.dados) {
    // Filtro de padrão: buscar todos os produtos e filtrar pelos IDs retornados
    const idsPermitidos = new Set(idsPorPadrao.dados.map(item => item.id));
    produtosData = (produtosGerais?.dados || []).filter(p => p.id && idsPermitidos.has(p.id));
  } else if (filterCategoria && !filterIdentidade) {
    produtosData = produtosPorCategoria?.dados;
  } else if (filterIdentidade && !filterCategoria) {
    produtosData = produtosPorIdentidade;
  } else if (filterCategoria && filterIdentidade) {
    // Se ambos estão ativos, buscar por categoria e filtrar por identidade depois
    produtosData = produtosPorCategoria?.dados;
  } else {
    produtosData = produtosGerais?.dados;
  }

  // Filtrar e ordenar produtos com useMemo para evitar recriação em cada render
  const produtos = useMemo(() => {
    let produtosFiltrados: ProdutoDTO[] = produtosData || [];
    
    // Se for busca por ID, não aplicar outros filtros
    if (searchId) {
      return produtosFiltrados;
    }
    
    // Aplicar filtros (padrão já foi filtrado no endpoint)
    produtosFiltrados = produtosFiltrados.filter((p) => {
      const matchCategoria = !filterCategoria || p.categoria === filterCategoria;
      const matchIdentidade = !filterIdentidade || p.identidade?.codigo === filterIdentidade;
      const matchDimensao = !filterDimensao || p.dimensao?.toLowerCase() === filterDimensao.toLowerCase();
      const matchMarca = !filterMarca || p.titulo?.toLowerCase().includes(filterMarca.toLowerCase());
      const matchAutor = !filterAutor || p.autor?.toLowerCase().includes(filterAutor.toLowerCase());
      
      // Não filtrar padrão aqui - já foi filtrado pelo endpoint
      return matchCategoria && matchIdentidade && matchDimensao && matchMarca && matchAutor;
    });
    
    // Aplicar ordenação
    if (sortBy === "preco-asc") {
      produtosFiltrados.sort((a, b) => (a.preco || 0) - (b.preco || 0));
    } else if (sortBy === "preco-desc") {
      produtosFiltrados.sort((a, b) => (b.preco || 0) - (a.preco || 0));
    } else if (sortBy === "recente") {
      // Usar ID como proxy para data de criação (IDs maiores = mais recentes)
      produtosFiltrados.sort((a, b) => (b.id || 0) - (a.id || 0));
    }
    
    return produtosFiltrados;
  }, [produtosData, filterCategoria, filterDimensao, filterMarca, filterAutor, searchId, sortBy, filterIdentidade]);

  // Extrair listas únicas para filtros dinâmicos
  const marcasUnicas = useMemo(() => {
    const marcas = new Set<string>();
    (produtosData || []).forEach(p => {
      if (p.titulo) marcas.add(p.titulo);
    });
    return Array.from(marcas).sort();
  }, [produtosData]);

  const autoresUnicos = useMemo(() => {
    const autores = new Set<string>();
    (produtosData || []).forEach(p => {
      if (p.autor) autores.add(p.autor);
    });
    return Array.from(autores).sort();
  }, [produtosData]);

  // Calcular produtos paginados
  const totalPages = Math.ceil(produtos.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return produtos.slice(startIndex, endIndex);
  }, [produtos, currentPage]);

  // Mutations
  const [deletarProduto] = useDeletarProdutoMutation();

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategoria, filterIdentidade, filterDimensao, filterPadrao, filterMarca, filterAutor, searchTerm, searchId, sortBy]);

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
      } catch {
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

  // Função para forçar refetch dos produtos
  const handleRefetch = () => {
    if (filterIdentidade) {
      refetchIdentidade();
    } else {
      refetchGerais();
    }
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Filtros e Ordenação
          </h2>
          
          {/* Linha 1: Busca e Ordenação */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
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

            {/* Sort By */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar Por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              >
                <option value="recente">Mais Recentes</option>
                <option value="preco-asc">Preço: Menor → Maior</option>
                <option value="preco-desc">Preço: Maior → Menor</option>
              </select>
            </div>
          </div>

          {/* Linha 2: Filtros Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                <option value="">Todas</option>
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
                <option value="">Todas</option>
                <option value="homem">Masculino</option>
                <option value="mulher">Feminino</option>
                <option value="unissex">Unissex</option>
                <option value="infantil">Infantil</option>
              </select>
            </div>

            {/* Dimensão Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensão
              </label>
              <select
                value={filterDimensao}
                onChange={(e) => setFilterDimensao(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              >
                <option value="">Todas</option>
                <option value="pequeno">Pequeno</option>
                <option value="médio">Médio</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            {/* Padrão Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padrão de Tamanho
              </label>
              <select
                value={filterPadrao}
                onChange={(e) => setFilterPadrao(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              >
                <option value="">Todos</option>
                <option value="usa">USA</option>
                <option value="br">Brasil</option>
                <option value="null">Sem Padrão (Bolsas)</option>
              </select>
            </div>
          </div>

          {/* Linha 3: Filtros de Marca e Autor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Marca Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca (Título)
              </label>
              <select
                value={filterMarca}
                onChange={(e) => setFilterMarca(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              >
                <option value="">Todas as Marcas</option>
                {marcasUnicas.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>

            {/* Autor Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Autor (Designer)
              </label>
              <select
                value={filterAutor}
                onChange={(e) => setFilterAutor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              >
                <option value="">Todos os Autores</option>
                {autoresUnicos.map(autor => (
                  <option key={autor} value={autor}>{autor}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{produtos.length}</span> produto{produtos.length !== 1 ? 's' : ''} encontrado{produtos.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCategoria("");
                setFilterIdentidade("");
                setFilterDimensao("");
                setFilterPadrao("");
                setFilterMarca("");
                setFilterAutor("");
                setSortBy("recente");
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Limpar Filtros
            </button>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((produto) => (
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
                  </div>

                  {/* Informações do produto */}
                  <div className="p-3 flex flex-col flex-grow">
                    {/* Category Badge + ID - Movido para baixo da imagem */}
                    <div className="flex justify-between items-center gap-2 mb-3">
                      {/* Category Tag - Elegante e sofisticada */}
                      <span className="px-3 py-1.5 bg-gradient-to-br from-gray-50 to-white text-gray-800 text-xs font-medium rounded-md shadow-sm border border-gray-200 tracking-wide">
                        {produto.categoria}
                      </span>
                      
                      {/* ID Tag - Minimalista e chique */}
                      <span className="px-2.5 py-1.5 bg-gradient-to-br from-gray-50 to-white text-gray-600 text-[10px] font-mono font-medium rounded-md shadow-sm border border-gray-200">
                        #{produto.id}
                      </span>
                    </div>
                    
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

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-12 mb-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
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
          onRefetch={handleRefetch}
        />
      )}
    </div>
  );
}
