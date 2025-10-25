/**
 * Função auxiliar para garantir que temos um array de strings limpo
 * Faz parse de JSON strings se necessário, incluindo JSON duplamente encodado
 * Remove caracteres extras como colchetes e aspas que possam ter sobrado
 */
export const parseArrayField = (field: string | string[] | undefined): string[] => {
  if (!field) return [];
  if (Array.isArray(field)) {
    // Se já for array, limpar cada item de possíveis caracteres JSON extras
    return field.map(item => {
      if (typeof item !== 'string') return String(item);
      
      // Remove colchetes iniciais e finais
      let cleaned = item.trim();
      if (cleaned.startsWith('[')) cleaned = cleaned.substring(1);
      if (cleaned.endsWith(']')) cleaned = cleaned.substring(0, cleaned.length - 1);
      
      // Remove aspas duplas extras no início e fim
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
      }
      
      return cleaned.trim();
    }).filter(item => item.length > 0);
  }
  
  // Se for string, tentar fazer parse de JSON
  try {
    let parsed = JSON.parse(field);
    
    // Se o resultado for uma string (JSON duplamente encodado), fazer parse novamente
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        // Se falhar no segundo parse, retornar o primeiro resultado como array
        return [parsed];
      }
    }
    
    if (Array.isArray(parsed)) {
      // Limpar cada item do array parseado
      return parsed.map(item => String(item).trim()).filter(item => item.length > 0);
    }
    
    return [String(parsed)];
  } catch {
    // Se não for JSON válido, retornar como array de um elemento
    return [field.trim()];
  }
};
