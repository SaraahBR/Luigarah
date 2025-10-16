# Luigara - E-commerce de Moda Luxo

<p align="center">
  <img src="public/logos/LH_FUNDO_BRANCO.png" alt="Logo Luigara" width="400" />
</p>

<p align="center">
  Plataforma digital de moda de grife que conecta o público às maiores referências da indústria de luxo internacional, com foco em representatividade, inclusividade e sofisticação.
</p>

---

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Gerenciamento de Estado](#gerenciamento-de-estado)
- [Sistema de Autenticação](#sistema-de-autenticação)
- [Integração com Backend](#integração-com-backend)
- [APIs e Serviços](#apis-e-serviços)
- [Componentes Principais](#componentes-principais)
- [Instalação e Configuração](#instalação-e-configuração)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Documentação Adicional](#documentação-adicional)

---

## Sobre o Projeto

Luigara é uma aplicação web full-stack desenvolvida com Next.js 15 que oferece uma experiência de compra premium para produtos de moda de luxo. O sistema integra catálogo de produtos, autenticação OAuth, carrinho de compras persistente, lista de desejos e gerenciamento completo de perfil de usuário.

### Características Principais

- **Catálogo Dinâmico**: Produtos organizados por categorias (bolsas, roupas, sapatos) com filtros avançados
- **Autenticação Multi-Provider**: Suporte para Google, Facebook e credenciais locais
- **E-commerce Completo**: Carrinho de compras, lista de desejos e checkout integrados
- **Gerenciamento de Perfil**: Upload de fotos (Cloudflare R2), endereços com auto-preenchimento via CEP
- **Responsividade Total**: Interface adaptativa para desktop, tablet e mobile
- **LGPD Compliant**: Páginas dedicadas para privacidade, termos de serviço e exclusão de dados

---

## Stack Tecnológica

### Core Framework

- **Next.js 15.5.0** - Framework React com App Router, SSR e API Routes
- **React 19.1.0** - Biblioteca UI com Server Components
- **TypeScript 5.x** - Tipagem estática e IntelliSense

### Estilização

- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **PostCSS 8.5.6** - Processamento de CSS
- **tailwindcss-animate** - Animações pré-configuradas
- **class-variance-authority** - Variantes de componentes tipadas
- **clsx** / **tailwind-merge** - Utilitários para className condicional

### UI Components

- **shadcn/ui** - Sistema de componentes acessíveis baseado em Radix UI
  - Button, Input, Select, Popover, Dialog, Command
- **Material-UI 7.3.1** - Componentes sofisticados (@mui/material, @mui/icons-material)
- **Framer Motion 12.23.22** - Animações declarativas
- **Lucide React** - Ícones SVG otimizados
- **React Icons 5.5.0** - Biblioteca unificada de ícones

### Gerenciamento de Estado

- **Redux Toolkit 2.9.0** - Estado global com slices tipados
- **RTK Query** - Data fetching e caching
- **Redux Persist 6.0.0** - Persistência de estado no localStorage
- **React Redux 9.2.0** - Bindings React para Redux

### Autenticação

- **NextAuth.js 4.24.11** - Autenticação para Next.js
  - Providers: Google OAuth, Facebook OAuth, Credentials
  - Session strategy: JWT
  - Callbacks customizados para profile sync

### Validação e Forms

- **Zod 4.0.17** - Schema validation com TypeScript inference
- **Sonner 2.0.7** - Sistema de notificações toast

### Backend Integration

- **REST API** - Spring Boot backend (Render.com)
  - Base URL: `https://luigarah-backend.onrender.com`
  - Endpoints: Produtos, Autenticação, Carrinho, Lista de Desejos
- **Cloudflare R2** - Object storage para imagens de perfil

### External APIs

- **ViaCEP** - Consulta de endereços por CEP (Brasil)
- **REST Countries API** - Lista de países internacionais
- **CountriesNow API** - Estados e cidades por país

---

## Arquitetura do Sistema

### Padrões Arquiteturais

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Next.js App  │  │  Redux Store │  │ NextAuth  │ │
│  │   Router     │  │  (RTK Query) │  │  Session  │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│ Next.js API │  │ Spring Boot  │  │ External APIs│
│   Routes    │  │   Backend    │  │ (ViaCEP etc) │
│ (Proxies)   │  │   (Render)   │  │              │
└─────────────┘  └──────────────┘  └──────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │ Oracle Database  │
              │  + Cloudflare R2 │
              └──────────────────┘
```

### Fluxo de Dados

1. **Client-Side State**: Redux Toolkit gerencia estado local (carrinho, wishlist, cache de produtos)
2. **Server State**: RTK Query faz cache e sincronização com backend
3. **Authentication**: NextAuth.js gerencia sessões JWT e OAuth
4. **Persistence**: Redux Persist salva estado por conta de usuário
5. **API Layer**: Next.js API Routes atuam como proxy/middleware para evitar CORS

---

## Estrutura de Diretórios

```
luigara/
├── public/
│   ├── logos/                  # Logos de marcas de luxo (Gucci, Prada, Chanel, etc.)
│   ├── roupas/                 # Imagens de produtos - roupas
│   ├── sapatos/                # Imagens de produtos - sapatos
│   └── pagamentos/             # Ícones de métodos de pagamento (Visa, Mastercard, Amex, etc.)
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes (Next.js)
│   │   │   ├── auth/           # NextAuth.js configuration
│   │   │   │   └── [...nextauth]/route.ts
│   │   │   ├── cep/            # Proxy ViaCEP (auto-preenchimento endereço)
│   │   │   │   └── route.ts
│   │   │   ├── countries/      # Lista de países
│   │   │   │   └── route.ts
│   │   │   ├── states/         # Estados por país
│   │   │   │   └── route.ts
│   │   │   ├── cities/         # Cidades por estado
│   │   │   │   └── route.ts
│   │   │   ├── me/             # Gerenciamento de perfil (mock/backend)
│   │   │   │   └── route.ts
│   │   │   └── docs/           # Swagger API documentation
│   │   │       └── swagger.json/
│   │   │
│   │   ├── produtos/           # Catálogo de produtos
│   │   │   ├── bolsas/         # Listagem de bolsas
│   │   │   │   ├── page.tsx
│   │   │   │   └── FiltersSidebar.tsx
│   │   │   ├── roupas/         # Listagem de roupas
│   │   │   │   ├── page.tsx
│   │   │   │   └── FiltersSidebar.tsx
│   │   │   ├── sapatos/        # Listagem de sapatos
│   │   │   │   ├── page.tsx
│   │   │   │   └── FiltersSidebar.tsx
│   │   │   ├── marcas/         # Produtos por marca
│   │   │   └── favoritos/      # Lista de desejos
│   │   │
│   │   ├── login/              # Sistema de autenticação
│   │   │   ├── AuthModal.tsx   # Modal login/cadastro (OAuth + Credentials)
│   │   │   ├── UserMenu.tsx    # Menu dropdown pós-login
│   │   │   ├── useAuthUser.ts  # Hook de gerenciamento de usuário
│   │   │   ├── loginModal.ts   # Controle de estado do modal
│   │   │   ├── openAuthModal.ts
│   │   │   ├── storage.ts      # Persistência local
│   │   │   └── minhaConta/
│   │   │       ├── page.tsx
│   │   │       └── minha-conta.tsx  # Página de perfil completa
│   │   │
│   │   ├── carrinho/           # Carrinho de compras
│   │   │   └── page.tsx
│   │   ├── checkout/           # Processo de checkout
│   │   │   └── sucesso/
│   │   │       └── page.tsx
│   │   ├── busca/              # Busca de produtos
│   │   │   ├── page.tsx
│   │   │   └── SearchResults.tsx
│   │   ├── colecao/            # Coleções especiais
│   │   │   └── page.tsx
│   │   ├── lgpd/               # Conformidade LGPD
│   │   │   ├── politica-de-privacidade/
│   │   │   │   └── page.tsx
│   │   │   ├── termos-de-servico/
│   │   │   │   └── page.tsx
│   │   │   └── exclusao-de-dados/
│   │   │       ├── page.tsx
│   │   │       └── FormSolicitacao.tsx
│   │   │
│   │   ├── homem/              # Seção masculina
│   │   │   └── page.tsx
│   │   ├── mulher/             # Seção feminina
│   │   │   └── page.tsx
│   │   ├── kids/               # Seção infantil
│   │   │   └── page.tsx
│   │   ├── unissex/            # Seção unissex
│   │   │   └── page.tsx
│   │   │
│   │   ├── components/         # Componentes da aplicação
│   │   │   ├── Header/
│   │   │   │   └── NavBar/
│   │   │   │       ├── NavBar.tsx
│   │   │   │       ├── TopBar.tsx
│   │   │   │       ├── BottomBar.tsx
│   │   │   │       └── Categorias/
│   │   │   │           └── Categorias.tsx
│   │   │   ├── Footer/
│   │   │   │   └── Footer.tsx
│   │   │   ├── Hero/
│   │   │   │   ├── Hero.tsx
│   │   │   │   └── HeroGrid.tsx
│   │   │   ├── cart/
│   │   │   │   └── AddToCartButton.tsx
│   │   │   ├── BrandCarousel.tsx
│   │   │   ├── HeartButton.tsx     # Botão wishlist
│   │   │   ├── LuxuryLoader.tsx
│   │   │   ├── SimpleLoader.tsx
│   │   │   ├── FlyToCartAnimation.tsx
│   │   │   ├── ProdutosIdentidade.tsx
│   │   │   ├── SectionBolsas.tsx
│   │   │   ├── SectionRoupas.tsx
│   │   │   ├── SectionSapatos.tsx
│   │   │   └── SessionProviders.tsx
│   │   │
│   │   ├── layout.tsx          # Root layout (Navbar, Footer, Toaster)
│   │   ├── page.tsx            # Homepage
│   │   ├── globals.css         # Estilos globais
│   │   └── Providers.tsx       # Redux Provider wrapper
│   │
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── popover.tsx
│   │       ├── dialog.tsx
│   │       └── command.tsx
│   │
│   ├── store/                  # Redux Store
│   │   ├── index.ts            # Store configuration
│   │   ├── cartSlice.ts        # Carrinho de compras (async thunks)
│   │   ├── wishlistSlice.ts    # Lista de desejos (async thunks)
│   │   ├── productsApi.ts      # RTK Query - produtos mockados
│   │   ├── accountStorage.ts   # Persistência por conta
│   │   └── storage.ts          # Storage adapter SSR-safe
│   │
│   ├── hooks/
│   │   ├── api/                # API clients e hooks
│   │   │   ├── config.ts       # Configuração base HTTP
│   │   │   ├── types.ts        # TypeScript interfaces
│   │   │   ├── authApi.ts      # API de autenticação
│   │   │   ├── produtosApi.ts  # RTK Query - produtos backend
│   │   │   ├── identidadesApi.ts # RTK Query - produtos com identidade
│   │   │   ├── useProdutos.ts  # Hooks de produtos
│   │   │   ├── carrinhoApi.ts  # API de carrinho
│   │   │   ├── listaDesejoApi.ts # API de wishlist
│   │   │   └── index.ts
│   │   ├── useImageLoader.ts   # Hook de lazy loading de imagens
│   │   └── useProdutoCompleto.ts
│   │
│   ├── lib/
│   │   ├── http.ts             # HTTP client utilitário
│   │   ├── httpClient.ts       # HTTP client com auth
│   │   ├── utils.ts            # Funções utilitárias gerais
│   │   ├── slug.ts             # Geração de slugs
│   │   └── errorUtils.ts       # Tratamento de erros
│   │
│   └── auth.ts                 # NextAuth configuration
│
├── docs/                       # Documentação técnica
│   ├── UPLOAD_FOTOS.md
│   ├── CORRECAO_BACKEND_UPLOAD.md
│   └── PROBLEMA_UPLOAD_FOTOS.md
│
├── next.config.ts              # Configuração Next.js
├── tailwind.config.js          # Configuração Tailwind
├── tsconfig.json               # Configuração TypeScript
├── postcss.config.mjs          # Configuração PostCSS
├── eslint.config.mjs           # Configuração ESLint
├── components.json             # Configuração shadcn/ui
└── package.json
```

---

## Gerenciamento de Estado

### Redux Store Architecture

```typescript
// src/store/index.ts
const rootReducer = combineReducers({
  wishlist: wishlistReducer,           // Lista de desejos
  cart: cartReducer,                   // Carrinho de compras
  [productsApi.reducerPath]: productsApi.reducer,      // Mock API
  [produtosApi.reducerPath]: produtosApi.reducer,      // Backend API
  [identidadesApi.reducerPath]: identidadesApi.reducer // Identidades API
});
```

### Slices Principais

#### 1. Cart Slice (`cartSlice.ts`)

Gerencia carrinho de compras com sincronização backend.

**Async Thunks:**
- `syncCartFromBackend`: Carrega carrinho do backend no login
- `addToCart`: Adiciona item (local + backend)
- `removeFromCart`: Remove item (local + backend)
- `updateQuantity`: Atualiza quantidade
- `clearCart`: Limpa carrinho completo

**State:**
```typescript
{
  items: Record<string, CartItem>, // key: "tipo:id"
  loading: boolean,
  error: string | null
}
```

#### 2. Wishlist Slice (`wishlistSlice.ts`)

Gerencia lista de desejos com sincronização backend.

**Async Thunks:**
- `syncWishlistFromBackend`: Carrega wishlist do backend
- `toggleWishlist`: Adiciona/remove item (toggle)
- `removeFromWishlist`: Remove item específico
- `clearWishlist`: Limpa wishlist

**State:**
```typescript
{
  items: Record<string, WishlistItem>, // key: "tipo:id"
  loading: boolean,
  error: string | null
}
```

### RTK Query APIs

#### Products API (`produtosApi.ts`)

Endpoints do backend Spring Boot:

- `listarProdutos(filtros)` - Lista produtos com paginação e filtros
- `buscarProdutoPorId(id)` - Busca produto específico
- `listarBolsas({ pagina, tamanho })` - Lista bolsas
- `listarRoupas({ pagina, tamanho })` - Lista roupas
- `listarSapatos({ pagina, tamanho })` - Lista sapatos
- `buscarProdutosPorAutor(autor)` - Produtos por marca
- `buscarTamanhosPorProduto(produtoId)` - Tamanhos disponíveis
- `buscarEstoquePorTamanho(produtoId, tamanhoId)` - Verifica estoque

#### Identidades API (`identidadesApi.ts`)

Endpoints para produtos com identidade:

- `buscarProdutosComIdentidade()` - Produtos com qualquer identidade
- `buscarProdutosPorIdentidade(codigo)` - Produtos por código de identidade

### Persistência de Estado

Sistema de persistência por conta de usuário:

```typescript
// src/store/accountStorage.ts
export function saveAccountSnapshot(email: string, state: {
  wishlist: Record<string, WishlistItem>;
  cart: Record<string, CartItem>;
}) {
  localStorage.setItem(`luigara:account:${email}`, JSON.stringify(state));
}

export function loadAccountSnapshot(email: string) {
  const key = `luigara:account:${email}`;
  const json = localStorage.getItem(key);
  return json ? JSON.parse(json) : null;
}
```

---

## Sistema de Autenticação

### NextAuth.js Configuration

**Providers:**

1. **Google OAuth**
   - Client ID/Secret via environment variables
   - Auto-import de foto de perfil

2. **Facebook OAuth**
   - Client ID/Secret via environment variables
   - Auto-import de foto de perfil

3. **Credentials Provider**
   - Login local com email/senha
   - Validação customizada

**Session Strategy:**
- JWT (stateless)
- Token inclui: name, email, picture
- Callbacks preservam dados do OAuth profile

### Custom Auth Hook (`useAuthUser.ts`)

Hook centralizado para gerenciamento de usuário:

**Estado:**
```typescript
{
  isLoggedIn: boolean;
  name: string;
  lastName: string;
  email: string;
  image: string | null;
  phone: string;
  birthDate: string;
  gender: Gender;
  address: AddressData;
}
```

**Métodos:**
- `login(email, password)` - Login com backend
- `registrar(userData)` - Registro de novo usuário
- `loginOAuth(session)` - Sincroniza sessão OAuth com backend
- `logout()` - Logout completo (limpa estado, sessão, storage)
- `saveProfile(profileData)` - Atualiza perfil
- `setAvatar(dataUrl)` - Upload de foto (Cloudflare R2)
- `loadBackendProfile()` - Carrega perfil do backend

### Upload de Foto de Perfil

**Fluxo:**
1. Usuário seleciona imagem (max 5MB)
2. Conversão para File object
3. Upload via `FormData` para `/api/auth/perfil/foto/upload`
4. Backend faz upload para Cloudflare R2
5. Retorna URL pública
6. Atualiza perfil local e recarrega do backend

**Validações:**
- Tipos aceitos: JPG, JPEG, PNG, WEBP, GIF
- Tamanho máximo: 5MB
- Autenticação JWT obrigatória

---

## Integração com Backend

### Base URL

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  'https://luigarah-backend.onrender.com';
```

### HTTP Client (`httpClient.ts`)

Cliente HTTP customizado com:

- **Token Management**: Gerencia JWT em localStorage
- **Auto-refresh**: Renova token expirado automaticamente
- **Error Handling**: Tratamento padronizado de erros
- **Request Interceptors**: Adiciona headers de autenticação
- **Response Interceptors**: Processa respostas e erros

**Métodos:**
```typescript
httpClient.get<T>(url, options?)
httpClient.post<T>(url, data, options?)
httpClient.put<T>(url, data, options?)
httpClient.delete<T>(url, options?)
httpClient.patch<T>(url, data, options?)
```

**Opções:**
```typescript
{
  requiresAuth?: boolean;  // Exige token JWT
  headers?: Headers;       // Headers customizados
}
```

### Principais Endpoints

#### Autenticação (`authApi.ts`)

```typescript
authApi.login(email, senha)              // POST /api/auth/login
authApi.registrar(userData)              // POST /api/auth/registro
authApi.sincronizarOAuth(oauthData)      // POST /api/auth/oauth/sync
authApi.obterPerfil()                    // GET /api/auth/perfil
authApi.atualizarPerfil(dados)           // PUT /api/auth/perfil
authApi.uploadFotoPerfil(file)           // POST /api/auth/perfil/foto/upload
authApi.atualizarFotoPorUrl(url)         // PUT /api/auth/perfil/foto
authApi.removerFotoPerfil()              // DELETE /api/auth/perfil/foto
authApi.alterarSenha(senhas)             // PUT /api/auth/perfil/senha
```

#### Carrinho (`carrinhoApi.ts`)

```typescript
carrinhoApi.listarItens()                            // GET /api/carrinho
carrinhoApi.adicionarItem(produtoId, qtd, tamanho)   // POST /api/carrinho
carrinhoApi.removerItem(itemId)                      // DELETE /api/carrinho/{id}
carrinhoApi.atualizarQuantidade(itemId, qtd)         // PATCH /api/carrinho/{id}
carrinhoApi.limparCarrinho()                         // DELETE /api/carrinho
```

#### Lista de Desejos (`listaDesejoApi.ts`)

```typescript
listaDesejoApi.listarItens()             // GET /api/lista-desejo
listaDesejoApi.adicionarItem(produtoId)  // POST /api/lista-desejo
listaDesejoApi.removerItem(itemId)       // DELETE /api/lista-desejo/{id}
listaDesejoApi.removerPorProduto(id)     // DELETE /api/lista-desejo/produto/{id}
```

---

## APIs e Serviços

### API Routes (Next.js)

#### 1. CEP API (`/api/cep`)

Proxy para ViaCEP com conversão de UF para nome do estado.

**Request:** `GET /api/cep?zip=01310100`

**Response:**
```json
{
  "zip": "01310-100",
  "city": "São Paulo",
  "state": "São Paulo",
  "district": "Bela Vista",
  "street": "Avenida Paulista",
  "country": "Brasil"
}
```

#### 2. Countries API (`/api/countries`)

**Request:** `GET /api/countries`

**Response:**
```json
[
  { "name": "Brazil", "code": "BR" },
  { "name": "United States", "code": "US" }
]
```

#### 3. States API (`/api/states`)

**Request:** `GET /api/states?country=Brazil`

**Response:**
```json
[
  { "name": "São Paulo", "code": "SP" },
  { "name": "Rio de Janeiro", "code": "RJ" }
]
```

#### 4. Cities API (`/api/cities`)

**Request:** `GET /api/cities?country=Brazil&state=São Paulo`

**Response:**
```json
[
  "São Paulo",
  "Campinas",
  "Santos"
]
```

### Integrações Externas

#### ViaCEP
- URL: `https://viacep.com.br/ws/{cep}/json/`
- Uso: Auto-preenchimento de endereço por CEP
- Conversão: UF → Nome do estado (ex: "SP" → "São Paulo")

#### REST Countries API
- URL: `https://restcountries.com/v3.1/all`
- Uso: Lista de países para select de endereço

#### CountriesNow API
- URL: `https://countriesnow.space/api/v0.1/countries/states`
- Uso: Estados e cidades por país

---

## Componentes Principais

### Navigation

#### NavBar (`src/app/components/Header/NavBar/`)

Navegação principal com:

- **TopBar**: Logo, links de seções (Mulher, Homem, Kids), ícones de usuário/wishlist/carrinho
- **BottomBar**: Barra de busca, categorias (Bolsas, Roupas, Sapatos, Marcas)
- **Categorias**: Dropdown com categorias e marcas

#### Footer (`src/app/components/Footer/Footer.tsx`)

Rodapé com:
- Links institucionais
- Redes sociais
- Métodos de pagamento
- Copyright

### Product Display

#### SectionBolsas / SectionRoupas / SectionSapatos

Seções de produtos na homepage com:
- Grid responsivo de produtos
- Lazy loading de imagens
- Botão "Ver mais"
- Link para página completa

#### FiltersSidebar

Sidebar de filtros com:
- Categorias
- Tamanhos (roupa/calçado)
- Dimensões (altura/largura/profundidade para bolsas)
- Faixa de preço
- Marcas
- Cores

### User Interface

#### AuthModal (`src/app/login/AuthModal.tsx`)

Modal de autenticação com:
- Tabs: Login / Cadastro
- OAuth buttons (Google, Facebook)
- Form de credenciais
- Validações em tempo real
- Feedback visual (loading, errors)

#### UserMenu (`src/app/login/UserMenu.tsx`)

Dropdown pós-login com:
- Avatar do usuário
- Nome e email
- Links: Minha Conta, Pedidos, Créditos, Interesses
- Botão de logout

#### Página Minha Conta (`src/app/login/minhaConta/minha-conta.tsx`)

Gerenciamento completo de perfil:

**Upload de Foto:**
- 3 opções: Upload de arquivo / URL externa / Remover foto
- Validações: tipo (PNG/JPG/WEBP/GIF), tamanho (max 5MB)
- Preview instantâneo
- Upload para Cloudflare R2

**Dados Pessoais:**
- Nome, Sobrenome
- Data de Nascimento
- Gênero (opcional - default "Não Especificado")
- Telefone

**Endereço:**
- CEP com auto-preenchimento
- País (select com busca)
- Estado (select dinâmico baseado no país)
- Cidade (combobox com busca para cidades grandes)
- Bairro, Rua, Número, Complemento

**Validações:**
- Campos obrigatórios marcados com *
- Formato de CEP (00000-000)
- Formato de telefone
- Feedback via Sonner toasts

### Cart & Wishlist

#### AddToCartButton

Botão de adicionar ao carrinho com:
- Loading state
- Animação fly-to-cart
- Toast de sucesso/erro
- Seleção de tamanho (modal)

#### HeartButton

Botão de wishlist com:
- Toggle animation
- Estado sincronizado com Redux
- Feedback visual

---

## Instalação e Configuração

### Pré-requisitos

- Node.js 20.x ou superior
- npm ou yarn
- Conta Google Cloud (OAuth)
- Conta Facebook Developers (OAuth)
- Conta Cloudflare (R2 storage)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/luigara.git

# Entre no diretório
cd luigara

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute em modo de desenvolvimento
npm run dev
```

### Instalação de Componentes shadcn/ui

```bash
# Adicionar componentes individualmente
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add popover
npx shadcn@latest add dialog
npx shadcn@latest add command
```

---

## Scripts Disponíveis

```json
{
  "dev": "next dev",           // Servidor desenvolvimento (http://localhost:3000)
  "build": "next build",       // Build de produção
  "start": "next start",       // Servidor de produção
  "lint": "eslint"             // Linter de código
}
```

### Comandos

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar produção localmente
npm run start

# Linting
npm run lint
```

---

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Backend API
NEXT_PUBLIC_API_URL=https://luigarah-backend.onrender.com

# Cloudflare R2 (se necessário no frontend)
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-r2-bucket-url
```

### Variáveis de Backend (Render.com)

```bash
# Cloudflare R2
AWS_ACCESS_KEY_ID=your-r2-access-key
AWS_SECRET_ACCESS_KEY=your-r2-secret-key
R2_ACCOUNT_ID=your-r2-account-id
STORAGE_BUCKET=luigarah-prod
STORAGE_PUBLIC_BASE_URL=https://your-r2-public-url

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=86400000

# Spring Boot
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# Oracle Database
TNS_ADMIN=/opt/app/wallet
ORACLE_DB_URL=jdbc:oracle:thin:@...
ORACLE_DB_USERNAME=your-db-user
ORACLE_DB_PASSWORD=your-db-password
```

---

## Documentação Adicional

### Documentos Técnicos

- **`docs/UPLOAD_FOTOS.md`**: Sistema completo de upload de fotos de perfil
- **`docs/CORRECAO_BACKEND_UPLOAD.md`**: Implementação do upload real no backend
- **`docs/PROBLEMA_UPLOAD_FOTOS.md`**: Troubleshooting de problemas de upload

### Links Úteis

- **Next.js Documentation**: https://nextjs.org/docs
- **Redux Toolkit**: https://redux-toolkit.js.org
- **NextAuth.js**: https://next-auth.js.org
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Cloudflare R2**: https://developers.cloudflare.com/r2

---

## Licença

Este projeto está sob a licença especificada no arquivo `LICENSE`.
