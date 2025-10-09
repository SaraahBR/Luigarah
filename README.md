# Luigarah – Moda de Grife e Luxo

Um site moderno e sofisticado dedicado ao universo da **moda de grife**, trazendo coleções exclusivas de **estilistas renomados** e **casas de nicho famosas** do cenário internacional.  
Nosso objetivo é oferecer uma **experiência digital inclusiva, representativa e impactante**, que traduz a essência da **alta costura** e da **luxuosidade contemporânea**.

</br>
<p align="center">
  <img src="public/logos/LH_FUNDO_BRANCO.png" alt="Logo Luigara" width="500" />
</p>

---

## 🚀 Tecnologias Utilizadas

### Core
- **Next.js (App Router)** – Framework React de alta performance  
- **React 18** – Interfaces modernas e dinâmicas  
- **TypeScript** – Tipagem estática para maior confiabilidade  
- **Tailwind CSS** – Estilização responsiva e escalável  

### UI & UX
- **shadcn/ui** – Componentes acessíveis e estilizados (Button, Input, Select, Popover, Command)  
- **Sonner** – Sistema de notificações (toasts) moderno  
- **lucide-react** – Ícones minimalistas (Loader, etc.)  
- **React Icons** – Ícones adicionais (FiUser, FiHeart, FiShoppingBag etc.)  
- **Material UI (MUI)** – Componentes sofisticados e acessíveis  

### Estado & Sessão
- **next-auth** – Autenticação com **Google** e **Facebook**  
- **LocalStorage Mock** – Login alternativo sem back-end  
- **Redux Toolkit** – Estado global (catálogo, carrinho, favoritos)  

### APIs & Integrações
- **ViaCEP** – Consulta de CEP brasileiro  
- **REST Countries** – Lista de países  
- **CountriesNow** – Lista dinâmica de Estados e Cidades  
- **API interna Next.js** (`/app/api/*`) para proxy e integração sem CORS  
- **Zod** – Validação de dados (ex.: `/api/me`)

---

## Bio do Projeto
Este projeto nasce como uma **plataforma de moda digital** que conecta o público às maiores referências da indústria de luxo.  
Inspirado pela **inovação**, **representatividade** e **inclusividade**, buscamos criar um espaço onde **todas as identidades, corpos e expressões** encontram **voz, estilo e poder**.  

Nossa missão é **quebrar barreiras**, democratizar o acesso ao universo da moda de grife, sem perder a exclusividade e a sofisticação que definem este nicho.  
Aqui, a **tecnologia encontra a arte** para entregar uma experiência digital imersiva e luxuosa.

---

## 📂 Estrutura de Pastas (nesse momento)

```bash
luigara/
├── public/
│   └── pagamentos/                     # ícones de bandeiras/pagamento
│       ├── amex.svg
│       ├── boleto.svg
│       ├── elo.svg
│       ├── hipercard.svg
│       └── ... (visa.svg, mastercard.svg, boleto.svg, etc...)
│
└── src/
    ├── app/
    │   ├── api/                        # rotas internas Next.js (proxy/serviço)
    │   │   ├── cep/
    │   │   │   └── route.ts            # ViaCEP → {city,state,district,street,country}
    │   │   ├── countries/
    │   │   │   └── route.ts            # lista de países
    │   │   ├── states/
    │   │   │   └── route.ts            # lista de estados por país
    │   │   ├── cities/
    │   │   │   └── route.ts            # lista de cidades por país/estado
    │   │   └── me/
    │   │       └── route.ts            # mock para salvar perfil (GET/PUT + Zod)
    │   │
    │   ├── carrinho-compras/
    │   │   └── page.tsx                # página do carrinho
    │   ├── colecao/
    │   │   └── page.tsx                # landing de coleções
    │   ├── internacionalizacao/        # (i18n; arquivos próprios)
    │   │   └── ...
    │   ├── login/
    │   │   ├── AuthModal.tsx           # modal entrar/cadastrar (Google/Facebook)
    │   │   ├── UserMenu.tsx            # dropdown pós-login (avatar/navegação)
    │   │   ├── useAuthUser.ts          # estado do usuário (nome, email, foto, endereço)
    │   │   └── minhaConta/
    │   │       └── minha-conta.tsx     # página “Minha Conta” (perfil editável)
    │   ├── minha-conta/
    │   │   └── page.tsx                # rota /minha-conta (renderiza minha-conta.tsx)
    │   ├── produtos/                   # rotas/páginas para catálogo de produtos
    │   │   ├── bolsas/                 # seção de bolsas de luxo
    │   │   │   ├── page.tsx            # página principal de listagem de bolsas
    │   │   │   ├── tailwind.tsx        # layout/estrutura + header e grid de bolsas
    │   │   │   └── FiltersSidebar.tsx  # drawer lateral "Todos os filtros" (categorias, tamanhos, dimensões)
    │   │   │
    │   │   ├── roupas/                 # seção de roupas de luxo
    │   │   │   ├── page.tsx            # página principal de listagem de roupas
    │   │   │   ├── tailwind.tsx        # layout/estrutura + header e grid de roupas
    │   │   │   └── FiltersSidebar.tsx  # drawer lateral "Todos os filtros" (categorias, tamanhos, dimensões)
    │   │   │
    │   │   └── sapatos/                # seção de sapatos de luxo
    │   │       ├── page.tsx            # página principal de listagem de sapatos
    │   │       ├── tailwind.tsx        # layout/estrutura + header e grid de sapatos
    │   │       └── FiltersSidebar.tsx  # drawer lateral "Todos os filtros" (categorias, tamanhos, dimensões)
    │   │
    │   ├── components/
    │   │   ├── Footer/
    │   │   │   └── Footer.tsx          # rodapé global
    │   │   └── Header/
    │   │       └── NavBar/
    │   │           ├── Categorias/
    │   │           │   └── Categorias.tsx  # organiza por categorias de marcas/bolsas/roupas/sapatos em dropdown
    │   │           ├── BottomBar.tsx   # barra de pesquisa no topo da página
    │   │           ├── TopBar.tsx      # TopBar das sessões e botões essenciais do topo da página
    │   │           ├── NavBar.tsx      # monta TopBar + BottomBar
    │   │           └── Header.tsx      
    │   ├── globals.css
    │   ├── layout.tsx                  # inclui <Navbar/>, <Footer/> e <Toaster (sonner)>
    │   └── page.tsx                    # home
    │
    ├── components/
    │   └── ui/                         # shadcn/ui gerados via CLI
    │       ├── button.tsx
    │       ├── input.tsx
    │       ├── select.tsx
    │       ├── popover.tsx
    │       └── command.tsx
    │
    ├── data/                           # base estática de produtos (mock inicial)
    │   ├── bolsas.json                 # catálogo inicial de bolsas (id, marca, categoria, preço, imagens, dimension/tamanho)
    │   ├── roupas.json                 # catálogo inicial de roupas (id, marca, categoria, preço, imagens, dimension/tamanho)
    │   └── sapatos.json                # catálogo inicial de sapatos (id, marca, categoria, preço, imagens, dimension/tamanho)
    │
    ├── lib/                            # utilitários globais para o projeto
    │   └── utils.ts                    # funções auxiliares (ex: formatações, validações, helpers de string/array)
    │
    └── app/components/SessionProviders.tsx  # provider do next-auth

```

---

## 🧭 Função de cada arquivo (resumo rápido)

- **`app/api/cep/route.ts`**: Proxy para ViaCEP. Converte UF → nome do estado e retorna `zip, city, state, district, street, country`.  
- **`app/api/countries/route.ts`**: Retorna todos os países (usado no select de país).  
- **`app/api/states/route.ts`**: Retorna estados para um país.  
- **`app/api/cities/route.ts`**: Retorna cidades para país + estado.  
- **`app/api/me/route.ts`**: `GET/PUT` do perfil com **Zod** (mock em memória).  
- **`login/useAuthUser.ts`**: Hook central de perfil (nome, foto, email, endereço, save, logout, etc.).  
- **`login/AuthModal.tsx`**: Modal de login/cadastro, com `signIn("google" | "facebook")`.  
- **`login/UserMenu.tsx`**: Dropdown pós-login (mostra nome, atalhos, **avatar** no cabeçalho).  
- **`login/minhaConta/minha-conta.tsx`**: Tela de perfil com upload de foto, selects dinâmicos, **CEP auto-preenche** e **Sonner** para toasts.  
- **`components/ui/*` (shadcn/ui)**: Componentes de UI (Button, Input, Select, Popover, Command).  
- **`app/components/Header/NavBar/*`**: TopBar + BottomBar + Categorias (ícones, busca, carrinho, etc.).  
- **`app/components/Footer/Footer.tsx`**: Rodapé global.  
- **`app/layout.tsx`**: Layout geral com `<Navbar/>`, `<Footer/>` e `<Toaster />` (Sonner).  
- **`data/*.json`**: Catálogo estático (bolsas/roupas/sapatos).  
- **`public/pagamentos/*.svg`**: Ícones de meios de pagamento.

---

## 🔧 Funcionalidades

### Configuração de Ambiente

O projeto utiliza variáveis de ambiente para configurar a URL do backend. Para configurar:

1. Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

2. Ajuste a variável `NEXT_PUBLIC_API_URL` conforme necessário:
   - **Desenvolvimento**: `http://localhost:8080`
   - **Produção**: `https://luigarah-backend.onrender.com`

Se não configurada, o sistema usa automaticamente a URL de produção (`https://luigarah-backend.onrender.com`).

### Autenticação
- Login via **Google** e **Facebook** (next-auth)  
- Login mock com **email/senha** salvo em LocalStorage  
- Menu do usuário com: pedidos, créditos, interesses, minha conta, sair  

### Página **Minha Conta**
- Upload e edição de **foto de perfil**  
- Importação automática da foto quando logado pelo Google/Facebook  
- Campos editáveis: **Nome, Sobrenome, Data de Nascimento, Gênero, Telefone, Endereço**  
- Endereço completo com: País, Estado, Cidade, CEP, Bairro, Rua, Número, Complemento  
- **Auto-preenchimento do CEP** (ViaCEP → cidade, estado, bairro, rua, país)  
- Selects dinâmicos: **País → Estado → Cidade**  
- Combobox com busca rápida para cidades grandes  
- Salvar perfil com validações (CEP, telefone, campos obrigatórios)  
- Notificações modernas com **Sonner**  

### Catálogo & Navegação
- Navbar responsiva com categorias (Mulher, Homem, Bolsas, Roupas, Sapatos)  
- **BottomBar** no mobile com busca integrada  
- Sessões exclusivas de produtos (Hero + seções temáticas)  
- Carrinho de compras com badge dinâmica  

---

## 📦 Dependências adicionadas recentemente

```bash
npm i next-auth zod sonner lucide-react
# shadcn/ui (gera componentes em src/components/ui)
npx shadcn@latest add button input select popover command
```

---

## 👥 Integrantes do Projeto
- **Sarah Hernandes** – Desenvolvedora Full Stack 
- **Luigi Moura** – Desenvolvedor Full Stack 

---

## 💎 Impacto
Este site não é apenas uma vitrine, mas um **manifesto digital** da moda de luxo.  
Ele une **tradição e inovação**, **exclusividade e acessibilidade**, **glamour e diversidade** — redefinindo o que significa **pertencer ao mundo da moda de alto padrão**.  
A tecnologia aqui não é apenas suporte, mas parte da experiência: **cada clique é um desfile.**
