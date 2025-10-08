import Image from "next/image";
import Link from "next/link";

export default function HeroGrid() {
  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2">
      <Link href="/colecao" className="relative overflow-hidden aspect-square cursor-pointer">
        <Image 
          src="/Hero_Grid.png" 
          alt="Moça com jaqueta jeans" 
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover" 
        />
      </Link>

      <div className="bg-[#D0A993] text-zinc-800 p-8 flex flex-col justify-center items-center text-center aspect-square">
        <h2 className="text-4xl font-light">ELEGÂNCIA</h2>
        <p className="mt-2 text-sm">LOOKS INCRÍVEIS PARA A PRIMAVERA</p>
        <div className="mt-4 border-b border-black w-24"></div>
        <p className="mt-4 text-xs font-semibold">Coleção Feminina</p>
      </div>

      <div className="bg-[#673024] text-black p-8 flex flex-col justify-center items-center text-center aspect-square">
        <h2 className="text-4xl font-light">ESTILO</h2>
        <p className="mt-2 text-sm">FIQUE PRONTO PARA O VERÃO</p>
        <div className="mt-4 border-b border-black w-24"></div>
        <p className="mt-4 text-xs text-gray-300 font-semibold">Coleção Masculina</p>
      </div>

      <Link href="/colecao" className="relative overflow-hidden aspect-square cursor-pointer">
        <Image 
          src="/Hero_Grid_1.png" 
          alt="Moço com camisa estampada" 
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover" 
        />
      </Link>
    </section>
  );
}