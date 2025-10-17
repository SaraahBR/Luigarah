"use client";

import Link from "next/link";
import { RiDashboardLine } from "react-icons/ri";

export default function AdminDashboardIcon() {
  return (
    <Link
      href="/admin/dashboard"
      className="relative group"
      aria-label="Dashboard Admin"
    >
      <div className="relative">
        {/* Ícone principal */}
        <RiDashboardLine className="text-black group-hover:text-gray-600 transition-colors duration-300 relative z-10" />
        
        {/* Anel animado girante - preto e branco sutil */}
        <div className="absolute inset-0 -m-1.5">
          <div className="w-full h-full rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-full h-full" viewBox="0 0 40 40">
              <defs>
                <linearGradient id="adminGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#000000" stopOpacity="0.8" />
                  <stop offset="25%" stopColor="#404040" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#808080" stopOpacity="0.4" />
                  <stop offset="75%" stopColor="#404040" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="url(#adminGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="80 40"
              />
            </svg>
          </div>
        </div>

        {/* Pulse sutil ao hover */}
        <div className="absolute inset-0 -m-2 rounded-full bg-black opacity-0 group-hover:opacity-5 group-hover:animate-ping" />
      </div>
    </Link>
  );
}
