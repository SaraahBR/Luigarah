"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBuscarProdutosQuery, type Produto } from "@/store/productsApi";

// Função para limpar URLs que podem ter espaços ou caracteres de controle
const cleanImageUrl = (url: string | undefined | null): string => {
  if (!url) return '/placeholder.jpg';
  return url.replace(/[\s\n\r\t]+/g, '').trim() || '/placeholder.jpg';
};

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Buscar produtos apenas quando há termo de busca (mínimo 2 caracteres)
  const { data: searchResults, isLoading } = useBuscarProdutosQuery(searchTerm, {
    skip: searchTerm.length < 2
  });

  // Filtrar resultados localmente para sugestões mais precisas
  const suggestions = searchResults?.filter((produto: Produto) => {
    const term = searchTerm.toLowerCase();
    return (
      produto.titulo.toLowerCase().includes(term) ||
      produto.subtitulo.toLowerCase().includes(term) ||
      produto.descricao?.toLowerCase().includes(term) ||
      produto.composicao?.toLowerCase().includes(term) ||
      produto.destaques?.some((destaque: string) => destaque.toLowerCase().includes(term)) ||
      produto.autor?.toLowerCase().includes(term) ||
      produto.categoria?.toLowerCase().includes(term)
    );
  })?.slice(0, 8) || []; // Mostrar no máximo 8 sugestões

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    setIsOpen(value.length >= 2);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else if (searchTerm.trim()) {
          handleSearch();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectSuggestion = (produto: Produto) => {
    router.push(`/produtos/${produto.categoria}/detalhes/${produto.id}`);
    setSearchTerm("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const formatPrice = (price: number) => 
    price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-96">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Buscar produtos, marcas, materiais..."
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          autoComplete="off"
        />
        
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
          aria-label="Buscar"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Dropdown de sugestões */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((produto: Produto, index: number) => (
                <button
                  key={produto.id}
                  onClick={() => handleSelectSuggestion(produto)}
                  className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                    index === selectedIndex ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Image
                      src={cleanImageUrl(produto.imagem)}
                      alt={produto.titulo}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {produto.titulo}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {produto.subtitulo} • {produto.descricao}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatPrice(produto.preco || 0)}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 uppercase">
                      {produto.categoria}
                    </div>
                  </div>
                </button>
              ))}
              
              {searchTerm.trim() && (
                <button
                  onClick={handleSearch}
                  className="w-full text-left p-3 hover:bg-gray-50 border-t border-gray-200 text-sm text-gray-600"
                >
                  Ver todos os resultados para &ldquo;{searchTerm}&rdquo;
                </button>
              )}
            </>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Nenhum produto encontrado para &ldquo;{searchTerm}&rdquo;</p>
              <p className="text-xs mt-1">Tente termos como marca, cor, material ou tipo de produto</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;