"use client";

import { useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  scrollToTopOnChange?: boolean;
  scrollTargetId?: string;
  scrollOffset?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  scrollToTopOnChange = true,
  scrollTargetId = "grid",
  scrollOffset = 100,
}: PaginationProps) {

  const handlePageChange = (page: number) => {
    onPageChange(page);
    
    // Scroll ao topo da grid de produtos
    if (scrollToTopOnChange) {
      setTimeout(() => {
        const targetElement = document.getElementById(scrollTargetId);
        if (targetElement) {
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - scrollOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };
  // Gerar array de páginas a mostrar
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Número máximo de botões visíveis
    
    if (totalPages <= maxVisible) {
      // Se tem poucas páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sempre mostra primeira página
      pages.push(1);
      
      if (currentPage <= 3) {
        // Início: 1 2 3 4 ... last
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Fim: 1 ... -3 -2 -1 last
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: 1 ... current-1 current current+1 ... last
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 my-8 ${className}`}>
      {/* Botão Anterior */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg border transition-all
          ${
            currentPage === 1
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:border-black hover:bg-black hover:text-white"
          }
        `}
        aria-label="Página anterior"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>

      {/* Números das páginas */}
      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-10 h-10 text-gray-400"
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`
              flex items-center justify-center w-10 h-10 rounded-lg border font-medium transition-all
              ${
                isActive
                  ? "border-black bg-black text-white"
                  : "border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50"
              }
            `}
            aria-label={`Página ${pageNum}`}
            aria-current={isActive ? "page" : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Botão Próximo */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg border transition-all
          ${
            currentPage === totalPages
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:border-black hover:bg-black hover:text-white"
          }
        `}
        aria-label="Próxima página"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
