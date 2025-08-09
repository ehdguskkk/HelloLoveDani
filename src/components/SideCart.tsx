'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

type Variant = { id: string; size: string; price: number };
type ProductDoc = {
  id: string;
  name: string;
  image?: string;
  images?: string[];
  price?: number;            // 하위호환
  basePrice?: number | null; // 옵션 없을 때
  variants?: Variant[];
};

export default function SideCart() {
  const { cart, isCartOpen, setCartOpen, updateQuantity, removeFromCart, addToCart } = useCart();

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.price || 0) * item.quantity, 0).toFixed(2),
    [cart]
  );

  // Firestore에서 products 불러오기 (추천용)
  const [allProducts, setAllProducts] = useState<ProductDoc[]>([]);
  useEffect(() => {
    getDocs(collection(db, 'products')).then(snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as ProductDoc[];
      setAllProducts(arr);
    });
  }, []);

  // 카트에 이미 담긴 상품 제외
  const cartKeys = new Set(cart.map(i => i.id)); // 상품 단위로만 제외
  const recommended = allProducts.filter(p => !cartKeys.has(p.id));

  // 상품 표시/담기용 가격 계산
  const getMinPrice = (p: ProductDoc) => {
    if (Array.isArray(p.variants) && p.variants.length) {
      return Math.min(...p.variants.map(v => Number(v.price || 0)));
    }
    if (typeof p.basePrice === 'number') return p.basePrice;
    if (typeof p.price === 'number') return p.price;
    return 0;
  };

  // 추천에서 ADD 눌렀을 때 담을 기본 옵션 선택 (M 우선, 없으면 첫번째)
  const pickDefaultVariant = (p: ProductDoc): { size: string; price: number; variantId?: string } => {
    if (p.variants && p.variants.length > 0) {
      const byM = p.variants.find(v => v.size === 'M') || p.variants[0];
      return { size: byM.size, price: Number(byM.price || 0), variantId: byM.id };
    }
    const base = getMinPrice(p);
    return { size: 'base', price: Number(base || 0) };
    };

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setCartOpen(false)}
      />
      {/* 사이드 카트 */}
      <aside
        className={`fixed top-0 right-0 w-[350px] h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* X 버튼 */}
        <button
          onClick={() => setCartOpen(false)}
          className="absolute top-4 right-4 text-2xl font-bold text-black bg-white hover:text-black hover:bg-white transition z-50"
          aria-label="Close Cart"
        >
          ✕
        </button>

        <h2 className="text-xl font-extrabold p-4 text-[#175943]">Your Cart</h2>

        {/* 카트 목록 */}
        <div className="overflow-y-auto px-4" style={{ maxHeight: '330px' }}>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center mt-12">Your cart is empty.</p>
          ) : (
            cart.map(item => (
              <div key={`${item.id}_${item.size}`} className="flex items-center gap-2 mb-6 border-b pb-4 border-gray-200">
                {/* 썸네일 */}
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#175943] truncate">{item.name}</p>
                  {item.variantLabel ? (
                    <p className="text-xs text-gray-400">{item.variantLabel}</p>
                  ) : (
                    <p className="text-xs text-gray-400">Size: {item.size}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                      className="w-7 h-7 rounded-full bg-[#175943] text-white font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="px-2 font-bold text-[#175943]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-[#175943] text-white font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="text-gray-400 hover:text-red-500 text-lg mb-2"
                    title="Remove item"
                  >
                    ✕
                  </button>
                  <span className="text-sm font-semibold text-[#175943]">
                    ${(Number(item.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 추천 상품 */}
        {recommended.length > 0 && (
          <div className="p-4 bg-[#f7f3eb] border-t">
            <h3 className="font-bold text-[var(--accent)] text-sm mb-2 tracking-widest text-center">
              YOUR PUP WILL ALSO LOVE
            </h3>
            <div className="space-y-3">
              {recommended.map(p => {
                const img = p.image || p.images?.[0] || '';
                const minPrice = getMinPrice(p);
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <img src={img} alt={p.name} className="w-14 h-14 rounded shadow object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#175943] truncate text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">${minPrice}</p>
                    </div>
                    <button
                      className="bg-[#175943] hover:bg-[var(--accent)] text-white px-4 py-1 rounded text-xs font-bold"
                      onClick={() => {
                        const pick = pickDefaultVariant(p); // size/price/variantId
                        addToCart({
                          id: p.id,
                          name: p.name,
                          image: img,
                          price: pick.price,
                          quantity: 1,
                          size: pick.size,
                          variantId: pick.variantId,
                          variantLabel: pick.variantId ? `Size ${pick.size}` : undefined,
                        });
                      }}
                    >
                      ADD
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 하단 합계/버튼 */}
        <div className="absolute bottom-0 w-full p-4 bg-white border-t">
          <p className="text-lg font-bold text-[#175943]">Subtotal: ${subtotal}</p>
          <Link
            href="/cart"
            className="block w-full bg-[var(--accent)] text-[#175943] py-3 mt-2 text-center rounded font-bold hover:bg-[var(--accent-light)]"
            onClick={() => setCartOpen(false)}
          >
            View Full Cart
          </Link>
        </div>
      </aside>
    </>
  );
}