"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import authApi, { type UsuarioDTO } from "@/hooks/api/authApi";
import { userManager } from "@/lib/httpClient";
import { getErrorMessage } from "@/lib/errorUtils";

/* Redux store */
import { store } from "@/store";
import { clearLocal as clearWishlist, syncWishlistFromBackend } from "@/store/wishlistSlice";
import { clearLocal as clearCart, syncCartFromBackend } from "@/store/cartSlice";

/**
 * Sincronização do login social em andamento. Vários componentes da tela usam este
 * hook ao mesmo tempo (header, botões de carrinho...) e cada um disparava a própria
 * sincronização: no primeiro login chegavam pedidos simultâneos ao backend, um deles
 * falhava e aparecia o aviso de erro mesmo com o login funcionando. Agora todos
 * esperam a mesma requisição.
 */
let sincronizacaoOAuth: Promise<boolean> | null = null;

/* Tipos Locais */
export type Gender = "Masculino" | "Feminino" | "Não Especificado";

export type Address = {
  city?: string;
  country?: string;
  state?: string;
  zip?: string;
  district?: string; // bairro
  street?: string;
  number?: string;
  complement?: string;
};

export type UserProfile = {
  id?: number;
  name: string;
  email: string;
  image?: string | null;
  firstName?: string;
  lastName?: string;
  birthDate?: string; // ISO yyyy-mm-dd
  gender?: Gender;
  phone?: string;
  address?: Address;
  role?: 'USER' | 'ADMIN';
  preferences?: Preferences;
};

/** Preferências salvas no backend (usuarios.receber_novidades / alertas_reposicao) */
export type Preferences = {
  receberNovidades: boolean;
  alertasReposicao: boolean;
};

export type StoredUser = {
  name: string;
  email: string;
  provider?: 'LOCAL' | 'GOOGLE' | 'FACEBOOK' | 'GITHUB';
};

/* Hook */
export function useAuthUser() {
  const { data: session } = useSession();
  const t = useTranslations("auth");
  const [user, setUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ Inicializa isOAuthUser verificando o provider do usuário salvo
  const [isOAuthUser, setIsOAuthUser] = useState(() => {
    if (globalThis.window !== undefined) {
      const currentUser = userManager.get();
      // Se o provider não for LOCAL (ou undefined para retrocompatibilidade), é OAuth
      return currentUser?.provider ? currentUser.provider !== 'LOCAL' : false;
    }
    return false;
  });
  
  // ✅ Inicializa isAuthenticated com verificação síncrona do token
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Verifica se tem token JWT no momento da montagem
    if (globalThis.window !== undefined) {
      return authApi.isAuthenticated();
    }
    return false;
  });

  /** Uma sincronização de fato (chamada só por syncOAuthWithBackend). */
  const sincronizarOAuth = useCallback(async (sessao: Session) => {
    const sessionUser = sessao.user;
    const provider = sessao.provider;

    if (!sessionUser?.email || !sessao.oauthToken || (provider !== 'google' && provider !== 'facebook')) {
      console.warn('[useAuthUser] Sessão OAuth sem token do provedor: é preciso entrar de novo');
      await signOut({ redirect: false });
      return false;
    }

    // Separa nome completo em nome e sobrenome
    const nameParts = (sessionUser.name || '').trim().split(' ').filter(Boolean);
    const nome = nameParts[0] || 'Cliente';
    const sobrenome = nameParts.slice(1).join(' ');
    const fotoPerfil = sessionUser.image?.trim() || null;

    try {
      await authApi.syncOAuth({
        provider,
        token: sessao.oauthToken,
        email: sessionUser.email,
        nome,
        ...(sobrenome && { sobrenome }),
        ...(fotoPerfil && { fotoUrl: fotoPerfil }), // Request usa fotoUrl
      });
      return true;
    } catch (error: unknown) {
      console.error('[useAuthUser] Erro ao sincronizar OAuth:', getErrorMessage(error));
      toast.error(t("socialLoginFailed"));
      await signOut({ redirect: false });
      return false;
    }
  }, [t]);

  /**
   * Sincroniza usuário OAuth com o backend
   * O backend confere o token do provedor (Google/Facebook) antes de gerar o JWT.
   * Sem token válido (sessão antiga, expirada ou recusada) a sessão do NextAuth é
   * encerrada para a pessoa entrar de novo.
   */
  const syncOAuthWithBackend = useCallback((sessao: Session): Promise<boolean> => {
    if (!sincronizacaoOAuth) {
      sincronizacaoOAuth = sincronizarOAuth(sessao).finally(() => {
        sincronizacaoOAuth = null;
      });
    }
    return sincronizacaoOAuth;
  }, [sincronizarOAuth]);

  /**
   * Sincroniza carrinho e wishlist com o backend
   */
  const syncWithBackend = useCallback(async () => {
    if (!authApi.isAuthenticated()) return;

    try {
      // Dispara thunks assíncronos para sincronizar com o backend
      await Promise.all([
        store.dispatch(syncCartFromBackend()),
        store.dispatch(syncWishlistFromBackend()),
      ]);
    } catch (error) {
      console.error('[useAuthUser] Erro ao sincronizar com backend:', error);
    }
  }, []);

  /**
   * Carrega perfil do backend
   */
  const loadBackendProfile = useCallback(async () => {
    try {
      const perfil = await authApi.getPerfil();
      
      // Usa foto diretamente do backend
      const fotoPerfil = perfil.fotoPerfil;

      const userProfile: UserProfile = {
        id: perfil.id,
        name: `${perfil.nome}${perfil.sobrenome ? ' ' + perfil.sobrenome : ''}`,
        email: perfil.email,
        firstName: perfil.nome,
        lastName: perfil.sobrenome,
        birthDate: perfil.dataNascimento,
        gender: (perfil.genero as Gender) || "Não Especificado", // Default se vier null/vazio
        phone: perfil.telefone,
        image: fotoPerfil, // URL sem timestamp (deixa o navegador cachear normalmente)
        role: perfil.role,
        preferences: {
          receberNovidades: perfil.receberNovidades ?? true,
          alertasReposicao: perfil.alertasReposicao ?? false,
        },
        address: perfil.enderecos?.[0] ? {
          country: perfil.enderecos[0].pais,
          state: perfil.enderecos[0].estado,
          city: perfil.enderecos[0].cidade,
          zip: perfil.enderecos[0].cep,
          district: perfil.enderecos[0].bairro,
          street: perfil.enderecos[0].rua, //  Corrigido: backend usa "rua"
          number: perfil.enderecos[0].numero,
          complement: perfil.enderecos[0].complemento,
        } : undefined,
      };

      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error('[useAuthUser] Erro ao carregar perfil:', error);
      return null;
    }
  }, []);

  /**
   * Inicializa autenticação ao montar o componente
   */
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // Prioridade 1: NextAuth (OAuth2)
      if (session?.user) {
        const u: StoredUser = {
          name: session.user.name || "Cliente",
          email: session.user.email || "",
        };
        setUser(u);
        setIsOAuthUser(true); // Marcamos como usuário OAuth

        // Tenta sincronizar com backend se ainda não tiver JWT
        if (authApi.isAuthenticated()) {
          // Já tem JWT! Carrega perfil e sincroniza dados
          await Promise.all([
            loadBackendProfile(),
            syncWithBackend(),
          ]);
          setIsOAuthUser(false);
          setIsAuthenticated(true);
        } else {
          console.log('[useAuthUser] Tentando sincronizar OAuth com backend...');
          const synced = await syncOAuthWithBackend(session);
          
          if (synced) {
            // Agora tem JWT! Carrega perfil e sincroniza dados EM PARALELO
            await Promise.all([
              loadBackendProfile(),
              syncWithBackend(),
            ]);
            setIsOAuthUser(false); // Agora é usuário com JWT
            setIsAuthenticated(true); // OAuth autenticado com sucesso
          } else {
            // Falhou a sincronização: cria perfil mínimo local
            setProfile({
              name: u.name,
              email: u.email,
              image: session.user.image,
            });
            setIsAuthenticated(false); // Falhou a autenticação
          }
        }
      }
      // Prioridade 2: Token JWT (autenticação normal)
      else if (authApi.isAuthenticated()) {
        const currentUser = userManager.get();
        
        // ✅ Define isOAuthUser baseado no provider do usuário
        const isOAuth = currentUser?.provider ? currentUser.provider !== 'LOCAL' : false;
        setIsOAuthUser(isOAuth);
        
        if (currentUser) {
          setUser({
            name: currentUser.nome,
            email: currentUser.email,
          });

          // Carrega perfil e sincroniza dados em paralelo
          await Promise.all([
            loadBackendProfile(),
            syncWithBackend(),
          ]);
          
          setIsAuthenticated(true); // JWT autenticado
        }
      }
      // Sem autenticação: limpa tudo
      else {
        setUser(null);
        setProfile(null);
        setIsOAuthUser(false);
        setIsAuthenticated(false); // Não autenticado
        store.dispatch(clearWishlist());
        store.dispatch(clearCart());
      }

      setLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]); // APENAS session como dependência

  /**
   * Escuta eventos de login/logout para forçar atualização do estado
   */
  useEffect(() => {
    const handleAuthChange = async () => {
      console.log('[useAuthUser] 🔄 Evento auth:changed detectado');
      
      // Força reload do perfil e sincronização
      if (authApi.isAuthenticated()) {
        const currentUser = userManager.get();
        if (currentUser) {
          setUser({
            name: currentUser.nome,
            email: currentUser.email,
          });
          
          // ✅ Define isOAuthUser baseado no provider do usuário
          const isOAuth = currentUser?.provider ? currentUser.provider !== 'LOCAL' : false;
          setIsOAuthUser(isOAuth);
          
          // Recarrega perfil e sincroniza dados
          await Promise.all([
            loadBackendProfile(),
            syncWithBackend(),
          ]);
          
          setIsAuthenticated(true); // Atualiza estado de autenticação
        }
      } else {
        // Logout ou token expirado
        setUser(null);
        setProfile(null);
        setIsOAuthUser(false);
        setIsAuthenticated(false);
      }
    };

    globalThis.addEventListener('luigara:auth:changed', handleAuthChange as EventListener);
    return () => globalThis.removeEventListener('luigara:auth:changed', handleAuthChange as EventListener);
  }, [loadBackendProfile, syncWithBackend]); // Adiciona dependências

  /**
   * Login com credenciais (substituindo onAuthSuccess)
   */
  const login = useCallback(async (email: string, senha: string) => {
    try {
      console.log('[useAuthUser] Iniciando login com email:', email);
      const response = await authApi.login({ email, senha });
      
      console.log('[useAuthUser] Login bem-sucedido, atualizando estado...');
      
      // Atualiza estados imediatamente
      setUser({
        name: response.usuario.nome,
        email: response.usuario.email,
      });
      
      // ✅ Define isOAuthUser baseado no provider do usuário
      const isOAuth = response.usuario.provider ? response.usuario.provider !== 'LOCAL' : false;
      setIsOAuthUser(isOAuth);
      setIsAuthenticated(true); // ✅ Marca como autenticado IMEDIATAMENTE

      // Carrega dados do backend
      await loadBackendProfile();
      await syncWithBackend();

      console.log('[useAuthUser] Estado atualizado com sucesso!');

      // Dispara evento global para outros componentes reagirem
      globalThis.dispatchEvent(new Event('luigara:auth:changed'));

      return { success: true, usuario: response.usuario };
    } catch (error: unknown) {
      console.error('[useAuthUser] Erro no login:', error);
      setIsAuthenticated(false); // ❌ Falhou - garante que está false
      return { success: false, error: getErrorMessage(error) };
    }
  }, [loadBackendProfile, syncWithBackend]);

  /**
   * Registro de novo usuário
   */
  const registrar = useCallback(async (dados: {
    nome: string;
    sobrenome: string;
    email: string;
    senha: string;
    telefone?: string;
    dataNascimento?: string;
    genero?: Gender;
  }) => {
    try {
      console.log('[useAuthUser] Iniciando registro...');
      
      // Garante que gênero seja "Não Especificado" se não fornecido
      const dadosComGenero = {
        ...dados,
        genero: dados.genero || "Não Especificado" as Gender,
      };
      
      const response = await authApi.registrar(dadosComGenero);
      
      console.log('[useAuthUser] Registro bem-sucedido, mas NÃO autenticando automaticamente');
      console.log('[useAuthUser] Usuário precisa verificar email antes de fazer login');
      
      // ❌ NÃO atualiza estados de autenticação
      // ❌ NÃO salva user no estado
      // ❌ NÃO marca como autenticado
      // Usuário precisa verificar email primeiro!
      
      return { success: true, usuario: response.usuario };
    } catch (error: unknown) {
      console.error('[useAuthUser] Erro no registro:', error);
      setIsAuthenticated(false); // ❌ Falhou - garante que está false
      return { success: false, error: getErrorMessage(error) };
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    // Limpa Redux
    store.dispatch(clearWishlist());
    store.dispatch(clearCart());

    // Limpa autenticação
    authApi.logout();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false); // ❌ Limpa estado de autenticação

    // Dispara evento global para outros componentes reagirem
    globalThis.dispatchEvent(new Event('luigara:auth:changed'));

    // Se tiver sessão NextAuth, desloga também
    if (session) {
      await signOut({ callbackUrl: "/" });
      return;
    }
    // Redireciona manualmente
    if (globalThis.window !== undefined) {
      globalThis.location.href = '/';
    }
  }, [session]);

  /**
   * Atualizar perfil localmente (edição em tempo real)
   */
  const updateProfileLocal = useCallback((partial: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...partial,
        // Mescla endereço se fornecido
        ...(partial.address && {
          address: {
            ...prev.address,
            ...partial.address,
          },
        }),
      };
    });
  }, []);

  /**
   * Salvar perfil no backend
   */
  const saveProfile = useCallback(async (profileData: UserProfile) => {
    if (!authApi.isAuthenticated()) {
      console.warn('[useAuthUser] Não autenticado com JWT');
      return { success: false, error: 'Não autenticado com JWT. Use login por e-mail e senha.' };
    }

    try {
      // Pega o usuário atual do localStorage para obter o email
      const currentUser = userManager.get();
      if (!currentUser?.email) {
        console.error('[useAuthUser] Email do usuário não encontrado');
        return { success: false, error: 'Email do usuário não encontrado' };
      }

      // Converte dados para formato do backend
      // NOTA: Backend exige 'senha' mesmo que vazia para atualização
      const updateData: Partial<UsuarioDTO> & { senha?: string } = {
        email: currentUser.email,
        senha: '', // Backend requer este campo
        nome: profileData.firstName,
        sobrenome: profileData.lastName,
        telefone: profileData.phone,
        dataNascimento: profileData.birthDate,
        genero: profileData.gender || "Não Especificado", // Sempre envia "Não Especificado" se vazio
        ...(profileData.preferences && {
          receberNovidades: profileData.preferences.receberNovidades,
          alertasReposicao: profileData.preferences.alertasReposicao,
        }),
        // Adiciona endereço se fornecido
        ...(profileData.address && {
          enderecos: [{
            pais: profileData.address.country,
            estado: profileData.address.state,
            cidade: profileData.address.city,
            cep: profileData.address.zip,
            bairro: profileData.address.district,
            rua: profileData.address.street, //  Corrigido: backend usa "rua", não "logradouro"
            numero: profileData.address.number,
            complemento: profileData.address.complement,
            principal: true, // Define como endereço principal
          }]
        }),
      };

      console.log('[useAuthUser] Enviando dados completos para o backend:', JSON.stringify(updateData, null, 2));

      const updated = await authApi.atualizarPerfil(updateData);
      
      // Recarrega perfil do backend
      await loadBackendProfile();

      return { success: true, usuario: updated };
    } catch (error: unknown) {
      console.error('[useAuthUser] Erro ao salvar perfil:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }, [loadBackendProfile]);

  /**
   * Atualizar perfil (compatibilidade - agora apenas atualiza localmente)
   */
  const updateProfile = updateProfileLocal;

  /**
   * Salva só as preferências (ao marcar/desmarcar), sem exigir o resto do formulário.
   * Atualiza a tela na hora e desfaz se o backend recusar.
   */
  const savePreferences = useCallback(async (preferences: Preferences) => {
    if (!authApi.isAuthenticated()) {
      return { success: false, error: 'Não autenticado' };
    }

    let anteriores: Preferences | undefined;
    setProfile((prev) => {
      anteriores = prev?.preferences;
      return prev ? { ...prev, preferences } : prev;
    });

    try {
      await authApi.atualizarPerfil({
        receberNovidades: preferences.receberNovidades,
        alertasReposicao: preferences.alertasReposicao,
      });
      return { success: true };
    } catch (error: unknown) {
      setProfile((prev) => (prev ? { ...prev, preferences: anteriores } : prev));
      return { success: false, error: getErrorMessage(error) };
    }
  }, []);

  /**
   * Alterar senha
   */
  const changePassword = useCallback(async (senhaAtual: string, novaSenha: string, confirmarNovaSenha: string) => {
    if (!authApi.isAuthenticated()) {
      return { success: false, error: 'Não autenticado' };
    }

    try {
      await authApi.alterarSenha({ senhaAtual, novaSenha, confirmarNovaSenha });
      return { success: true };
    } catch (error: unknown) {
      console.error('[useAuthUser] Erro ao alterar senha:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }, []);

  /**
   * Upload de avatar
   * Recebe um dataURL (base64) da imagem e faz o upload para o backend
   */
  const setAvatar = useCallback(async (dataUrl: string | null) => {
    if (!dataUrl) {
      // Se dataUrl é null, remove a foto
      try {
        await authApi.removerFotoPerfil();
        setProfile((prev) => prev ? { ...prev, image: null } : null);
        return { success: true };
      } catch (error) {
        console.error('[useAuthUser] Erro ao remover foto:', error);
        return { success: false, error: getErrorMessage(error) };
      }
    }

    try {
      // Converte dataURL para File
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });

      // Faz upload
      const result = await authApi.uploadFotoPerfil(file);

      // Recarrega perfil do backend para pegar a URL atualizada com cache-buster
      const updatedProfile = await loadBackendProfile();

      console.log('[useAuthUser] Foto de perfil atualizada com sucesso!');
      return { success: true, fotoPerfil: updatedProfile?.image || result.fotoPerfil };
    } catch (error) {
      console.error('[useAuthUser] Erro ao fazer upload da foto:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }, [loadBackendProfile]);

  // isAuthenticated agora é um estado reativo (declarado no início do hook)
  // Não usa mais useMemo com array vazio que nunca se atualiza!

  return {
    user,
    profile,
    isAuthenticated,
    isOAuthUser,
    loading,
    login,
    registrar,
    logout,
    updateProfile,
    saveProfile,
    savePreferences,
    changePassword,
    setAvatar,
    loadBackendProfile,
    syncWithBackend,
    setIsAuthenticated, // ✅ Expor para VerificarEmailModal poder autenticar após verificação
    // Compatibilidade com código antigo
    onAuthSuccess: (u: StoredUser) => login(u.email, ''), // Deprecated
  };
}