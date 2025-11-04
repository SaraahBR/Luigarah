"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Componente que força scroll para o topo ao navegar entre páginas
 * Resolve problema no mobile onde página começa no footer
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Força scroll para o topo SEMPRE que a rota mudar
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Sem animação suave
    });
  }, [pathname]);

  return null; // Componente invisível
}
