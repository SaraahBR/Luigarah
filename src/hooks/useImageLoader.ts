import { useEffect, useState, useCallback } from "react";

export function useImageLoader(imageCount: number) {
  const [loadedImages, setLoadedImages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoadedImages(0);
    setIsLoading(true);
    setProgress(0);

    // Timeout de segurança: força finalização após 3 segundos
    const safetyTimeout = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }, 3000);

    return () => clearTimeout(safetyTimeout);
  }, [imageCount]);

  const onImageLoad = useCallback(() => {
    setLoadedImages((prev) => {
      const newCount = prev + 1;
      const newProgress = Math.min((newCount / imageCount) * 100, 100);
      setProgress(newProgress);

      // Quando todas as imagens carregarem ou atingir 100%
      if (newCount >= imageCount || newProgress >= 100) {
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }

      return newCount;
    });
  }, [imageCount]);

  const onImageError = useCallback(() => {
    // Mesmo em erro, contabiliza como "carregada" para não travar o loader
    onImageLoad();
  }, [onImageLoad]);

  return {
    isLoading,
    progress,
    onImageLoad,
    onImageError,
    loadedImages,
    totalImages: imageCount,
  };
}

// Tipo para produtos com imagens
type ProductWithImages = {
  img?: string;
  imgHover?: string;
  images?: string[];
};

// Função helper para contar todas as imagens de um produto
export function countProductImages(produto: ProductWithImages): number {
  let count = 0;
  
  // Imagem principal
  if (produto.img) count++;
  
  // Imagem hover
  if (produto.imgHover) count++;
  
  // Array de imagens adicionais
  if (produto.images && Array.isArray(produto.images)) {
    count += produto.images.length;
  }
  
  return Math.max(count, 1); // Pelo menos 1 imagem por produto
}

// Função para contar todas as imagens de uma lista de produtos
export function countAllProductImages(produtos: ProductWithImages[]): number {
  const total = produtos.reduce((total, produto) => total + countProductImages(produto), 0);
  return Math.max(total, produtos.length); // Pelo menos 1 imagem por produto
}
