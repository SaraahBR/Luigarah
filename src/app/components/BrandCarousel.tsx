'use client';
import Image from 'next/image';
import { Tooltip } from '@mui/material';
import { useState } from 'react';

const brands = [
  { name: 'Balenciaga', logo: '/Balenciaga.png' },
  { name: 'Burberry', logo: '/Burberry.png' },
  { name: 'Cartier', logo: '/Cartier.png' },
  { name: 'Chanel', logo: '/Chanel.png' },
  { name: 'Chloé', logo: '/Chloe_Paris.png' },
  { name: 'Christian Louboutin', logo: '/Christian_Louboutin.png' },
  { name: 'Givenchy', logo: '/Givenchy.png' },
  { name: 'Gucci', logo: '/Gucci.png' },
  { name: 'Hugo Boss', logo: '/Hugo_Boss.png' },
  { name: 'Louis Vuitton', logo: '/Louis_Vuitton.png' },
];

export default function BrandCarousel() {
  const [isPaused, setIsPaused] = useState(false);
  const duplicatedBrands = [...brands, ...brands];

  const animationStyle = {
    width: `${duplicatedBrands.length * 200}px`,
    animation: `brandScroll 30s linear infinite`,
    animationPlayState: isPaused ? 'paused' : 'running',
    transform: 'translateX(0)',
  };

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-2xl font-light mb-8">Nossas Marcas</h2>
        
        <div className="relative overflow-hidden">
          <div 
            className="flex"
            style={animationStyle}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {duplicatedBrands.map((brand, index) => (
              <div key={`${brand.name}-${index}`} className="flex-shrink-0 w-[200px]">
                <Tooltip title={brand.name} arrow>
                  <div className="flex justify-center items-center p-4 hover:scale-110 transition-transform duration-300">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={120}
                      height={60}
                      className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes brandScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-2000px);
          }
        }
      `}</style>
    </section>
  );
}