// Armazena/recupera "snapshots" da conta do usuário (por e-mail) no localStorage,
// com tipagem forte para os itens da wishlist e do carrinho.

// Importações **apenas de tipo** (não geram código em runtime — evitam ciclos)
import type { WishlistItem } from "./wishlistSlice";
import type { CartItem } from "./cartSlice";

/** Estrutura persistida por conta (email) */
export type AccountSnapshot = {
  wishlist: { items: Record<string, WishlistItem> };
  cart: { items: Record<string, CartItem> };
};

const KEY_PREFIX = "luigara:acct:";

export function accountKey(email: string) {
  return `${KEY_PREFIX}${email.trim().toLowerCase()}`;
}

/** Constrói um snapshot tipado a partir de objetos de itens já prontos */
export function buildAccountSnapshot(
  wishlistItems: Record<string, WishlistItem>,
  cartItems: Record<string, CartItem>
): AccountSnapshot {
  return {
    wishlist: { items: wishlistItems },
    cart: { items: cartItems },
  };
}

/** Salva o snapshot da CONTA (email) no localStorage */
export function saveAccountSnapshot(email: string, snapshot: AccountSnapshot) {
  if (typeof window === "undefined") return;
  try {
    const key = accountKey(email);
    const data = JSON.stringify(snapshot);
    localStorage.setItem(key, data);
    
    // Debug: log para verificar se está salvando corretamente
    if (process.env.NODE_ENV === "development") {
      console.log(`[AccountStorage] Salvando para ${email}:`, {
        wishlistItems: Object.keys(snapshot.wishlist?.items || {}).length,
        cartItems: Object.keys(snapshot.cart?.items || {}).length,
        key
      });
    }
  } catch (error) {
    console.error(`[AccountStorage] Erro ao salvar para ${email}:`, error);
  }
}

/** Lê o snapshot da CONTA (email) do localStorage */
export function loadAccountSnapshot(email: string): AccountSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const key = accountKey(email);
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[AccountStorage] Nenhum snapshot encontrado para ${email}`);
      }
      return null;
    }

    // Parse + validação leve do formato esperado
    const parsed = JSON.parse(raw) as Partial<AccountSnapshot> | null;
    if (
      parsed &&
      parsed.wishlist &&
      parsed.cart &&
      typeof parsed.wishlist.items === "object" &&
      typeof parsed.cart.items === "object"
    ) {
      // Debug: log para verificar se está carregando corretamente
      if (process.env.NODE_ENV === "development") {
        console.log(`[AccountStorage] Carregando para ${email}:`, {
          wishlistItems: Object.keys(parsed.wishlist.items || {}).length,
          cartItems: Object.keys(parsed.cart.items || {}).length,
          key
        });
      }
      
      // Cast seguro após checagens estruturais
      return parsed as AccountSnapshot;
    }
    return null;
  } catch (error) {
    console.error(`[AccountStorage] Erro ao carregar para ${email}:`, error);
    return null;
  }
}

/** Remove o snapshot salvo para a CONTA (email) */
export function clearAccountSnapshot(email: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(accountKey(email));
  } catch {
    // ignora
  }
}
