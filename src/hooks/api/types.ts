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
  dimensao?: string;
  imagem?: string;
  imagemHover?: string;
  imagens?: string[];
  composicao?: string;
  destaques?: string[];
  categoria: 'bolsas' | 'roupas' | 'sapatos';
  modelo?: string;
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