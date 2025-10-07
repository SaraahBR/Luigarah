"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface LuxuryLoaderProps {
  isLoading: boolean;
  progress: number;
  loadedImages?: number;
  totalImages?: number;
}

const LuxuryLoader: React.FC<LuxuryLoaderProps> = ({ 
  isLoading, 
  progress, 
  loadedImages = 0, 
  totalImages = 0 
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Anima o progresso suavemente
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < progress) {
          return Math.min(prev + 1, progress);
        }
        return prev;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [progress]);

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-md"
      style={{
        background: `
          radial-gradient(circle at 30% 70%, rgba(0, 0, 0, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 70% 30%, rgba(0, 0, 0, 0.03) 0%, transparent 50%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.95) 100%)
        `
      }}
    >
      {/* Partículas flutuantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-black/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-${i} ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center relative z-10">
        {/* Linha decorativa superior */}
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-black/30 to-transparent mx-auto mb-8"></div>
        
        {/* Logo */}
        <div className="mb-6">
          <Image
            src="/logos/LUIGARA-LOGO.png"
            alt="LUIGARAH"
            width={300}
            height={120}
            priority
            className="h-24 w-auto mx-auto"
          />
        </div>

        {/* Título principal */}
        <h1 
          className="text-2xl text-black font-bold tracking-wider mb-8"
          style={{
            fontFamily: "'Playfair Display', 'Times New Roman', serif",
            letterSpacing: '0.15em',
          }}
        >
          LUIGARAH
        </h1>

        {/* Container da barra de progresso */}
        <div className="w-80 max-w-sm mx-auto">
          {/* Barra de progresso */}
          <div className="relative w-full h-1 bg-gray-200/50 rounded-full overflow-hidden mb-4">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-800 via-black to-gray-600 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${displayProgress}%` }}
            >
              {/* Efeito shimmer */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{
                  animation: 'shimmer 1.5s ease-in-out infinite',
                  transform: 'translateX(-100%)',
                }}
              />
            </div>
          </div>

          {/* Porcentagem */}
          <div className="text-center">
            <span 
              className="text-2xl font-light text-black tracking-wider"
              style={{
                fontFamily: "'Playfair Display', 'Times New Roman', serif",
              }}
            >
              {Math.round(displayProgress)}%
            </span>
            
            {/* Contador de imagens (se disponível) */}
            {totalImages > 0 && (
              <div className="text-xs text-gray-600 mt-1 tracking-wide">
                {loadedImages} de {totalImages} imagens carregadas
              </div>
            )}
          </div>
        </div>

        {/* Linha decorativa inferior */}
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-black/30 to-transparent mx-auto mt-8"></div>
      </div>

      {/* Animações CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes float-0 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
            50% { transform: translateY(-10px) translateX(5px); opacity: 0.8; }
          }
          @keyframes float-1 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
            50% { transform: translateY(-8px) translateX(-3px); opacity: 0.7; }
          }
          @keyframes float-2 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
            50% { transform: translateY(-12px) translateX(7px); opacity: 0.9; }
          }
          @keyframes float-3 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
            50% { transform: translateY(-6px) translateX(-2px); opacity: 0.6; }
          }
          @keyframes float-4 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
            50% { transform: translateY(-14px) translateX(4px); opacity: 0.8; }
          }
          @keyframes float-5 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
            50% { transform: translateY(-9px) translateX(-6px); opacity: 0.7; }
          }
          @keyframes float-6 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
            50% { transform: translateY(-11px) translateX(3px); opacity: 0.9; }
          }
          @keyframes float-7 {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
            50% { transform: translateY(-7px) translateX(-4px); opacity: 0.6; }
          }
        `
      }} />
    </div>
  );
};

export default LuxuryLoader;