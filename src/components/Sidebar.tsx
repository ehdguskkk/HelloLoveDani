'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const [isShopOpen, setShopOpen] = useState(false);

  const shopCategories = [
    { name: 'Bandanas', href: '/collections/bandanas' },
    { name: 'Ribbon Ties', href: '/collections/Ribbon Ties' },
    { name: 'Walk Set', href: '/collections/Walk Set' },
    { name: 'Coming Soon', href: '/collections/Coming Soon' },
  ];

  return (
    <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-bold">Menu</h2>
        <button onClick={closeSidebar} className="text-gray-600 hover:text-gray-800">
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="p-4">
        <ul>
          <li className="mb-4"><Link href="/" className="text-gray-800 hover:text-yellow-500">Home</Link></li>
          <li className="mb-4">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setShopOpen(!isShopOpen)}>
              <span className="text-gray-800 hover:text-yellow-500">Shop</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${isShopOpen ? 'rotate-180' : ''}`} />
            </div>
            {isShopOpen && (
              <ul className="pl-4 mt-2">
                {shopCategories.map((category) => (
                  <li key={category.name} className="mb-2"><Link href={category.href} className="text-gray-600 hover:text-yellow-500">{category.name}</Link></li>
                ))}
              </ul>
            )}
          </li>
          <li className="mb-4"><Link href="/about" className="text-gray-800 hover:text-yellow-500">About Us</Link></li>
          <li className="mb-4"><Link href="/size-guide" className="text-gray-800 hover:text-yellow-500">Size Guide</Link></li>
          <li className="mb-4"><Link href="/returns-exchanges" className="text-gray-800 hover:text-yellow-500">Returns &amp; Exchanges</Link></li>
          <li className="mb-4"><Link href="/contact" className="text-gray-800 hover:text-yellow-500">Contact Us</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
