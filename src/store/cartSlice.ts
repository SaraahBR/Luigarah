"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import type { Tipo } from "./wishlistSlice";

export type CartKey = `${Tipo}:${number}`;

export type CartItem = {
  key: CartKey;
  id: number;
  tipo: Tipo;
  qty: number;
  title?: string;
  subtitle?: string;
  img?: string;
  preco?: number; // usar para total; se ausente, trata como 0
};

type CartState = {
  items: Record<CartKey, CartItem>;
};

const initialState: CartState = { items: {} };

function makeKey(id: number, tipo: Tipo): CartKey {
  return `${tipo}:${id}`;
}

type AddPayload = {
  id: number;
  tipo: Tipo;
  qty: number;
  title?: string;
  subtitle?: string;
  img?: string;
  preco?: number;
};

type SetQtyPayload = {
  id: number;
  tipo: Tipo;
  qty: number;
};

type RemovePayload = { id: number; tipo: Tipo } | CartKey;

const slice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    add(state, action: PayloadAction<AddPayload>) {
      const { id, tipo, qty, ...rest } = action.payload;
      const key = makeKey(id, tipo);
      const existing = state.items[key];
      const nextQty = (existing?.qty ?? 0) + qty;
      state.items[key] = {
        key,
        id,
        tipo,
        qty: nextQty,
        title: rest.title ?? existing?.title,
        subtitle: rest.subtitle ?? existing?.subtitle,
        img: rest.img ?? existing?.img,
        preco: typeof rest.preco === "number" ? rest.preco : existing?.preco,
      };
    },
    setQty(state, action: PayloadAction<SetQtyPayload>) {
      const { id, tipo, qty } = action.payload;
      const key = makeKey(id, tipo);
      const item = state.items[key];
      if (!item) return;
      if (qty <= 0) {
        delete state.items[key];
      } else {
        item.qty = qty;
      }
    },
    increment(state, action: PayloadAction<{ id: number; tipo: Tipo }>) {
      const { id, tipo } = action.payload;
      const key = makeKey(id, tipo);
      const item = state.items[key];
      if (item) item.qty += 1;
    },
    decrement(state, action: PayloadAction<{ id: number; tipo: Tipo }>) {
      const { id, tipo } = action.payload;
      const key = makeKey(id, tipo);
      const item = state.items[key];
      if (!item) return;
      if (item.qty <= 1) {
        delete state.items[key];
      } else {
        item.qty -= 1;
      }
    },
    remove(state, action: PayloadAction<RemovePayload>) {
      const p = action.payload;
      if (typeof p === "string") {
        delete state.items[p];
        return;
      }
      const key = makeKey(p.id, p.tipo as Tipo);
      delete state.items[key];
    },
    clear(state) {
      state.items = {};
    },
    // migra do localStorage legado: [{id,qty}]
    migrateLegacy(state, action: PayloadAction<Array<{ id: number; qty: number; tipo?: Tipo }>>) {
      action.payload.forEach((i) => {
        const tipo: Tipo = i.tipo ?? "bolsas"; // fallback neutro
        const key = makeKey(i.id, tipo);
        const existing = state.items[key];
        const nextQty = (existing?.qty ?? 0) + i.qty;
        state.items[key] = existing
          ? { ...existing, qty: nextQty }
          : { key, id: i.id, tipo, qty: nextQty };
      });
    },
  },
});

export const { add, setQty, increment, decrement, remove, clear, migrateLegacy } = slice.actions;
export const cartReducer = slice.reducer;

/* ================== SELECTORS ================== */
export const selectCartItems = (s: { cart: CartState }) => Object.values(s.cart.items);

export const selectCartBadgeCount = (s: { cart: CartState }) =>
  Object.values(s.cart.items).reduce((acc, it) => acc + it.qty, 0);

export const selectCartUniqueCount = (s: { cart: CartState }) =>
  Object.keys(s.cart.items).length;

export const selectCartSubtotal = (s: { cart: CartState }) =>
  Object.values(s.cart.items).reduce((acc, it) => acc + (it.preco ?? 0) * it.qty, 0);

/* Para uso em componentes com RootState */
export const selectCartWithRoot = (s: RootState) => selectCartItems({ cart: (s as unknown as { cart: CartState }).cart });