'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const getTotal = () =>
    cart.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-[var(--accent)]">Your Cart</h1>
        <div className="text-lg text-gray-500">Your cart is empty.</div>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] font-bold hover:bg-[var(--accent-light)] hover:text-white transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-[var(--accent)]">Your Cart</h1>

      <div className="bg-[var(--card-bg)] rounded-lg shadow p-6">
        {cart.map((item) => (
          <div
            key={`${item.id}:${item.size}`}
            className="flex items-center gap-8 py-4 border-b last:border-0 border-[var(--border)]"
          >
            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg text-[var(--text-primary)] truncate">
                {item.name}
              </div>
              <div className="text-sm text-gray-400">
                {item.variantLabel ? item.variantLabel : `Size: ${item.size}`}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() =>
                    updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))
                  }
                  className="w-7 h-7 rounded-full bg-[var(--bg-primary)] text-[var(--accent)] text-lg"
                >
                  -
                </button>
                <span className="mx-2 font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-[var(--bg-primary)] text-[var(--accent)] text-lg"
                >
                  +
                </button>

                <button
                  onClick={() => removeFromCart(item.id, item.size)}
                  className="ml-4 text-[var(--danger)] hover:text-red-600 transition"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="text-lg font-semibold text-[var(--accent)]">
              ${(Number(item.price) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-[var(--danger)] underline"
          >
            Clear Cart
          </button>
          <div className="text-2xl font-bold text-[var(--accent)]">
            Total: ${getTotal().toFixed(2)}
          </div>
        </div>

        {/* Checkout으로 이동 */}
        <button
          onClick={() => router.push('/checkout')}
          className="block mt-6 w-full text-center py-4 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] font-bold hover:bg-[var(--accent-light)] hover:text-white transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}