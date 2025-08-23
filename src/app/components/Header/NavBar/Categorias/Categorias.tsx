"use client";

import { useState } from "react";
import Link from "next/link";

type SubMenuItem = {
  name: string;
  href: string;
};

type NavigationItem = {
  name: string;
  href?: string;
  submenu?: SubMenuItem[];
};

const navigationLinks: NavigationItem[] = [
  {
    name: "Marcas",
    submenu: [
      { name: "Ver Todas", href: "/produtos/marcas" },
      { name: "Balenciaga", href: "/produtos/marcas/balenciaga" },
      { name: "Balmain", href: "/produtos/marcas/balmain" },
      { name: 'Burberry', href: '/produtos/marcas/burberry' },
      { name: 'Chloé', href: '/produtos/marcas/chloe' },
      { name: 'Dolce & Gabbana', href: '/produtos/marcas/dolce-gabbana' },
      { name: 'Ferragamo', href: '/produtos/marcas/ferragamo' },
    ],
  },
  {
    name: "Bolsas",
    submenu: [
      { name: "Ver Todas", href: "/produtos/bolsas" },
      { name: "Bolsas Bucket", href: "/produtos/bolsas/bucket" },
      { name: 'Bolsas Conscius', href: '/produtos/bolsas/conscius' },
      { name: 'Bolsas de Praia', href: '/produtos/bolsas/praia' },
      { name: 'Bolsas Mini', href: '/produtos/bolsas/mini' },
      { name: 'Bolsas Tiracolo', href: '/produtos/bolsas/tiracolo' },
      { name: 'Bolsas Tote', href: '/produtos/bolsas/tote' },
    ],
  },
  {
    name: "Roupas",
    submenu: [
      { name: "Ver Todas", href: "/produtos/roupas" },
      { name: "Fitness", href: "/produtos/roupas/fitness" },
      { name: 'Moda Praia', href: '/produtos/roupas/praia' },
      { name: 'Casacos', href: '/produtos/roupas/casacos' },
      { name: 'Jeans', href: '/produtos/roupas/jeans' },
      { name: 'Vestidos', href: '/produtos/roupas/vestidos' },
      { name: 'Jaquetas', href: '/produtos/roupas/jaquetas' },
    ],
  },
  {
    name: "Sapatos",
    submenu: [
      { name: "Ver Todos", href: "/produtos/sapatos" },
      { name: "Botas", href: "/produtos/sapatos/botas" },
      { name: 'Coturnos', href:'/produtos/sapatos/coturnos' },
      { name: 'Sandálias', href:'/produtos/sapatos/sandalias' },
      { name: 'Mules', href:'/produtos/sapatos/mules' },
      { name: 'Sapatilhas', href:'/produtos/sapatos/sapatilhas' },
    ],
  },
];

const Categorias = ({ mobile = false }: { mobile?: boolean }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  if (mobile) {
    return (
      <nav>
        <ul className="space-y-4">
          {navigationLinks.map((link) => (
            <li key={link.name}>
              {link.submenu ? (
                <button
                  onClick={() => setOpenMenu(openMenu === link.name ? null : link.name)}
                  className="font-semibold text-gray-800 uppercase text-sm tracking-wider w-full text-left flex justify-between items-center"
                >
                  {link.name}
                  <span>{openMenu === link.name ? "−" : "+"}</span>
                </button>
              ) : (
                <Link href={link.href!} className="block font-semibold uppercase text-sm tracking-wider">
                  {link.name}
                </Link>
              )}

              {link.submenu && openMenu === link.name && (
                <ul className="pl-4 mt-2 space-y-2">
                  {link.submenu.map((sub) => (
                    <li key={sub.name}>
                      <Link href={sub.href} className="block text-sm text-gray-600 hover:underline">
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav>
      <ul className="flex items-center gap-8 h-14">
        {navigationLinks.map((link) => (
          <li
            key={link.name}
            className="relative h-full flex items-center"
            onMouseEnter={() => link.submenu && setOpenMenu(link.name)}
            onMouseLeave={() => link.submenu && setOpenMenu(null)}
          >
            {link.submenu ? (
              <button className="font-semibold uppercase text-sm tracking-wider text-gray-800 hover:text-black transition-colors duration-200">
                {link.name}
              </button>
            ) : (
              <Link href={link.href!} className="font-semibold uppercase text-sm tracking-wider">
                {link.name}
              </Link>
            )}

            {link.submenu && openMenu === link.name && (
              <div className="absolute top-full left-0 bg-white shadow-lg rounded-b-md p-6 w-64 z-20">
                <ul className="space-y-4">
                  {link.submenu.map((subItem) => (
                    <li key={subItem.name}>
                      <Link href={subItem.href} className="block text-sm text-gray-800 hover:underline">
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Categorias;
