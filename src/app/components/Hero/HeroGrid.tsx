import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function HeroGrid() {
  const t = useTranslations("heroGrid");
  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-0">
      {/* MULHER - Imagem */}
      <Link href="/mulher" className="relative overflow-hidden h-[40vh] md:h-[45vh] cursor-pointer group">
        <Image 
          src="/Hero_Grid.png" 
          alt={t("womenAlt")} 
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          style={{ objectPosition: 'center 01%' }}
        />
      </Link>

      {/* MULHER - Texto */}
      <div className="bg-[#D0A993] text-zinc-900 p-6 md:p-8 flex flex-col justify-center items-center text-center h-[40vh] md:h-[45vh]">
        <h2 className="text-2xl md:text-3xl font-light tracking-wider">{t("womenTitle")}</h2>
        <p className="mt-2 text-xs md:text-sm tracking-wide">{t("womenText")}</p>
        <div className="mt-3 border-b border-black w-12 md:w-20"></div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider">{t("womenCollection")}</p>
      </div>

      {/* HOMEM - Texto */}
      <div className="bg-[#57534E] text-white p-6 md:p-8 flex flex-col justify-center items-center text-center h-[40vh] md:h-[45vh] order-3 md:order-none">
        <h2 className="text-2xl md:text-3xl font-light tracking-wider">{t("menTitle")}</h2>
        <p className="mt-2 text-xs md:text-sm tracking-wide">{t("menText")}</p>
        <div className="mt-3 border-b border-white w-12 md:w-20"></div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider">{t("menCollection")}</p>
      </div>

      {/* HOMEM - Imagem */}
      <Link href="/homem" className="relative overflow-hidden h-[40vh] md:h-[45vh] cursor-pointer group order-2 md:order-none">
        <Image 
          src="/Hero_Grid_1.png" 
          alt={t("menAlt")} 
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          style={{ objectPosition: 'center 01%' }}
        />
      </Link>

      {/* UNISSEX - Imagem */}
      <Link href="/unissex" className="relative overflow-hidden h-[40vh] md:h-[45vh] cursor-pointer group order-4 md:order-none">
        <Image 
          src="/Hero_Grid_3.png" 
          alt={t("unisexAlt")} 
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          style={{ objectPosition: 'center 01%' }}
        />
      </Link>

      {/* UNISSEX - Texto */}
      <div className="bg-[#8B7355] text-zinc-900 p-6 md:p-8 flex flex-col justify-center items-center text-center h-[40vh] md:h-[45vh] order-5 md:order-none">
        <h2 className="text-2xl md:text-3xl font-light tracking-wider">{t("unisexTitle")}</h2>
        <p className="mt-2 text-xs md:text-sm tracking-wide">{t("unisexText")}</p>
        <div className="mt-3 border-b border-black w-12 md:w-20"></div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider">{t("unisexCollection")}</p>
      </div>

      {/* KIDS - Texto */}
      <div className="bg-[#5E402A] text-white p-6 md:p-8 flex flex-col justify-center items-center text-center h-[40vh] md:h-[45vh] order-7 md:order-none">
        <h2 className="text-2xl md:text-3xl font-light tracking-wider">{t("kidsTitle")}</h2>
        <p className="mt-2 text-xs md:text-sm tracking-wide">{t("kidsText")}</p>
        <div className="mt-3 border-b border-white w-12 md:w-20"></div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider">{t("kidsCollection")}</p>
      </div>

      {/* KIDS - Imagem */}
      <Link href="/kids" className="relative overflow-hidden h-[40vh] md:h-[45vh] cursor-pointer group order-6 md:order-none">
        <Image 
          src="/Hero_Grid_2.png" 
          alt={t("kidsAlt")} 
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          style={{ objectPosition: 'center 01%' }}
        />
      </Link>
    </section>
  );
}