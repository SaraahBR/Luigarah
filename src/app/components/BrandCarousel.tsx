'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import Image from 'next/image';
import { Tooltip } from '@mui/material';
import 'swiper/css';

const brands = [
  { name: 'Belenciaga', logo: '/Balenciaga.png' },
  { name: 'Burberry', logo: '/Burberry.png' },
  { name: 'Cartier', logo: '/Cartier.png' },
  { name: 'Chanel', logo: '/Chanel.png' },
  { name: 'Chloé', logo: '/Chloe_Paris.png' },
  { name: 'Christian Louboutin', logo: '/Christian_Louboutin.png' },
  { name: 'Givenchy', logo: '/Givenchy.png' },
  { name: 'Gucci', logo: '/Gucci.png' },
  { name: 'Hugo Boss', logo: '/Hugo_Boss.png' },
  { name: 'Louis Vuitton', logo: '/Louis_Vuitton.png' },
  // ... mais marcas
];

export default function BrandCarousel() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-2xl font-light mb-8">Nossas Marcas</h2>
        <Swiper
          modules={[Autoplay]}
          spaceBetween={30}
          slidesPerView={2}
          autoplay={{ delay: 3000 }}
          loop={true}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 6 }
          }}
        >
          {brands.map((brand) => (
            <SwiperSlide key={brand.name}>
              <Tooltip title={brand.name} arrow>
                <div className="flex justify-center items-center p-4 hover:scale-110 transition-transform">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={120}
                    height={60}
                    className="object-contain grayscale hover:grayscale-0 transition-all"
                  />
                </div>
              </Tooltip>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}