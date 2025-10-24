# 🐛 CORREÇÃO URGENTE: Foto do Google OAuth não está sendo salva no banco

## 📋 Problema Identificado

Quando um usuário faz login com **Google OAuth**, a foto de perfil do Google **está sendo enviada pelo frontend**, mas **não está sendo salva no banco de dados**.

### 🔍 Evidências do Frontend (Logs)

**✅ Frontend está enviando corretamente:**

```json
POST /api/auth/oauth/sync
Content-Type: application/json

{
  "provider": "google",
  "email": "mariaantonietabrsarah@gmail.com",
  "nome": "Maria",
  "sobrenome": "Antonieta",
  "fotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocJJMKr-upRg9CR8-1uljo8fdBP4EYcvxS4JxaHoBpvaA4jYdMA=s96-c"
}
```

**❌ Backend está retornando:**

```json
{
  "token": "eyJhbGc...",
  "tipo": "Bearer",
  "usuario": {
    "id": 50,
    "nome": "Maria",
    "sobrenome": "Antonieta",
    "email": "mariaantonietabrsarah@gmail.com",
    "telefone": null,
    "dataNascimento": null,
    "genero": null,
    "fotoPerfil": null,  // ❌ DEVERIA TER A URL AQUI
    "role": "USER",
    "ativo": true,
    "emailVerificado": true,
    "provider": "GOOGLE",
    "enderecos": []
  }
}
```

---

## 🎯 Solução Necessária

### **1. Verificar/Corrigir o DTO `OAuthSyncRequest`**

**Arquivo:** `src/main/java/com/luigarah/dto/autenticacao/OAuthSyncRequest.java` (ou similar)

```java
package com.luigarah.dto.autenticacao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuthSyncRequest {
    private String provider;      // "google", "facebook", etc.
    private String email;          // Email do usuário
    private String nome;           // Primeiro nome
    private String sobrenome;      // Sobrenome (opcional)
    private String fotoUrl;        // ⚠️ URL da foto do Google (ADICIONAR SE NÃO EXISTIR)
    private String oauthId;        // ID do provider (opcional)
}
```

---

### **2. Corrigir o Controller `ControladorAutenticacao`**

**Arquivo:** `src/main/java/com/luigarah/controller/autenticacao/ControladorAutenticacao.java`

**Endpoint:** `POST /api/auth/oauth/sync`

```java
@PostMapping("/oauth/sync")
public ResponseEntity<AuthResponse> syncOAuth(
    @RequestBody @Valid OAuthSyncRequest request
) {
    try {
        // Log para debug
        log.info("📥 Recebendo sincronização OAuth:");
        log.info("   Email: {}", request.getEmail());
        log.info("   Nome: {} {}", request.getNome(), request.getSobrenome());
        log.info("   Foto URL: {}", request.getFotoUrl()); // ⚠️ ADICIONAR LOG
        
        // Chama o service
        AuthResponse response = authService.syncOAuth(request);
        
        // Log da resposta
        log.info("✅ OAuth sincronizado! Foto salva: {}", 
                 response.getUsuario().getFotoPerfil()); // ⚠️ VERIFICAR SE TEM FOTO
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        log.error("❌ Erro ao sincronizar OAuth: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(null);
    }
}
```

---

### **3. Corrigir o Service `AuthService`**

**Arquivo:** `src/main/java/com/luigarah/service/autenticacao/AuthService.java`

**Método:** `syncOAuth()`

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    
    @Transactional
    public AuthResponse syncOAuth(OAuthSyncRequest request) {
        String email = request.getEmail();
        String nome = request.getNome();
        String sobrenome = request.getSobrenome();
        String fotoUrl = request.getFotoUrl(); // ⚠️ CAPTURAR fotoUrl
        String provider = request.getProvider();
        
        log.info("🔄 Processando sincronização OAuth para: {}", email);
        log.info("📸 Foto URL recebida: {}", fotoUrl); // ⚠️ LOG DE DEBUG
        
        // Busca ou cria o usuário
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseGet(() -> {
                log.info("✨ Criando novo usuário OAuth: {}", email);
                
                Usuario novoUsuario = new Usuario();
                novoUsuario.setEmail(email);
                novoUsuario.setNome(nome);
                novoUsuario.setSobrenome(sobrenome);
                novoUsuario.setFotoPerfil(fotoUrl); // ⚠️ SALVAR FOTO AQUI
                novoUsuario.setProvider(Provider.valueOf(provider.toUpperCase()));
                novoUsuario.setEmailVerificado(true);
                novoUsuario.setRole(Role.USER);
                novoUsuario.setAtivo(true);
                
                Usuario salvo = usuarioRepository.save(novoUsuario);
                log.info("✅ Usuário criado com ID: {} | Foto: {}", 
                         salvo.getId(), salvo.getFotoPerfil());
                
                return salvo;
            });
        
        // ⚠️ IMPORTANTE: Se usuário já existe mas não tem foto, atualizar
        if (usuario.getFotoPerfil() == null && fotoUrl != null && !fotoUrl.isBlank()) {
            log.info("🔄 Atualizando foto do usuário existente: {}", email);
            usuario.setFotoPerfil(fotoUrl);
            usuario = usuarioRepository.save(usuario);
            log.info("✅ Foto atualizada: {}", usuario.getFotoPerfil());
        }
        
        // Gerar token JWT
        String token = jwtService.generateToken(usuario);
        
        // Converter para DTO
        UsuarioDTO usuarioDTO = usuarioMapper.toDto(usuario);
        
        return AuthResponse.builder()
            .token(token)
            .tipo("Bearer")
            .usuario(usuarioDTO)
            .build();
    }
}
```

---

### **4. Verificar a Entidade `Usuario`**

**Arquivo:** `src/main/java/com/luigarah/model/autenticacao/Usuario.java`

```java
@Entity
@Table(name = "USUARIOS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USUARIO_ID")
    private Long id;
    
    @Column(name = "NOME", nullable = false, length = 100)
    private String nome;
    
    @Column(name = "SOBRENOME", length = 100)
    private String sobrenome;
    
    @Column(name = "EMAIL", unique = true, nullable = false, length = 255)
    private String email;
    
    @Column(name = "FOTO_PERFIL", length = 500) // ⚠️ VERIFICAR SE EXISTE E TEM TAMANHO ADEQUADO
    private String fotoPerfil;
    
    // ... outros campos
}
```

**⚠️ IMPORTANTE:** A coluna `FOTO_PERFIL` precisa ter pelo menos **500 caracteres** de tamanho, pois URLs do Google podem ser longas.

---

### **5. Verificar o Mapper `UsuarioMapper`**

**Arquivo:** `src/main/java/com/luigarah/mapper/usuario/UsuarioMapper.java`

```java
@Mapper(componentModel = "spring")
public interface UsuarioMapper {
    
    default UsuarioDTO toDto(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        
        return UsuarioDTO.builder()
            .id(usuario.getId())
            .nome(usuario.getNome())
            .sobrenome(usuario.getSobrenome())
            .email(usuario.getEmail())
            .telefone(usuario.getTelefone())
            .dataNascimento(usuario.getDataNascimento())
            .genero(usuario.getGenero())
            .fotoPerfil(usuario.getFotoPerfil()) // ⚠️ VERIFICAR SE ESTÁ MAPEANDO
            .role(usuario.getRole())
            .ativo(usuario.isAtivo())
            .emailVerificado(usuario.isEmailVerificado())
            .provider(usuario.getProvider())
            .enderecos(usuario.getEnderecos() != null 
                       ? usuario.getEnderecos().stream()
                           .map(this::enderecoToDto)
                           .collect(Collectors.toList()) 
                       : Collections.emptyList())
            .build();
    }
}
```

---

### **6. Verificar o DTO de Resposta `UsuarioDTO`**

**Arquivo:** `src/main/java/com/luigarah/dto/usuario/UsuarioDTO.java`

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String nome;
    private String sobrenome;
    private String email;
    private String telefone;
    private LocalDate dataNascimento;
    private String genero;
    private String fotoPerfil; // ⚠️ DEVE TER ESTE CAMPO
    private Role role;
    private Boolean ativo;
    private Boolean emailVerificado;
    private Provider provider;
    private List<EnderecoDTO> enderecos;
}
```

---

## 🗄️ Verificar Banco de Dados Oracle

### **Verificar estrutura da tabela:**

```sql
DESC USUARIOS;
```

**Deve ter:**
```
FOTO_PERFIL VARCHAR2(500)
```

### **Se a coluna não existe ou é muito pequena:**

```sql
-- Se não existe
ALTER TABLE USUARIOS ADD FOTO_PERFIL VARCHAR2(500);

-- Se é muito pequena (menos de 500 chars)
ALTER TABLE USUARIOS MODIFY FOTO_PERFIL VARCHAR2(500);
```

### **Verificar dados após login:**

```sql
SELECT 
    USUARIO_ID,
    NOME,
    EMAIL,
    FOTO_PERFIL,
    PROVIDER
FROM USUARIOS 
WHERE EMAIL = 'mariaantonietabrsarah@gmail.com';
```

**Resultado esperado:**
```
USUARIO_ID | NOME  | EMAIL                           | FOTO_PERFIL                                    | PROVIDER
-----------|-------|----------------------------------|------------------------------------------------|----------
50         | Maria | mariaantonietabrsarah@gmail.com | https://lh3.googleusercontent.com/a/ACg8oc... | GOOGLE
```

---

## 🧪 Como Testar

### **1. Limpar dados de teste antigos:**

```sql
DELETE FROM USUARIOS WHERE EMAIL IN (
    'mariaantonietabrsarah@gmail.com',
    'juliadasilvaldrbr@gmail.com'
);
COMMIT;
```

### **2. Fazer login com Google:**

1. Acesse: `http://localhost:3000/login`
2. Clique em "Entrar com Google"
3. Use uma conta Google com foto de perfil

### **3. Verificar logs do backend:**

Deve aparecer:
```
📥 Recebendo sincronização OAuth:
   Email: mariaantonietabrsarah@gmail.com
   Nome: Maria Antonieta
   Foto URL: https://lh3.googleusercontent.com/a/ACg8ocJJMKr-upRg9CR8-1uljo8fdBP4EYcvxS4JxaHoBpvaA4jYdMA=s96-c

✨ Criando novo usuário OAuth: mariaantonietabrsarah@gmail.com
✅ Usuário criado com ID: 50 | Foto: https://lh3.googleusercontent.com/a/ACg8oc...
✅ OAuth sincronizado! Foto salva: https://lh3.googleusercontent.com/a/ACg8oc...
```

### **4. Verificar resposta da API:**

```json
{
  "token": "eyJhbGc...",
  "tipo": "Bearer",
  "usuario": {
    "id": 50,
    "nome": "Maria",
    "sobrenome": "Antonieta",
    "email": "mariaantonietabrsarah@gmail.com",
    "fotoPerfil": "https://lh3.googleusercontent.com/a/ACg8ocJJMKr-upRg9CR8-1uljo8fdBP4EYcvxS4JxaHoBpvaA4jYdMA=s96-c",
    "role": "USER",
    "ativo": true,
    "emailVerificado": true,
    "provider": "GOOGLE"
  }
}
```

### **5. Verificar no banco:**

```sql
SELECT FOTO_PERFIL 
FROM USUARIOS 
WHERE EMAIL = 'mariaantonietabrsarah@gmail.com';
```

Deve retornar a URL completa do Google.

---

## 📝 Checklist de Implementação

- [ ] DTO `OAuthSyncRequest` tem campo `fotoUrl`
- [ ] Controller captura `fotoUrl` do request
- [ ] Service salva `fotoUrl` no campo `fotoPerfil`
- [ ] Service atualiza foto se usuário já existe sem foto
- [ ] Entidade `Usuario` tem coluna `FOTO_PERFIL` com 500+ chars
- [ ] Mapper inclui `fotoPerfil` no DTO de resposta
- [ ] DTO `UsuarioDTO` tem campo `fotoPerfil`
- [ ] Coluna existe no banco Oracle com tamanho adequado
- [ ] Logs de debug adicionados para rastreamento
- [ ] Teste realizado com sucesso
- [ ] Foto aparece no frontend após login
- [ ] Foto persiste no banco de dados

---

## 🔗 Exemplos de URLs do Google

URLs típicas de foto do Google OAuth:
```
https://lh3.googleusercontent.com/a/ACg8ocJJMKr-upRg9CR8-1uljo8fdBP4EYcvxS4JxaHoBpvaA4jYdMA=s96-c
```

**Tamanho:** ~97 caracteres (pode variar)  
**Recomendação:** Coluna com 500 caracteres para segurança

---

## 🆘 Troubleshooting

### Problema: Coluna não existe
```
ORA-00904: "FOTO_PERFIL": invalid identifier
```
**Solução:** Executar `ALTER TABLE USUARIOS ADD FOTO_PERFIL VARCHAR2(500);`

### Problema: Valor muito grande
```
ORA-12899: value too large for column "FOTO_PERFIL" (actual: 97, maximum: 50)
```
**Solução:** Executar `ALTER TABLE USUARIOS MODIFY FOTO_PERFIL VARCHAR2(500);`

### Problema: Foto ainda null no banco
**Solução:** Verificar se:
1. DTO `OAuthSyncRequest` tem getter para `fotoUrl`
2. Service está chamando `setFotoPerfil(fotoUrl)`
3. `usuarioRepository.save()` está sendo executado

---

## 📞 Suporte

**Status:** 🔴 CRÍTICO - Bloqueia login OAuth completo  
**Prioridade:** ALTA  
**Impacto:** Todos os usuários OAuth não têm foto de perfil  
**Frontend:** ✅ Já corrigido e testado  
**Backend:** ❌ Aguardando implementação  

**Contato:** Time de Frontend (logs completos disponíveis)

---

**📅 Última atualização:** 23/10/2025  
**🎯 Objetivo:** Salvar foto do Google OAuth no banco de dados Oracle
