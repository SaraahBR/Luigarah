"use client";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import listaDesejoApi, { listaDesejoListToRecord } from "@/hooks/api/listaDesejoApi";
import authApi from "@/hooks/api/authApi";
import { getErrorMessage } from "@/lib/errorUtils";

export type Tipo = "roupas" | "bolsas" | "sapatos";

export type WishlistItem = {
  id: number;
  tipo: Tipo;
  title?: string;
  subtitle?: string;
  img?: string;
  backendId?: number; // ID do item no backend
};

type WishlistState = {
  // Chave composta "tipo:id" para evitar colisão entre categorias
  items: Record<string, WishlistItem>;
  loading: boolean;
  error: string | null;
};

const initialState: WishlistState = { 
  items: {},
  loading: false,
  error: null,
};

// ========================================================================
// ASYNC THUNKS - Operações que sincronizam com o backend
// ========================================================================

/**
 * Sincroniza a lista de desejos do backend (executado no login)
 */
export const syncWishlistFromBackend = createAsyncThunk(
  "wishlist/syncFromBackend",
  async (_, { rejectWithValue }) => {
    try {
      if (!authApi.isAuthenticated()) {
        return {};
      }
      
      const items = await listaDesejoApi.listarItens();
      return listaDesejoListToRecord(items);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Adiciona/Remove item da lista de desejos (toggle)
 */
export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async (
    payload: WishlistItem,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { wishlist: WishlistState };
      const key = `${payload.tipo}:${payload.id}`;
      const exists = state.wishlist.items[key];

      // Se autenticado, sincroniza com backend
      if (authApi.isAuthenticated()) {
        if (exists) {
          // Remove do backend
          if (exists.backendId) {
            await listaDesejoApi.removerItem(exists.backendId);
          } else {
            await listaDesejoApi.removerPorProduto(payload.id);
          }
          return { action: 'remove' as const, key, item: null };
        } else {
          // Adiciona no backend
          const item = await listaDesejoApi.adicionarItem(payload.id);
          return { 
            action: 'add' as const, 
            key, 
            item: {
              ...payload,
              backendId: item.id,
            }
          };
        }
      }

      // Modo offline: toggle local
      return { 
        action: exists ? 'remove' as const : 'add' as const, 
        key, 
        item: exists ? null : payload 
      };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Remove item da lista de desejos
 */
export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (
    payload: { id: number; tipo: Tipo; backendId?: number },
    { rejectWithValue }
  ) => {
    try {
      // Se autenticado, remove do backend
      if (authApi.isAuthenticated()) {
        if (payload.backendId) {
          await listaDesejoApi.removerItem(payload.backendId);
        } else {
          await listaDesejoApi.removerPorProduto(payload.id);
        }
      }

      return { id: payload.id, tipo: payload.tipo };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Limpa a lista de desejos completamente
 */
export const clearWishlist = createAsyncThunk(
  "wishlist/clear",
  async (_, { rejectWithValue }) => {
    try {
      // Se autenticado, limpa no backend
      if (authApi.isAuthenticated()) {
        await listaDesejoApi.limparLista();
      }

      return;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ========================================================================
// SLICE
// ========================================================================

const slice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Hidrata inteiramente a wishlist a partir de um dicionário (para login por conta)
    hydrate(state, action: PayloadAction<Record<string, WishlistItem>>) {
      state.items = action.payload || {};
      state.loading = false;
      state.error = null;
    },
    
    // Ações síncronas para uso local (modo offline)
    toggleLocal(state, action: PayloadAction<WishlistItem>) {
      const { id, tipo } = action.payload;
      const key = `${tipo}:${id}`;
      if (state.items[key]) {
        delete state.items[key];
      } else {
        state.items[key] = action.payload;
      }
    },
    
    removeLocal(state, action: PayloadAction<{ id: number; tipo: Tipo }>) {
      const { id, tipo } = action.payload;
      const key = `${tipo}:${id}`;
      delete state.items[key];
    },
    
    clearLocal(state) {
      state.items = {};
    },
  },
  
  extraReducers: (builder) => {
    // syncWishlistFromBackend
    builder
      .addCase(syncWishlistFromBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncWishlistFromBackend.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(syncWishlistFromBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // toggleWishlist
    builder
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { action: op, key, item } = action.payload;
        
        if (op === 'add' && item) {
          state.items[key] = item;
        } else if (op === 'remove') {
          delete state.items[key];
        }
        
        state.loading = false;
        state.error = null;
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // removeFromWishlist
    builder
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        const { id, tipo } = action.payload;
        const key = `${tipo}:${id}`;
        delete state.items[key];
      });

    // clearWishlist
    builder
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = {};
      });
  },
});

export const { 
  hydrate, 
  toggleLocal, 
  removeLocal, 
  clearLocal 
} = slice.actions;

// Aliases para os async thunks (para compatibilidade com código legado)
export const toggle = toggleWishlist;
export const remove = removeFromWishlist;
export const clear = clearWishlist;

export const wishlistReducer = slice.reducer;

// SELECTORS
export const selectWishlistItems = (s: { wishlist: WishlistState }) => Object.values(s.wishlist.items);

// Checa se um produto está na wishlist
export const selectIsInWishlist =
  (id: number, tipo: Tipo) =>
  (s: { wishlist: WishlistState }) => {
    const key = `${tipo}:${id}`;
    return Boolean(s.wishlist.items[key]);
  };

export const selectWishlistCount = (s: { wishlist: WishlistState }) => Object.keys(s.wishlist.items).length;

export const selectWishlistLoading = (s: { wishlist: WishlistState }) => s.wishlist.loading;

export const selectWishlistError = (s: { wishlist: WishlistState }) => s.wishlist.error;
