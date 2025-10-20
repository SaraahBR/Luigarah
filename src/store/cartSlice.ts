"use client";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Tipo } from "./wishlistSlice";
import carrinhoApi, { carrinhoListToRecord } from "@/hooks/api/carrinhoApi";
import authApi from "@/hooks/api/authApi";
import { getErrorMessage } from "@/lib/errorUtils";

// Tipagem dos itens do carrinho
export type CartItem = {
  id: number;
  tipo: Tipo;
  key: string;           // "tipo:id"
  qty: number;
  title?: string;
  subtitle?: string;
  img?: string;
  preco?: number;
  backendId?: number;    // ID do item no backend
  tamanhoId?: number;    // ID do tamanho selecionado
};

type CartState = {
  items: Record<string, CartItem>; // key -> item
  loading: boolean;
  error: string | null;
};

const initialState: CartState = { 
  items: {},
  loading: false,
  error: null,
};

// Helpers
function makeKey(tipo: Tipo, id: number) {
  return `${tipo}:${id}`;
}

// ========================================================================
// ASYNC THUNKS - Operações que sincronizam com o backend
// ========================================================================

/**
 * Sincroniza o carrinho do backend (executado no login)
 */
export const syncCartFromBackend = createAsyncThunk(
  "cart/syncFromBackend",
  async (_, { rejectWithValue }) => {
    try {
      if (!authApi.isAuthenticated()) {
        return {};
      }
      
      const items = await carrinhoApi.listarItens();
      return carrinhoListToRecord(items);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Adiciona um item ao carrinho (local + backend)
 */
export const addToCart = createAsyncThunk(
  "cart/add",
  async (
    payload: {
      id: number;
      tipo: Tipo;
      qty?: number;
      title?: string;
      subtitle?: string;
      img?: string;
      preco?: number;
      tamanhoId?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      // Se autenticado, adiciona no backend
      if (authApi.isAuthenticated()) {
        const item = await carrinhoApi.adicionarItem({
          produtoId: payload.id,
          quantidade: payload.qty || 1,
          tamanhoId: payload.tamanhoId,
        });

        const tipo = payload.tipo;
        return {
          id: payload.id,
          tipo,
          key: makeKey(tipo, payload.id),
          qty: item.quantidade,
          title: payload.title || item.produto.titulo,
          subtitle: payload.subtitle || item.tamanho?.etiqueta,
          img: payload.img || item.produto.imagem,
          preco: payload.preco || item.produto.preco,
          backendId: item.id,
          tamanhoId: item.tamanho?.id,
        };
      }

      // Modo offline: adiciona apenas localmente
      const key = makeKey(payload.tipo, payload.id);
      return {
        ...payload,
        key,
        qty: payload.qty || 1,
      };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Atualiza a quantidade de um item (local + backend)
 */
export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async (
    payload: { id: number; tipo: Tipo; qty: number; backendId?: number },
    { rejectWithValue }
  ) => {
    try {
      // Se autenticado e tem backendId, atualiza no backend
      if (authApi.isAuthenticated() && payload.backendId) {
        await carrinhoApi.atualizarQuantidade(payload.backendId, payload.qty);
      }

      return { id: payload.id, tipo: payload.tipo, qty: payload.qty };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Remove um item do carrinho (local + backend)
 */
export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (
    payload: { id: number; tipo: Tipo; backendId?: number },
    { rejectWithValue }
  ) => {
    try {
      // Se autenticado e tem backendId, remove do backend
      if (authApi.isAuthenticated() && payload.backendId) {
        try {
          await carrinhoApi.removerItem(payload.backendId);
        } catch (error: unknown) {
          // Ignora 404 ao remover (item já não existe no backend)
          const errorStr = String(error);
          if (!errorStr.includes('404')) {
            throw error; // Re-lança se não for 404
          }
          // Silencioso - 404 é esperado ao remover
        }
      }

      return { id: payload.id, tipo: payload.tipo };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Limpa o carrinho completamente (local + backend)
 */
export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      // Se autenticado, limpa no backend
      if (authApi.isAuthenticated()) {
        await carrinhoApi.limparCarrinho();
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
  name: "cart",
  initialState,
  reducers: {
    // Hidrata inteiramente o carrinho a partir de um dicionário (para login por conta)
    hydrate(state, action: PayloadAction<Record<string, CartItem>>) {
      state.items = action.payload || {};
      state.loading = false;
      state.error = null;
    },
    
    // Ações síncronas para uso local (modo offline)
    addLocal(
      state,
      action: PayloadAction<{
        id: number;
        tipo: Tipo;
        qty?: number;
        title?: string;
        subtitle?: string;
        img?: string;
        preco?: number;
      }>
    ) {
      const { id, tipo, qty = 1, title, subtitle, img, preco } = action.payload;
      const key = makeKey(tipo, id);
      const prev = state.items[key];
      if (prev) {
        state.items[key] = { ...prev, qty: Math.max(1, prev.qty + qty) };
      } else {
        state.items[key] = {
          key,
          id,
          tipo,
          qty: Math.max(1, qty),
          title,
          subtitle,
          img,
          preco,
        };
      }
    },
    
    incrementLocal(state, action: PayloadAction<{ id: number; tipo: Tipo }>) {
      const { id, tipo } = action.payload;
      const key = makeKey(tipo, id);
      const it = state.items[key];
      if (it) it.qty = Math.max(1, it.qty + 1);
    },
    
    decrementLocal(state, action: PayloadAction<{ id: number; tipo: Tipo }>) {
      const { id, tipo } = action.payload;
      const key = makeKey(tipo, id);
      const it = state.items[key];
      if (it) it.qty = Math.max(1, it.qty - 1);
    },
    
    removeLocal(state, action: PayloadAction<{ id: number; tipo: Tipo }>) {
      const { id, tipo } = action.payload;
      const key = makeKey(tipo, id);
      delete state.items[key];
    },
    
    clearLocal(state) {
      state.items = {};
    },
  },
  
  extraReducers: (builder) => {
    // syncCartFromBackend
    builder
      .addCase(syncCartFromBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCartFromBackend.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(syncCartFromBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // addToCart - ATUALIZAÇÃO OTIMISTA
    builder
      .addCase(addToCart.pending, (state, action) => {
        // Atualiza UI IMEDIATAMENTE (otimistic update)
        const { id, tipo, qty = 1, title, subtitle, img, preco } = action.meta.arg;
        const key = makeKey(tipo, id);
        const prev = state.items[key];
        
        if (prev) {
          // Se já existe, incrementa quantidade imediatamente
          state.items[key] = {
            ...prev,
            qty: prev.qty + qty,
          };
        } else {
          // Adiciona novo item imediatamente
          state.items[key] = {
            key,
            id,
            tipo,
            qty: Math.max(1, qty),
            title,
            subtitle,
            img,
            preco,
          };
        }
        
        state.loading = false; // Não mostra loading na UI
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        // Backend confirmou - atualiza com dados reais do servidor
        const item = action.payload;
        
        // Atualiza com backendId e dados corretos do servidor
        state.items[item.key] = {
          ...state.items[item.key],
          ...item,
        };
        
        state.loading = false;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        // Verifica se o erro é aceitável (ex: duplicata)
        const errorMessage = action.payload as string;
        const isDuplicate = errorMessage?.includes('já existe') || errorMessage?.includes('duplicate');
        
        if (isDuplicate) {
          // Duplicata é OK - não reverte (mantém adicionado)
          state.loading = false;
          state.error = null;
          return;
        }
        
        // Para outros erros, REVERTE a operação otimista
        const { id, tipo, qty = 1 } = action.meta.arg;
        const key = makeKey(tipo, id);
        const item = state.items[key];
        
        if (item) {
          // Reverte a quantidade adicionada
          const newQty = item.qty - qty;
          if (newQty <= 0) {
            delete state.items[key];
          } else {
            item.qty = newQty;
          }
        }
        
        state.loading = false;
        state.error = errorMessage;
        // Log removido - erro já está disponível em state.error
      });

    // updateCartItemQuantity
    builder
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        const { id, tipo, qty } = action.payload;
        const key = makeKey(tipo, id);
        const item = state.items[key];
        if (item) {
          item.qty = Math.max(1, qty);
        }
      });

    // removeFromCart - ATUALIZAÇÃO OTIMISTA
    builder
      .addCase(removeFromCart.pending, (state, action) => {
        // Remove IMEDIATAMENTE da UI (otimistic update)
        const { id, tipo } = action.meta.arg;
        const key = makeKey(tipo, id);
        delete state.items[key];
        
        state.loading = false; // Não mostra loading na UI
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        // Backend confirmou - nada a fazer, já removemos no pending
        const { id, tipo } = action.payload;
        const key = makeKey(tipo, id);
        delete state.items[key]; // Garante que está removido
        
        state.loading = false;
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        // Erro ao remover - REVERTE (adiciona de volta)
        const errorMessage = action.payload as string;
        const is404 = errorMessage?.includes('404') || errorMessage?.includes('não encontrado');
        
        if (is404) {
          // 404 é OK - item já não existe no backend
          state.loading = false;
          state.error = null;
          return;
        }
        
        // Para outros erros, deveria reverter adicionando de volta
        // Mas não temos os dados do item aqui... então apenas mostra erro
        state.loading = false;
        state.error = errorMessage;
      });

    // clearCart
    builder
      .addCase(clearCart.fulfilled, (state) => {
        state.items = {};
      });
  },
});

export const { 
  hydrate, 
  addLocal, 
  incrementLocal, 
  decrementLocal, 
  removeLocal, 
  clearLocal 
} = slice.actions;

// Aliases para os async thunks (para compatibilidade com código legado)
export const add = addToCart;
export const increment = updateCartItemQuantity;
export const decrement = updateCartItemQuantity;
export const remove = removeFromCart;
export const clear = clearCart;

// Objeto para migração de código legado
export const migrateLegacy = {
  add: addToCart,
  increment: updateCartItemQuantity,
  decrement: updateCartItemQuantity,
  remove: removeFromCart,
  clear: clearCart,
  sync: syncCartFromBackend,
};

export const cartReducer = slice.reducer;

// SELECTORS
export const selectCartItems = (s: { cart: CartState }) => Object.values(s.cart.items);

export const selectCartSubtotal = (s: { cart: CartState }) =>
  Object.values(s.cart.items).reduce((acc, it) => acc + (Number(it.preco) || 0) * it.qty, 0);

export const selectCartBadgeCount = (s: { cart: CartState }) =>
  Object.values(s.cart.items).reduce((acc, it) => acc + it.qty, 0);

export const selectCartLoading = (s: { cart: CartState }) => s.cart.loading;

export const selectCartError = (s: { cart: CartState }) => s.cart.error;
