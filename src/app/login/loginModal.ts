// Dispara o AuthModal globalmente e mostra um aviso.
// O TopBar escuta o evento "luigara:auth:open" e abre o AuthModal.
import { toast } from "sonner";
import { getClientLocale } from "@/i18n/client";
import type { Locale } from "@/i18n/config";

export type AuthOpenDetail = {
  reason?: "wishlist" | "cart" | "checkout";
  message?: string;
};

// Aviso padrão, usado só quando quem chama não passa uma mensagem já traduzida
const MENSAGEM_PADRAO: Record<Locale, string> = {
  pt: "É necessário estar logado para continuar.",
  en: "You need to be signed in to continue.",
  es: "Debes iniciar sesión para continuar.",
  fr: "Vous devez être connecté pour continuer.",
};

export function requestLogin(
  message?: string,
  reason?: AuthOpenDetail["reason"]
) {
  if (typeof window === "undefined") return;
  const texto = message || MENSAGEM_PADRAO[getClientLocale()];
  // feedback visual
  toast.error(texto);
  // aciona o modal
  const detail: AuthOpenDetail = { message: texto, reason };
  window.dispatchEvent(new CustomEvent<AuthOpenDetail>("luigara:auth:open", { detail }));
}
