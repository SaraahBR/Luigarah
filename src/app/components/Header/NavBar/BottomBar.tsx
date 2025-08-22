"use client";

import { useState } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import Categorias from "./Categorias/Categorias";

const BottomBar = () => {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  return (
    <div className="bg-white border-t">
      <div className="container mx-auto flex justify-between items-center px-4 h-14">
        
        {/* Desktop Categorias */}
        <div className="hidden md:block">
          <Categorias />
        </div>

        {/* Botão Mobile */}
        <button
          className="md:hidden flex items-center gap-2 text-gray-800 font-semibold"
          onClick={() => setOpenMobileMenu(true)}
        >
          <FiMenu className="text-xl" />
          Categorias
        </button>

        {/* Barra de Busca */}
        <div className="text-gray-800 relative w-2/3 md:w-1/3">
          <input
            type="text"
            placeholder="O que você está procurando?"
            className="w-full border-b-2 border-gray-300 focus:border-black outline-none transition-colors pr-8 py-1 text-sm"
          />
          <FiSearch className="absolute top-1/2 right-0 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Drawer Mobile */}
      {openMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpenMobileMenu(false)} />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300
        ${openMobileMenu ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <span className="text-lg font-semibold">Categorias</span>
          <button onClick={() => setOpenMobileMenu(false)} className="text-2xl">
            <FiX />
          </button>
        </div>
        {/* Reaproveitando Categorias, mas em versão mobile */}
        <div className="px-4 py-4">
          <Categorias mobile />
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
