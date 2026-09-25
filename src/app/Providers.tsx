"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { hydrate as hydrateCart } from "@/store/cartSlice";
import { hydrate as hydrateWishlist } from "@/store/wishlistSlice";
import { buildAccountSnapshot, loadAccountSnapshot, saveAccountSnapshot } from "@/store/accountStorage";
import { userManager } from "@/lib/httpClient";
import authApi from "@/hooks/api/authApi";

/** E-mail da conta logada (com token válido), ou null. */
function emailLogado(): string | null {
  const email = userManager.get()?.email;
  return email && authApi.isAuthenticated() ? email : null;
}

export default function Providers({ children }: PropsWithChildren) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carrinho e favoritos não ficam no navegador entre recarregamentos (trocar de idioma
  // recarrega a página): até a resposta do backend chegar, o carrinho aparecia vazio.
  // Agora uma cópia por conta fica no localStorage, é mostrada na hora e o backend
  // atualiza em seguida.
  useEffect(() => {
    const email = emailLogado();
    if (email) {
      const copia = loadAccountSnapshot(email);
      if (copia) {
        store.dispatch(hydrateCart(copia.cart.items));
        store.dispatch(hydrateWishlist(copia.wishlist.items));
      }
    }

    let ultimo = { cart: store.getState().cart.items, wishlist: store.getState().wishlist.items };
    return store.subscribe(() => {
      const { cart, wishlist } = store.getState();
      if (cart.items === ultimo.cart && wishlist.items === ultimo.wishlist) return;
      ultimo = { cart: cart.items, wishlist: wishlist.items };
      const atual = emailLogado();
      if (atual) saveAccountSnapshot(atual, buildAccountSnapshot(wishlist.items, cart.items));
    });
  }, []);

  return (
    <Provider store={store}>
      {isClient && persistor ? (
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      ) : (
        children
      )}
    </Provider>
  );
}
