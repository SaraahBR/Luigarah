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
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; delay: number }>>([]);

  useEffect(() => {
    if (isActive) {
      setIsAnimating(true);
      
      // Gerar partículas aleatórias
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        angle: (Math.random() * 360),
        delay: Math.random() * 0.3
      }));
      setParticles(newParticles);
      
      // Encontrar a posição do ícone do carrinho na navbar
      const cartIcon = document.querySelector('[aria-label="Carrinho"]') || 
                       document.querySelector('[data-cart-icon]') ||
                       document.querySelector('.shopping-bag-icon');
      const cartRect = cartIcon?.getBoundingClientRect();
      
      if (cartRect) {
        // Configurar a animação do produto
        const flyingElement = document.getElementById('flying-product');
        if (flyingElement) {
          const deltaX = cartRect.left + cartRect.width / 2 - startPosition.x;
          const deltaY = cartRect.top + cartRect.height / 2 - startPosition.y;
          
          // Animação suave com curva bezier
          flyingElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2) rotate(15deg)`;
          flyingElement.style.opacity = '0.3';
        }
      }

      // Completar animação após 1800ms (mais lenta e elegante)
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete();
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [isActive, startPosition, onComplete]);

  if (!isActive && !isAnimating) return null;

  // Limpar a URL da imagem
  const cleanedImageUrl = cleanImageUrl(productImage);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Produto voando */}
      <div
        id="flying-product"
        className="absolute"
        style={{
          left: startPosition.x - 60,
          top: startPosition.y - 60,
          transform: 'translate(0, 0) scale(1) rotate(0deg)',
          opacity: 1,
          transition: 'all 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Curva bezier suave
        }}
      >
        {/* Container principal do produto */}
        <div className="relative w-28 h-28">
          {/* Anel de luz pulsante ao redor */}
          <div className="absolute inset-0 w-28 h-28 rounded-full bg-gradient-to-r from-black/10 via-black/5 to-transparent animate-ping" 
               style={{ animationDuration: '1.5s' }}></div>
          
          {/* Segundo anel rotacionando */}
          <div className="absolute inset-0 w-28 h-28 rounded-full border-2 border-black/15 animate-spin"
               style={{ animationDuration: '3s' }}></div>
          
          {/* Imagem do produto principal */}
          <div className="relative w-24 h-24 mx-auto my-auto mt-2 ml-2 bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden">
            {/* Brilho superior */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent"></div>
            
            <Image
              src={cleanedImageUrl || "/placeholder.jpg"}
              alt={productTitle}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
            
            {/* Overlay de vidro */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/20"></div>
            
            {/* Flash de destaque */}
            <div className="absolute inset-0 bg-white/40 animate-pulse" style={{ animationDuration: '0.8s' }}></div>
          </div>

          {/* Partículas explosivas ao redor */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-black/70 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                animation: `particle-explode 1.5s ease-out forwards`,
                animationDelay: `${particle.delay}s`,
                transform: `rotate(${particle.angle}deg)`,
              }}
            />
          ))}

          {/* Estrelas brilhantes */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute text-black/60 animate-pulse"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                fontSize: `${10 + Math.random() * 8}px`,
                animationDelay: `${Math.random() * 1.2}s`,
                animationDuration: `${1 + Math.random() * 0.8}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              ✦
            </div>
          ))}

          {/* Rastro de luz */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute w-32 h-32 -left-4 -top-4 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full animate-spin"
                 style={{ animationDuration: '2s' }}></div>
          </div>

          {/* Círculos concêntricos */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`circle-${i}`}
              className="absolute inset-0 rounded-full border border-black/10"
              style={{
                animation: `ripple 2s ease-out infinite`,
                animationDelay: `${i * 0.4}s`,
                width: '100%',
                height: '100%',
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes particle-explode {
          0% {
            transform: translate(-50%, -50%) translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translateX(80px) scale(0);
            opacity: 0;
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default FlyToCartAnimation;