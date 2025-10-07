// Dispara o AuthModal globalmente e mostra um aviso.
// O TopBar escuta o evento "luigara:auth:open" e abre o AuthModal.
import { toast } from "sonner";

export type AuthOpenDetail = {
  reason?: "wishlist" | "cart" | "checkout";
  message?: string;
};

export function requestLogin(
  message: string = "É necessário estar logado para continuar.",
  reason?: AuthOpenDetail["reason"]
) {
  if (typeof window === "undefined") return;
  // feedback visual
  toast.error(message);
  // aciona o modal
  const detail: AuthOpenDetail = { message, reason };
  window.dispatchEvent(new CustomEvent<AuthOpenDetail>("luigara:auth:open", { detail }));
}
