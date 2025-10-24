import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Configurações da API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://luigarah-backend.onrender.com',
  ENDPOINTS: {
    PRODUTOS: '/produtos',
  },
  PAGINATION: {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 15,
    MAX_SIZE: 100,
  },
  CACHE: {
    PRODUTOS_LIST: 300,
    PRODUTO_DETAIL: 600,
    TAMANHOS: 300,
  },
  CATEGORIAS: ['bolsas', 'roupas', 'sapatos'] as const,
};

export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const isValidCategoria = (categoria: string): categoria is 'bolsas' | 'roupas' | 'sapatos' => {
  return API_CONFIG.CATEGORIAS.includes(categoria as 'bolsas' | 'roupas' | 'sapatos');
};

export const buildQueryParams = (params: Record<string, string | number | boolean>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  return searchParams.toString();
};

export const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${API_CONFIG.BASE_URL}/api`,
  prepareHeaders: (headers) => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('luigara:auth:token');
        if (raw) {
          const authToken = JSON.parse(raw) as { token: string; tipo: string };
          headers.set('Authorization', `${authToken.tipo} ${authToken.token}`);
        }
      } catch (error) {
        console.error('[API] Erro ao recuperar token:', error);
      }
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});
