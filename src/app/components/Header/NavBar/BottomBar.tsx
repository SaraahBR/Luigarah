"use client";

import Categorias from "./Categorias/Categorias";
import SearchBar from "./SearchBar";

const BottomBar = () => {
  return (
    <div className="bg-white border-t text-black">
      <div className="container mx-auto px-4 py-4">
        {/* Layout Desktop */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <div className="flex-1">
            <Categorias />
          </div>
          <div className="flex-shrink-0">
            <SearchBar />
          </div>
        </div>

        {/* Layout Mobile - busca centralizada */}
        <div className="md:hidden flex justify-center">
          <SearchBar />
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
