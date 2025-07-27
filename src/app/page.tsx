"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";


type Product = {
  id: string;
  name: string;
  image?: string;
  price?: number;
  [key: string]: any;
};

type Category = {
  id?: string;
  label: string;
  value: string;
  image?: string;
  order?: number; // 추가됨
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // 상품 불러오기
  useEffect(() => {
    async function fetchProducts() {
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
      );
    }
    fetchProducts();
  }, []);

  // 🔥 카테고리 Firestore에서 실시간 불러오기 (order 정렬 추가)
  useEffect(() => {
    async function fetchCategories() {
      const snapshot = await getDocs(collection(db, "categories"));
      const fetchedCategories = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Category),
      }));

      // 🔥 order 필드 기준 정렬 추가
      fetchedCategories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      setCategories(fetchedCategories);
    }
    fetchCategories();
  }, []);

  return (
    <main>
      {/* 배너 */}
      <section className="relative h-[500px] rounded-3xl overflow-hidden my-6 mx-2 md:mx-0">
        <Image
          src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80"
          alt="Retro Puppy Banner"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="absolute inset-0 bg-black/25 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#F2D0A4] drop-shadow-xl" style={{ fontFamily: 'Montserrat, Playfair Display, sans-serif' }}>
            Bright Styles, Retro Vibes!
          </h1>
          <p className="text-lg md:text-2xl mb-8 text-[#FBEEDB] drop-shadow" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Gear up your pup with neon classics &amp; stand out in style.
          </p>
          <Link href="/collections/all"
            className="bg-[#F2D0A4] text-[#274B4D] font-bold py-3 px-8 rounded-full shadow hover:bg-[#f6e2c3] transition duration-300"
            style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Explore Collection
          </Link>
        </div>
      </section>

      {/* 메인 상품 그리드 */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop Our Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.length === 0 ? (
              <div className="col-span-4 text-center text-gray-500">No products found.</div>
            ) : (
              products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <Image
                    src={product.image || "/default-image.png"}
                    alt={product.name}
                    width={533}
                    height={533}
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600">{product.price ? `$${product.price}` : ""}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 카테고리별 쇼핑 섹션 (정렬 적용됨) */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop our best sellers!</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {categories.length === 0 ? (
              <div className="col-span-4 text-center text-gray-500">No categories found.</div>
            ) : (
              categories.map(cat => (
                <Link href={`/collections/${cat.value}`} className="relative group" key={cat.value}>
                  <Image
                    src={cat.image || "/default-image.png"}
                    alt={cat.label}
                    width={400}
                    height={400}
                    className="rounded-lg group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-25 flex justify-center items-center">
                    <h3 className="text-white text-2xl font-bold">{cat.label}</h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="bg-[#f8f8f8] py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {/* Stars */}
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width={28} height={28} fill="#d1a980" className="mx-1" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.568-.955L10 0l2.942 5.955 6.568.955-4.755 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <h2 className="text-4xl font-serif font-semibold mb-2 text-[#4a5c47]">What Our Customers Say</h2>
          <p className="mb-10 text-lg text-gray-500">
            5-star reviews from dog lovers across Australia.<br />
            See how HelloLoveDani makes every day more special!
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-600 mb-6">
                “Absolutely love these bandanas! The embroidery is beautiful and the fabric feels premium. My pup gets compliments every time we go for a walk.”
              </p>
              <span className="font-bold text-[#4a5c47]">Jessica L. · Sydney</span>
            </div>
            <div>
              <p className="text-gray-600 mb-6">
                “My dog usually hates wearing collars, but the harness from HelloLoveDani is so comfy he actually gets excited when I pull it out. Super cute design too!”
              </p>
              <span className="font-bold text-[#4a5c47]">Ben W. · Melbourne</span>
            </div>
            <div>
              <p className="text-gray-600 mb-6">
                “Fast shipping, lovely packaging, and the quality is even better than expected. I got a custom order for my friend’s dog and she loved it. Highly recommend!”
              </p>
              <span className="font-bold text-[#4a5c47]">Emma P. · Brisbane</span>
            </div>
          </div>
        </div>
      </section>

      {/* 인스타그램 */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#175943]">Instagram with HelloLoveDani</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              "/insta1.png",
              "/insta2.png",
              "/insta3.png",
              "/insta4.png",
              "/insta5.png",
              "/insta6.png",
            ].map((src, idx) => (
              <a href="https://instagram.com/hellolovedani" target="_blank" rel="noopener noreferrer" key={idx}>
                <img src={src} alt={`Instagram photo ${idx + 1}`} className="rounded-lg shadow hover:scale-105 transition" />
              </a>
            ))}
          </div>
          <a href="https://instagram.com/hellolovedani" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD600] text-[#175943] font-semibold rounded-full shadow hover:bg-[#FFE082] transition text-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect width="20" height="20" x="2" y="2" rx="6" strokeWidth="2" />
              <circle cx="12" cy="12" r="5" strokeWidth="2" />
              <circle cx="18" cy="6" r="1.5" strokeWidth="2" />
            </svg>
            @hellolovedani
          </a>
        </div>
      </section>
    </main>
  );
}