/**
 * Utilitários para manipulação de datas
 * Converte entre formato brasileiro (DD/MM/YYYY) e ISO 8601 (YYYY-MM-DD)
 */

/**
 * Converte data do formato brasileiro (DD/MM/YYYY) para ISO 8601 (YYYY-MM-DD)
 * 
 * @param dataBR - Data no formato DD/MM/YYYY (ex: "13/04/2002")
 * @returns Data no formato YYYY-MM-DD (ex: "2002-04-13") ou string vazia se inválido
 * 
 * @example
 * formatarDataParaISO("13/04/2002") // "2002-04-13"
 * formatarDataParaISO("2002-04-13") // "2002-04-13" (já está no formato ISO)
 * formatarDataParaISO("invalid")    // ""
 */
export function formatarDataParaISO(dataBR: string): string {
  if (!dataBR) return '';
  
  // Se já estiver no formato ISO (YYYY-MM-DD), retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataBR)) {
    return dataBR;
  }
  
  // Tenta converter do formato brasileiro (DD/MM/YYYY)
  const match = dataBR.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return '';
  
  const [, dia, mes, ano] = match;
  
  // Valida se é uma data válida
  const diaNum = parseInt(dia, 10);
  const mesNum = parseInt(mes, 10);
  const anoNum = parseInt(ano, 10);
  
  if (mesNum < 1 || mesNum > 12) return '';
  if (diaNum < 1 || diaNum > 31) return '';
  if (anoNum < 1900 || anoNum > 2100) return '';
  
  // Formata com zero à esquerda se necessário
  const diaFormatado = dia.padStart(2, '0');
  const mesFormatado = mes.padStart(2, '0');
  
  return `${ano}-${mesFormatado}-${diaFormatado}`;
}

/**
 * Converte data do formato ISO 8601 (YYYY-MM-DD) para brasileiro (DD/MM/YYYY)
 * 
 * @param dataISO - Data no formato YYYY-MM-DD (ex: "2002-04-13")
 * @returns Data no formato DD/MM/YYYY (ex: "13/04/2002") ou string vazia se inválido
 * 
 * @example
 * formatarDataParaBR("2002-04-13") // "13/04/2002"
 * formatarDataParaBR("13/04/2002") // "13/04/2002" (já está no formato BR)
 * formatarDataParaBR("invalid")    // ""
 */
export function formatarDataParaBR(dataISO: string): string {
  if (!dataISO) return '';
  
  // Se já estiver no formato brasileiro (DD/MM/YYYY), retorna como está
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dataISO)) {
    return dataISO;
  }
  
  // Tenta converter do formato ISO (YYYY-MM-DD)
  const match = dataISO.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  
  const [, ano, mes, dia] = match;
  
  // Remove zeros à esquerda
  const diaFormatado = parseInt(dia, 10).toString();
  const mesFormatado = parseInt(mes, 10).toString();
  
  return `${diaFormatado}/${mesFormatado}/${ano}`;
}

/**
 * Formata input de data enquanto o usuário digita
 * Aceita: DD/MM/YYYY ou YYYY-MM-DD
 * 
 * @param valor - Valor atual do input
 * @returns Valor formatado
 * 
 * @example
 * formatarInputData("13042002")   // "13/04/2002"
 * formatarInputData("13/04/2002") // "13/04/2002"
 */
export function formatarInputData(valor: string): string {
  // Remove tudo que não é número
  const apenasNumeros = valor.replace(/\D/g, '');
  
  // Se vazio, retorna vazio
  if (!apenasNumeros) return '';
  
  // Limita a 8 dígitos (DDMMYYYY)
  const numeros = apenasNumeros.substring(0, 8);
  
  // Formata progressivamente conforme o usuário digita
  if (numeros.length <= 2) {
    // DD
    return numeros;
  } else if (numeros.length <= 4) {
    // DD/MM
    return `${numeros.substring(0, 2)}/${numeros.substring(2)}`;
  } else {
    // DD/MM/YYYY
    return `${numeros.substring(0, 2)}/${numeros.substring(2, 4)}/${numeros.substring(4)}`;
  }
}

/**
 * Valida se uma data está no formato correto e é válida
 * 
 * @param data - Data para validar (DD/MM/YYYY ou YYYY-MM-DD)
 * @returns true se válida, false caso contrário
 * 
 * @example
 * validarData("13/04/2002") // true
 * validarData("2002-04-13") // true
 * validarData("31/02/2002") // false (fevereiro não tem 31 dias)
 * validarData("invalid")    // false
 */
export function validarData(data: string): boolean {
  if (!data) return false;
  
  let ano: number, mes: number, dia: number;
  
  // Formato ISO (YYYY-MM-DD)
  const matchISO = data.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchISO) {
    [, ano, mes, dia] = matchISO.map(Number);
  } else {
    // Formato brasileiro (DD/MM/YYYY)
    const matchBR = data.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!matchBR) return false;
    
    const [, diaStr, mesStr, anoStr] = matchBR;
    dia = parseInt(diaStr, 10);
    mes = parseInt(mesStr, 10);
    ano = parseInt(anoStr, 10);
  }
  
  // Valida intervalos básicos
  if (mes < 1 || mes > 12) return false;
  if (dia < 1 || dia > 31) return false;
  if (ano < 1900 || ano > 2100) return false;
  
  // Cria objeto Date para validação completa
  const dataObj = new Date(ano, mes - 1, dia);
  
  // Verifica se a data criada corresponde aos valores fornecidos
  // (isso pega casos como 31/02/2002)
  return (
    dataObj.getFullYear() === ano &&
    dataObj.getMonth() === mes - 1 &&
    dataObj.getDate() === dia
  );
}

/**
 * Calcula a idade a partir de uma data de nascimento
 * 
 * @param dataNascimento - Data de nascimento (DD/MM/YYYY ou YYYY-MM-DD)
 * @returns Idade em anos ou null se inválido
 * 
 * @example
 * calcularIdade("13/04/2002") // 23 (em 2025)
 * calcularIdade("2002-04-13") // 23 (em 2025)
 */
export function calcularIdade(dataNascimento: string): number | null {
  if (!validarData(dataNascimento)) return null;
  
  // Converte para ISO se necessário
  const dataISO = formatarDataParaISO(dataNascimento);
  if (!dataISO) return null;
  
  const [ano, mes, dia] = dataISO.split('-').map(Number);
  const nascimento = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();
  
  // Ajusta se ainda não fez aniversário este ano
  if (
    mesAtual < nascimento.getMonth() ||
    (mesAtual === nascimento.getMonth() && diaAtual < nascimento.getDate())
  ) {
    idade--;
  }
  
  return idade;
}
