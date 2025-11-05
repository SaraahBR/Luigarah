/**
 * Utilitários para normalização de identidades
 * Garante que variações de identidades sejam tratadas como equivalentes
 */

/**
 * Mapa de identidades equivalentes
 * Cada grupo representa identidades que devem ser tratadas como iguais
 */
const IDENTITY_GROUPS = {
  feminino: ['mulher', 'feminino', 'female', 'woman'],
  masculino: ['homem', 'masculino', 'male', 'man'],
  infantil: ['kids', 'infantil', 'criança', 'children'],
  unissex: ['unissex', 'unisex'],
} as const;

/**
 * Normaliza uma identidade para sua forma canônica
 * @param identidade - A identidade a ser normalizada
 * @returns A forma normalizada da identidade
 * 
 * @example
 * normalizeIdentity('mulher') // 'feminino'
 * normalizeIdentity('homem') // 'masculino'
 * normalizeIdentity('kids') // 'infantil'
 */
export function normalizeIdentity(identidade: string | null | undefined): string | null {
  if (!identidade) return null;
  
  const lower = identidade.toLowerCase().trim();
  
  // Procura em qual grupo a identidade pertence
  for (const [canonical, variants] of Object.entries(IDENTITY_GROUPS)) {
    if (variants.some(v => v.toLowerCase() === lower)) {
      return canonical;
    }
  }
  
  // Se não encontrou em nenhum grupo, retorna a original normalizada
  return lower;
}

/**
 * Verifica se duas identidades são equivalentes
 * @param identity1 - Primeira identidade
 * @param identity2 - Segunda identidade
 * @returns true se as identidades são equivalentes
 * 
 * @example
 * areIdentitiesEqual('mulher', 'feminino') // true
 * areIdentitiesEqual('homem', 'masculino') // true
 * areIdentitiesEqual('kids', 'infantil') // true
 */
export function areIdentitiesEqual(
  identity1: string | null | undefined,
  identity2: string | null | undefined
): boolean {
  if (!identity1 && !identity2) return true;
  if (!identity1 || !identity2) return false;
  
  return normalizeIdentity(identity1) === normalizeIdentity(identity2);
}

/**
 * Retorna todas as variações de uma identidade
 * @param identidade - A identidade base
 * @returns Array com todas as variações possíveis
 * 
 * @example
 * getIdentityVariants('mulher') // ['mulher', 'feminino', 'female', 'woman']
 * getIdentityVariants('homem') // ['homem', 'masculino', 'male', 'man']
 */
export function getIdentityVariants(identidade: string | null | undefined): string[] {
  if (!identidade) return [];
  
  const normalized = normalizeIdentity(identidade);
  if (!normalized) return [identidade];
  
  // Retorna todas as variantes do grupo
  for (const [canonical, variants] of Object.entries(IDENTITY_GROUPS)) {
    if (canonical === normalized) {
      return [...variants];
    }
  }
  
  return [identidade];
}

/**
 * Normaliza um código de identidade para query string
 * Mantém compatibilidade com URLs existentes
 * 
 * @example
 * normalizeIdentityForQuery('mulher') // 'feminino'
 * normalizeIdentityForQuery('feminino') // 'feminino'
 */
export function normalizeIdentityForQuery(identidade: string | null | undefined): string | null {
  return normalizeIdentity(identidade);
}

/**
 * Normaliza um array de identidades
 * Remove duplicatas considerando equivalências
 */
export function normalizeIdentities(identidades: string[]): string[] {
  const normalized = new Set<string>();
  
  identidades.forEach(id => {
    const norm = normalizeIdentity(id);
    if (norm) normalized.add(norm);
  });
  
  return Array.from(normalized);
}
