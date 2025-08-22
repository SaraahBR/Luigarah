'use client'
import { useState } from 'react';
import Link from 'next/link';

type SubMenuItem = {
  name: string;
  href: string;
};

type LinkItem = {
  name: string;
  href: string;
  submenu?: never; 
};

type SubmenuParentItem = {
  name: string;
  href?: never; 
  submenu: SubMenuItem[];
};

type NavigationItem = LinkItem | SubmenuParentItem;

const navigationLinks: NavigationItem[] = [
  { name: 'Marcas', 
    submenu: [
    { name: 'Ver Todas', href: '/marcas' },
    { name: 'Balenciaga', href: '/marcas/balenciaga' },
    { name: 'Balmain', href: '/marcas/balmain' },
    { name: 'Burberry', href: '/marcas/burberry' },
    { name: 'Chloé', href: '/marcas/chloe' },
    { name: 'Dolce & Gabbana', href: '/marcas/dolce-gabbana' },
    { name: 'Ferragamo', href: '/marcas/ferragamo' },
    ]
   },
  {
    name: 'Bolsas',
    submenu: [
      { name: 'Ver Todas', href: '/bolsas' },
      { name: 'Bolsas Bucket', href: '/bolsas/bucket' },
      { name: 'Bolsas Conscius', href: '/bolsas/conscius' },
      { name: 'Bolsas de Praia', href: '/bolsas/praia' },
      { name: 'Bolsas Mini', href: '/bolsas/mini' },
      { name: 'Bolsas Tiracolo', href: '/bolsas/tiracolo' },
      { name: 'Bolsas Tote', href: '/bolsas/tote' },
    ],
  },
  {
    name: 'Roupas',
    submenu: [
      { name: 'Ver Todas', href: '/roupas' },
      { name: 'Fitness', href: '/roupas/fitness' },
      { name: 'Moda Praia', href: '/roupas/praia' },
      { name: 'Casacos', href: '/roupas/casacos' },
      { name: 'Jeans', href: '/roupas/jeans' },
      { name: 'Vestidos', href: '/roupas/vestidos' },
      { name: 'Jaquetas', href: '/roupas/jaquetas' },
    ],
  },
  { name: 'Sapatos', 
    submenu: [
        { name: 'Ver Todos', href:'/sapatos' },
        { name: ' Scarpins & Peep Toes', href:'/sapatos/scarpins' },
        { name: 'Botas', href:'/sapatos/botas' },
        { name: 'Coturnos', href:'/sapatos/coturnos' },
        { name: 'Sandálias', href:'/sapatos/sandalias' },
        { name: 'Mules', href:'/sapatos/mules' },
        { name: 'Sapatilhas', href:'/sapatos/sapatilhas' },  
    ],
   },
];

const Categorias = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleMouseEnter = (menuName: string) => {
    setOpenMenu(menuName);
  };

  const handleMouseLeave = () => {
    setOpenMenu(null);
  };

  return (
    <nav>
      <ul className="flex items-center gap-8 h-14">
        {navigationLinks.map((link) => (
          <li
            key={link.name}
            className="relative h-full flex items-center"
            onMouseEnter={() => link.submenu && handleMouseEnter(link.name)}
            onMouseLeave={() => link.submenu && handleMouseLeave()}
          >
            {link.submenu ? (
              <button className="font-semibold uppercase text-sm tracking-wider">
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
                      <Link href={subItem.href} className="block hover:underline text-sm">
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
