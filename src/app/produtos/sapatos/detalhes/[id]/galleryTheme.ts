// Tokens de layout/estilo da galeria.
// - gap: espaçamento entre as imagens
// - portrait/square/banner: "comprimento" (altura relativa via aspect-ratio)
// - objectFit: como a imagem se encaixa dentro do card
// - sizes: hint de tamanhos para o <Image/> do Next (performance)
export const galleryTheme = {
  // Espaçamento entre cards
  gap: "gap-4 lg:gap-6",

  // Altura/“comprimento” dos cards por tipo (mobile -> desktop)
  portrait: { mobile: "", desktop: "" },
  square:   { mobile: "", desktop: "" },
  banner:   { mobile: "", desktop: "" },

  // Image fit (não corta as fotos)
  objectFit: "object-contain",

  // Hint para o Next/Image
  sizes:
    "(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw",
};
