/**
 * Sistema de cache para requisições API
 * Evita chamadas duplicadas e melhora performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, Promise<unknown>>();
  private readonly DEFAULT_TTL = 30000; // 30 segundos

  /**
   * Executa uma requisição com cache e deduplicação
   * Se já houver uma requisição em andamento para a mesma key, retorna a mesma promise
   */
  async fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const now = Date.now();

    // 1. Verifica se há dados em cache válidos
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.data;
    }

    // 2. Verifica se já há uma requisição em andamento (deduplicação)
    const pending = this.pendingRequests.get(key) as Promise<T> | undefined;
    if (pending) {
      return pending;
    }

    // 3. Faz nova requisição
    const promise = fetcher()
      .then((data) => {
        // Salva no cache
        this.cache.set(key, { data, timestamp: now });
        // Remove da lista de pendentes
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        // Remove da lista de pendentes em caso de erro
        this.pendingRequests.delete(key);
        throw error;
      });

    // Adiciona à lista de pendentes
    this.pendingRequests.set(key, promise);

    return promise;
  }

  /**
   * Invalida cache de uma chave específica
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  /**
   * Invalida cache de múltiplas chaves que correspondem a um padrão
   */
  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    });
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Remove entradas expiradas do cache
   */
  cleanup(ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if ((now - entry.timestamp) > ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Singleton
export const apiCache = new APICache();

// Cleanup automático a cada 1 minuto
if (typeof window !== 'undefined') {
  setInterval(() => apiCache.cleanup(), 60000);
}

export default apiCache;
