# Sistema de Identidades de Produtos - Luigara

## 📋 O que foi implementado

Este sistema permite filtrar e exibir produtos por identidade (gênero/faixa etária), integrando-se perfeitamente com o backend Spring Boot.

## 🎯 Funcionalidades

### 1. **Tipos e Interfaces Atualizados**
- `IdentidadeDTO`: Interface para dados de identidade
- `ProdutoDTO`: Adicionado campo `identidade` opcional
- `FiltrosProdutos`: Adicionado campo `identidadeCodigo` para filtragem

### 2. **API e Hooks**

#### Endpoints na API (`produtosApi.ts`):
- `buscarProdutosPorIdentidade`: Busca produtos por código de identidade
- `buscarProdutosPorIdentidadeId`: Busca produtos por ID de identidade

#### Hooks customizados (`useProdutos.ts`):
- `useProdutosPorIdentidade(codigo, pagina, tamanho)`: Hook genérico para buscar por identidade
- `useProdutosMulher(pagina, tamanho)`: Hook específico para produtos femininos
- `useProdutosHomem(pagina, tamanho)`: Hook específico para produtos masculinos
- `useProdutosUnissex(pagina, tamanho)`: Hook específico para produtos unissex
- `useProdutosKids(pagina, tamanho)`: Hook específico para produtos infantis

### 3. **Componente Reutilizável**

`ProdutosIdentidade.tsx` - Componente genérico que:
- Exibe produtos filtrados por identidade
- Mostra grid responsivo (2 colunas mobile, 3 tablet, 4 desktop)
- Inclui paginação completa
- Badge visual da identidade em cada produto
- Imagem hover nos cards
- Integração com wishlist (favoritos)
- Loading states e tratamento de erros
- Animações suaves (Framer Motion)

### 4. **Páginas Criadas**

#### `/mulher`
- Título: "Moda Feminina"
- Descrição: "Coleção exclusiva de produtos de luxo para mulheres"
- Identidade: `mulher`

#### `/homem`
- Título: "Moda Masculina"
- Descrição: "Coleção exclusiva de produtos de luxo para homens"
- Identidade: `homem`

#### `/unissex`
- Título: "Moda Unissex"
- Descrição: "Coleção exclusiva de produtos de luxo unissex"
- Identidade: `unissex`

#### `/kids`
- Título: "Moda Infantil"
- Descrição: "Coleção exclusiva de produtos de luxo para crianças"
- Identidade: `infantil`

### 5. **Navegação Atualizada**

#### TopBar (Links Principais de Identidades)
Na `TopBar.tsx` foram adicionados os links de identidades:
1. **Mulher** → `/mulher`
2. **Homem** → `/homem`
3. **Unissex** → `/unissex`
4. **Kids** → `/kids`

#### Categorias (Produtos)
A `Categorias.tsx` permanece com as categorias de produtos:
1. Marcas
2. Bolsas
3. Roupas
4. Sapatos

## 🔗 Integração com Backend

### Endpoints Utilizados:

```
GET /api/produtos/identidade/codigo/{codigo}
- Parâmetros de query: pagina, tamanho
- Retorna: produtos filtrados por código de identidade

GET /api/produtos/identidade/{identidadeId}
- Parâmetros de query: pagina, tamanho
- Retorna: produtos filtrados por ID de identidade
```

### Códigos de Identidade:
- `mulher` - Produtos femininos
- `homem` - Produtos masculinos
- `unissex` - Produtos unissex
- `infantil` - Produtos infantis (Kids)

## 🎨 Características Visuais

- **Cards de Produtos**: Design luxuoso com sombras suaves
- **Hover Effects**: Escala de imagem e troca de foto
- **Badge de Identidade**: Identificação visual no canto superior esquerdo
- **Paginação Inteligente**: Mostra até 5 páginas com contexto da página atual
- **Responsivo**: Layout adaptativo para todos os dispositivos
- **Loading States**: Spinner durante carregamento
- **Empty States**: Mensagem amigável quando não há produtos

## 📱 Responsividade

- **Mobile** (< 768px): 2 colunas
- **Tablet** (768px - 1024px): 3 colunas
- **Desktop** (> 1024px): 4 colunas

## 🚀 Como Usar

```tsx
// Exemplo de uso do hook
import { useProdutosMulher } from '@/hooks/api/useProdutos';

function MinhaPage() {
  const { produtos, isLoading, total, totalPaginas } = useProdutosMulher(0, 24);
  
  // Use os produtos...
}

// Ou use o componente pronto
import ProdutosIdentidade from '@/app/components/ProdutosIdentidade';

export default function Page() {
  return (
    <ProdutosIdentidade 
      identidadeCodigo="mulher"
      titulo="Minha Coleção"
      descricao="Descrição opcional"
    />
  );
}
```

## 🔍 SEO

Cada página possui metadados otimizados:
- `title`: Título específico para cada identidade
- `description`: Descrição focada em SEO
- `keywords`: Palavras-chave relevantes

## ✅ Checklist de Implementação

- [x] Tipos TypeScript atualizados
- [x] Endpoints da API configurados
- [x] Hooks customizados criados
- [x] Componente genérico ProdutosIdentidade
- [x] Página /mulher
- [x] Página /homem
- [x] Página /unissex
- [x] Página /kids
- [x] NavBar atualizada
- [x] Integração com Wishlist
- [x] Paginação funcional
- [x] Responsividade
- [x] Loading states
- [x] Tratamento de erros
- [x] SEO otimizado

## 🎯 Próximos Passos Sugeridos

1. Adicionar filtros adicionais dentro das páginas de identidade
2. Implementar ordenação (preço, novidades, etc.)
3. Adicionar breadcrumbs
4. Criar páginas de combinação (ex: /mulher/bolsas)
5. Implementar busca dentro de cada identidade
