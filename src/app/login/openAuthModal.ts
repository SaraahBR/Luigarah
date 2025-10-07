// Dispara um evento global que o TopBar escuta para abrir o AuthModal
export function openAuthModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("luigara:auth:open"));
  }
}
