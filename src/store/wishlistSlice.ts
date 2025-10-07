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

/* helpers sem any */
function removeLegacyNumericKey(items: Record<string, WishlistItem>, id: number) {
  const rec = items as Record<string, WishlistItem | undefined>;
  delete rec[String(id)];
}

function isPayloadIdTipo(p: unknown): p is { id: number; tipo?: Tipo } {
  if (typeof p !== "object" || p === null) return false;
  const obj = p as Record<string, unknown>;
  const idOk = typeof obj.id === "number";
  const tipoVal = obj.tipo;
  const tipoOk =
    typeof tipoVal === "undefined" ||
    (typeof tipoVal === "string" && (["roupas", "bolsas", "sapatos"] as const).includes(tipoVal as Tipo));
  return idOk && tipoOk;
}

const slice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Hidrata inteiramente a wishlist a partir de um dicionário (para login por conta)
    hydrate(state, action: PayloadAction<Record<string, WishlistItem>>) {
      state.items = action.payload || {};
    },
    toggle(state, action: PayloadAction<WishlistItem>) {
      const { id, tipo } = action.payload;
      const key = `${tipo}:${id}`;
      if (state.items[key]) {
        delete state.items[key];
      } else {
        state.items[key] = action.payload;
      }
      // compat: se existir uma chave legada só com o número, remove
      removeLegacyNumericKey(state.items, id);
    },
    remove(state, action: PayloadAction<{ id: number; tipo?: Tipo } | string | number>) {
      const p = action.payload;

      if (typeof p === "string") {
        delete state.items[p];
        return;
      }

      if (typeof p === "number") {
        // tentar remover por todos os tipos e pela chave numérica
        tipos.forEach((t) => delete state.items[`${t}:${p}`]);
        removeLegacyNumericKey(state.items, p);
        return;
      }

      if (isPayloadIdTipo(p)) {
        const { id, tipo } = p;
        if (tipo) {
          delete state.items[`${tipo}:${id}`];
          removeLegacyNumericKey(state.items, id);
        } else {
          tipos.forEach((t) => delete state.items[`${t}:${id}`]);
          removeLegacyNumericKey(state.items, id);
        }
      }
    },
    clear(state) {
      state.items = {};
    },
  },
});

export const { toggle, remove, clear, hydrate } = slice.actions;
export const wishlistReducer = slice.reducer;

// SELECTORS
export const selectWishlistItems = (s: { wishlist: WishlistState }) => Object.values(s.wishlist.items);

// Checa chave composta e a chave numérica antiga (sem any)
export const selectIsInWishlist =
  (id: number, tipo: Tipo) =>
  (s: { wishlist: WishlistState }) => {
    const composed = s.wishlist.items[`${tipo}:${id}`];
    const legacy = (s.wishlist.items as Record<string, WishlistItem | undefined>)[String(id)];
    return Boolean(composed || legacy);
  };

export const selectWishlistCount = (s: { wishlist: WishlistState }) => Object.keys(s.wishlist.items).length;
