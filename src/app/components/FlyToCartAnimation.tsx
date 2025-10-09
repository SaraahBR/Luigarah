"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface FlyToCartAnimationProps {
  isActive: boolean;
  productImage: string;
  productTitle: string;
  startPosition: { x: number; y: number };
  onComplete: () => void;
}

// Função para limpar URLs que podem ter espaços ou caracteres de controle
const cleanImageUrl = (url: string): string => {
  return url.replace(/\s+/g, '').trim();
};

const FlyToCartAnimation: React.FC<FlyToCartAnimationProps> = ({
  isActive,
  productImage,
  productTitle,
  startPosition,
  onComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsAnimating(true);
      
      // Encontrar a posição do ícone do carrinho
      const cartIcon = document.querySelector('[aria-label="Carrinho"]');
      const cartRect = cartIcon?.getBoundingClientRect();
      
      if (cartRect) {
        // Configurar a animação
        const flyingElement = document.getElementById('flying-product');
        if (flyingElement) {
          const deltaX = cartRect.left + cartRect.width / 2 - startPosition.x;
          const deltaY = cartRect.top + cartRect.height / 2 - startPosition.y;
          
          // Animação mais dramática
          flyingElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.1) rotate(360deg)`;
          flyingElement.style.opacity = '0';
        }
      }

      // Completar animação após 1200ms (mais lenta para ser mais visível)
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete();
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isActive, startPosition, onComplete]);

  if (!isActive && !isAnimating) return null;

  // Limpar a URL da imagem
  const cleanedImageUrl = cleanImageUrl(productImage);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Overlay com efeito de flash */}
      <div className="absolute inset-0 bg-black/10 animate-ping opacity-30"></div>
      
      {/* Produto voando */}
      <div
        id="flying-product"
        className="absolute transition-all duration-1000 ease-in-out"
        style={{
          left: startPosition.x - 50,
          top: startPosition.y - 50,
          transform: 'translate(0, 0) scale(1) rotate(0deg)',
          opacity: 1
        }}
      >
        {/* Anel de energia ao redor */}
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-black/20 animate-spin"></div>
        
        {/* Produto principal - um pouco menor */}
        <div className="relative w-20 h-20 bg-white rounded-2xl shadow-2xl border-4 border-black/10 overflow-hidden transform hover:scale-110 transition-all">
          {/* Brilho de luxo */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-black/10"></div>
          
          <Image
            src={cleanedImageUrl || "/placeholder.jpg"}
            alt={productTitle}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay com efeito de vidro */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30"></div>
        </div>
        
        {/* Rastro de partículas mais elaborado */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-black rounded-full opacity-80"
              style={{
                left: Math.random() * 100 + 'px',
                top: Math.random() * 100 + 'px',
                animation: `float ${0.8 + Math.random() * 0.6}s ease-out infinite`,
                animationDelay: Math.random() * 0.8 + 's',
                boxShadow: '0 0 8px rgba(0,0,0,0.5)'
              }}
            />
          ))}
        </div>

        {/* Efeito de estrelas */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute text-black text-lg opacity-70 animate-pulse"
              style={{
                left: Math.random() * 80 + 'px',
                top: Math.random() * 80 + 'px',
                animationDelay: Math.random() * 1 + 's',
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            >
              ✦
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); opacity: 1; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(-40px) scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FlyToCartAnimation;