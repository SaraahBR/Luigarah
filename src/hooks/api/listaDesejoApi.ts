/**
 * API de Lista de Desejos - Conecta ao backend Spring Boot
 * Endpoints: /api/lista-desejos/*
 */

import httpClient from '@/lib/httpClient';
import apiCache from '@/lib/apiCache';
import type { Tipo, WishlistItem } from '@/store/wishlistSlice';

// ========================================================================
// TIPOS - DTOs do Backend
// ========================================================================

/**
 * Item da lista de desejos retornado pelo backend
 */
export interface ListaDesejoItemDTO {
  id: number;
  dataAdicao: string;
  // Dados do produto (vêm populados do backend)
  produto: {
    id: number;
    titulo: string;
    subtitulo?: string;
    descricao?: string;
    preco: number;
    imagem?: string;
    imagemHover?: string;
    categoria?: string;
    autor?: string;
  };
}

// ========================================================================
// API - SERVIÇO DE LISTA DE DESEJOS
// ========================================================================

export const listaDesejoApi = {
  /**
   * LISTAR ITENS - GET /api/lista-desejos
   * Retorna todos os itens da lista de desejos do usuário autenticado
   * COM CACHE para evitar múltiplas chamadas simultâneas
   */
  async listarItens(): Promise<ListaDesejoItemDTO[]> {
    return apiCache.fetch(
      'lista-desejos:listar',
      () => httpClient.get<ListaDesejoItemDTO[]>('/api/lista-desejos', { requiresAuth: true }),
      30000 // Cache por 30 segundos
    );
  },

  /**
   * ADICIONAR ITEM - POST /api/lista-desejos/{produtoId}
   * Adiciona um produto à lista de desejos
   */
  async adicionarItem(produtoId: number): Promise<ListaDesejoItemDTO> {
    const result = await httpClient.post<ListaDesejoItemDTO>(
      `/api/lista-desejos/${produtoId}`, 
      undefined, 
      { requiresAuth: true }
    );
    // Invalida cache ao adicionar
    apiCache.invalidate('lista-desejos:listar');
    return result;
  },

  /**
   * REMOVER ITEM - DELETE /api/lista-desejos/{id}
   * Remove um item da lista de desejos pelo ID do item
   */
  async removerItem(itemId: number): Promise<void> {
    await httpClient.delete<void>(`/api/lista-desejos/${itemId}`, { requiresAuth: true });
    // Invalida cache ao remover
    apiCache.invalidate('lista-desejos:listar');
  },

  /**
   * REMOVER POR PRODUTO - DELETE /api/lista-desejos/produto/{produtoId}
   * Remove um item da lista de desejos pelo ID do produto
   */
  async removerPorProduto(produtoId: number): Promise<void> {
    await httpClient.delete<void>(`/api/lista-desejos/produto/${produtoId}`, { requiresAuth: true });
    // Invalida cache ao remover
    apiCache.invalidate('lista-desejos:listar');
  },

  /**
   * VERIFICAR SE ESTÁ NA LISTA - GET /api/lista-desejos/verificar/{produtoId}
   * Verifica se um produto está na lista de desejos
   */
  async verificarSeEstaFavorito(produtoId: number): Promise<boolean> {
    return httpClient.get<boolean>(
      `/api/lista-desejos/verificar/${produtoId}`,
      { requiresAuth: true }
    );
  },

  /**
   * LIMPAR LISTA - DELETE /api/lista-desejos
   * Remove todos os itens da lista de desejos
   */
  async limparLista(): Promise<void> {
    await httpClient.delete<void>('/api/lista-desejos', { requiresAuth: true });
    // Invalida cache ao limpar
    apiCache.invalidate('lista-desejos:listar');
  },

  /**
   * CONTAR ITENS - GET /api/lista-desejos/count
   * Retorna o número total de itens na lista de desejos
   */
  async contarItens(): Promise<number> {
    return httpClient.get<number>('/api/lista-desejos/count', { requiresAuth: true });
  },
};

// ========================================================================
// HELPER - Conversão de DTO para formato Redux
// ========================================================================

/**
 * Converte ListaDesejoItemDTO (backend) para WishlistItem (Redux)
 */
export function listaDesejoItemDTOToWishlistItem(dto: ListaDesejoItemDTO): WishlistItem {
  // Determina o tipo (categoria) do produto
  const tipo: Tipo = (dto.produto.categoria?.toLowerCase() as Tipo) || 'bolsas';
  
  return {
    id: dto.produto.id,
    tipo,
    title: dto.produto.titulo,
    subtitle: dto.produto.subtitulo,
    img: dto.produto.imagem,
    // Dados adicionais do backend
    backendId: dto.id, // ID do item na lista de desejos do backend
  };
}

/**
 * Converte lista de ListaDesejoItemDTO para Record<string, WishlistItem>
 */
export function listaDesejoListToRecord(items: ListaDesejoItemDTO[]): Record<string, WishlistItem> {
  const record: Record<string, WishlistItem> = {};
  
  items.forEach((dto) => {
    const item = listaDesejoItemDTOToWishlistItem(dto);
    const key = `${item.tipo}:${item.id}`;
    record[key] = item;
  });
  
  return record;
}

export default listaDesejoApi;
