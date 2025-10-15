"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import authApi from "@/hooks/api/authApi";
import { userManager } from "@/lib/httpClient";
import { getErrorMessage } from "@/lib/errorUtils";

/* Redux store */
import { store } from "@/store";
import { clearLocal as clearWishlist, syncWishlistFromBackend } from "@/store/wishlistSlice";
import { clearLocal as clearCart, syncCartFromBackend } from "@/store/cartSlice";

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
};

export type StoredUser = {
  name: string;
  email: string;
};

/* Hook */
export function useAuthUser() {
  const { data: session } = useSession();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOAuthUser, setIsOAuthUser] = useState(false); // Novo estado

  /**
   * Sincroniza usuário OAuth com o backend
   * Cria/vincula conta e obtém token JWT
   */
  const syncOAuthWithBackend = useCallback(async (sessionUser: { name?: string | null; email?: string | null; image?: string | null }) => {
    if (!sessionUser?.email) {
      console.warn('[useAuthUser] Sessão OAuth sem e-mail');
      return false;
    }

    try {
      // Log da sessão completa para debug
      console.log('[useAuthUser] 📸 Dados da sessão OAuth:', {
        name: sessionUser.name,
        email: sessionUser.email,
        image: sessionUser.image,
        hasImage: !!sessionUser.image,
      });

      // Separa nome completo em nome e sobrenome
      const fullName = (sessionUser.name || '').trim();
      
      if (!fullName) {
        console.warn('[useAuthUser] Nome não fornecido pelo OAuth');
        return false;
      }

      const nameParts = fullName.split(' ').filter(Boolean);
      const nome = nameParts[0] || 'Usuario';
      const sobrenome = nameParts.slice(1).join(' ');

      // Valida dados obrigatórios
      if (!nome || !sessionUser.email) {
        console.error('[useAuthUser] Dados obrigatórios faltando:', { nome, email: sessionUser.email });
        return false;
      }

      // Validate and prepare foto perfil
      const fotoPerfil = sessionUser.image?.trim() || null;
      
      if (!fotoPerfil) {
        console.warn('[useAuthUser] ⚠️ FOTO DE PERFIL NÃO ENCONTRADA na sessão OAuth!');
      } else {
        console.log('[useAuthUser] ✅ Foto de perfil encontrada:', fotoPerfil);
      }

      // Prepare o payload (com validação extra)
      const payload = {
        provider: 'google' as const,
        email: sessionUser.email,
        nome,
        ...(sobrenome && sobrenome.trim() !== '' && { sobrenome }),
        ...(fotoPerfil && { fotoUrl: fotoPerfil }), // Backend usa 'fotoUrl'
      };

      console.log('[useAuthUser] 🔄 Sincronizando OAuth com backend...');
      console.log('[useAuthUser] 📤 Payload COMPLETO que será enviado:');
      console.log(JSON.stringify(payload, null, 2));

      const response = await authApi.syncOAuth(payload);

      console.log('[useAuthUser] ✅ OAuth sincronizado com sucesso!');
      console.log('[useAuthUser] 👤 Usuário:', response.usuario.nome, response.usuario.email);
      console.log('[useAuthUser] 🖼️ Foto salva no backend:', response.usuario.fotoUrl || '(sem foto)');
      console.log('[useAuthUser] 🔑 Token JWT recebido e salvo!');
      
      return true;
    } catch (error: unknown) {
      // Log detalhado do erro
      const errorMessage = getErrorMessage(error);
      console.error('[useAuthUser] ❌ Erro ao sincronizar OAuth:', errorMessage);
      
      // Verifica tipo de erro
      if (errorMessage.includes('400')) {
        console.error('[useAuthUser] Erro 400: Dados inválidos enviados ao backend');
      } else if (errorMessage.includes('500')) {
        console.error('[useAuthUser] Erro 500: Erro interno do servidor');
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        console.error('[useAuthUser] Erro de autenticação/autorização');
      } else {
        console.error('[useAuthUser] Erro desconhecido:', errorMessage);
      }
      
      return false;
    }
  }, []);

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
      
      const userProfile: UserProfile = {
        id: perfil.id,
        name: `${perfil.nome}${perfil.sobrenome ? ' ' + perfil.sobrenome : ''}`,
        email: perfil.email,
        firstName: perfil.nome,
        lastName: perfil.sobrenome,
        birthDate: perfil.dataNascimento,
        gender: perfil.genero as Gender,
        phone: perfil.telefone,
        image: perfil.fotoUrl || perfil.fotoPerfil, // Backend usa 'fotoUrl'
        role: perfil.role,
        address: perfil.enderecos?.[0] ? {
          country: perfil.enderecos[0].pais,
          state: perfil.enderecos[0].estado,
          city: perfil.enderecos[0].cidade,
          zip: perfil.enderecos[0].cep,
          district: perfil.enderecos[0].bairro,
          street: perfil.enderecos[0].logradouro,
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
        if (!authApi.isAuthenticated()) {
          console.log('[useAuthUser] Tentando sincronizar OAuth com backend...');
          const synced = await syncOAuthWithBackend(session.user);
          
          if (synced) {
            // Agora tem JWT! Carrega perfil e sincroniza dados
            await loadBackendProfile();
            await syncWithBackend();
            setIsOAuthUser(false); // Agora é usuário com JWT
          } else {
            // Falhou a sincronização: cria perfil mínimo local
            setProfile({
              name: u.name,
              email: u.email,
              image: session.user.image,
            });
          }
        } else {
          // Já tem JWT (sincronizado anteriormente)
          await loadBackendProfile();
          await syncWithBackend();
          setIsOAuthUser(false);
        }
      }
      // Prioridade 2: Token JWT (autenticação normal)
      else if (authApi.isAuthenticated()) {
        const currentUser = userManager.get();
        setIsOAuthUser(false); // Usuário com JWT
        
        if (currentUser) {
          setUser({
            name: currentUser.nome,
            email: currentUser.email,
          });

          await loadBackendProfile();
          await syncWithBackend();
        }
      }
      // Sem autenticação: limpa tudo
      else {
        setUser(null);
        setProfile(null);
        setIsOAuthUser(false);
        store.dispatch(clearWishlist());
        store.dispatch(clearCart());
      }

      setLoading(false);
    };

    initAuth();
  }, [session, loadBackendProfile, syncWithBackend, syncOAuthWithBackend]);

  /**
   * Login com credenciais (substituindo onAuthSuccess)
   */
  const login = useCallback(async (email: string, senha: string) => {
    try {
      const response = await authApi.login({ email, senha });
      
      setUser({
        name: response.usuario.nome,
        email: response.usuario.email,
      });

      await loadBackendProfile();
      await syncWithBackend();

      return { success: true, usuario: response.usuario };
    } catch (error: unknown) {
      console.error('[useAuthUser] Erro no login:', error);
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
      const response = await authApi.registrar(dados);
      
      setUser({
        name: response.usuario.nome,
        email: response.usuario.email,
      });

      await loadBackendProfile();
      await syncWithBackend();

      return { success: true, usuario: response.usuario };
    } catch (error: unknown) {
      console.error('[useAuthUser] Erro no registro:', error);
      return { success: false, error: getErrorMessage(error) };
    }
  }, [loadBackendProfile, syncWithBackend]);

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

    // Se tiver sessão NextAuth, desloga também
    if (session) {
      await signOut({ callbackUrl: "/" });
    } else {
      // Redireciona manualmente
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
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
      // NOTA: Backend EXIGE email e senha mesmo para atualização de perfil (bug do backend)
      // Vamos enviar o email atual e uma senha vazia (o backend só valida presença, não usa)
      const updateData = {
        email: currentUser.email,        // ← OBRIGATÓRIO (mesmo sem mudar)
        senha: '',                        // ← OBRIGATÓRIO (backend não usa, só valida presença)
        nome: profileData.firstName,
        sobrenome: profileData.lastName,
        telefone: profileData.phone,
        dataNascimento: profileData.birthDate,
        genero: profileData.gender,
        // fotoUrl NÃO INCLUÍDO - backend não permite atualizar via este endpoint
      };

      console.log('[useAuthUser] 🔧 Tentando atualizar com email e senha vazios...');

      // TODO: Adicionar atualização de endereço quando a API suportar
      // if (profileData.address) { ... }

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
   * Upload de avatar (compatibilidade)
   */
  const setAvatar = useCallback((dataUrl: string | null) => {
    // TODO: Implementar upload de imagem no backend
    setProfile((prev) => prev ? { ...prev, image: dataUrl } : null);
  }, []);

  const isAuthenticated = useMemo(() => authApi.isAuthenticated(), []);

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
    changePassword,
    setAvatar,
    // Compatibilidade com código antigo
    onAuthSuccess: (u: StoredUser) => login(u.email, ''), // Deprecated
  };
}