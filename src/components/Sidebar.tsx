'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface Category {
  name: string;
  href: string;
  order?: number; // 추가됨
}

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  categories?: Category[];
}

const Sidebar = ({ isOpen, closeSidebar, categories = [] }: SidebarProps) => {
  const [shopOpen, setShopOpen] = useState(true);

  // 🔥 카테고리를 order 필드 기준으로 정렬 추가
  const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-[9999] overflow-y-auto
      transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
      
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-bold">Menu</h2>
        <button onClick={closeSidebar} className="text-gray-600 hover:text-gray-800">
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="p-4">
        <ul>
          <li className="mb-4">
            <Link href="/" className="text-gray-800 hover:text-yellow-500">Home</Link>
          </li>

          <li className="mb-4">
            <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setShopOpen(prev => !prev)}>
              <span className="text-gray-800 hover:text-yellow-500 font-bold">Shop</span>
              {shopOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>

            {shopOpen && sortedCategories.length > 0 && (
              <ul className="pl-6 mt-2 rounded-lg py-2" style={{ minWidth: 180 }}>
                {sortedCategories.map(category => (
                  <li key={category.name} className="mb-2">
                    <Link href={category.href} className="block text-gray-700 hover:text-yellow-600 font-medium">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li className="mb-4"><Link href="/about" className="text-gray-800 hover:text-yellow-500">About Us</Link></li>
          <li className="mb-4"><Link href="/size-guide" className="text-gray-800 hover:text-yellow-500">Size Guide</Link></li>
          <li className="mb-4"><Link href="/returns-exchanges" className="text-gray-800 hover:text-yellow-500">Returns & Exchanges</Link></li>
          <li className="mb-4"><Link href="/contact" className="text-gray-800 hover:text-yellow-500">Contact Us</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;