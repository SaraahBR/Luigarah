import BrandCarousel from "./components/BrandCarousel";
import HeroGrid from "./components/Hero/HeroGrid";

export default function HomePage() {
  return (
    <div className="min-h-[50vh]">
      {/* conteúdo da home aqui, função para o Luigi */}
      <HeroGrid/>
      <BrandCarousel/>
    </div>
  );
}
