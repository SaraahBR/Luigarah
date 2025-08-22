"use client";

import Link from "next/link";
import { FiGlobe, FiUser, FiHeart, FiShoppingBag, FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";

const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border-b relative">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">

        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden text-2xl text-gray-800"
        >
          <FiMenu />
        </button>

        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link href="/mulher" className="text-gray-800 hover:text-gray-500 transition-colors">
            Mulher
          </Link>
          <Link href="/homem" className="text-gray-800 hover:text-gray-500 transition-colors">
            Homem
          </Link>
        </div>

        <div className="flex-1 text-center md:absolute md:left-1/2 md:-translate-x-1/2">
          <Link href="/" className="text-2xl text-gray-800 font-bold tracking-wider">
            LUIGARAH
          </Link>
        </div>

        <div className="flex items-center gap-5 text-xl">
          <button className="text-gray-800 hover:text-gray-500 transition-colors">
            <FiGlobe />
          </button>
          <Link href="/minha-conta" className="text-gray-800 hover:text-gray-500 transition-colors">
            <FiUser />
          </Link>
          <Link href="/favoritos" className="text-gray-800 hover:text-gray-500 transition-colors">
            <FiHeart />
          </Link>
          <Link href="/carrinho" className="text-gray-800 relative hover:text-gray-500 transition-colors">
            <FiShoppingBag />
            <span className="absolute -top-1 -right-2 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              0
            </span>
          </Link>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={() => setIsOpen(false)} className="text-2xl">
            <FiX />
          </button>
        </div>
        <nav className="flex flex-col px-4 py-4 space-y-4 text-gray-800 font-semibold">
          <Link href="/mulher" onClick={() => setIsOpen(false)}>Mulher</Link>
          <Link href="/homem" onClick={() => setIsOpen(false)}>Homem</Link>
        </nav>
      </div>
    </div>
  );
};

export default TopBar;
