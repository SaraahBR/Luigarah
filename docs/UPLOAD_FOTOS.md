# 📸 Sistema de Upload de Fotos de Perfil

## Visão Geral

O sistema permite que usuários atualizem suas fotos de perfil de três formas:

1. **Upload de arquivo** - Para usuários cadastrados com email/senha
2. **URL externa** - Para qualquer usuário
3. **Automático (OAuth)** - Para usuários logados via Google/Facebook

## Fluxo de Autenticação

### 1. Login OAuth (Google/Facebook)
```typescript
// Foto vem automaticamente do provider
usuario.fotoPerfil = "https://lh3.googleusercontent.com/a/..."
```

### 2. Cadastro Local (Email/Senha)
```typescript
// Usuário pode fazer upload ou inserir URL posteriormente
usuario.fotoPerfil = null // inicialmente
```

## Endpoints do Backend

### 📤 Upload de Arquivo
```http
POST /api/auth/perfil/foto/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: File (imagem)
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Foto enviada com sucesso",
  "fotoPerfil": "https://r2.cloudflarestorage.com/luigarah-prod/usuarios/1234567890-avatar.jpg"
}
```

### 🔗 Atualizar por URL
```http
PUT /api/auth/perfil/foto
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "fotoUrl": "https://exemplo.com/foto.jpg"
}
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Foto atualizada com sucesso",
  "fotoUrl": "https://exemplo.com/foto.jpg"
}
```

### 🗑️ Remover Foto
```http
DELETE /api/auth/perfil/foto
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "sucesso": true,
  "mensagem": "Foto removida com sucesso"
}
```

## Frontend - Implementação

### API Client (`authApi.ts`)

```typescript
// Upload de arquivo
async uploadFotoPerfil(file: File): Promise<Response>

// Atualizar por URL
async atualizarFotoPorUrl(fotoUrl: string): Promise<Response>

// Remover foto
async removerFotoPerfil(): Promise<Response>
```

### Hook Personalizado (`useAuthUser.ts`)

```typescript
const { setAvatar, profile } = useAuthUser();

// Upload de arquivo (recebe dataURL)
await setAvatar(dataUrlString);

// Remover foto
await setAvatar(null);
```

### Componente de Perfil (`minha-conta.tsx`)

#### Opções de Upload

1. **Botão com Popover** - Clique no ícone de câmera
2. **Upload de Arquivo** - Seleciona arquivo do dispositivo
3. **Inserir URL** - Abre modal para colar URL
4. **Remover Foto** - Remove foto atual (só aparece se tiver foto)

```tsx
<Popover>
  <PopoverTrigger>
    <Button>
      <FiUploadCloud />
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <button onClick={onPickFile}>Fazer upload</button>
    <button onClick={() => setShowUrlModal(true)}>Usar URL</button>
    {avatar && <button onClick={removerFoto}>Remover foto</button>}
  </PopoverContent>
</Popover>
```

## Validações

### Frontend
- **Tipos aceitos:** PNG, JPG, JPEG, WEBP, GIF
- **Tamanho máximo:** 5MB
- **Validação de URL:** Formato válido (https://...)

### Backend
- **Tipos aceitos:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`
- **Tamanho máximo:** 5MB (configurável em `application.properties`)
- **Storage:** Cloudflare R2 (S3-compatible)

## Storage (Cloudflare R2)

### Configuração
```properties
# application.properties
storage.bucket=luigarah-prod
storage.publicBaseUrl=https://pub-xxxxx.r2.dev
aws.s3.endpoint=https://xxxxx.r2.cloudflarestorage.com
aws.credentials.accessKey=${AWS_ACCESS_KEY_ID}
aws.credentials.secretKey=${AWS_SECRET_ACCESS_KEY}
```

### Estrutura de Pastas
```
luigarah-prod/
├── usuarios/
│   ├── 1234567890-avatar.jpg
│   ├── 9876543210-profile.png
│   └── ...
├── produtos/
└── ...
```

### Geração de Chave
```java
String key = folder + "/" + timestamp + "-" + sanitizedFilename;
// Exemplo: usuarios/1701234567890-avatar.jpg
```

## Fluxo Completo

### 1. Usuário faz upload
```
Frontend → authApi.uploadFotoPerfil(file)
  → Backend → ImageStorageService.save()
    → Cloudflare R2
      → URL pública retornada
        → Backend atualiza usuario.fotoPerfil
          → Frontend atualiza state local
```

### 2. Usuário insere URL
```
Frontend → authApi.atualizarFotoPorUrl(url)
  → Backend valida URL
    → Backend atualiza usuario.fotoPerfil
      → Frontend atualiza state local
```

### 3. Login OAuth
```
NextAuth → syncOAuth(provider, email, fotoUrl)
  → Backend salva fotoUrl do provider
    → Frontend carrega perfil
      → Foto aparece automaticamente
```

## Tratamento de Erros

### Frontend
```typescript
try {
  await authApi.uploadFotoPerfil(file);
  toast.success("Foto atualizada!");
} catch (error) {
  toast.error("Erro ao atualizar foto");
  console.error(error);
}
```

### Backend
```java
if (!isValidImageType(contentType)) {
    throw new IllegalArgumentException("Tipo de arquivo inválido");
}

if (file.getSize() > 5 * 1024 * 1024) {
    throw new IllegalArgumentException("Arquivo muito grande");
}
```

## UX - Feedback Visual

### Estados
- **Loading:** `toast.loading("Enviando foto...")`
- **Sucesso:** `toast.success("Foto atualizada com sucesso!")`
- **Erro:** `toast.error("Erro ao atualizar foto")`

### Pré-visualização
- **Upload:** Mostra imagem imediatamente após seleção
- **URL:** Mostra preview no modal antes de confirmar
- **OAuth:** Carrega foto do provider automaticamente

## Casos de Uso

### ✅ Caso 1: Novo usuário (cadastro local)
1. Usuário se registra com email/senha
2. `fotoPerfil` = `null`
3. Usuário acessa "Minha Conta"
4. Clica no ícone de câmera → "Fazer upload"
5. Seleciona arquivo → Upload → Foto salva

### ✅ Caso 2: Login com Google
1. Usuário faz login com Google
2. `fotoPerfil` = foto do Google automaticamente
3. Usuário pode trocar depois se quiser

### ✅ Caso 3: Atualizar por URL
1. Usuário clica no ícone de câmera → "Usar URL"
2. Cola URL da imagem
3. Vê preview
4. Confirma → Foto atualizada

### ✅ Caso 4: Remover foto
1. Usuário tem foto configurada
2. Clica no ícone de câmera → "Remover foto"
3. Foto removida → Volta para monograma com iniciais

## Segurança

### Validação de Tipo MIME
```typescript
const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
if (!validTypes.includes(file.type)) {
  throw new Error('Tipo inválido');
}
```

### Sanitização de Nome de Arquivo
```java
String sanitized = filename
  .replaceAll(".*[/\\\\]", "")
  .replaceAll("[^a-zA-Z0-9._-]", "_")
  .toLowerCase();
```

### Autenticação
- Todos os endpoints exigem `Authorization: Bearer {token}`
- Token JWT validado em cada requisição

## Performance

### CDN (Cloudflare R2)
- Cache público com TTL de 1 ano
- `Cache-Control: public, max-age=31536000, immutable`
- Distribuição global via Cloudflare

### Otimização de Imagens
- Formato comprimido (JPEG/WebP)
- Tamanho máximo 5MB
- Lazy loading no frontend

## Próximas Melhorias

- [ ] Redimensionamento automático de imagens no backend
- [ ] Suporte a recorte/crop de imagem
- [ ] Histórico de fotos anteriores
- [ ] Compressão automática de imagens grandes
- [ ] Detecção de conteúdo impróprio (AI)
