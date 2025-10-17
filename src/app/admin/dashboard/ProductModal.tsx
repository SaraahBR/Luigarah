"use client";

import { useState, useEffect, useMemo } from "react";
import { FiX, FiPlus, FiTrash2, FiSearch } from "react-icons/fi";
import { ProdutoDTO } from "@/hooks/api/types";
import {
  useCriarProdutoMutation,
  useAtualizarProdutoMutation,
  useListarProdutosQuery,
} from "@/hooks/api/produtosApi";
import Image from "next/image";
import Toast from "./Toast";

interface ProductModalProps {
  product: ProdutoDTO | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const isEditing = !!product;

  // Mutations
  const [criarProduto, { isLoading: isCreating }] = useCriarProdutoMutation();
  const [atualizarProduto, { isLoading: isUpdating }] = useAtualizarProdutoMutation();

  // Form State
  const [formData, setFormData] = useState<Partial<ProdutoDTO>>({
    titulo: "",
    subtitulo: "",
    autor: "",
    descricao: "",
    preco: 0,
    dimensao: "",
    imagem: "",
    imagemHover: "",
    imagens: [], // Array vazio - backend aceita via StringListFlexDeserializer
    composicao: "Não informado",
    destaques: [], // Array vazio - backend aceita via StringListFlexDeserializer
    categoria: "bolsas",
    modelo: undefined,
    identidade: undefined,
  });

  const [newDestaque, setNewDestaque] = useState("");
  const [newImagem, setNewImagem] = useState("");
  const [tituloSearch, setTituloSearch] = useState("");
  const [showTituloDropdown, setShowTituloDropdown] = useState(false);
  const [subtituloSearch, setSubtituloSearch] = useState("");
  const [showSubtituloDropdown, setShowSubtituloDropdown] = useState(false);
  const [dimensaoSearch, setDimensaoSearch] = useState("");
  const [showDimensaoDropdown, setShowDimensaoDropdown] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Buscar todos os produtos para extrair dados únicos
  const { data: todosOsProdutos } = useListarProdutosQuery({ tamanho: 1000 });

  // Extrair títulos únicos
  const titulosExistentes = useMemo(() => {
    if (!todosOsProdutos?.dados) return [];
    const titulos = todosOsProdutos.dados
      .map(p => p.titulo)
      .filter((s): s is string => !!s && s.trim() !== "");
    return Array.from(new Set(titulos)).sort();
  }, [todosOsProdutos]);

  // Extrair subtítulos únicos
  const subtitulosExistentes = useMemo(() => {
    if (!todosOsProdutos?.dados) return [];
    const subtitulos = todosOsProdutos.dados
      .map(p => p.subtitulo)
      .filter((s): s is string => !!s && s.trim() !== "");
    return Array.from(new Set(subtitulos)).sort();
  }, [todosOsProdutos]);

  // Extrair dimensões únicas
  const dimensoesExistentes = useMemo(() => {
    if (!todosOsProdutos?.dados) return [];
    const dimensoes = todosOsProdutos.dados
      .map(p => p.dimensao)
      .filter((s): s is string => !!s && s.trim() !== "");
    return Array.from(new Set(dimensoes)).sort();
  }, [todosOsProdutos]);

  // Filtrar títulos baseado na busca
  const titulosFiltrados = useMemo(() => {
    if (!tituloSearch.trim()) return titulosExistentes;
    return titulosExistentes.filter(s =>
      s.toLowerCase().includes(tituloSearch.toLowerCase())
    );
  }, [titulosExistentes, tituloSearch]);

  // Filtrar subtítulos baseado na busca
  const subtitulosFiltrados = useMemo(() => {
    if (!subtituloSearch.trim()) return subtitulosExistentes;
    return subtitulosExistentes.filter(s =>
      s.toLowerCase().includes(subtituloSearch.toLowerCase())
    );
  }, [subtitulosExistentes, subtituloSearch]);

  // Filtrar dimensões baseado na busca
  const dimensoesFiltradas = useMemo(() => {
    if (!dimensaoSearch.trim()) return dimensoesExistentes;
    return dimensoesExistentes.filter(s =>
      s.toLowerCase().includes(dimensaoSearch.toLowerCase())
    );
  }, [dimensoesExistentes, dimensaoSearch]);

  // Auto-completar autor baseado no título
  const autoCompletarAutor = (titulo: string) => {
    if (!todosOsProdutos?.dados) return;
    const produtoComMesmoTitulo = todosOsProdutos.dados.find(
      p => p.titulo?.toLowerCase() === titulo.toLowerCase()
    );
    if (produtoComMesmoTitulo && produtoComMesmoTitulo.autor) {
      setFormData(prev => ({ ...prev, autor: produtoComMesmoTitulo.autor }));
    }
  };

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        categoria: product.categoria || "bolsas",
        composicao: product.composicao || "Não informado",
        titulo: product.titulo || "",
        subtitulo: product.subtitulo || "",
        descricao: product.descricao || "",
        preco: product.preco || 0,
        imagens: product.imagens || [],
        destaques: product.destaques || [],
        dimensao: product.dimensao || "",
      });
      setTituloSearch(product.titulo || "");
      setSubtituloSearch(product.subtitulo || "");
      setDimensaoSearch(product.dimensao || "");
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação obrigatória dos campos
    if (!formData.categoria || !['bolsas','roupas','sapatos'].includes(formData.categoria)) {
      setToast({ message: 'Selecione uma categoria válida!', type: 'error' });
      return;
    }
    if (!formData.composicao || !formData.composicao.trim()) {
      setToast({ message: 'Preencha a composição!', type: 'error' });
      return;
    }
    if (!formData.titulo || !formData.titulo.trim()) {
      setToast({ message: 'Preencha o título!', type: 'error' });
      return;
    }
    if (!formData.preco || formData.preco <= 0) {
      setToast({ message: 'Preencha um preço válido!', type: 'error' });
      return;
    }

    try {
      // Payload para POST e PUT (edição e criação) - sem identidade
      const { identidade, id, ...formDataSemIdentidade } = formData;
      
      // Garantir que campos obrigatórios nunca sejam undefined
      const payload: Partial<ProdutoDTO> = {
        titulo: formData.titulo!.trim(),
        categoria: formData.categoria!,
        composicao: formData.composicao!.trim(),
        preco: formData.preco!,
        // Campos opcionais - apenas incluir se tiverem valor
        ...(formData.subtitulo?.trim() && { subtitulo: formData.subtitulo.trim() }),
        ...(formData.descricao?.trim() && { descricao: formData.descricao.trim() }),
        ...(formData.dimensao?.trim() && { dimensao: formData.dimensao.trim() }),
        ...(formData.autor?.trim() && { autor: formData.autor.trim() }),
        ...(formData.imagem?.trim() && { imagem: formData.imagem.trim() }),
        ...(formData.imagemHover?.trim() && { imagemHover: formData.imagemHover.trim() }),
        // Arrays - sempre enviar (mesmo que vazios)
        imagens: formData.imagens || [],
        destaques: formData.destaques || [],
      };

      if (isEditing) {
        await atualizarProduto({ id: product.id!, produto: payload }).unwrap();
        setToast({ message: 'Produto atualizado com sucesso!', type: 'success' });
        setTimeout(() => onClose(), 1500);
      } else {
        await criarProduto(payload).unwrap();
        setToast({ message: 'Produto criado com sucesso!', type: 'success' });
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      const error = err as { data?: { mensagem?: string; dados?: Record<string, string> }; message?: string };
      
      // Mostrar erros de validação detalhados
      if (error.data?.dados) {
        const erros = Object.entries(error.data.dados)
          .map(([campo, msg]) => `${campo}: ${msg}`)
          .join('\n');
        setToast({ message: `Erro de validação:\n${erros}`, type: 'error' });
      } else {
        setToast({ 
          message: error.data?.mensagem || error.message || "Erro desconhecido ao salvar produto", 
          type: 'error' 
        });
      }
    }
  };

  // Remove destaque do array
  const removeDestaque = (index: number) => {
    const updated = [...(formData.destaques || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, destaques: updated });
  };

  // Adiciona destaque ao array
  const addDestaque = () => {
    if (newDestaque.trim()) {
      setFormData({
        ...formData,
        destaques: [...(formData.destaques || []), newDestaque.trim()],
      });
      setNewDestaque("");
    }
  };

  // Remove imagem do array
  const removeImagem = (index: number) => {
    const updated = [...(formData.imagens || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, imagens: updated });
  };

  // Adiciona imagem ao array
  const addImagem = () => {
    if (newImagem.trim()) {
      setFormData({
        ...formData,
        imagens: [...(formData.imagens || []), newImagem.trim()],
      });
      setNewImagem("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fadeIn">
        {/* Header - Fixo */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="text-2xl text-gray-600" />
          </button>
        </div>

        {/* Form - Scrollável */}
        <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
          {/* Grid 2 colunas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título com Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiSearch />
                </div>
                <input
                  type="text"
                  value={tituloSearch}
                  onChange={(e) => {
                    setTituloSearch(e.target.value);
                    setFormData({ ...formData, titulo: e.target.value });
                  }}
                  onFocus={() => setShowTituloDropdown(true)}
                  placeholder="Digite ou selecione..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Dropdown */}
              {showTituloDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowTituloDropdown(false)}
                  />
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Opção de adicionar novo */}
                    {tituloSearch.trim() &&
                      !titulosExistentes.some(s => s.toLowerCase() === tituloSearch.toLowerCase()) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, titulo: tituloSearch.trim() });
                            setShowTituloDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-200"
                        >
                          <FiPlus className="text-green-600" />
                          <span className="font-medium text-green-600">
                            Adicionar &quot;{tituloSearch.trim()}&quot;
                          </span>
                        </button>
                      )}

                    {/* Lista de títulos existentes */}
                    {titulosFiltrados.length > 0 ? (
                      titulosFiltrados.map((titulo, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setTituloSearch(titulo);
                            setFormData({ ...formData, titulo });
                            autoCompletarAutor(titulo);
                            setShowTituloDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                        >
                          {titulo}
                        </button>
                      ))
                    ) : (
                      !tituloSearch.trim() && (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Nenhum título encontrado
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Subtítulo com Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtítulo
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiSearch />
                </div>
                <input
                  type="text"
                  value={subtituloSearch}
                  onChange={(e) => {
                    setSubtituloSearch(e.target.value);
                    setFormData({ ...formData, subtitulo: e.target.value });
                  }}
                  onFocus={() => setShowSubtituloDropdown(true)}
                  placeholder="Digite ou selecione..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
              </div>

              {/* Dropdown */}
              {showSubtituloDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSubtituloDropdown(false)}
                  />
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Opção de adicionar novo */}
                    {subtituloSearch.trim() &&
                      !subtitulosExistentes.some(s => s.toLowerCase() === subtituloSearch.toLowerCase()) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, subtitulo: subtituloSearch.trim() });
                            setShowSubtituloDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-200"
                        >
                          <FiPlus className="text-green-600" />
                          <span className="font-medium text-green-600">
                            Adicionar &quot;{subtituloSearch.trim()}&quot;
                          </span>
                        </button>
                      )}

                    {/* Lista de subtítulos existentes */}
                    {subtitulosFiltrados.length > 0 ? (
                      subtitulosFiltrados.map((subtitulo, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSubtituloSearch(subtitulo);
                            setFormData({ ...formData, subtitulo });
                            setShowSubtituloDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                        >
                          {subtitulo}
                        </button>
                      ))
                    ) : (
                      !subtituloSearch.trim() && (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Nenhum subtítulo encontrado
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Autor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Autor/Designer
              </label>
              <input
                type="text"
                value={formData.autor || ""}
                onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>

            {/* Preço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                R$ {(formData.preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
              </p>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  categoria: e.target.value as "bolsas" | "roupas" | "sapatos"
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              >
                <option value="bolsas">Bolsas</option>
                <option value="roupas">Roupas</option>
                <option value="sapatos">Sapatos</option>
              </select>
            </div>

            {/* Dimensão com Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensão
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiSearch />
                </div>
                <input
                  type="text"
                  value={dimensaoSearch}
                  onChange={(e) => {
                    setDimensaoSearch(e.target.value);
                    setFormData({ ...formData, dimensao: e.target.value });
                  }}
                  onFocus={() => setShowDimensaoDropdown(true)}
                  placeholder="Digite ou selecione..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
              </div>

              {/* Dropdown */}
              {showDimensaoDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDimensaoDropdown(false)}
                  />
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Opção de adicionar novo */}
                    {dimensaoSearch.trim() &&
                      !dimensoesExistentes.some(s => s.toLowerCase() === dimensaoSearch.toLowerCase()) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, dimensao: dimensaoSearch.trim() });
                            setShowDimensaoDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-200"
                        >
                          <FiPlus className="text-green-600" />
                          <span className="font-medium text-green-600">
                            Adicionar &quot;{dimensaoSearch.trim()}&quot;
                          </span>
                        </button>
                      )}

                    {/* Lista de dimensões existentes */}
                    {dimensoesFiltradas.length > 0 ? (
                      dimensoesFiltradas.map((dimensao, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setDimensaoSearch(dimensao);
                            setFormData({ ...formData, dimensao });
                            setShowDimensaoDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                        >
                          {dimensao}
                        </button>
                      ))
                    ) : (
                      !dimensaoSearch.trim() && (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Nenhuma dimensão encontrada
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Composição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Composição <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.composicao || ""}
                onChange={(e) => setFormData({ ...formData, composicao: e.target.value })}
                placeholder="Couro 100%, etc..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.descricao || ""}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Imagem Principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem Principal (URL)
            </label>
            <input
              type="url"
              value={formData.imagem || ""}
              onChange={(e) => setFormData({ ...formData, imagem: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
            {formData.imagem && (
              <div className="mt-3 relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={formData.imagem}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {/* Imagem Hover */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem Hover (URL)
            </label>
            <input
              type="url"
              value={formData.imagemHover || ""}
              onChange={(e) => setFormData({ ...formData, imagemHover: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
            {formData.imagemHover && (
              <div className="mt-3 relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={formData.imagemHover}
                  alt="Preview Hover"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {/* Imagens Adicionais */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens Adicionais
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={newImagem}
                onChange={(e) => setNewImagem(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={addImagem}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FiPlus />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(formData.imagens || []).map((img, index) => (
                <div key={index} className="relative group">
                  <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <Image src={img} alt={`Imagem ${index + 1}`} fill className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImagem(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Destaques */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destaques
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newDestaque}
                onChange={(e) => setNewDestaque(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDestaque())}
                placeholder="Adicionar destaque..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={addDestaque}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FiPlus />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.destaques || []).map((destaque, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  <span>{destaque}</span>
                  <button
                    type="button"
                    onClick={() => removeDestaque(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div>
          </div>
        </form>

        {/* Footer - Fixo */}
        <div className="flex justify-end gap-3 p-6 border-t flex-shrink-0 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isCreating || isUpdating}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating || isUpdating
              ? "Salvando..."
              : isEditing
              ? "Atualizar Produto"
              : "Criar Produto"}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
