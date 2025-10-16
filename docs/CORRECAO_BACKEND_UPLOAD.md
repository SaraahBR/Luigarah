# ✅ Upload de Foto de Perfil - Implementação Completa

## 📋 Status da Implementação

### ✅ Backend - CORRIGIDO E FUNCIONANDO
- ✅ `ImageStorageService` injetado no controller
- ✅ Upload real para Cloudflare R2 implementado
- ✅ Validações completas (tipo, tamanho, arquivo vazio)
- ✅ Logs detalhados para debugging
- ✅ Variáveis de ambiente configuradas no Render

### ✅ Frontend - 100% FUNCIONAL
- ✅ API client com upload multipart
- ✅ Interface com 3 opções (upload/URL/remover)
- ✅ Validações e feedback visual
- ✅ Integração completa com backend

---

## ❌ Problema Anterior (RESOLVIDO)

O endpoint `/api/auth/perfil/foto/upload` estava retornando URL mockada:

```java
// ❌ PROBLEMA: URL mockada que não existia
String fotoUrl = "https://storage.luigarah.com/fotos/" + userDetails.getUsername() + ".jpg";
```

**Erro no console:**
```
admin@luigarah.com.jpg:1  Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

---

## ✅ Solução Implementada

### 1. Injeção de Dependência Adicionada

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class ControladorAutenticacao {

    private final AuthService authService;
    private final ImageStorageService imageStorageService; // ✅ ADICIONADO
    
    // ... resto do código
}
```

### 2. Método `uploadFotoPerfil` Atualizado

```java
/**
 * Upload de foto de perfil (arquivo)
 * POST /api/auth/perfil/foto/upload
 */
@PostMapping(value = "/perfil/foto/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@Operation(summary = "Upload de foto de perfil")
public ResponseEntity<?> uploadFotoPerfil(
        @Parameter(description = "Arquivo de imagem da foto de perfil", required = true)
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal UserDetails userDetails
) {
    try {
        // Validações
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                Map.of("sucesso", false, "mensagem", "Arquivo vazio")
            );
        }

        String contentType = file.getContentType();
        if (!imageStorageService.isValidImageType(contentType)) {
            return ResponseEntity.badRequest().body(
                Map.of("sucesso", false, "mensagem", "Tipo de arquivo inválido. Use: JPG, PNG, WEBP ou GIF")
            );
        }

        // Validar tamanho (máximo 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(
                Map.of("sucesso", false, "mensagem", "Arquivo muito grande (máx 5MB)")
            );
        }

        log.info("📤 Upload de foto de perfil - Usuário: {}", userDetails.getUsername());
        log.info("📦 Arquivo: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

        // ✅ UPLOAD REAL PARA CLOUDFLARE R2
        String key = imageStorageService.generateKey("usuarios", 
            userDetails.getUsername().replace("@", "-").replace(".", "-") + ".jpg");
        
        String fotoUrl = imageStorageService.save(
            key, 
            contentType, 
            file.getSize(), 
            file.getInputStream()
        );

        log.info("✅ Foto salva no storage: {}", fotoUrl);

        // Atualiza no banco de dados
        UsuarioDTO usuario = authService.atualizarFotoPerfil(fotoUrl, userDetails.getUsername());

        return ResponseEntity.ok(
            Map.of(
                "sucesso", true,
                "mensagem", "Foto enviada com sucesso",
                "fotoPerfil", usuario.getFotoPerfil()
            )
        );

    } catch (Exception e) {
        log.error("❌ Erro ao fazer upload: {}", e.getMessage(), e);
        return ResponseEntity.status(500).body(
            Map.of("sucesso", false, "mensagem", "Erro ao fazer upload: " + e.getMessage())
        );
    }
}
```

### 3. Variáveis de Ambiente (Render) - ✅ CONFIGURADAS

Todas as variáveis já estão configuradas no Render:

```bash
# Cloudflare R2
AWS_ACCESS_KEY_ID=d563b6dedff6e5f54b470660cae83d70
AWS_SECRET_ACCESS_KEY=3769ef6b1ff9bf585562845cf8c415a57581730836639341d8c536c6d793bb0f
R2_ACCOUNT_ID=aef01bde77cd4e5689cde7c9784a36ee
STORAGE_BUCKET=luigarah-prod
STORAGE_PUBLIC_BASE_URL=https://aef01bde77cd4e5689cde7c9784a36ee.r2.cloudflarestorage.com/luigarah-prod

# JWT
JWT_SECRET=uWzss1A_PWt4Nojgt8Yfbjxs7gi-K_v5H-_vMKq_CUTyV-HuXx_wo7bHRsXVsr6YD3XEdGjSPdgNChP3vyVwHw
JWT_EXPIRATION=86400000

# Spring
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
TNS_ADMIN=/opt/app/wallet
```

### 4. Configuração `application.properties`

```properties
# Storage - Cloudflare R2
storage.bucket=${STORAGE_BUCKET:luigarah-prod}
storage.publicBaseUrl=${STORAGE_PUBLIC_BASE_URL:}
aws.region=${AWS_REGION:auto-r2}
aws.s3.endpoint=https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
aws.credentials.accessKey=${AWS_ACCESS_KEY_ID}
aws.credentials.secretKey=${AWS_SECRET_ACCESS_KEY}

# Upload limits
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB
```

⚠️ **IMPORTANTE:** Se estiver usando `application-prod.properties`, certifique-se de que o encoding do arquivo está correto (UTF-8).

---

## 🔐 Validações Implementadas

| Validação | Implementação |
|-----------|--------------|
| ✅ Arquivo vazio | `if (file.isEmpty())` → Erro 400 |
| ✅ Tipo de arquivo | Aceita apenas: JPG, JPEG, PNG, WEBP, GIF |
| ✅ Tamanho máximo | Máximo 5MB |
| ✅ Autenticação | JWT obrigatório via `@AuthenticationPrincipal` |
| ✅ Sanitização | Remove `@` e `.` do nome de arquivo |

---

## 📊 Fluxo Completo de Upload

```
┌─────────────────┐
│   1. Frontend   │ ← Usuário seleciona foto
│   envia arquivo │
└────────┬────────┘
         │ FormData com file
         ▼
┌─────────────────────────┐
│ 2. Controller Valida    │
│   - Arquivo vazio?      │
│   - Tipo válido?        │
│   - Tamanho <= 5MB?     │
└────────┬────────────────┘
         │ ✅ Validações OK
         ▼
┌─────────────────────────────────┐
│ 3. ImageStorageService          │
│   gera key única                │
│   "usuarios/admin-luigarah-com" │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 4. Upload para R2       │
│   AWS S3 SDK            │
│   Cloudflare R2 Storage │
└────────┬────────────────┘
         │ URL pública
         ▼
┌──────────────────────────────────────┐
│ 5. R2 retorna URL                    │
│ https://...r2.cloudflarestorage.com/ │
│        luigarah-prod/usuarios/...    │
└────────┬─────────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 6. AuthService          │
│   atualiza banco        │
│   usuario.fotoPerfil    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 7. Retorna sucesso      │
│   com URL da foto       │
└─────────────────────────┘
```

---

## 🧪 Como Testar

### 1. Via Frontend (Recomendado)
   ```
   📤 Upload de foto de perfil - Usuário: admin@luigarah.com
   📦 Arquivo: avatar.jpg (152340 bytes)
   ✅ Upload OK para key='usuarios/admin-luigarah-com.jpg' -> https://pub-xxxxx.r2.dev/usuarios/admin-luigarah-com.jpg
   ✅ Foto salva no storage: https://pub-xxxxx.r2.dev/usuarios/admin-luigarah-com.jpg
   ```
4. **Frontend: Verificar se imagem aparece**

## 🐛 Troubleshooting

### Erro: "Credenciais inválidas"
- Verificar `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`
- Confirmar que as chaves têm permissão no bucket

### Erro: "Bucket não encontrado"
- Verificar `STORAGE_BUCKET`
- Confirmar que bucket existe no Cloudflare R2

### Erro: "Endpoint não responde"
- Verificar `AWS_S3_ENDPOINT`
- Confirmar formato: `https://xxxxx.r2.cloudflarestorage.com`

### Imagem não carrega no frontend
- Verificar `STORAGE_PUBLIC_BASE_URL`
- Confirmar que domínio público está configurado no R2
- Testar URL diretamente no navegador

## 📝 Logs Esperados

### Backend (sucesso):
```
📤 Upload de foto de perfil - Usuário: admin@luigarah.com
📦 Arquivo: avatar.jpg (152340 bytes)
✅ Upload OK para key='usuarios/admin-luigarah-com.jpg'
✅ Foto salva no storage: https://pub-xxxxx.r2.dev/usuarios/admin-luigarah-com.jpg
📸 Atualizando foto de perfil do usuário: admin@luigarah.com
✅ Foto atualizada com sucesso!
```

### Frontend (sucesso):
```
[useAuthUser] Foto de perfil atualizada com sucesso!
✅ Perfil atualizado! Resposta: {
  "fotoPerfil": "https://pub-xxxxx.r2.dev/usuarios/admin-luigarah-com.jpg"
}
```

## 🔐 Segurança

### Validações Implementadas:
- ✅ Tipo de arquivo (MIME type)
- ✅ Tamanho máximo (5MB)
- ✅ Nome de arquivo sanitizado
- ✅ Autenticação JWT obrigatória
- ✅ Upload apenas para conta própria


## 📚 Referências

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [AWS S3 SDK for Java](https://docs.aws.amazon.com/sdk-for-java/)
- [Spring Boot Multipart Upload](https://spring.io/guides/gs/uploading-files/)
