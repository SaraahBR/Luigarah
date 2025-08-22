import Link from 'next/link';
import { FiGlobe, FiUser, FiHeart, FiShoppingBag } from 'react-icons/fi';

const TopBar = () => {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        
        <div className="flex items-center gap-6 text-sm font-semibold">
          <Link href="/mulher" className="hover:text-gray-500 transition-colors">
            Mulher
          </Link>
          <Link href="/homem" className="hover:text-gray-500 transition-colors">
            Homem
          </Link>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="text-2xl font-bold tracking-wider">
            LUIGARAH
          </Link>
        </div>

        <div className="flex items-center gap-5 text-xl">
          <button className="hover:text-gray-500 transition-colors">
            <FiGlobe />
          </button>
          <Link href="/minha-conta" className="hover:text-gray-500 transition-colors">
            <FiUser />
          </Link>
          <Link href="/favoritos" className="hover:text-gray-500 transition-colors">
            <FiHeart />
          </Link>
          <Link href="/carrinho" className="relative hover:text-gray-500 transition-colors">
            <FiShoppingBag />
            <span className="absolute -top-1 -right-2 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              0
            </span>
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default TopBar;