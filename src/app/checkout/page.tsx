'use client';

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "@/components/StripePaymentForm";

// Stripe 초기화
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const AU_STATES = [
  { value: "", label: "State/Territory" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NSW", label: "New South Wales" },
  { value: "NT", label: "Northern Territory" },
  { value: "QLD", label: "Queensland" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "VIC", label: "Victoria" },
  { value: "WA", label: "Western Australia" },
];

const NZ_REGIONS = [
  { value: "", label: "Region" },
  { value: "Auckland", label: "Auckland" },
  { value: "Bay of Plenty", label: "Bay of Plenty" },
  { value: "Canterbury", label: "Canterbury" },
  { value: "Chatham Islands", label: "Chatham Islands" },
  { value: "Gisborne", label: "Gisborne" },
  { value: "Hawke's Bay", label: "Hawke's Bay" },
  { value: "Manawatū-Whanganui", label: "Manawatū-Whanganui" },
  { value: "Marlborough", label: "Marlborough" },
  { value: "Nelson", label: "Nelson" },
  { value: "Northland", label: "Northland" },
  { value: "Otago", label: "Otago" },
  { value: "Southland", label: "Southland" },
  { value: "Taranaki", label: "Taranaki" },
  { value: "Tasman", label: "Tasman" },
  { value: "Waikato", label: "Waikato" },
  { value: "Wellington", label: "Wellington" },
  { value: "West Coast", label: "West Coast" },
];

export default function CheckoutPage() {
  const { cart } = useCart();
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [country, setCountry] = useState("Australia");
  const [stateRegion, setStateRegion] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // PaymentIntent 생성
  useEffect(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(subtotal * 100) || 5700 }), // 센트단위
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, [subtotal]);

  return (
    <div className="min-h-screen bg-[#f9f7f3] flex items-center justify-center py-10">
      <div className="flex flex-col md:flex-row gap-10 w-full max-w-5xl">
        {/* Checkout Form + Payment */}
        <div className="bg-white rounded-2xl shadow-xl p-10 flex-1 min-w-[350px]">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#B99973] tracking-wider">Checkout</h2>
          <form className="space-y-7">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Contact (Email or Phone)</label>
              <input className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B99973] bg-[#faf9f6] text-lg" placeholder="you@example.com or 0412 345 678" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Delivery Address</label>
              <div className="flex gap-2 mb-2">
                <input className="flex-1 border border-gray-200 rounded-md px-4 py-3 bg-[#faf9f6]" placeholder="First name" />
                <input className="flex-1 border border-gray-200 rounded-md px-4 py-3 bg-[#faf9f6]" placeholder="Last name" />
              </div>
              <input className="w-full border border-gray-200 rounded-md px-4 py-3 mb-2 bg-[#faf9f6]" placeholder="Street address" />
              <input className="w-full border border-gray-200 rounded-md px-4 py-3 mb-2 bg-[#faf9f6]" placeholder="Apartment, suite, etc. (optional)" />
              <div className="flex gap-2">
                <input
                  className="basis-2/5 border border-gray-200 rounded-md px-4 py-3 bg-[#faf9f6]"
                  placeholder="City"
                />
                <select
                  className="basis-2/5 max-w-[180px] border border-gray-200 rounded-md px-4 py-3 bg-[#faf9f6]"
                  value={stateRegion}
                  onChange={e => setStateRegion(e.target.value)}
                  required
                >
                  {(country === "Australia" ? AU_STATES : NZ_REGIONS).map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <input
                  className="basis-1/5 max-w-[110px] border border-gray-200 rounded-md px-4 py-3 bg-[#faf9f6]"
                  placeholder={country === "Australia" ? "Postcode" : "Postal code"}
                />
              </div>
              <select
                className="w-full border border-gray-200 rounded-md px-4 py-3 mt-2 bg-[#faf9f6]"
                value={country}
                onChange={e => {
                  setCountry(e.target.value);
                  setStateRegion("");
                }}
              >
                <option>Australia</option>
                <option>New Zealand</option>
              </select>
            </div>
          </form>

          {/* Stripe 결제영역 - 영어로 고정 */}
          <div className="mt-10">
            {clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  locale: "en", // Stripe PaymentElement 언어를 영어로 고정
                }}
              >
                <StripePaymentForm />
              </Elements>
            ) : (
              <div>Loading payment form...</div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <h3 className="text-xl font-semibold mb-6 text-[#B99973] tracking-wide">Order Summary</h3>
          {cart.length === 0 ? (
            <div className="text-gray-400 mb-8">Your cart is empty.</div>
          ) : (
            cart.map((item) => (
              <div key={item.id + item.size} className="flex gap-3 items-center mb-6">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-gray-400 text-sm">
                    Size: {item.size} &middot; Qty: {item.quantity}
                  </div>
                </div>
                <div className="ml-auto font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))
          )}
          <div className="flex justify-between border-b pb-2 mb-2">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pb-2 mb-2">
            <span>Shipping</span>
            <span className="text-gray-400">Enter shipping address</span>
          </div>
          <div className="flex justify-between items-center pt-4">
            <span className="font-bold text-lg">Total</span>
            <span className="font-extrabold text-[#1C4636] text-2xl">AUD ${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}