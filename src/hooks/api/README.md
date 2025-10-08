# API de Produtos - Hooks e RTK Query

Esta pasta contém a integração com o backend Spring Boot para gerenciar produtos da Luigara.

## 📁 Estrutura

```
src/hooks/api/
├── produtosApi.ts      # API RTK Query principal
├── useProdutos.ts      # Hooks customizados
├── types.ts            # Tipos TypeScript
├── config.ts           # Configurações da API
├── examples.tsx        # Exemplos de uso
└── index.ts            # Exportações principais
```

## 🚀 Como usar

### 1. Importar hooks

```typescript
import { 
  useBolsas, 
  useRoupas, 
  useSapatos, 
  useProduto,
  usePesquisarProdutos 
} from '@/hooks/api';
```

### 2. Usar nos componentes

```typescript
// Listar bolsas
const { bolsas, isLoading, error } = useBolsas(0, 12);

// Buscar produto específico
const { produto, isLoading } = useProduto(1);

// Pesquisar produtos
const { produtos, total } = usePesquisarProdutos('Gucci', 'bolsas');
```

## 🔧 Configuração

A API se conecta ao backend Spring Boot em `http://localhost:8080` por padrão.
Para alterar, modifique a variável `NEXT_PUBLIC_API_URL` no arquivo `.env.local`.

## 📋 Endpoints Disponíveis

- `GET /produtos` - Listar produtos com filtros
- `GET /produtos/{id}` - Buscar produto por ID
- `GET /produtos/bolsas` - Listar apenas bolsas
- `GET /produtos/roupas` - Listar apenas roupas
- `GET /produtos/sapatos` - Listar apenas sapatos
- `GET /produtos/categoria/{categoria}` - Produtos por categoria
- `GET /produtos/autor/{autor}` - Produtos por autor
- `POST /produtos` - Criar produto
- `PUT /produtos/{id}` - Atualizar produto
- `DELETE /produtos/{id}` - Deletar produto

## 🎯 Exemplos de Uso

### Componente de Lista de Bolsas

```typescript
import { useBolsas } from '@/hooks/api';

export const ListaBolsas = () => {
  const { bolsas, isLoading, error, total } = useBolsas(0, 12);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar</div>;

  return (
    <div>
      <h2>Bolsas ({total})</h2>
      {bolsas.map(bolsa => (
        <div key={bolsa.id}>
          <h3>{bolsa.titulo}</h3>
          <p>R$ {bolsa.preco}</p>
        </div>
      ))}
    </div>
  );
};
```

### Componente de Pesquisa

```typescript
import { useState } from 'react';
import { usePesquisarProdutos } from '@/hooks/api';

export const PesquisaProdutos = () => {
  const [busca, setBusca] = useState('');
  const { produtos, isLoading } = usePesquisarProdutos(busca);

  return (
    <div>
      <input 
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Pesquisar..."
      />
      {isLoading && <div>Pesquisando...</div>}
      {produtos.map(produto => (
        <div key={produto.id}>{produto.titulo}</div>
      ))}
    </div>
  );
};
```

## 🔄 Cache e Otimização

O RTK Query automaticamente:
- ✅ Faz cache das consultas
- ✅ Refetch quando necessário
- ✅ Optimistic updates
- ✅ Background refetching
- ✅ Invalidação automática de cache

## 🛠️ Desenvolvimento

Para adicionar novos endpoints:

1. Adicione o endpoint em `produtosApi.ts`
2. Crie hooks customizados em `useProdutos.ts`
3. Adicione os tipos em `types.ts`
4. Exporte em `index.ts`

## 🔗 Backend Necessário

Certifique-se de que o backend Spring Boot está rodando em `http://localhost:8080` com os endpoints configurados.