'use client';

import Link from 'next/link';
import { useCart } from "@/context/CartContext";

interface Category {
  name: string;
  href: string;
}

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { cart, setCartOpen } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-[var(--bg-primary)] shadow-lg sticky top-0 z-50 font-[Montserrat]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-3 md:py-5">
          {/* 왼쪽: 텍스트 로고 + 햄버거 */}
          <div className="flex items-center gap-3 min-w-[180px]">
            <span className="text-xl font-bold text-white tracking-wide" style={{ letterSpacing: '0.02em' }}>
              HelloLoveDani
            </span>
            <button
              onClick={onMenuClick}
              className="text-[var(--accent)] bg-transparent shadow-none hover:text-[var(--accent-light)] hover:bg-transparent transition focus:outline-none"
              aria-label="Open menu"
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="4" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* 중앙: 로고 (이미지) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center select-none">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="HelloLoveDani Logo"
                className="h-14 md:h-20 drop-shadow-[0_4px_18px_rgba(23,89,67,0.18)]"
                style={{ filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.3))" }}
              />
            </Link>
          </div>

          {/* 오른쪽: 아이콘들 */}
          <div className="flex items-center space-x-2 md:space-x-4 min-w-[72px] justify-end">
            {/* 로그인 아이콘 링크 수정 */}
            <Link
              href="/login"
              className="text-[var(--accent)] bg-transparent shadow-none hover:text-[var(--accent-light)] hover:bg-transparent transition"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* 카트 */}
            <Link
              href="#"
              onClick={() => setCartOpen(true)}
              className="relative text-[var(--accent)] bg-transparent shadow-none hover:text-[var(--accent-light)] hover:bg-transparent transition"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-[var(--accent)] shadow">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;