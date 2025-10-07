"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Tipo } from "./wishlistSlice";

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
};

type CartState = {
  items: Record<string, CartItem>; // key -> item
};

const initialState: CartState = { items: {} };

// Helpers
function makeKey(tipo: Tipo, id: number) {
  return `${tipo}:${id}`;
}

const slice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Hidrata inteiramente o carrinho a partir de um dicionário (para login por conta)
    hydrate(state, action: PayloadAction<Record<string, CartItem>>) {
      state.items = action.payload || {};
    },
    add(
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
    increment(state, action: PayloadAction<{ id: number; tipo: Tipo }>) {
      const { id, tipo } = action.payload;
      const key = makeKey(tipo, id);
      const it = state.items[key];
      if (it) it.qty = Math.max(1, it.qty + 1);
    },
    decrement(state, action: PayloadAction<{ id: number; tipo: Tipo }>) {
      const { id, tipo } = action.payload;
      const key = makeKey(tipo, id);
      const it = state.items[key];
      if (it) it.qty = Math.max(1, it.qty - 1);
    },
    remove(state, action: PayloadAction<{ id: number; tipo: Tipo }>) {
      const { id, tipo } = action.payload;
      const key = makeKey(tipo, id);
      delete state.items[key];
    },
    clear(state) {
      state.items = {};
    },
    // Migração do localStorage legado (sem tipo -> assume "bolsas")
    migrateLegacy(state, action: PayloadAction<Array<{ id: number; qty: number }>>) {
      const arr = action.payload || [];
      for (const { id, qty } of arr) {
        const tipo: Tipo = "bolsas";
        const key = makeKey(tipo, id);
        const prev = state.items[key];
        if (prev) {
          prev.qty = Math.max(1, prev.qty + (qty || 1));
        } else {
          state.items[key] = {
            key,
            id,
            tipo,
            qty: Math.max(1, qty || 1),
          };
        }
      }
    },
  },
});

export const { add, increment, decrement, remove, clear, migrateLegacy, hydrate } = slice.actions;
export const cartReducer = slice.reducer;

// SELECTORS
export const selectCartItems = (s: { cart: CartState }) => Object.values(s.cart.items);

export const selectCartSubtotal = (s: { cart: CartState }) =>
  Object.values(s.cart.items).reduce((acc, it) => acc + (Number(it.preco) || 0) * it.qty, 0);

export const selectCartBadgeCount = (s: { cart: CartState }) =>
  Object.values(s.cart.items).reduce((acc, it) => acc + it.qty, 0);
