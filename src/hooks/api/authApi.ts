/**
 * API de Autenticação - Conecta ao backend Spring Boot
 * Endpoints: /api/auth/*
 */

import httpClient, { tokenManager, userManager, type AuthToken, type Usuario, type FetchError } from '@/lib/httpClient';
import { getErrorMessage } from "@/lib/errorUtils";

// ========================================================================
// TIPOS - DTOs do Backend
// ========================================================================

/**
 * Request de Login
 */
export interface LoginRequest {
  email: string;
  senha: string;
}

/**
 * Request de Registro
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
 * Request de Sincronização OAuth
 * Usado para criar/vincular conta de usuário logado com Google
 */
export interface OAuthSyncRequest {
  provider: 'google' | 'facebook' | 'github';
  email: string;
  nome: string;
  sobrenome?: string;
  fotoUrl?: string; // URL da foto (nome do campo no backend)
  oauthId?: string; // ID do provider (Google ID, Facebook ID, etc.)
}

/**
 * Response de Autenticação (Login/Registro)
 */
export interface AuthResponse {
  token: string;
  tipo: string; // "Bearer"
  usuario: Usuario;
}

/**
 * Request de Alteração de Senha
 */
export interface AlterarSenhaRequest {
  senhaAtual: string;
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
  logradouro?: string;
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
  fotoUrl?: string; // URL da foto (nome do campo no backend)
  fotoPerfil?: string; // Alias para compatibilidade (mesmo valor que fotoUrl)
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
    
    return response;
  },

  /**
   * PERFIL - GET /api/auth/perfil
   * Retorna os dados completos do usuário autenticado
   */
  async getPerfil(): Promise<UsuarioDTO> {
    return httpClient.get<UsuarioDTO>('/api/auth/perfil', { requiresAuth: true });
  },

  /**
   * ATUALIZAR PERFIL - PUT /api/auth/perfil
   * Atualiza os dados do usuário autenticado
   */
  async atualizarPerfil(data: Partial<UsuarioDTO>): Promise<UsuarioDTO> {
    console.log('[authApi] 📤 Atualizando perfil com dados:', JSON.stringify(data, null, 2));
    
    try {
      const updated = await httpClient.put<UsuarioDTO>('/api/auth/perfil', data, { requiresAuth: true });
      
      console.log('[authApi] ✅ Perfil atualizado! Resposta:', JSON.stringify(updated, null, 2));
      
      return updated;
    } catch (error: unknown) {
      const fetchError = error as FetchError;
      console.error('[authApi] ❌ ERRO DETALHADO ao atualizar perfil:', {
        mensagem: getErrorMessage(error),
        status: fetchError.status,
        statusText: fetchError.statusText,
        url: fetchError.url,
        dadosRetornados: fetchError.data,
      });
      
      // Log extra para ver o que tem dentro de "dados"
      if (fetchError.data && typeof fetchError.data === 'object' && 'dados' in fetchError.data) {
        console.error('[authApi] 🔍 Detalhes dentro de "dados":', (fetchError.data as { dados: unknown }).dados);
      }
      
      // Log da mensagem do backend
      if (fetchError.data && typeof fetchError.data === 'object' && 'mensagem' in fetchError.data) {
        console.error('[authApi] 💬 Mensagem do backend:', (fetchError.data as { mensagem: unknown }).mensagem);
      }
      
      throw error;
    }
  },

  /**
   * ALTERAR SENHA - PUT /api/auth/alterar-senha
   * Altera a senha do usuário autenticado
   */
  async alterarSenha(data: AlterarSenhaRequest): Promise<{ message: string }> {
    return httpClient.put<{ message: string }>('/api/auth/alterar-senha', data, { requiresAuth: true });
  },

  /**
   * LOGOUT - Limpa os dados de autenticação do localStorage
   */
  logout(): void {
    tokenManager.clear();
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
};

export default authApi;
