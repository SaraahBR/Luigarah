// Tipos baseados na sua API backend
export interface IdentidadeDTO {
  id: number;
  codigo: string;
  nome: string;
  ordem?: number;
  ativo?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ProdutoDTO {
  id?: number;
  titulo: string;
  subtitulo?: string;
  autor?: string;
  descricao?: string;
  preco: number;
  dimensao?: string; // Dimensões físicas (ex: "10cm x 20cm x 5cm")
  padrao?: 'usa' | 'br' | 'sapatos' | null; // Padrão de tamanhos do produto (aceita null)
  imagem?: string;
  imagemHover?: string;
  // Backend aceita: ["url1","url2"] OU "url1, url2" (StringListFlexDeserializer)
  imagens?: string[];
  composicao?: string;
  // Backend aceita: ["bordô","sem alças"] OU "bordô, sem alças" (StringListFlexDeserializer)
  destaques?: string[];
  categoria: 'bolsas' | 'roupas' | 'sapatos';
  // Backend aceita: {key:value} OU "key:value; key2:value2" (ObjectFlexDeserializer)
  modelo?: Record<string, unknown>;
  identidade?: IdentidadeDTO;
}

export interface TamanhoDTO {
  etiqueta: string;
  categoria: string;
  qtdEstoque: number;
}

export interface ProdutoTamanhoDTO {
  etiqueta: string;
  qtdEstoque: number;
}

export interface PadraoItemDTO {
  id: number;
  padrao: 'usa' | 'br' | 'sapatos' | null;
}

export interface PadraoAtualizacaoDTO {
  padrao: 'usa' | 'br' | 'sapatos' | null;
  produtoIds?: number[];
  tamanhoIds?: number[];
}

export interface RespostaProdutoDTO<T> {
  dados: T;
  sucesso: boolean;
  mensagem?: string;
  total?: number;
  paginaAtual?: number;
  totalPaginas?: number;
  tamanhoPagina?: number;
}

export interface ParametrosPaginacao {
  pagina?: number;
  tamanho?: number;
  ordenarPor?: string;
  direcao?: 'asc' | 'desc';
}

export interface FiltrosProdutos extends ParametrosPaginacao {
  categoria?: 'bolsas' | 'roupas' | 'sapatos';
  busca?: string;
  autor?: string;
  subtitulo?: string;
  tamanhoEtiqueta?: string;
  identidadeCodigo?: string;
}