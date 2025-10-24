"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface FlyToWishlistAnimationProps {
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

const FlyToWishlistAnimation: React.FC<FlyToWishlistAnimationProps> = ({
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
      
      // Gerar partículas aleatórias com tema de coração
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        angle: (Math.random() * 360),
        delay: Math.random() * 0.3
      }));
      setParticles(newParticles);
      
      // Encontrar a posição do ícone de wishlist/favoritos na navbar
      // Procurar pelo link com aria-label="Favoritos"
      const wishlistIcon = document.querySelector('a[aria-label="Favoritos"]');
      const wishlistRect = wishlistIcon?.getBoundingClientRect();
      
      if (wishlistRect) {
        // Configurar a animação do produto
        const flyingElement = document.getElementById('flying-product-wishlist');
        if (flyingElement) {
          const deltaX = wishlistRect.left + wishlistRect.width / 2 - startPosition.x;
          const deltaY = wishlistRect.top + wishlistRect.height / 2 - startPosition.y;
          
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
        id="flying-product-wishlist"
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
          {/* Anel de luz pulsante ao redor - tema vermelho/rosa para wishlist */}
          <div className="absolute inset-0 w-28 h-28 rounded-full bg-gradient-to-r from-red-500/10 via-pink-500/5 to-transparent animate-ping" 
               style={{ animationDuration: '1.5s' }}></div>
          
          {/* Segundo anel rotacionando - tema rosa */}
          <div className="absolute inset-0 w-28 h-28 rounded-full border-2 border-pink-500/15 animate-spin"
               style={{ animationDuration: '3s' }}></div>
          
          {/* Imagem do produto principal */}
          <div className="relative w-24 h-24 mx-auto my-auto mt-2 ml-2 bg-white rounded-2xl shadow-2xl border border-pink-500/10 overflow-hidden">
            {/* Brilho superior */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/60 via-transparent to-transparent"></div>
            
            <Image
              src={cleanedImageUrl || "/placeholder.jpg"}
              alt={productTitle}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
            
            {/* Overlay de vidro com tema rosa */}
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 via-transparent to-pink-100/20"></div>
            
            {/* Flash de destaque rosa */}
            <div className="absolute inset-0 bg-pink-300/40 animate-pulse" style={{ animationDuration: '0.8s' }}></div>
          </div>

          {/* Partículas explosivas ao redor - tema rosa/vermelho */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-gradient-to-r from-red-500/70 to-pink-500/70 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                animation: `particle-explode 1.5s ease-out forwards`,
                animationDelay: `${particle.delay}s`,
                transform: `rotate(${particle.angle}deg)`,
              }}
            />
          ))}

          {/* Ondas de ripple concêntricas - tema rosa */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full border-2 border-pink-400/30 animate-[ripple_2s_ease-out_infinite]" />
            <div className="absolute w-24 h-24 rounded-full border-2 border-pink-400/20 animate-[ripple_2s_ease-out_0.3s_infinite]" />
            <div className="absolute w-28 h-28 rounded-full border-2 border-pink-400/10 animate-[ripple_2s_ease-out_0.6s_infinite]" />
          </div>

          {/* Anéis de luz pulsantes - tema rosa/vermelho */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-red-400/20 to-pink-400/20 blur-sm animate-pulse" 
                 style={{ animationDuration: '2s' }} />
            <div className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-pink-500/10 to-red-500/10 blur-md animate-pulse" 
                 style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          </div>

          {/* Rastro de luz rotativo - tema rosa */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
            <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-pink-400/40 via-pink-400/10 to-transparent blur-sm" />
          </div>

          {/* Estrelas decorativas - tema rosa/vermelho */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30) + Math.random() * 15;
            const distance = 50 + Math.random() * 20;
            const x = Math.cos((angle * Math.PI) / 180) * distance;
            const y = Math.sin((angle * Math.PI) / 180) * distance;
            
            return (
              <div
                key={`star-${i}`}
                className="absolute w-1 h-1 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Definição das animações de keyframes */}
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

export default FlyToWishlistAnimation;
