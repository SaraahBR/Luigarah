"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Tipo = "roupas" | "bolsas" | "sapatos";

export type WishlistItem = {
  id: number;
  tipo: Tipo;                 
  title?: string;
  subtitle?: string;
  img?: string;
};

type WishlistState = {
  // Chave composta "tipo:id" para evitar colisão entre categorias
  items: Record<string, WishlistItem>;
};

const initialState: WishlistState = { items: {} };

const tipos: readonly Tipo[] = ["roupas", "bolsas", "sapatos"] as const;

const slice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggle(state, action: PayloadAction<WishlistItem>) {
      const { id, tipo } = action.payload;
      const key = `${tipo}:${id}`;
      if (state.items[key]) {
        delete state.items[key];
      } else {
        state.items[key] = action.payload;
      }
      // compat: se existir uma chave legada só com o número, remove
      delete (state.items as any)[String(id)];
    },
    remove(
      state,
      action: PayloadAction<{ id: number; tipo?: Tipo } | string | number>
    ) {
      const p = action.payload as any;
      if (typeof p === "string") {
        delete state.items[p];
        return;
      }
      if (typeof p === "number") {
        // tentar remover por todos os tipos e pela chave numérica
        tipos.forEach((t) => delete state.items[`${t}:${p}`]);
        delete (state.items as any)[String(p)];
        return;
      }
      const { id, tipo } = p as { id: number; tipo?: Tipo };
      if (tipo) {
        delete state.items[`${tipo}:${id}`];
        // também limpar chave numérica antiga se existir
        delete (state.items as any)[String(id)];
      } else {
        tipos.forEach((t) => delete state.items[`${t}:${id}`]);
        delete (state.items as any)[String(id)];
      }
    },
    clear(state) {
      state.items = {};
    },
  },
});

export const { toggle, remove, clear } = slice.actions;
export const wishlistReducer = slice.reducer;

// SELECTORS
export const selectWishlistItems = (s: { wishlist: WishlistState }) =>
  Object.values(s.wishlist.items);

// Checa chave composta e a chave numérica antiga
export const selectIsInWishlist =
  (id: number, tipo: Tipo) => (s: { wishlist: WishlistState }) =>
    Boolean(
      s.wishlist.items[`${tipo}:${id}`] ||
        (s.wishlist.items as any)[String(id)]
    );

export const selectWishlistCount = (s: { wishlist: WishlistState }) =>
  Object.keys(s.wishlist.items).length;
