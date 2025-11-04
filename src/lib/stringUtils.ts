/**
 * Normaliza uma string removendo acentos e convertendo para minúsculas
 * @param str - String para normalizar
 * @returns String normalizada sem acentos em minúsculas
 * @example
 * normalizeString("Tênis") // "tenis"
 * normalizeString("Maiô") // "maio"
 * normalizeString("KÉRASTASE") // "kerastase"
 */
export function normalizeString(str: string): string {
  return str
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos (acentos)
    .toLowerCase()
    .trim();
}

/**
 * Verifica se uma string contém outra, ignorando acentos e case
 * @param text - Texto onde buscar
 * @param search - Texto a ser buscado
 * @returns true se encontrou, false caso contrário
 * @example
 * searchIgnoreAccents("Tênis Nike", "tenis") // true
 * searchIgnoreAccents("Maiô Feminino", "maio") // true
 */
export function searchIgnoreAccents(text: string, search: string): boolean {
  const normalizedText = normalizeString(text);
  const normalizedSearch = normalizeString(search);
  return normalizedText.includes(normalizedSearch);
}
