/**
 * Type guard para verificar se um erro é do tipo Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Extrai mensagem de erro de um valor unknown
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Erro desconhecido';
}

/**
 * Type guard para erros com propriedades customizadas (como erros de API)
 */
export interface ApiError {
  message?: string;
  status?: number;
  statusText?: string;
  url?: string;
  data?: unknown;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    error !== null &&
    typeof error === 'object' &&
    ('message' in error || 'status' in error || 'data' in error)
  );
}
