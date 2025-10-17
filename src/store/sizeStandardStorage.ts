/**
 * Armazenamento local do padrão de tamanhos dos produtos
 * Como não há endpoint backend para isso, gerenciamos no frontend
 */

const STORAGE_KEY = 'luigara_product_size_standards';

export type SizeStandard = 'usa' | 'br' | 'sapatos';

interface ProductSizeStandards {
  [productId: string]: SizeStandard;
}

/**
 * Obter todos os padrões salvos
 */
export const getAllSizeStandards = (): ProductSizeStandards => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Erro ao carregar padrões de tamanho:', error);
    return {};
  }
};

/**
 * Obter o padrão de tamanho de um produto específico
 */
export const getProductSizeStandard = (productId: number): SizeStandard | null => {
  const standards = getAllSizeStandards();
  return standards[productId] || null;
};

/**
 * Definir o padrão de tamanho para um produto
 */
export const setProductSizeStandard = (productId: number, standard: SizeStandard): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const standards = getAllSizeStandards();
    standards[productId] = standard;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(standards));
    console.log(`✅ Padrão "${standard}" salvo para produto ${productId}`);
  } catch (error) {
    console.error('Erro ao salvar padrão de tamanho:', error);
  }
};

/**
 * Remover o padrão de tamanho de um produto
 */
export const removeProductSizeStandard = (productId: number): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const standards = getAllSizeStandards();
    delete standards[productId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(standards));
    console.log(`🗑️ Padrão removido do produto ${productId}`);
  } catch (error) {
    console.error('Erro ao remover padrão de tamanho:', error);
  }
};

/**
 * Limpar todos os padrões (útil para debug/reset)
 */
export const clearAllSizeStandards = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Todos os padrões de tamanho foram removidos');
  } catch (error) {
    console.error('Erro ao limpar padrões de tamanho:', error);
  }
};

/**
 * Obter os tamanhos disponíveis baseado no padrão
 */
export const getSizesByStandard = (standard: SizeStandard): string[] => {
  const SIZES_MAP: Record<SizeStandard, string[]> = {
    usa: ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    br: ['PP', 'P', 'M', 'G', 'XG', 'G1', 'G2'],
    sapatos: ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  };

  return SIZES_MAP[standard] || [];
};
