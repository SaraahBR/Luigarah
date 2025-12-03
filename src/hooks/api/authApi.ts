/**
 * API de Autenticação - Conecta ao backend Spring Boot
 * Endpoints: /api/auth/*
 */

import httpClient, { tokenManager, userManager, type AuthToken, type Usuario, type FetchError } from '@/lib/httpClient';
import apiCache from '@/lib/apiCache';
import { getErrorMessage } from "@/lib/errorUtils";

// ========================================================================
// TIPOS - DTOs do Backend
// ========================================================================

/**
 * Requisição de Login
 */
export interface LoginRequest {
  email: string;
  senha: string;
}

/**
 * Requisição de Registro
 */
export interface RegistroRequest {
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  telefone?: string;
  dataNascimento?: string; // formato: yyyy-MM-dd
  genero?: 'Masculino' | 'Feminino' | 'Não Especificado';
}

/**
 * Requisição de Sincronização OAuth
 * Usado para criar/vincular conta de usuário logado com Google
 */
export interface OAuthSyncRequest {
  provider: 'google' | 'facebook' | 'github';
  email: string;
  nome: string;
  sobrenome?: string;
  fotoUrl?: string; // Request usa fotoUrl (input)
  oauthId?: string; // ID do provider (Google ID, Facebook ID, etc.)
}

/**
 * Resposta de Autenticação (Login/Registro)
 */
export interface AuthResponse {
  token: string;
  tipo: string; // "Bearer"
  usuario: Usuario;
}

/**
 * Requisição de Alteração de Senha
 */
export interface AlterarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}

/**
 * Requisição de Envio de Código de Verificação
 */
export interface EnviarCodigoVerificacaoRequest {
  email: string;
}

/**
 * Requisição de Verificação de Código
 */
export interface VerificarCodigoRequest {
  email: string;
  codigo: string;
}

/**
 * Requisição de Redefinição de Senha com Código
 */
export interface RedefinirSenhaComCodigoRequest {
  email: string;
  codigo: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}

/**
 * DTO de Endereço
 */
export interface EnderecoDTO {
  id?: number;
  pais?: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  bairro?: string;
  rua?: string; // Nome do campo no backend (não "logradouro")
  numero?: string;
  complemento?: string;
  principal?: boolean;
}

/**
 * DTO de Usuário (Perfil Completo)
 */
export interface UsuarioDTO {
  id: number;
  nome: string;
  sobrenome?: string;
  email: string;
  role: 'USER' | 'ADMIN';
  telefone?: string;
  dataNascimento?: string;
  genero?: string;
  fotoPerfil?: string; // URL da foto de perfil (nome do campo no backend)
  enderecos?: EnderecoDTO[];
}

// ========================================================================
// API - SERVIÇO DE AUTENTICAÇÃO
// ========================================================================

export const authApi = {
  /**
   * LOGIN - POST /api/auth/login
   * Autentica o usuário e retorna o token JWT
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/api/auth/login', data);
    
    // Salva token e usuário no localStorage
    const authToken: AuthToken = {
      token: response.token,
      tipo: response.tipo,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
    };
    
    tokenManager.save(authToken);
    userManager.save(response.usuario);
    
    // Invalida cache de perfil ao fazer login
    apiCache.invalidate('auth:perfil');
    
    return response;
  },

  /**
   * REGISTRO - POST /api/auth/registrar
   * Cria uma nova conta de usuário
   */
  async registrar(data: RegistroRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/api/auth/registrar', data);
    
    // Salva token e usuário no localStorage
    const authToken: AuthToken = {
      token: response.token,
      tipo: response.tipo,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
    };
    
    tokenManager.save(authToken);
    userManager.save(response.usuario);
    
    // Invalida cache de perfil ao registrar
    apiCache.invalidate('auth:perfil');
    
    return response;
  },

  /**
   * SINCRONIZAR OAUTH - POST /api/auth/oauth/sync
   * Cria ou vincula uma conta OAuth (Google, Facebook, etc.) ao backend
   * 
   * Se o e-mail já existe: vincula a conta OAuth e retorna token JWT
   * Se o e-mail não existe: cria nova conta e retorna token JWT
   */
  async syncOAuth(data: OAuthSyncRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/api/auth/oauth/sync', data);
    
    // Salva token e usuário no localStorage
    const authToken: AuthToken = {
      token: response.token,
      tipo: response.tipo,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
    };
    
    tokenManager.save(authToken);
    userManager.save(response.usuario);
    
    // Invalida cache de perfil ao sincronizar OAuth
    apiCache.invalidate('auth:perfil');
    
    return response;
  },

  /**
   * PERFIL - GET /api/auth/perfil
   * Retorna os dados completos do usuário autenticado
   * COM CACHE para evitar múltiplas chamadas
   */
  async getPerfil(): Promise<UsuarioDTO> {
    return apiCache.fetch(
      'auth:perfil',
      () => httpClient.get<UsuarioDTO>('/api/auth/perfil', { requiresAuth: true }),
      60000 // Cache por 60 segundos (dados de perfil mudam pouco)
    );
  },

  /**
   * ATUALIZAR PERFIL - PUT /api/auth/perfil
   * Atualiza os dados do usuário autenticado
   */
  async atualizarPerfil(data: Partial<UsuarioDTO>): Promise<UsuarioDTO> {
    console.log('[authApi]  Atualizando perfil com dados:', JSON.stringify(data, null, 2));
    
    try {
      const updated = await httpClient.put<UsuarioDTO>('/api/auth/perfil', data, { requiresAuth: true });
      
      console.log('[authApi]  Perfil atualizado! Resposta:', JSON.stringify(updated, null, 2));
      
      // Invalida cache ao atualizar perfil
      apiCache.invalidate('auth:perfil');
      
      return updated;
    } catch (error: unknown) {
      const fetchError = error as FetchError;
      console.error('[authApi]  ERRO DETALHADO ao atualizar perfil:', {
        mensagem: getErrorMessage(error),
        status: fetchError.status,
        statusText: fetchError.statusText,
        url: fetchError.url,
        dadosRetornados: fetchError.data,
      });
      
      // Log extra para ver o que tem dentro de "dados"
      if (fetchError.data && typeof fetchError.data === 'object' && 'dados' in fetchError.data) {
        console.error('[authApi]  Detalhes dentro de "dados":', (fetchError.data as { dados: unknown }).dados);
      }
      
      // Log da mensagem do backend
      if (fetchError.data && typeof fetchError.data === 'object' && 'mensagem' in fetchError.data) {
        console.error('[authApi]  Mensagem do backend:', (fetchError.data as { mensagem: unknown }).mensagem);
      }
      
      throw error;
    }
  },

  /**
   * ALTERAR SENHA - PUT /api/auth/alterar-senha
   * Altera a senha do usuário autenticado
   */
  async alterarSenha(data: AlterarSenhaRequest): Promise<{ message: string }> {
    const result = await httpClient.put<{ message: string }>('/api/auth/alterar-senha', data, { requiresAuth: true });
    // Invalida cache ao alterar senha
    apiCache.invalidate('auth:perfil');
    return result;
  },

  /**
   * ATUALIZAR FOTO DE PERFIL POR URL - PUT /api/auth/perfil/foto
   * Atualiza a URL da foto de perfil
   */
  async atualizarFotoPorUrl(fotoUrl: string): Promise<{ sucesso: boolean; mensagem: string; fotoPerfil: string }> {
    const result = await httpClient.put<{ sucesso: boolean; mensagem: string; fotoPerfil: string }>(
      '/api/auth/perfil/foto',
      { fotoUrl }, // Request usa fotoUrl
      { requiresAuth: true }
    );
    // Invalida cache ao atualizar foto
    apiCache.invalidate('auth:perfil');
    return result;
  },

  /**
   * UPLOAD DE FOTO DE PERFIL - POST /api/auth/perfil/foto/upload
   * Faz upload de arquivo de imagem para foto de perfil
   */
  async uploadFotoPerfil(file: File): Promise<{ sucesso: boolean; mensagem: string; fotoPerfil: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = tokenManager.get()?.token;
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://luigarah-backend.onrender.com';

    const response = await fetch(`${API_BASE_URL}/api/auth/perfil/foto/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ mensagem: 'Erro ao fazer upload' }));
      throw new Error(error.mensagem || 'Erro ao fazer upload');
    }

    const result = await response.json();
    // Invalida cache ao fazer upload de foto
    apiCache.invalidate('auth:perfil');
    return result;
  },

  /**
   * REMOVER FOTO DE PERFIL - DELETE /api/auth/perfil/foto
   * Remove a foto de perfil do usuário
   */
  async removerFotoPerfil(): Promise<{ sucesso: boolean; mensagem: string }> {
    const result = await httpClient.delete<{ sucesso: boolean; mensagem: string }>(
      '/api/auth/perfil/foto',
      { requiresAuth: true }
    );
    // Invalida cache ao remover foto
    apiCache.invalidate('auth:perfil');
    return result;
  },

  /**
   * LOGOUT - Limpa os dados de autenticação do localStorage
   */
  logout(): void {
    tokenManager.clear();
    // Invalida cache ao fazer logout
    apiCache.clear();
    userManager.clear();
  },

  /**
   * VERIFICAR AUTENTICAÇÃO - Checa se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return tokenManager.isValid();
  },

  /**
   * OBTER USUÁRIO ATUAL - Retorna os dados do usuário do localStorage
   */
  getCurrentUser(): Usuario | null {
    return userManager.get();
  },

  /**
   * OBTER TOKEN - Retorna o token JWT do localStorage
   */
  getToken(): string | null {
    const authToken = tokenManager.get();
    return authToken ? authToken.token : null;
  },

  /**
   * ENVIAR CÓDIGO DE VERIFICAÇÃO - POST /api/auth/enviar-codigo-verificacao
   * Envia um código de 6 dígitos para o email do usuário após cadastro tradicional
   */
  async enviarCodigoVerificacao(data: EnviarCodigoVerificacaoRequest): Promise<{ sucesso: boolean; mensagem: string }> {
    return httpClient.post<{ sucesso: boolean; mensagem: string }>('/api/auth/enviar-codigo-verificacao', data);
  },

  /**
   * VERIFICAR CÓDIGO - POST /api/auth/verificar-codigo
   * Valida o código de 6 dígitos e ativa a conta do usuário
   */
  async verificarCodigo(data: VerificarCodigoRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/api/auth/verificar-codigo', data);
    
    // Salva token e usuário no localStorage
    const authToken: AuthToken = {
      token: response.token,
      tipo: response.tipo,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
    };
    
    tokenManager.save(authToken);
    userManager.save(response.usuario);
    
    // Invalida cache de perfil ao verificar código
    apiCache.invalidate('auth:perfil');
    
    return response;
  },

  /**
   * SOLICITAR RESET DE SENHA - POST /api/auth/solicitar-reset-senha
   * Envia código de 6 dígitos para redefinir senha esquecida
   */
  async solicitarResetSenha(data: EnviarCodigoVerificacaoRequest): Promise<{ sucesso: boolean; mensagem: string }> {
    return httpClient.post<{ sucesso: boolean; mensagem: string }>('/api/auth/solicitar-reset-senha', data);
  },

  /**
   * REDEFINIR SENHA COM CÓDIGO - POST /api/auth/redefinir-senha
   * Atualiza a senha do usuário usando código de verificação
   */
  async redefinirSenhaComCodigo(data: RedefinirSenhaComCodigoRequest): Promise<{ sucesso: boolean; mensagem: string }> {
    return httpClient.post<{ sucesso: boolean; mensagem: string }>('/api/auth/redefinir-senha', data);
  },
};

export default authApi;
