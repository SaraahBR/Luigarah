import Image from "next/image";
import Link from "next/link";

export default function HeroGrid() {
  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-0">
      {/* MULHER - Imagem */}
      <Link href="/mulher" className="relative overflow-hidden h-[40vh] md:h-[45vh] cursor-pointer group">
        <Image 
          src="/Hero_Grid.png" 
          alt="Coleção Feminina - Elegância" 
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          style={{ objectPosition: 'center 01%' }}
        />
      </Link>

      {/* MULHER - Texto */}
      <div className="bg-[#D0A993] text-zinc-800 p-6 md:p-8 flex flex-col justify-center items-center text-center h-[40vh] md:h-[45vh]">
        <h2 className="text-2xl md:text-3xl font-light tracking-wider">ELEGÂNCIA</h2>
        <p className="mt-2 text-xs md:text-sm tracking-wide">LOOKS INCRÍVEIS PARA TODAS AS OCASIÕES</p>
        <div className="mt-3 border-b border-black w-12 md:w-20"></div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider">Coleção Feminina</p>
      </div>

      {/* HOMEM - Texto */}
      <div className="bg-[#57534E] text-white p-6 md:p-8 flex flex-col justify-center items-center text-center h-[40vh] md:h-[45vh] order-3 md:order-none">
        <h2 className="text-2xl md:text-3xl font-light tracking-wider">ESTILO</h2>
        <p className="mt-2 text-xs md:text-sm tracking-wide">SOFISTICAÇÃO EM CADA DETALHE</p>
        <div className="mt-3 border-b border-white w-12 md:w-20"></div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider">Coleção Masculina</p>
      </div>

      {/* HOMEM - Imagem */}
      <Link href="/homem" className="relative overflow-hidden h-[40vh] md:h-[45vh] cursor-pointer group order-2 md:order-none">
        <Image 
          src="/Hero_Grid_1.png" 
          alt="Coleção Masculina - Estilo" 
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
          alt="Coleção Unissex - Liberdade" 
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          style={{ objectPosition: 'center 01%' }}
        />
      </Link>

      {/* UNISSEX - Texto */}
      <div className="bg-[#8B7355] text-zinc-800 p-6 md:p-8 flex flex-col justify-center items-center text-center h-[40vh] md:h-[45vh] order-5 md:order-none">
        <h2 className="text-2xl md:text-3xl font-light tracking-wider">LIBERDADE</h2>
        <p className="mt-2 text-xs md:text-sm tracking-wide">MODA SEM FRONTEIRAS</p>
        <div className="mt-3 border-b border-black w-12 md:w-20"></div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider">Coleção Unissex</p>
      </div>

      {/* KIDS - Texto */}
      <div className="bg-[#5E402A] text-white p-6 md:p-8 flex flex-col justify-center items-center text-center h-[40vh] md:h-[45vh] order-7 md:order-none">
        <h2 className="text-2xl md:text-3xl font-light tracking-wider">DIVERSÃO</h2>
        <p className="mt-2 text-xs md:text-sm tracking-wide">ESTILO PARA OS PEQUENOS</p>
        <div className="mt-3 border-b border-white w-12 md:w-20"></div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider">Coleção Infantil</p>
      </div>

      {/* KIDS - Imagem */}
      <Link href="/kids" className="relative overflow-hidden h-[40vh] md:h-[45vh] cursor-pointer group order-6 md:order-none">
        <Image 
          src="/Hero_Grid_2.png" 
          alt="Coleção Kids - Diversão" 
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          style={{ objectPosition: 'center 01%' }}
        />
      </Link>
    </section>
  );
}