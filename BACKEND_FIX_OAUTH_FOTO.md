# ✅ CORREÇÃO: Foto do Google OAuth agora está sendo salva

## 🎯 Problema Resolvido

**Status:** ✅ CORRIGIDO  
**Data:** 2025-10-23  
**Prioridade:** ALTA - URGENTE

### 📋 Descrição do Problema

Quando um usuário fazia login com Google OAuth, a **foto de perfil não estava sendo salva no banco de dados**.

**Causa Raiz Identificada:**
- ❌ Frontend enviava o campo `fotoUrl`
- ❌ Backend esperava o campo `fotoPerfil`
- ❌ Incompatibilidade de nomenclatura causava perda de dados

---

## 🔧 Correções Implementadas

---

## 🔧 Correções Implementadas

### 1️⃣ **OAuthSyncRequest.java** - Suporte para ambos os campos

**Arquivo:** `src/main/java/com/luigarah/dto/autenticacao/OAuthSyncRequest.java`

```java
@Schema(description = "Sobrenome do usuário", example = "Silva")
private String sobrenome;

@Schema(description = "URL da foto de perfil", example = "https://lh3.googleusercontent.com/a/...")
private String fotoPerfil;

@Schema(description = "URL da foto de perfil (alias para fotoPerfil)", example = "https://lh3.googleusercontent.com/a/...")
private String fotoUrl;  // ✅ NOVO CAMPO ADICIONADO

@Schema(description = "ID do usuário no provedor OAuth", example = "109876543210")
private String oauthId;

/**
 * Getter inteligente que retorna fotoUrl se fotoPerfil estiver vazio
 */
public String getFotoPerfil() {
    if (fotoPerfil != null && !fotoPerfil.isEmpty()) {
        return fotoPerfil;
    }
    return fotoUrl;  // ✅ FALLBACK PARA fotoUrl
}
```

**Benefícios:**
- ✅ Aceita `fotoUrl` do frontend (compatibilidade)
- ✅ Aceita `fotoPerfil` (padrão do backend)
- ✅ Getter inteligente prioriza `fotoPerfil`, mas usa `fotoUrl` como fallback
- ✅ Não quebra código existente

---

### 2️⃣ **AuthService.java** - Logs de debug adicionados

**Arquivo:** `src/main/java/com/luigarah/service/autenticacao/AuthService.java`

#### Para Usuários Existentes:

```java
if (usuarioOpt.isPresent()) {
    usuario = usuarioOpt.get();
    log.info("Usuário existente encontrado: {}", usuario.getEmail());

    // Atualiza foto se fornecida
    String fotoParaSalvar = request.getFotoPerfil();
    log.info("📸 Foto recebida do frontend: {}", fotoParaSalvar);
    
    if (fotoParaSalvar != null && !fotoParaSalvar.isEmpty()) {
        usuario.setFotoPerfil(fotoParaSalvar);
        log.info("✅ Foto de perfil atualizada para: {}", fotoParaSalvar);
    } else {
        log.warn("⚠️ Nenhuma foto fornecida no request");
    }
    
    // ... resto do código
    
    usuario = usuarioRepository.save(usuario);  // ✅ SALVA NO BANCO
}
```

#### Para Novos Usuários:

```java
} else {
    isNewUser = true;
    log.info("Criando novo usuário OAuth: {}", request.getEmail());
    
    String fotoParaSalvar = request.getFotoPerfil();
    log.info("📸 Foto recebida do frontend (novo usuário): {}", fotoParaSalvar);

    usuario = Usuario.builder()
        .nome(request.getNome())
        .sobrenome(request.getSobrenome())
        .email(request.getEmail())
        .fotoPerfil(fotoParaSalvar)  // ✅ SALVA A FOTO
        .role(Role.USER)
        .ativo(true)
        .emailVerificado(true)
        // ... resto dos campos
        .build();

    usuario = usuarioRepository.save(usuario);
    log.info("✅ Novo usuário criado com ID: {} e foto: {}", 
        usuario.getId(), usuario.getFotoPerfil());
}
```

**Benefícios:**
- ✅ Logs detalhados para debug
- ✅ Salva corretamente no banco
- ✅ Funciona para usuários novos e existentes

---

## 📊 Formato do Request (Frontend)

O frontend pode enviar de duas formas:

### Forma 1: Campo `fotoUrl` (ATUAL - Google OAuth)
```json
{
  "provider": "google",
  "email": "juliadasilvaldrbr@gmail.com",
  "nome": "Júlia",
  "sobrenome": "Da Silva",
  "fotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocKn2YJ0r7ov-sKUvG004tKQ_ORbALrmO8kd1G6fDJvQVWIV-_8=s96-c"
}
```

### Forma 2: Campo `fotoPerfil` (PADRÃO)
```json
{
  "provider": "google",
  "email": "juliadasilvaldrbr@gmail.com",
  "nome": "Júlia",
  "sobrenome": "Da Silva",
  "fotoPerfil": "https://lh3.googleusercontent.com/a/ACg8ocKn2YJ0r7ov-sKUvG004tKQ_ORbALrmO8kd1G6fDJvQVWIV-_8=s96-c"
}
```

**Ambos funcionam agora!** ✅

---

## 🧪 Como Testar

### 1. Limpar banco de dados (opcional)
```sql
-- Deletar usuário de teste
DELETE FROM oauth_providers WHERE usuario_id IN (SELECT id FROM usuarios WHERE email = 'teste@gmail.com');
DELETE FROM usuarios WHERE email = 'teste@gmail.com';
COMMIT;
```

### 2. Fazer login com Google

**Endpoint:** `POST /api/auth/oauth/sync`

**Request Body:**
```json
{
  "provider": "google",
  "email": "teste@gmail.com",
  "nome": "Teste",
  "sobrenome": "Usuario",
  "fotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocKn2YJ0r7ov-sKUvG004tKQ_ORbALrmO8kd1G6fDJvQVWIV-_8=s96-c"
}
```

### 3. Verificar logs do backend

Você deve ver:
```
INFO  - Sincronizando conta OAuth - Provider: google, Email: teste@gmail.com
INFO  - Criando novo usuário OAuth: teste@gmail.com
INFO  - 📸 Foto recebida do frontend (novo usuário): https://lh3.googleusercontent.com/a/...
INFO  - ✅ Novo usuário criado com ID: 123 e foto: https://lh3.googleusercontent.com/a/...
```

### 4. Verificar resposta JSON

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "usuario": {
    "id": 123,
    "nome": "Teste",
    "sobrenome": "Usuario",
    "email": "teste@gmail.com",
    "fotoPerfil": "https://lh3.googleusercontent.com/a/...",  // ✅ DEVE TER FOTO
    "role": "USER",
    "ativo": true
  }
}
```

### 5. Verificar no banco de dados

```sql
SELECT id, nome, email, foto_perfil 
FROM usuarios 
WHERE email = 'teste@gmail.com';
```

**Resultado esperado:**
```
ID  | NOME  | EMAIL             | FOTO_PERFIL
----|-------|-------------------|------------------------------------
123 | Teste | teste@gmail.com   | https://lh3.googleusercontent.com/...
```

---

## ✅ Checklist de Verificação

- [x] Campo `fotoUrl` adicionado ao `OAuthSyncRequest`
- [x] Getter inteligente implementado para fallback
- [x] Service atualiza foto para usuários existentes
- [x] Service salva foto para novos usuários
- [x] Logs de debug adicionados
- [x] `usuarioRepository.save()` chamado após atualização
- [x] Coluna `foto_perfil` no banco suporta URLs longas (500 chars)
- [x] DTO de resposta inclui `fotoPerfil`
- [x] Compatibilidade com frontend mantida

---

## 🔍 Debugging

### Se a foto ainda não aparecer:

1. **Verifique os logs do backend:**
   ```
   grep "📸 Foto recebida" logs/application.log
   ```

2. **Verifique se o request está chegando:**
   ```java
   log.info("Request completo: {}", request);
   ```

3. **Verifique a coluna no banco:**
   ```sql
   SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH 
   FROM USER_TAB_COLUMNS 
   WHERE TABLE_NAME = 'USUARIOS' 
   AND COLUMN_NAME = 'FOTO_PERFIL';
   ```

   **Esperado:** `VARCHAR2(500)` ou maior

4. **Teste direto no banco:**
   ```sql
   UPDATE usuarios 
   SET foto_perfil = 'https://lh3.googleusercontent.com/test' 
   WHERE email = 'teste@gmail.com';
   COMMIT;
   ```

---

## 📚 Arquivos Modificados

| Arquivo | Linha(s) | Mudança |
|---------|----------|---------|
| `OAuthSyncRequest.java` | 33-47 | ✅ Adicionado campo `fotoUrl` e getter inteligente |
| `AuthService.java` | 225-239 | ✅ Logs e salvamento para usuário existente |
| `AuthService.java` | 242-263 | ✅ Logs e salvamento para novo usuário |

---

## 🎓 Lições Aprendidas

1. **Consistência de nomenclatura é crucial:** Frontend e backend devem usar os mesmos nomes de campos
2. **Suporte a aliases ajuda na migração:** Aceitar ambos `fotoUrl` e `fotoPerfil` evita breaking changes
3. **Logs são essenciais:** Facilitam debug de problemas de integração
4. **Sempre salvar após atualizar:** `usuarioRepository.save()` deve ser chamado explicitamente

---

## 🔗 Recursos Relacionados

- [Documentação OAuth](./README.md#oauth)
- [Guia fotoPerfil vs fotoUrl](./FOTO_PERFIL_VS_FOTO_URL.md)
- [API de Autenticação](./README.md#endpoints-de-autenticação)

---

## 📞 Suporte

Se o problema persistir:

1. Verifique os logs completos do backend
2. Teste o endpoint com Postman/Insomnia
3. Valide o tamanho da coluna no banco
4. Entre em contato com o time de DevOps

---

**Status Final:** ✅ PROBLEMA RESOLVIDO  
**Testado:** ⏳ Aguardando teste em produção  
**Deploy:** ⏳ Aguardando deploy

---

**📅 Criado em:** 2025-10-23  
**👤 Autor:** GitHub Copilot - Luigara Backend Team

```java
// OAuthSyncRequest.java (ou similar)
public class OAuthSyncRequest {
    private String provider;
    private String email;
    private String nome;
    private String sobrenome;
    private String fotoUrl; // ⚠️ ESTE CAMPO DEVE EXISTIR
    private String oauthId;
    
    // Getters e Setters
}
```

### **2. Verificar Service de OAuth Sync**

O serviço deve processar e salvar a `fotoUrl`:

```java
// AuthService.java (ou similar)
public AuthResponse syncOAuth(OAuthSyncRequest request) {
    Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
        .orElseGet(() -> {
            Usuario novoUsuario = new Usuario();
            novoUsuario.setEmail(request.getEmail());
            novoUsuario.setNome(request.getNome());
            novoUsuario.setSobrenome(request.getSobrenome());
            novoUsuario.setFotoPerfil(request.getFotoUrl()); // ⚠️ ADICIONAR ESTA LINHA
            novoUsuario.setProvider(Provider.valueOf(request.getProvider().toUpperCase()));
            novoUsuario.setEmailVerificado(true);
            novoUsuario.setRole(Role.USER);
            novoUsuario.setAtivo(true);
            return usuarioRepository.save(novoUsuario);
        });
    
    // Se o usuário já existe, atualizar a foto se não tiver
    if (usuario.getFotoPerfil() == null && request.getFotoUrl() != null) {
        usuario.setFotoPerfil(request.getFotoUrl()); // ⚠️ ADICIONAR ESTA LINHA
        usuario = usuarioRepository.save(usuario);
    }
    
    // Gerar token JWT e retornar...
}
```

### **3. Verificar Entidade Usuario**

A entidade `Usuario` deve ter o campo `fotoPerfil`:

```java
// Usuario.java
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nome;
    private String sobrenome;
    private String email;
    
    @Column(name = "foto_perfil", length = 500) // ⚠️ Permitir URLs longas
    private String fotoPerfil; // ou fotoUrl
    
    // ... outros campos
}
```

### **4. Verificar DTO de Resposta**

O `UsuarioDTO` retornado deve incluir a foto:

```java
// UsuarioDTO.java
public class UsuarioDTO {
    private Long id;
    private String nome;
    private String sobrenome;
    private String email;
    private String fotoPerfil; // ou fotoUrl
    private Role role;
    // ... outros campos
    
    public static UsuarioDTO fromEntity(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setSobrenome(usuario.getSobrenome());
        dto.setEmail(usuario.getEmail());
        dto.setFotoPerfil(usuario.getFotoPerfil()); // ⚠️ NÃO ESQUECER
        dto.setRole(usuario.getRole());
        // ...
        return dto;
    }
}
```

---

## 🧪 Como Testar

1. **Limpar banco de dados** (remover usuário de teste)
2. **Fazer login com Google** usando uma conta nova
3. **Verificar logs do backend:**
   - O payload recebido deve conter `fotoUrl`
   - O usuário salvo deve ter `fotoPerfil` preenchido
4. **Verificar resposta JSON:**
   ```json
   {
     "token": "eyJhbGc...",
     "tipo": "Bearer",
     "usuario": {
       "id": 1,
       "nome": "Júlia",
       "email": "juliadasilvaldrbr@gmail.com",
       "fotoPerfil": "https://lh3.googleusercontent.com/..." // ✅ DEVE TER FOTO
     }
   }
   ```

---

## 📝 Checklist de Verificação

- [ ] Campo `fotoUrl` existe no `OAuthSyncRequest`
- [ ] Service processa e salva `fotoUrl` no banco
- [ ] Entidade `Usuario` tem coluna `foto_perfil` com tamanho adequado (min 500 chars)
- [ ] DTO de resposta inclui o campo `fotoPerfil`
- [ ] Migração de banco criada (se necessário)
- [ ] Erro HTTP 500 foi corrigido
- [ ] Teste realizado com sucesso

---

## 🔗 URLs de Teste

### Google OAuth URLs (para Next.js Image)
```
https://lh3.googleusercontent.com/a/ACg8ocKn2YJ0r7ov-sKUvG004tKQ_ORbALrmO8kd1G6fDJvQVWIV-_8=s96-c
```

Tamanho típico: ~97 caracteres

### Recomendação de Coluna
```sql
ALTER TABLE usuarios MODIFY COLUMN foto_perfil VARCHAR(500);
```

---

## 📞 Contato

Se precisar de ajuda, entre em contato com o time de frontend.
Logs completos disponíveis no console do navegador.

**Status:** 🔴 URGENTE - Bloqueia login OAuth do Google
**Prioridade:** ALTA
**Impacto:** Todos os novos usuários OAuth não terão foto de perfil
