'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image'; // Next.js 이미지 최적화

// 샘플 추천상품 (실제 구현 시 props나 API 등에서 가져올 수 있음)
const recommended = [
  {
    id: 'rec1',
    name: 'Sundae Funday Dog Collar',
    price: 35,
    image: 'https://ext.same-assets.com/1667191207/1597653608.jpeg',
  },
  {
    id: 'rec2',
    name: 'Island Time Dog Collar',
    price: 35,
    image: 'https://ext.same-assets.com/1667191207/2069186592.jpeg',
  },
  {
    id: 'rec3',
    name: 'Island Time Dog Bow Tie',
    price: 20,
    image: 'https://ext.same-assets.com/1667191207/3124710205.jpeg',
  },
];

export default function SideCart() {
  const { cart, isCartOpen, setCartOpen, updateQuantity, removeFromCart, addToCart } = useCart();

  const total = cart.reduce(
    (acc, item) => acc + Number(String(item.price).replace(/[^0-9.]/g, "")) * item.quantity, 0
  ).toFixed(2);

  // 추천상품에서 이미 카트에 담긴 것은 제외
  const filteredRecommended = recommended.filter(
    rec => !cart.find(item => item.id === rec.id)
  );

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setCartOpen(false)}
      />
      {/* 사이드 카트 */}
      <div className={`fixed top-0 right-0 w-[350px] h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* X 버튼: 항상 노출 */}
        <button
          onClick={() => setCartOpen(false)}
          className="absolute top-4 right-4 text-2xl font-bold text-[var(--accent)] hover:text-black transition z-50"
          aria-label="Close Cart"
        >✕</button>
        <h2 className="text-xl font-extrabold p-4 text-[#175943]">Your Cart</h2>
        <div className="overflow-y-auto px-4" style={{ maxHeight: '330px' }}>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center mt-12">Your cart is empty.</p>
          ) : (
            cart.map(item => (
              <div key={item.id + item.size} className="flex items-center gap-2 mb-6 border-b pb-4 border-gray-200">
                {/* 썸네일 이미지 */}
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#175943] truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">Size: {item.size}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                      className="w-7 h-7 rounded-full bg-[#175943] text-white font-bold flex items-center justify-center"
                    >-</button>
                    <span className="px-2 font-bold text-[#175943]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-[#175943] text-white font-bold flex items-center justify-center"
                    >+</button>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="text-gray-400 hover:text-red-500 text-lg mb-2"
                    title="Remove item"
                  >✕</button>
                  <span className="text-sm font-semibold text-[#175943]">
                    ${(Number(String(item.price).replace(/[^0-9.]/g, "")) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        {/* 추천상품 */}
        {filteredRecommended.length > 0 && (
          <div className="p-4 bg-[#f7f3eb] border-t">
            <h3 className="font-bold text-[var(--accent)] text-sm mb-2 tracking-widest text-center">
              YOUR PUP WILL ALSO LOVE
            </h3>
            <div className="space-y-3">
              {filteredRecommended.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded shadow" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#175943] truncate text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">${item.price}</p>
                  </div>
                  <button
                    className="bg-[#175943] hover:bg-[var(--accent)] text-white px-4 py-1 rounded text-xs font-bold"
                    onClick={() => addToCart({ ...item, quantity: 1, size: 'M' })}
                  >
                    ADD
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* 하단 */}
        <div className="absolute bottom-0 w-full p-4 bg-white border-t">
          <p className="text-lg font-bold text-[#175943]">Subtotal: ${total}</p>
          <Link href="/cart" className="block w-full bg-[var(--accent)] text-[#175943] py-3 mt-2 text-center rounded font-bold hover:bg-[var(--accent-light)]">
            View Full Cart
          </Link>
        </div>
      </div>
    </>
  );
}