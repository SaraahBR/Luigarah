import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";

import {
  wishlistReducer,
  hydrate as hydrateWishlist,
  clear as clearWishlist,
} from "./wishlistSlice";
import {
  cartReducer,
  hydrate as hydrateCart,
  clear as clearCart,
} from "./cartSlice";
// RTK Query (endpoints bolsas/roupas/sapatos)
import { productsApi } from "./productsApi";
// Nova API para produtos do backend
import { produtosApi } from "../hooks/api/produtosApi";
// Nova API para identidades
import { identidadesApi } from "../hooks/api/identidadesApi";

// Tipos fortes dos itens (usados na reidratação)
import type { WishlistItem } from "./wishlistSlice";
import type { CartItem } from "./cartSlice";

// Persistência por CONTA (email)
import { loadAccountSnapshot } from "./accountStorage";

// ------------------------------------------------------------------
// SINGLETON: garante 1 única store/persistor no client
// ------------------------------------------------------------------
declare global {
  interface Window {
    __LUIGARA_STORE__?: ReturnType<typeof makeStore>;
    __LUIGARA_PERSISTOR__?: ReturnType<typeof persistStore>;
  }
}

const rootReducer = combineReducers({
  wishlist: wishlistReducer,
  cart: cartReducer,
  // RTK Query reducer (produtos mockados - manter por compatibilidade)
  [productsApi.reducerPath]: productsApi.reducer,
  // Nova API para produtos do backend
  [produtosApi.reducerPath]: produtosApi.reducer,
  // Nova API para identidades
  [identidadesApi.reducerPath]: identidadesApi.reducer,
});

const persistConfig = {
  key: "luigara:redux",
  storage,
  whitelist: [], // Não persistir wishlist e cart globalmente - usar sistema de conta
  blacklist: [productsApi.reducerPath, produtosApi.reducerPath, identidadesApi.reducerPath, "wishlist", "cart"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

function makeStore() {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefault) =>
      getDefault({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      })
      .concat(productsApi.middleware)
      .concat(produtosApi.middleware)
      .concat(identidadesApi.middleware), // Adicionar middleware das APIs
    devTools: process.env.NODE_ENV !== "production",
  });
}

// Store singleton (client)
let _store: ReturnType<typeof makeStore>;
if (typeof window !== "undefined") {
  _store = window.__LUIGARA_STORE__ ||= makeStore();
} else {
  _store = makeStore();
}
export const store = _store;

// Persistor singleton (client only)
let _persistor: ReturnType<typeof persistStore> | null = null;
if (typeof window !== "undefined") {
  _persistor = window.__LUIGARA_PERSISTOR__ ||= persistStore(store);
}
export const persistor = _persistor as ReturnType<typeof persistStore>;

// Tipos
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ------------------------------------------------------------------
// Reidratar estado por CONTA do usuário (login/logout/troca)
// ------------------------------------------------------------------
/**
 * Reidrata wishlist e carrinho com o snapshot salvo da CONTA (email).
 * - Se email for falsy: limpa wishlist e carrinho (logout).
 * - Se houver snapshot salvo para o email: aplica no Redux.
 * - Caso não exista snapshot: zera estados.
 */
export async function rehydrateAccountForUser(email?: string | null) {
  if (typeof window === "undefined") return;

  try {
    if (!email?.trim()) {
      // Logout: limpa estados
      store.dispatch(clearWishlist());
      store.dispatch(clearCart());
      return;
    }

    const snap = loadAccountSnapshot(email.trim());
    if (snap) {
      // Tipagem forte nos objetos
      const wl = (snap.wishlist?.items ?? {}) as Record<string, WishlistItem>;
      const ct = (snap.cart?.items ?? {}) as Record<string, CartItem>;

      store.dispatch(hydrateWishlist(wl));
      store.dispatch(hydrateCart(ct));
    } else {
      // Sem snapshot salvo: zera (importante para evitar dados de outros usuários)
      store.dispatch(clearWishlist());
      store.dispatch(clearCart());
    }
  } catch (error) {
    // Em qualquer problema, limpa os estados para evitar dados inconsistentes
    console.error(`[Store] Erro na reidratação para ${email}:`, error);
    store.dispatch(clearWishlist());
    store.dispatch(clearCart());
  }
}
