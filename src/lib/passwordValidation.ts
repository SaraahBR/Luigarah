/**
 * Utilitário de Validação de Senha
 * Sincronizado com backend - Regras atualizadas em 03/12/2025
 * 
 * Requisitos:
 * ✅ Mínimo 6 caracteres, Máximo 40 caracteres
 * ✅ 1 letra maiúscula (A-Z)
 * ✅ 1 letra minúscula (a-z)
 * ✅ 1 número (0-9)
 * ✅ 1 caractere especial (!@#$%^&*(),.?":{}|<>)
 */

export interface ValidacaoSenhaResultado {
  valido: boolean;
  erros: string[];
}

/**
 * Regex completa para validação de senha
 * Sincronizada com backend (Java @Pattern)
 */
export const SENHA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,40}$/;

/**
 * Valida senha de acordo com as regras do backend
 * Retorna objeto com status de validação e lista de erros detalhados
 * 
 * @param senha - Senha a ser validada
 * @returns Objeto com `valido` (boolean) e `erros` (string[])
 * 
 * @example
 * ```typescript
 * const resultado = validarSenha('Senha@123');
 * if (!resultado.valido) {
 *   console.log('Erros:', resultado.erros);
 * }
 * ```
 */
export function validarSenha(senha: string): ValidacaoSenhaResultado {
  const erros: string[] = [];
  
  if (senha.length < 6) {
    erros.push('A senha deve ter no mínimo 6 caracteres');
  }
  
  if (senha.length > 40) {
    erros.push('A senha deve ter no máximo 40 caracteres');
  }
  
  if (!/[a-z]/.test(senha)) {
    erros.push('A senha deve conter pelo menos 1 letra minúscula');
  }
  
  if (!/[A-Z]/.test(senha)) {
    erros.push('A senha deve conter pelo menos 1 letra maiúscula');
  }
  
  if (!/\d/.test(senha)) {
    erros.push('A senha deve conter pelo menos 1 número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
    erros.push('A senha deve conter pelo menos 1 caractere especial (!@#$%^&*(),.?":{}|<>)');
  }
  
  return {
    valido: erros.length === 0,
    erros
  };
}

/**
 * Valida senha de forma rápida usando apenas regex
 * Útil para validações simples sem precisar de erros detalhados
 * 
 * @param senha - Senha a ser validada
 * @returns true se a senha é válida, false caso contrário
 * 
 * @example
 * ```typescript
 * if (!validarSenhaRapido('Senha@123')) {
 *   toast.error('Senha inválida');
 * }
 * ```
 */
export function validarSenhaRapido(senha: string): boolean {
  return SENHA_REGEX.test(senha);
}

/**
 * Retorna mensagem de erro amigável para o usuário
 * Útil para exibir em formulários
 * 
 * @example
 * ```typescript
 * const mensagem = getMensagemErroSenha();
 * // "A senha deve ter entre 6 e 40 caracteres, incluindo maiúscula, minúscula, número e caractere especial (!@#$%^&*(),.?\":{}|<>)"
 * ```
 */
export function getMensagemErroSenha(): string {
  return 'A senha deve ter entre 6 e 40 caracteres, incluindo maiúscula, minúscula, número e caractere especial (@$!%*?&#)';
}

/**
 * Retorna mensagem curta para placeholders
 * 
 * @example
 * ```typescript
 * <input placeholder={getPlaceholderSenha()} />
 * // "6 a 40 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial"
 * ```
 */
export function getPlaceholderSenha(): string {
  return '6 a 40 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial (@$!%*?&#)';
}

/**
 * Exemplos de senhas válidas (para testes e documentação)
 */
export const SENHAS_VALIDAS_EXEMPLOS = [
  'Senha@123',
  'Admin$789',
  'Teste#456',
  'Minhasenha!1',
  'MinhaSenh@SuperSegura2025'
] as const;

/**
 * Exemplos de senhas inválidas com motivos (para testes e documentação)
 */
export const SENHAS_INVALIDAS_EXEMPLOS = [
  { senha: 'senha', motivo: 'Falta maiúscula, número e caractere especial' },
  { senha: 'SENHA123', motivo: 'Falta minúscula e caractere especial' },
  { senha: 'Senha123', motivo: 'Falta caractere especial' },
  { senha: 'Se@1', motivo: 'Menos de 6 caracteres' },
  { senha: 'SenhaExtremamenteLongaDemaisQueUltrapassaOLimiteMaximo@123456', motivo: 'Mais de 40 caracteres' }
] as const;
