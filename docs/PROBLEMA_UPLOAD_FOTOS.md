# 🔴 PROBLEMA IDENTIFICADO - Upload de Fotos

## ❌ Erro Atual

```
admin@luigarah.com.jpg:1  Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

### Causa Raiz

O backend está retornando uma **URL mockada** que não existe:

```java
// ❌ Código atual no ControladorAutenticacao.java
String fotoUrl = "https://storage.luigarah.com/fotos/" + userDetails.getUsername() + ".jpg";
```

Essa URL é fictícia e o DNS não resolve, por isso o erro `ERR_NAME_NOT_RESOLVED`.

---

## ✅ SOLUÇÃO NECESSÁRIA

### 1. Atualizar Backend

Substituir a URL mockada pelo **upload real** para Cloudflare R2:

```java
// ✅ Upload real usando ImageStorageService
String key = imageStorageService.generateKey("usuarios", 
    userDetails.getUsername().replace("@", "-").replace(".", "-") + ".jpg");

String fotoUrl = imageStorageService.save(
    key, 
    contentType, 
    file.getSize(), 
    file.getInputStream()
);
```

### 2. Resultado Esperado

Após a correção, a URL será real e acessível:

```
✅ https://pub-xxxxx.r2.dev/usuarios/admin-luigarah-com.jpg
```

---

## 📋 Passos para Corrigir

### Backend (Java/Spring Boot)

1. **Abrir arquivo:** `ControladorAutenticacao.java`

2. **Localizar método:** `uploadFotoPerfil`

3. **Substituir estas linhas:**
   ```java
   // TODO: Implementar storage service (AWS S3, Azure Blob, etc)
   // String fotoUrl = storageService.salvarFoto(file, userDetails.getUsername());

   // Por enquanto, retornar URL mockada
   String fotoUrl = "https://storage.luigarah.com/fotos/" + userDetails.getUsername() + ".jpg";
   ```

4. **Por este código:**
   ```java
   // ✅ Upload real para Cloudflare R2
   String key = imageStorageService.generateKey("usuarios", 
       userDetails.getUsername().replace("@", "-").replace(".", "-") + ".jpg");
   
   String fotoUrl = imageStorageService.save(
       key, 
       contentType, 
       file.getSize(), 
       file.getInputStream()
   );
   
   log.info("✅ Foto salva no storage: {}", fotoUrl);
   ```

5. **Adicionar injeção de dependência:**
   ```java
   @RestController
   @RequestMapping("/api/auth")
   @RequiredArgsConstructor
   public class ControladorAutenticacao {
       
       private final AuthService authService;
       private final ImageStorageService imageStorageService; // ← ADICIONAR
   }
   ```

### Configuração (Variáveis de Ambiente no Render)

Adicionar no Render Dashboard → Environment:

```bash
AWS_ACCESS_KEY_ID=your_cloudflare_r2_access_key
AWS_SECRET_ACCESS_KEY=your_cloudflare_r2_secret_key
STORAGE_BUCKET=luigarah-prod
STORAGE_PUBLIC_BASE_URL=https://pub-xxxxx.r2.dev
AWS_S3_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
```

---

## 🧪 Como Validar

### 1. Após Deploy

```bash
# Frontend - Console do navegador
[useAuthUser] Foto de perfil atualizada com sucesso!
✅ Perfil atualizado! Resposta: {
  "fotoPerfil": "https://pub-xxxxx.r2.dev/usuarios/admin-luigarah-com.jpg"
}
```

### 2. Verificar Imagem

Abrir a URL diretamente no navegador:
```
https://pub-xxxxx.r2.dev/usuarios/admin-luigarah-com.jpg
```

Deve mostrar a imagem carregada.

### 3. Logs do Backend (Render)

```
📤 Upload de foto de perfil - Usuário: admin@luigarah.com
📦 Arquivo: avatar.jpg (152340 bytes)
✅ Upload OK para key='usuarios/admin-luigarah-com.jpg'
✅ Foto salva no storage: https://pub-xxxxx.r2.dev/usuarios/admin-luigarah-com.jpg
```

---

## 🎯 Status Atual vs. Esperado

### ❌ Atual
```json
{
  "fotoPerfil": "https://storage.luigarah.com/fotos/admin@luigarah.com.jpg"
}
```
**Resultado:** Imagem não carrega (ERR_NAME_NOT_RESOLVED)

### ✅ Esperado
```json
{
  "fotoPerfil": "https://pub-xxxxx.r2.dev/usuarios/admin-luigarah-com.jpg"
}
```
**Resultado:** Imagem carrega perfeitamente

---

## 📚 Arquivos para Editar

1. `src/main/java/com/luigarah/controller/autenticacao/ControladorAutenticacao.java`
   - Adicionar `ImageStorageService` na injeção
   - Substituir URL mockada por upload real

2. Render Dashboard (variáveis de ambiente)
   - Configurar credenciais R2
   - Definir bucket e endpoint

---

## ⚠️ Importante

> **O frontend já está 100% pronto e funcional!** 
> 
> O único ajuste necessário é no backend para fazer o upload real em vez de retornar URL mockada.

Uma vez corrigido o backend, o sistema completo funcionará perfeitamente! 🎉
