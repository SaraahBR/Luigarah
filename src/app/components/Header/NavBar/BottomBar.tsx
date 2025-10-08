"use client";

import { FiSearch } from "react-icons/fi";
import Categorias from "./Categorias/Categorias";

const BottomBar = () => {
  return (
    <div className="bg-white border-t text-black">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
        
        {/* Categorias - apenas desktop */}
        <div className="hidden md:block">
          <Categorias />
        </div>

        {/* Campo de busca */}
        <div className="relative flex-1 max-w-md lg:max-w-lg">
          <input
            type="text"
            placeholder="O que você está procurando?"
            className="w-full border-b border-gray-300 focus:border-black focus:ring-0 outline-none pr-10 py-1 text-sm text-black placeholder:text-gray-500 transition-colors"
          />
          <FiSearch className="absolute top-1/2 right-2 sm:right-3 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
