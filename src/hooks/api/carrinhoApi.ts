/**
 * API de Carrinho - Conecta ao backend Spring Boot
 * Endpoints: /api/carrinho/*
 */

import httpClient from '@/lib/httpClient';
import apiCache from '@/lib/apiCache';
import type { Tipo } from '@/store/wishlistSlice';
import type { CartItem } from '@/store/cartSlice';

// ========================================================================
// TIPOS - DTOs do Backend
// ========================================================================

/**
 * Item do carrinho retornado pelo backend
 */
export interface CarrinhoItemDTO {
  id: number;
  quantidade: number;
  dataAdicao: string;
  dataAtualizacao: string;
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
  // Dados do tamanho (se aplicável)
  tamanho?: {
    id: number;
    etiqueta: string;
    categoria: string;
  };
}

/**
 * Request para adicionar item ao carrinho
 */
export interface AdicionarCarrinhoRequest {
  produtoId: number;
  quantidade: number;
  tamanhoId?: number;
}

/**
 * Request para atualizar quantidade do item
 */
export interface AtualizarQuantidadeRequest {
  quantidade: number;
}

// ========================================================================
// API - SERVIÇO DE CARRINHO
// ========================================================================

export const carrinhoApi = {
  /**
   * LISTAR ITENS - GET /api/carrinho
   * Retorna todos os itens do carrinho do usuário autenticado
   * COM CACHE para evitar múltiplas chamadas simultâneas
   */
  async listarItens(): Promise<CarrinhoItemDTO[]> {
    return apiCache.fetch(
      'carrinho:listar',
      () => httpClient.get<CarrinhoItemDTO[]>('/api/carrinho', { requiresAuth: true }),
      30000 // Cache por 30 segundos
    );
  },

  /**
   * ADICIONAR ITEM - POST /api/carrinho
   * Adiciona um item ao carrinho
   */
  async adicionarItem(data: AdicionarCarrinhoRequest): Promise<CarrinhoItemDTO> {
    const result = await httpClient.post<CarrinhoItemDTO>('/api/carrinho', data, { requiresAuth: true });
    // Invalida cache ao adicionar
    apiCache.invalidate('carrinho:listar');
    return result;
  },

  /**
   * ATUALIZAR QUANTIDADE - PUT /api/carrinho/{id}
   * Atualiza a quantidade de um item no carrinho
   */
  async atualizarQuantidade(itemId: number, quantidade: number): Promise<CarrinhoItemDTO> {
    const result = await httpClient.put<CarrinhoItemDTO>(
      `/api/carrinho/${itemId}`,
      undefined,
      { 
        requiresAuth: true,
        params: { quantidade: quantidade.toString() }
      }
    );
    // Invalida cache ao atualizar
    apiCache.invalidate('carrinho:listar');
    return result;
  },

  /**
   * ATUALIZAR TAMANHO - PUT /api/carrinho/{id}/atualizar
   * Atualiza o tamanho e quantidade de um item no carrinho
   */
  async atualizarTamanho(itemId: number, novoTamanhoId: number, quantidade: number): Promise<CarrinhoItemDTO> {
    const result = await httpClient.put<CarrinhoItemDTO>(
      `/api/carrinho/${itemId}/atualizar`,
      {
        tamanhoId: novoTamanhoId,
        quantidade: quantidade
      },
      { 
        requiresAuth: true
      }
    );
    // Invalida cache ao atualizar
    apiCache.invalidate('carrinho:listar');
    return result;
  },

  /**
   * REMOVER ITEM - DELETE /api/carrinho/{id}
   * Remove um item do carrinho
   */
  async removerItem(itemId: number): Promise<void> {
    await httpClient.delete<void>(`/api/carrinho/${itemId}`, { requiresAuth: true });
    // Invalida cache ao remover
    apiCache.invalidate('carrinho:listar');
  },

  /**
   * LIMPAR CARRINHO - DELETE /api/carrinho
   * Remove todos os itens do carrinho
   */
  async limparCarrinho(): Promise<void> {
    await httpClient.delete<void>('/api/carrinho', { requiresAuth: true });
    // Invalida cache ao limpar
    apiCache.invalidate('carrinho:listar');
  },

  /**
   * CONTAR ITENS - GET /api/carrinho/count
   * Retorna o número total de itens no carrinho
   */
  async contarItens(): Promise<number> {
    return httpClient.get<number>('/api/carrinho/count', { requiresAuth: true });
  },
};

// ========================================================================
// HELPER - Conversão de DTO para formato Redux
// ========================================================================

/**
 * Converte CarrinhoItemDTO (backend) para CartItem (Redux)
 */
export function carrinhoItemDTOToCartItem(dto: CarrinhoItemDTO): CartItem {
  // Determina o tipo (categoria) do produto
  const tipo: Tipo = (dto.produto.categoria?.toLowerCase() as Tipo) || 'bolsas';
  
  return {
    id: dto.produto.id,
    tipo,
    key: `${tipo}:${dto.produto.id}`,
    qty: dto.quantidade,
    title: dto.produto.titulo,
    subtitle: dto.tamanho?.etiqueta,
    img: dto.produto.imagem,
    preco: dto.produto.preco,
    // Dados adicionais do backend
    backendId: dto.id, // ID do item no carrinho do backend
    tamanhoId: dto.tamanho?.id,
  };
}

/**
 * Converte lista de CarrinhoItemDTO para Record<string, CartItem>
 */
export function carrinhoListToRecord(items: CarrinhoItemDTO[]): Record<string, CartItem> {
  const record: Record<string, CartItem> = {};
  
  items.forEach((dto) => {
    const item = carrinhoItemDTOToCartItem(dto);
    record[item.key] = item;
  });
  
  return record;
}

export default carrinhoApi;
