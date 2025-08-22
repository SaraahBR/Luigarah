"use client";

import { useState } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import Categorias from "./Categorias/Categorias";

const BottomBar = () => {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  return (
    <div className="bg-white border-t">
      <div className="container mx-auto flex items-center md:justify-between md:items-center gap-4 px-4 py-4">
        
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

        <div className="relative flex-1 max-w-md lg:max-w-lg">
          <input
            type="text"
            placeholder="O que você está procurando?"
            className="w-full border-b border-gray-300 focus:border-black focus:ring-0 outline-none pr-10 py-1 text-sm placeholder-gray-400 transition-colors"
          />
          <FiSearch className="absolute top-1/2 right-2 sm:right-3 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      {openMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpenMobileMenu(false)} />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300
        ${openMobileMenu ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="container mx-auto flex items-center md:justify-between md:items-center gap-4 px-4 py-4">
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
