/**
 * Cliente HTTP com interceptor de autenticação JWT
 * Adiciona automaticamente o token Bearer em todas as requisições autenticadas
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://luigarah-backend.onrender.com';

// Chaves de armazenamento
const TOKEN_KEY = 'luigara:auth:token';
const USER_KEY = 'luigara:auth:user';

// Tipos
export interface AuthToken {
  token: string;
  tipo: string; // "Bearer"
  expiresAt?: number; // timestamp
}

export interface Usuario {
  id: number;
  nome: string;
  sobrenome?: string;
  email: string;
  role: 'USER' | 'ADMIN';
  telefone?: string;
  dataNascimento?: string;
  genero?: string;
  fotoUrl?: string; // URL da foto de perfil (campo do backend)
  fotoPerfil?: string; // Alias para compatibilidade (mesmo valor que fotoUrl)
  provider?: 'LOCAL' | 'GOOGLE' | 'FACEBOOK' | 'GITHUB'; // Provedor de autenticação
}

// Interface para erros de fetch
export interface FetchError extends Error {
  status?: number;
  statusText?: string;
  data?: unknown;
  url?: string;
}

// ========================================================================
// Gerenciamento de Token
// ========================================================================

export const tokenManager = {
  /**
   * Salva o token JWT no localStorage
   */
  save(authToken: AuthToken): void {
    if (globalThis.window === undefined) return;
    localStorage.setItem(TOKEN_KEY, JSON.stringify(authToken));
  },

  /**
   * Recupera o token JWT do localStorage
   */
  get(): AuthToken | null {
    if (globalThis.window === undefined) return null;
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      if (!raw) return null;
      
      const authToken = JSON.parse(raw) as AuthToken;
      
      // Verifica se o token expirou
      if (authToken.expiresAt && Date.now() > authToken.expiresAt) {
        this.clear();
        return null;
      }
      
      return authToken;
    } catch {
      return null;
    }
  },

  /**
   * Remove o token do localStorage
   */
  clear(): void {
    if (globalThis.window === undefined) return;
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Verifica se existe um token válido
   */
  isValid(): boolean {
    return this.get() !== null;
  },
};

// ========================================================================
// Gerenciamento de Usuário
// ========================================================================

export const userManager = {
  /**
   * Salva os dados do usuário no localStorage
   */
  save(user: Usuario): void {
    if (globalThis.window === undefined) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Recupera os dados do usuário do localStorage
   */
  get(): Usuario | null {
    if (globalThis.window === undefined) return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  },

  /**
   * Remove os dados do usuário do localStorage
   */
  clear(): void {
    if (globalThis.window === undefined) return;
    localStorage.removeItem(USER_KEY);
  },
};

// ========================================================================
// Cliente HTTP
// ========================================================================

export interface HttpClientOptions extends RequestInit {
  requiresAuth?: boolean; // Se true, adiciona o token JWT
  params?: Record<string, string | number | boolean | undefined>; // Query params
}

export class HttpClient {
  private readonly baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Constrói a URL completa com query params
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      }
    }
    
    return url.toString();
  }

  /**
   * Adiciona headers padrão à requisição
   */
  private buildHeaders(options?: HttpClientOptions): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge com headers customizados
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    // Adiciona token JWT se requiresAuth for true
    if (options?.requiresAuth) {
      const authToken = tokenManager.get();
      if (authToken) {
        headers['Authorization'] = `${authToken.tipo} ${authToken.token}`;
      }
    }

    return headers;
  }

  /**
   * Realiza uma requisição HTTP genérica
   */
  private async request<T>(
    endpoint: string,
    options?: HttpClientOptions
  ): Promise<T> {
    const url = this.buildURL(endpoint, options?.params);
    const headers = this.buildHeaders(options);

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Se não autenticado (401), limpa o token e redireciona
      if (response.status === 401 && options?.requiresAuth) {
        tokenManager.clear();
        userManager.clear();
        
        // Dispara evento para abrir modal de login
        if (globalThis.window !== undefined) {
          globalThis.dispatchEvent(
            new CustomEvent('luigara:auth:open', { 
              detail: { reason: 'session-expired', message: 'Sua sessão expirou. Faça login novamente.' } 
            })
          );
        }
        
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Se erro do servidor
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        // Log removido - erros são propagados via throw e tratados nos slices
        
        const errorMessage = errorData?.message || errorData?.error || `Erro HTTP ${response.status}`;
        
        // Criar erro com mais contexto
        const error = new Error(errorMessage) as FetchError;
        error.status = response.status;
        error.statusText = response.statusText;
        error.data = errorData;
        error.url = url;
        
        throw error;
      }

      // Se resposta vazia (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      // Tenta parsear JSON
      const data = await response.json();
      return data as T;
    } catch (error) {
      // Se for um erro de rede ou timeout
      if (error instanceof TypeError) {
        throw new Error('Erro de conexão. Verifique sua internet.');
      }
      
      // Propaga outros erros
      throw error;
    }
  }

  /**
   * GET - Requisição de leitura
   */
  async get<T>(endpoint: string, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST - Criação de recurso
   */
  async post<T>(endpoint: string, body?: unknown, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT - Atualização completa de recurso
   */
  async put<T>(endpoint: string, body?: unknown, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH - Atualização parcial de recurso
   */
  async patch<T>(endpoint: string, body?: unknown, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE - Remoção de recurso
   */
  async delete<T>(endpoint: string, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// ========================================================================
// Exporta instância singleton
// ========================================================================

export const httpClient = new HttpClient();
export default httpClient;
