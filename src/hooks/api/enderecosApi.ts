/**
 * API de Endereços - Conecta ao backend Spring Boot
 * Endpoints: /api/usuario/enderecos/*
 */

import httpClient from '@/lib/httpClient';
import apiCache from '@/lib/apiCache';

// ========================================================================
// TIPOS - DTOs do Backend
// ========================================================================

export interface EnderecoDTO {
  id?: number;
  pais?: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  principal?: boolean;
}

// ========================================================================
// API - SERVIÇO DE ENDEREÇOS
// ========================================================================

export const enderecosApi = {
  /**
   * LISTAR ENDEREÇOS - GET /api/usuario/enderecos
   * Retorna todos os endereços do usuário autenticado
   * COM CACHE para evitar múltiplas chamadas
   */
  async listar(): Promise<EnderecoDTO[]> {
    console.log('[enderecosApi]  Listando endereços do usuário...');
    const enderecos = await apiCache.fetch(
      'enderecos:listar',
      () => httpClient.get<EnderecoDTO[]>('/api/usuario/enderecos', { requiresAuth: true }),
      60000 // Cache por 60 segundos
    );
    console.log('[enderecosApi]  Endereços listados:', enderecos.length);
    return enderecos;
  },

  /**
   * BUSCAR ENDEREÇO - GET /api/usuario/enderecos/:id
   * Retorna um endereço específico
   */
  async buscarPorId(id: number): Promise<EnderecoDTO> {
    console.log('[enderecosApi]  Buscando endereço:', id);
    const endereco = await apiCache.fetch(
      `enderecos:${id}`,
      () => httpClient.get<EnderecoDTO>(`/api/usuario/enderecos/${id}`, { requiresAuth: true }),
      60000 // Cache por 60 segundos
    );
    console.log('[enderecosApi]  Endereço encontrado:', endereco);
    return endereco;
  },

  /**
   * ADICIONAR ENDEREÇO - POST /api/usuario/enderecos
   * Cria um novo endereço para o usuário
   */
  async adicionar(endereco: EnderecoDTO): Promise<EnderecoDTO> {
    console.log('[enderecosApi]  Adicionando endereço:', JSON.stringify(endereco, null, 2));
    const novoEndereco = await httpClient.post<EnderecoDTO>('/api/usuario/enderecos', endereco, { requiresAuth: true });
    console.log('[enderecosApi]  Endereço adicionado!', novoEndereco);
    // Invalida cache ao adicionar
    apiCache.invalidatePattern('enderecos');
    return novoEndereco;
  },

  /**
   * ATUALIZAR ENDEREÇO - PUT /api/usuario/enderecos/:id
   * Atualiza um endereço existente
   */
  async atualizar(id: number, endereco: EnderecoDTO): Promise<EnderecoDTO> {
    console.log('[enderecosApi]  Atualizando endereço:', id);
    const enderecoAtualizado = await httpClient.put<EnderecoDTO>(`/api/usuario/enderecos/${id}`, endereco, { requiresAuth: true });
    console.log('[enderecosApi]  Endereço atualizado!');
    // Invalida cache ao atualizar
    apiCache.invalidatePattern('enderecos');
    return enderecoAtualizado;
  },

  /**
   * DELETAR ENDEREÇO - DELETE /api/usuario/enderecos/:id
   * Remove um endereço
   */
  async deletar(id: number): Promise<void> {
    console.log('[enderecosApi]  Deletando endereço:', id);
    await httpClient.delete(`/api/usuario/enderecos/${id}`, { requiresAuth: true });
    console.log('[enderecosApi]  Endereço deletado!');
    // Invalida cache ao deletar
    apiCache.invalidatePattern('enderecos');
  },

  /**
   * MARCAR COMO PRINCIPAL - PATCH /api/usuario/enderecos/:id/marcar-principal
   * Define o endereço como principal
   */
  async marcarComoPrincipal(id: number): Promise<EnderecoDTO> {
    console.log('[enderecosApi] Marcando endereço como principal:', id);
    const endereco = await httpClient.patch<EnderecoDTO>(`/api/usuario/enderecos/${id}/marcar-principal`, {}, { requiresAuth: true });
    console.log('[enderecosApi] Endereço marcado como principal!');
    // Invalida cache ao marcar como principal
    apiCache.invalidatePattern('enderecos');
    return endereco;
  },
};

export default enderecosApi;
