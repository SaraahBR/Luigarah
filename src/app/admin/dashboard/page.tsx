"use client";
// Utilitário para formatar preço igual aos produtos
const formatBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuthUser } from "@/app/login/useAuthUser";
import { useRouter } from "next/navigation";
import { FiPlus, FiPackage, FiImage, FiEye, FiUsers, FiShoppingBag, FiBox, FiLayers, FiChevronDown } from "react-icons/fi";
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
import { useBuscarProdutosQuery } from "@/store/productsApi";
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
  const [globalSearchTerm, setGlobalSearchTerm] = useState(""); // Busca global do banco
  const [filterDimensao, setFilterDimensao] = useState<string>("");
  const [filterPadrao, setFilterPadrao] = useState<string>("");
  const [filterMarca, setFilterMarca] = useState<string>("");
  const [filterAutor, setFilterAutor] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recente"); // recente, preco-asc, preco-desc
  const [authProgress, setAuthProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchProgress, setSearchProgress] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchById, setSearchById] = useState<string>(""); // Busca por ID
  const [isIdDropdownOpen, setIsIdDropdownOpen] = useState(false); // Controle do dropdown de ID
  const ITEMS_PER_PAGE = 20;

  // Busca global do banco (como na navbar)
  const { 
    data: resultadosBuscaGlobal, 
    isLoading: isLoadingBuscaGlobal,
    isFetching: isFetchingBuscaGlobal
  } = useBuscarProdutosQuery(globalSearchTerm, {
    skip: globalSearchTerm.length < 2
  });

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
  
  if (globalSearchTerm && resultadosBuscaGlobal) {
    // Se há busca global ativa, usar resultados da busca
    produtosData = resultadosBuscaGlobal.map(produto => ({
      id: produto.id,
      titulo: produto.titulo,
      subtitulo: produto.subtitulo,
      autor: produto.autor,
      descricao: produto.descricao,
      preco: produto.preco || 0,
      dimensao: produto.dimensao,
      padrao: null,
      imagem: produto.imagem,
      imagemHover: produto.imagemHover,
      imagens: produto.imagens,
      composicao: produto.composicao,
      destaques: produto.destaques,
      categoria: produto.categoria as 'bolsas' | 'roupas' | 'sapatos',
      modelo: produto.modelo,
    }));
  } else if (searchId) {
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
    
    // Se for busca por ID (do combobox), filtrar por esse ID específico
    if (searchById) {
      const idNumerico = parseInt(searchById, 10);
      produtosFiltrados = produtosFiltrados.filter(p => p.id === idNumerico);
      return produtosFiltrados;
    }
    
    // Se for busca por ID antiga (do searchTerm), não aplicar outros filtros
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
  }, [produtosData, filterCategoria, filterDimensao, filterMarca, filterAutor, searchId, searchById, sortBy, filterIdentidade]);

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

  const dimensoesUnicas = useMemo(() => {
    const dimensoes = new Set<string>();
    (produtosData || []).forEach(p => {
      if (p.dimensao) dimensoes.add(p.dimensao);
    });
    return Array.from(dimensoes).sort();
  }, [produtosData]);

  // Lista única de IDs de produtos (ordenados do maior ao menor - mais recentes primeiro)
  const idsUnicos = useMemo(() => {
    const ids = (produtosData || [])
      .map(p => p.id)
      .filter((id): id is number => id !== undefined)
      .sort((a, b) => b - a); // Ordem decrescente (IDs maiores primeiro)
    return ids;
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

  // Debounce para busca global (aguarda usuário parar de digitar)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        setGlobalSearchTerm(searchTerm);
      }, 500); // Aguarda 500ms após parar de digitar
    } else {
      setGlobalSearchTerm("");
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Simular progresso de carregamento da busca
  useEffect(() => {
    if (isLoadingBuscaGlobal || isFetchingBuscaGlobal) {
      setSearchProgress(0);
      const interval = setInterval(() => {
        setSearchProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 100);

      return () => clearInterval(interval);
    } else if (resultadosBuscaGlobal) {
      setSearchProgress(100);
      setTimeout(() => setSearchProgress(0), 1000);
    }
  }, [isLoadingBuscaGlobal, isFetchingBuscaGlobal, resultadosBuscaGlobal]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FiPackage className="text-blue-600" />
            Gerenciamento de Produtos
          </h1>
          <p className="text-gray-600">Administre produtos, categorias e estoque do sistema</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{produtos.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiBox className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bolsas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {produtos.filter(p => p.categoria === 'bolsas').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiShoppingBag className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Roupas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {produtos.filter(p => p.categoria === 'roupas').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiLayers className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sapatos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {produtos.filter(p => p.categoria === 'sapatos').length}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiPackage className="text-2xl text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Ações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/admin/dashboard/usuarios")}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg"
              >
                <FiUsers className="text-lg" />
                <span className="font-medium">Usuários</span>
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 hover:shadow-lg"
              >
                <FiPlus className="text-lg" />
                <span className="font-medium">Novo Produto</span>
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Mostrando {paginatedProducts.length} de {produtos.length} produtos
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiImage className="text-blue-600" />
            Filtros e Busca
          </h2>
          
          {/* Linha 1: Busca Global e Busca por ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Busca Global com Indicador de Progresso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Produto (busca direta no banco)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite para buscar: título, descrição, autor, categoria..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                
                {/* Indicador de Carregamento */}
                {(isLoadingBuscaGlobal || isFetchingBuscaGlobal) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  </div>
                )}
              </div>
              
              {/* Barra de Progresso */}
              {(isLoadingBuscaGlobal || isFetchingBuscaGlobal || searchProgress > 0) && globalSearchTerm && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${searchProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
                    {resultadosBuscaGlobal && searchProgress === 100 ? (
                      <>
                        <span className="text-green-600 font-semibold"></span>
                        <span>{resultadosBuscaGlobal.length} produtos encontrados</span>
                      </>
                    ) : (
                      <span>Buscando produtos no banco de dados...</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Busca por ID com Dropdown Customizado */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por ID de Produto
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchById}
                  onChange={(e) => setSearchById(e.target.value)}
                  onFocus={() => setIsIdDropdownOpen(true)}
                  placeholder="Digite ou selecione um ID..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setIsIdDropdownOpen(!isIdDropdownOpen)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <FiChevronDown className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              
              {/* Dropdown Lista de IDs */}
              {isIdDropdownOpen && idsUnicos.length > 0 && (
                <>
                  {/* Overlay para fechar ao clicar fora */}
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setIsIdDropdownOpen(false)}
                  />
                  
                  {/* Lista de IDs */}
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Opção para limpar */}
                    {searchById && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchById("");
                          setIsIdDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-500 italic hover:bg-gray-50 border-b border-gray-100"
                      >
                        Limpar seleção
                      </button>
                    )}
                    
                    {/* Lista de IDs filtrados */}
                    {idsUnicos
                      .filter(id => !searchById || id.toString().includes(searchById))
                      .slice(0, 50)
                      .map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setSearchById(id.toString());
                            setIsIdDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
                            searchById === id.toString() 
                              ? 'bg-blue-100 text-blue-700 font-medium' 
                              : 'text-gray-700'
                          }`}
                        >
                          ID: {id}
                        </button>
                      ))}
                    
                    {/* Mensagem se não encontrar */}
                    {searchById && idsUnicos.filter(id => id.toString().includes(searchById)).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        Nenhum ID encontrado
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {searchById && (
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                  <span className="text-green-600 font-semibold"></span>
                  Filtrando pelo ID: <span className="font-semibold">{searchById}</span>
                </p>
              )}
            </div>
          </div>

          {/* Linha 2: Filtros Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Todas as Identidades</option>
                <option value="mulher">Mulher</option>
                <option value="homem">Homem</option>
                <option value="infantil">Infantil</option>
                <option value="unissex">Unissex</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar Por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="recente">Mais Recentes</option>
                <option value="preco-asc">Preço: Menor  Maior</option>
                <option value="preco-desc">Preço: Maior  Menor</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterCategoria("");
                  setFilterIdentidade("");
                  setSearchTerm("");
                  setFilterDimensao("");
                  setFilterPadrao("");
                  setFilterMarca("");
                  setFilterAutor("");
                  setSortBy("recente");
                  setSearchById(""); // Limpar busca por ID
                }}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Linha 3: Filtros Adicionais (Dimensão, Padrão, Marca, Autor) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Dimensão Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensão
              </label>
              <select
                value={filterDimensao}
                onChange={(e) => setFilterDimensao(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Todas as Dimensões</option>
                {dimensoesUnicas.map(dimensao => (
                  <option key={dimensao} value={dimensao}>{dimensao}</option>
                ))}
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Todos os Padrões</option>
                <option value="usa">USA</option>
                <option value="br">BR</option>
                <option value="null">Sem Padrão</option>
              </select>
            </div>

            {/* Marca Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca (Título)
              </label>
              <select
                value={filterMarca}
                onChange={(e) => setFilterMarca(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Todos os Autores</option>
                {autoresUnicos.map(autor => (
                  <option key={autor} value={autor}>{autor}</option>
                ))}
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
          <div className="bg-red-50/50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">Erro ao carregar produtos</p>
          </div>
        ) : produtos.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <FiPackage className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-1">Nenhum produto encontrado</p>
            <p className="text-sm text-gray-500 mb-4">Comece criando seu primeiro produto</p>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Criar Produto
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((produto) => (
                <article key={produto.id} className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex flex-col overflow-hidden h-fit">
                  
                  {/* Imagem com hover effect */}
                  <div className="w-full aspect-square relative bg-gray-50 flex-shrink-0 overflow-hidden">
                    {produto.imagem ? (
                      <>
                        {/* Imagem principal */}
                        <Image
                          src={produto.imagem}
                          alt={produto.titulo}
                          fill
                          sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                          className="object-contain transition-all duration-300 group-hover:opacity-0 group-hover:scale-105"
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
                            className="object-contain absolute inset-0 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88O7NfwAJKAOhG7enwwAAAABJRU5ErkJggg=="
                          />
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FiImage className="text-4xl text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Informações do produto */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* Category Badge + ID */}
                    <div className="flex justify-between items-center gap-2 mb-3">
                      {/* Category Tag */}
                      <span className="px-3 py-1.5 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 text-xs font-semibold rounded-lg shadow-sm border border-blue-200 tracking-wide">
                        {produto.categoria}
                      </span>
                      
                      {/* ID Tag */}
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-mono font-medium rounded-md border border-gray-200">
                        #{produto.id}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 tracking-widest uppercase mb-2 font-medium">
                      {produto.subtitulo || produto.categoria}
                    </p>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {produto.titulo}
                    </h3>
                    {produto.autor && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                        {produto.autor}
                      </p>
                    )}
                    <p className="text-base font-bold text-black mb-4">
                      {formatBRL(produto.preco)}
                    </p>

                    {/* Botões de ação */}
                    <div className="mt-auto flex justify-center items-center">
                      <button
                        onClick={() => setOptionsProduto(produto)}
                        className="group/btn flex items-center justify-center w-10 h-10 rounded-full bg-black text-white hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110"
                        aria-label="Abrir opções do produto"
                      >
                        <FiEye className="text-lg group-hover/btn:scale-110 transition-transform duration-200" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-8 mb-6 flex justify-center">
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
