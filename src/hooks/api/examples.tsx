import React from 'react';
import Image from 'next/image';
import { 
  useBolsas, 
  useProduto, 
  usePesquisarProdutos,
  useProdutosFiltrados 
} from './useProdutos';
import { ProdutoDTO } from './types';

// Exemplo de uso dos hooks

// 1. Componente para listar bolsas
const ListaBolsas: React.FC = () => {
  const { bolsas, isLoading, error, total } = useBolsas(0, 12);

  if (isLoading) return <div>Carregando bolsas...</div>;
  if (error) return <div>Erro ao carregar bolsas</div>;

  return (
    <div>
      <h2>Bolsas ({total})</h2>
      <div className="grid grid-cols-3 gap-4">
        {bolsas.map((bolsa: ProdutoDTO) => (
          <div key={bolsa.id} className="border p-4">
            <Image 
              src={bolsa.imagem || ""} 
              alt={bolsa.titulo || ""} 
              width={200} 
              height={200} 
              className="object-cover"
            />
            <h3>{bolsa.titulo}</h3>
            <p>{bolsa.autor}</p>
            <p>R$ {bolsa.preco}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Componente para detalhes de um produto
const DetalhesProduto: React.FC<{ id: number }> = ({ id }) => {
  const { produto, isLoading, error, encontrado } = useProduto(id);

  if (isLoading) return <div>Carregando produto...</div>;
  if (error || !encontrado) return <div>Produto não encontrado</div>;

  return (
    <div>
      <h1>{produto?.titulo}</h1>
      <p>{produto?.subtitulo}</p>
      <p>Por: {produto?.autor}</p>
      <p>{produto?.descricao}</p>
      <p>R$ {produto?.preco}</p>
      <Image 
        src={produto?.imagem || ""} 
        alt={produto?.titulo || ""} 
        width={400} 
        height={400} 
        className="object-cover"
      />
      
      {produto?.imagens && (
        <div>
          {produto.imagens.map((img: string, index: number) => (
            <Image 
              key={index} 
              src={img} 
              alt={`${produto.titulo} ${index + 1}`} 
              width={200} 
              height={200} 
              className="object-cover"
            />
          ))}
        </div>
      )}
      
      {produto?.destaques && (
        <ul>
          {produto.destaques.map((destaque: string, index: number) => (
            <li key={index}>{destaque}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

// 3. Componente para pesquisa
const PesquisaProdutos: React.FC = () => {
  const [termoBusca, setTermoBusca] = React.useState('');
  const [categoria, setCategoria] = React.useState<string>('');
  
  const { produtos, isLoading, total } = usePesquisarProdutos(termoBusca, categoria);

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Pesquisar produtos..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
        />
        
        <select 
          value={categoria} 
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          <option value="bolsas">Bolsas</option>
          <option value="roupas">Roupas</option>
          <option value="sapatos">Sapatos</option>
        </select>
      </div>

      {isLoading && <div>Pesquisando...</div>}
      
      <div>
        <p>Encontrados: {total} produtos</p>
        <div className="grid grid-cols-4 gap-4">
          {produtos.map((produto: ProdutoDTO) => (
            <div key={produto.id} className="border p-4">
              <Image 
                src={produto.imagem || ""} 
                alt={produto.titulo || ""} 
                width={200} 
                height={200} 
                className="object-cover"
              />
              <h3>{produto.titulo}</h3>
              <p>{produto.autor}</p>
              <p>R$ {produto.preco}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4. Componente com filtros avançados
const ProdutosFiltrados: React.FC = () => {
  const [filtros, setFiltros] = React.useState<{
    categoria: 'bolsas' | 'roupas' | 'sapatos';
    autor: string;
    ordenarPor: string;
    direcao: 'asc' | 'desc';
    pagina: number;
    tamanho: number;
  }>({
    categoria: 'bolsas',
    autor: '',
    ordenarPor: 'preco',
    direcao: 'asc',
    pagina: 0,
    tamanho: 12,
  });

  const { produtos, isLoading, total, totalPaginas } = useProdutosFiltrados(filtros);

  return (
    <div>
      <div>
        {/* Controles de filtro */}
        <select 
          value={filtros.categoria}
          onChange={(e) => setFiltros({...filtros, categoria: e.target.value as 'bolsas' | 'roupas' | 'sapatos'})}
        >
          <option value="bolsas">Bolsas</option>
          <option value="roupas">Roupas</option>
          <option value="sapatos">Sapatos</option>
        </select>

        <input
          type="text"
          placeholder="Autor..."
          value={filtros.autor}
          onChange={(e) => setFiltros({...filtros, autor: e.target.value})}
        />

        <select
          value={filtros.ordenarPor}
          onChange={(e) => setFiltros({...filtros, ordenarPor: e.target.value})}
        >
          <option value="titulo">Título</option>
          <option value="preco">Preço</option>
          <option value="autor">Autor</option>
        </select>

        <select
          value={filtros.direcao}
          onChange={(e) => setFiltros({...filtros, direcao: e.target.value as 'asc' | 'desc'})}
        >
          <option value="asc">Crescente</option>
          <option value="desc">Decrescente</option>
        </select>
      </div>

      {isLoading && <div>Carregando...</div>}
      
      <div>
        <p>Total: {total} produtos - Página {filtros.pagina + 1} de {totalPaginas}</p>
        
        <div className="grid grid-cols-4 gap-4">
          {produtos.map((produto: ProdutoDTO) => (
            <div key={produto.id} className="border p-4">
              <Image 
                src={produto.imagem || ""} 
                alt={produto.titulo || ""} 
                width={200} 
                height={200} 
                className="object-cover"
              />
              <h3>{produto.titulo}</h3>
              <p>{produto.autor}</p>
              <p>R$ {produto.preco}</p>
            </div>
          ))}
        </div>

        {/* Paginação */}
        <div>
          <button 
            disabled={filtros.pagina === 0}
            onClick={() => setFiltros({...filtros, pagina: filtros.pagina - 1})}
          >
            Anterior
          </button>
          
          <span>Página {filtros.pagina + 1}</span>
          
          <button 
            disabled={filtros.pagina >= totalPaginas - 1}
            onClick={() => setFiltros({...filtros, pagina: filtros.pagina + 1})}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

export { ListaBolsas, DetalhesProduto, PesquisaProdutos, ProdutosFiltrados };