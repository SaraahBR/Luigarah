"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import type { StoredUser } from "./storage";
import { loadUser, saveUser, clearUser } from "./storage";

/* Perfil (Minha Conta) */
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
  name: string;
  email: string;
  image?: string | null; // foto do NextAuth (google/facebook) ou upload local (dataURL)
  firstName?: string;
  lastName?: string;
  birthDate?: string; // ISO yyyy-mm-dd
  gender?: Gender;
  phone?: string;
  address?: Address;
};

const PROFILE_KEY = "luigara:profile";
const AVATAR_KEY = "luigara:avatar"; // dataURL quando o usuário faz upload manual

function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function loadAvatar(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AVATAR_KEY);
}
function saveAvatar(dataUrl: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AVATAR_KEY, dataUrl);
}
function clearAvatar() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AVATAR_KEY);
}

/* Redux store e helpers para reidratar e limpar no logout */
import { store, rehydrateAccountForUser } from "@/store";
import { clear as clearWishlist } from "@/store/wishlistSlice";
import { clear as clearCart } from "@/store/cartSlice";
import { saveAccountSnapshot } from "@/store/accountStorage";

/* Hook */
export function useAuthUser() {
  const { data: session } = useSession();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // sincroniza sessão e fallback localStorage
  useEffect(() => {
    const lsUser = loadUser();
    if (session?.user) {
      const u: StoredUser = {
        name: session.user.name || "Cliente",
        email: session.user.email || "",
      };
      setUser(u);

      // Perfil existente
      const existing = loadProfile();
      const uploadedAvatar = loadAvatar();

      // monta perfil base com possíveis dados sociais
      const base: UserProfile = {
        name: u.name,
        email: u.email,
        image: uploadedAvatar || session.user.image || existing?.image || null,
        firstName: existing?.firstName,
        lastName: existing?.lastName,
        birthDate: existing?.birthDate,
        gender: existing?.gender,
        phone: existing?.phone,
        address: existing?.address,
      };
      setProfile(base);
      saveProfile(base);

      // 🔄 Reidrata Redux (wishlist/cart) da CONTA do usuário com delay
      if (u.email) {
        setTimeout(() => rehydrateAccountForUser(u.email), 100);
      }
    } else {
      // sem NextAuth aqui: cai no mock
      const fallback = lsUser;
      setUser(fallback);

      const existing = loadProfile();
      const uploadedAvatar = loadAvatar();

      if (fallback) {
        const base: UserProfile = {
          name: existing?.name || fallback.name,
          email: existing?.email || fallback.email,
          image: uploadedAvatar || existing?.image || null,
          firstName: existing?.firstName,
          lastName: existing?.lastName,
          birthDate: existing?.birthDate,
          gender: existing?.gender,
          phone: existing?.phone,
          address: existing?.address,
        };
        setProfile(base);

        // 🔄 Reidrata Redux do mock (também salva por e-mail) com delay
        if (fallback.email) {
          setTimeout(() => rehydrateAccountForUser(fallback.email), 100);
        }
      } else {
        setProfile(existing);
        // Se não há usuário, garante que Redux esteja limpo
        setTimeout(() => rehydrateAccountForUser(null), 100);
      }
    }
  }, [session]);

  // 🔄 Auto-salva wishlist/cart sempre que o estado Redux mudar (usuário logado)
  useEffect(() => {
    if (typeof window === "undefined" || !user?.email) return;

    const email = user.email.trim();
    if (!email) return;

    let isInitializing = true;
    
    // Permite que a reidratação inicial aconteça sem salvar
    setTimeout(() => {
      isInitializing = false;
    }, 200);

    // Escuta mudanças no Redux e salva snapshot automaticamente
    const unsubscribe = store.subscribe(() => {
      if (isInitializing) return; // Não salva durante reidratação inicial
      
      const current = store.getState();
      saveAccountSnapshot(email, {
        wishlist: current.wishlist,
        cart: current.cart,
      });
    });

    return () => unsubscribe();
  }, [user?.email]);

  // login mockado por e-mail/senha
  function onAuthSuccess(u: StoredUser) {
    saveUser(u);
    setUser(u);

    const uploadedAvatar = loadAvatar();
    const merged: UserProfile = {
      name: u.name,
      email: u.email,
      image: uploadedAvatar || null,
      ...(loadProfile() || {}),
    };
    setProfile(merged);
    saveProfile(merged);

    // 🔄 Reidrata Redux (wishlist/cart) da CONTA do usuário com delay
    if (u.email) {
      setTimeout(() => rehydrateAccountForUser(u.email), 100);
    }
  }

  async function logout() {
    // Salva um snapshot final da CONTA antes de limpar o Redux
    const current = store.getState();
    const email = (user?.email || "").trim();
    if (email) {
      saveAccountSnapshot(email, {
        wishlist: current.wishlist,
        cart: current.cart,
      });
    }

    // 🔁 PRIMEIRO: Limpa estados Redux para evitar que dados apareçam na UI
    store.dispatch(clearWishlist());
    store.dispatch(clearCart());

    // Limpa perfil/usuário locais
    clearUser();
    clearAvatar();
    setUser(null);
    setProfile(null);

    // Força reidratação vazia (importante!)
    await rehydrateAccountForUser(null);

    // Redireciona sessão do NextAuth
    await signOut({ callbackUrl: "/" });
  }

  // atualizar campos do perfil na Minha Conta
  function updateProfile(partial: Partial<UserProfile>) {
    setProfile((prev) => {
      const next = { ...(prev || {}), ...partial } as UserProfile;
      saveProfile(next);
      // mantém "user.name" sincronizado quando mudar o nome completo
      if (next?.name && user?.name !== next.name) {
        saveUser({ name: next.name, email: next.email });
        setUser({ name: next.name, email: next.email });
      }
      return next;
    });
  }

  // seta o avatar local (upload)
  function setAvatar(dataUrl: string | null) {
    if (dataUrl) {
      saveAvatar(dataUrl);
      updateProfile({ image: dataUrl });
    } else {
      clearAvatar();
      updateProfile({ image: null });
    }
  }

  const isAuthenticated = useMemo(() => Boolean(user?.email), [user]);

  return { user, profile, isAuthenticated, onAuthSuccess, logout, updateProfile, setAvatar };
}
