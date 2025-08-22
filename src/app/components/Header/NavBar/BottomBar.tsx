"use client";

import { useState } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import Categorias from "./Categorias/Categorias";

const BottomBar = () => {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  return (
    <div className="bg-white border-t">
      <div className="container mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 py-4">
        
        <div className="hidden md:block">
          <Categorias />
        </div>

        <button
          className="md:hidden flex items-center gap-2 text-gray-800 font-semibold"
          onClick={() => setOpenMobileMenu(true)}
        >
          <FiMenu className="text-xl" />
          Categorias
        </button>

        <div className="text-gray-800 relative w-2/3 md:w-1/3">
          <input
            type="text"
            placeholder="O que você está procurando?"
            className="w-64 border-b-2 border-gray-300 focus:border-black outline-none transition-colors px-2 py-0.5 text-xs" 
          />
          <FiSearch className="absolute top-1/2 right-0 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {openMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpenMobileMenu(false)} />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300
        ${openMobileMenu ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="container mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-4 py-4">
          <span className="text-lg font-semibold">Categorias</span>
          <button onClick={() => setOpenMobileMenu(false)} className="text-2xl">
            <FiX />
          </button>
        </div>
        <div className="px-4 py-4">
          <Categorias mobile />
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
