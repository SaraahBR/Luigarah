// Configurações da API
export const API_CONFIG = {
  // URL base do backend Spring Boot
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  
  // Endpoints
  ENDPOINTS: {
    PRODUTOS: '/produtos',
  },
  
  // Configurações de paginação padrão
  PAGINATION: {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 15,
    MAX_SIZE: 100,
  },
  
  // Configurações de cache (em segundos)
  CACHE: {
    PRODUTOS_LIST: 300, // 5 minutos
    PRODUTO_DETAIL: 600, // 10 minutos
    TAMANHOS: 300, // 5 minutos
  },
  
  // Categorias válidas
  CATEGORIAS: ['bolsas', 'roupas', 'sapatos'] as const,
};

// Helper para construir URLs
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper para validar categoria
export const isValidCategoria = (categoria: string): categoria is 'bolsas' | 'roupas' | 'sapatos' => {
  return API_CONFIG.CATEGORIAS.includes(categoria as 'bolsas' | 'roupas' | 'sapatos');
};

// Helper para parâmetros de consulta
export const buildQueryParams = (params: Record<string, string | number | boolean>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  return searchParams.toString();
};