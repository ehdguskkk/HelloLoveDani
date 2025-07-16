import React from 'react';
import Link from 'next/link';

const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="bg-[#D1A980] py-8 px-4 mt-10 rounded-t-3xl shadow-inner">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* SHOP */}
          <div>
            <h3 className="text-xl font-bold text-[#FFD600] mb-4 font-[Playfair Display] tracking-wide">Shop</h3>
            <ul className="space-y-2 text-[#FFF8E1] font-semibold text-base">
              <li><Link href="/collections/all" className="hover:text-[#FFD600] transition">All Products</Link></li>
              <li><Link href="/collections/bandanas" className="hover:text-[#FFD600] transition">Bandanas</Link></li>
              <li><Link href="/collections/bows" className="hover:text-[#FFD600] transition">Ribbon Ties</Link></li>
              <li><Link href="/collections/sweaters" className="hover:text-[#FFD600] transition">Walk Set</Link></li>
            </ul>
          </div>
          {/* ABOUT */}
          <div>
            <h3 className="text-xl font-bold text-[#FFD600] mb-4 font-[Playfair Display] tracking-wide">About</h3>
            <ul className="space-y-2 text-[#FFF8E1] font-semibold text-base">
              <li><Link href="/about" className="hover:text-[#FFD600] transition">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-[#FFD600] transition">Contact</Link></li>
            </ul>
          </div>
          {/* SUPPORT */}
          <div>
            <h3 className="text-xl font-bold text-[#FFD600] mb-4 font-[Playfair Display] tracking-wide">Support</h3>
            <ul className="space-y-2 text-[#FFF8E1] font-semibold text-base">
              <li><Link href="/size-guide" className="hover:text-[#FFD600] transition">Size Guide</Link></li>
              <li><Link href="/returns-exchanges" className="hover:text-[#FFD600] transition">Returns & Exchanges</Link></li>
            </ul>
          </div>
          {/* 구독 */}
          <div>
            <h3 className="text-xl font-bold text-[#FFD600] mb-4 font-[Playfair Display] tracking-wide">Stay In Touch</h3>
            <p className="mb-3 text-[#FFF8E1]/90">Subscribe to get early access to new collections, offers, and more.</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="rounded-lg px-4 py-2 text-[#175943] bg-[#FFF8E1] placeholder-[#B8AD85] focus:outline-none focus:ring-2 focus:ring-[#FFD600] flex-1"
                required
              />
              <button
                type="submit"
                className="bg-[#FFD600] text-[#175943] font-bold rounded-lg px-6 py-2 hover:bg-[#ffe475] transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-[#FFD600]/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#FFF8E1]/80 text-sm">&copy; {currentYear} <span className="font-[Playfair Display] text-[#FFD600] font-bold">HelloLoveDani</span>. All rights reserved.</p>
          <div className="flex space-x-3">
            <a href="#" aria-label="Instagram" className="hover:text-[#FFD600] transition">
              {/* Instagram */}
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="6" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="18" cy="6" r="1.5" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-[#FFD600] transition">
              {/* Twitter/X */}
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M22 4.01c-.77.34-1.61.57-2.5.67A4.5 4.5 0 0 0 21.5 2a8.99 8.99 0 0 1-2.85 1.09A4.48 4.48 0 0 0 16 2c-2.5 0-4.5 2.02-4.5 4.5 0 .34.04.67.1.99C7.31 7.2 4.24 5.54 2.34 3.06c-.36.63-.57 1.37-.57 2.16 0 1.5.77 2.81 1.93 3.58-.71-.02-1.37-.22-1.95-.54v.05c0 2.1 1.48 3.83 3.45 4.23-.36.1-.74.16-1.13.16-.27 0-.54-.03-.8-.08.54 1.73 2.11 3 3.97 3.04C3.32 19.09 1 17.39 1 15.11c0-.19.01-.38.03-.56A8.98 8.98 0 0 0 12 21c7.89 0 12.21-6.54 12.21-12.21 0-.19 0-.38-.01-.57A8.75 8.75 0 0 0 22 4.01z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;