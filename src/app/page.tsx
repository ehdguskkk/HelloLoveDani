"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

// ---------- Types ----------
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
  order?: number;
};

type Banner = {
  // 기본
  image: string;
  mobileImage?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  link?: string;

  // 정렬/스타일
  hAlign?: "left" | "center" | "right"; // 수평 정렬
  vAlign?: "top" | "center" | "bottom"; // 수직 정렬
  overlay?: number;                     // 0~80
  offsetX?: number;                     // -50 ~ 50 (%)
  offsetY?: number;                     // -50 ~ 50 (%)
  titleColor?: string;
  subtitleColor?: string;
  ctaBgColor?: string;
  ctaTextColor?: string;

  // 가시성/정렬 순서
  visible?: boolean;
  order?: number;

  // 상/하 여백 보정(px, 음수 가능)
  padAdjust?: number;
};

// ---------- Page ----------
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banner, setBanner] = useState<Banner | null>(null);

  // 상품
  useEffect(() => {
    async function fetchProducts() {
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[]
      );
    }
    fetchProducts();
  }, []);

  // 카테고리(정렬)
  useEffect(() => {
    async function fetchCategories() {
      const snapshot = await getDocs(collection(db, "categories"));
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Category),
      }));
      fetched.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setCategories(fetched);
    }
    fetchCategories();
  }, []);

  // 배너: visible=true + order asc, 1건 (실시간)
  useEffect(() => {
    const qBanners = query(
      collection(db, "banners"),
      where("visible", "==", true),
      orderBy("order", "asc"),
      limit(1)
    );
    const off = onSnapshot(qBanners, (snap) => {
      if (snap.empty) {
        setBanner(null);
        return;
      }
      setBanner(snap.docs[0].data() as Banner);
    });
    return off;
  }, []);

  // ---------- Hero 계산값 ----------
  // 수평 정렬(컨테이너의 주축 정렬) + 텍스트 정렬
  const hJustify =
    banner?.hAlign === "left"
      ? "justify-start"
      : banner?.hAlign === "right"
      ? "justify-end"
      : "justify-center";
  const textAlign =
    banner?.hAlign === "left"
      ? "text-left"
      : banner?.hAlign === "right"
      ? "text-right"
      : "text-center";

  // 수직 정렬(자식의 교차축 위치)
  const vSelf =
    banner?.vAlign === "top"
      ? "self-start"
      : banner?.vAlign === "bottom"
      ? "self-end"
      : "self-center";

  // 오버레이 alpha (0~80 → 0~1로 매핑)
  const overlayAlpha = Math.min(Math.max((banner?.overlay ?? 0) / 80, 0), 1);

  // 오프셋(%)
  const dx = banner?.offsetX ?? 0;
  const dy = banner?.offsetY ?? 0;

  // 색상 기본값
  const titleColor = banner?.titleColor || "#F2D0A4";
  const subtitleColor = banner?.subtitleColor || "#FBEEDB";
  const ctaBgColor = banner?.ctaBgColor || "#F2D0A4";
  const ctaTextColor = banner?.ctaTextColor || "#274B4D";

  // 배너 섹션 상/하 여백 보정 (음수 가능)
  const padAdjust = banner?.padAdjust ?? 0;

  return (
    <main>
      {/* ===== Hero Banner ===== */}
      <section
        className="relative h-[520px] md:h-[560px] overflow-hidden my-0"
        style={{
          marginTop: padAdjust,
          marginBottom: padAdjust,
        }}
      >
        {/* 모바일 이미지 */}
        <Image
          src={
            banner?.mobileImage ||
            banner?.image ||
            "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80"
          }
          alt={banner?.title || "Hero Banner"}
          fill
          className="object-cover md:hidden"
          priority
        />

        {/* 데스크탑 이미지 */}
        <Image
          src={
            banner?.image ||
            "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1600&q=80"
          }
          alt={banner?.title || "Hero Banner"}
          fill
          className="hidden md:block object-cover"
          priority
        />

        {/* 어둡게 오버레이 */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${overlayAlpha})` }}
        />

        {/* 카피/버튼 레이어 */}
        <div className={`relative z-10 h-full w-full flex ${hJustify} px-4`}>
          <div
            className={`${vSelf} ${textAlign} max-w-3xl`}
            style={{ transform: `translate(${dx}%, ${dy}%)` }}
          >
            <h1
              className="text-[42px] md:text-[64px] font-bold leading-tight mb-4 drop-shadow"
              style={{
                color: titleColor,
                fontFamily: "Montserrat, Playfair Display, sans-serif",
              }}
            >
              {banner?.title || "Bright Styles, Retro Vibes!"}
            </h1>

            <p
              className="text-lg md:text-2xl mb-8 drop-shadow"
              style={{
                color: subtitleColor,
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              {banner?.subtitle ||
                "Gear up your pup with neon classics & stand out in style."}
            </p>

            {(banner?.ctaText || "Explore Collection") && (
              <Link
                href={banner?.link || "/collections/all"}
                className="inline-block font-bold py-3 px-8 rounded-full shadow transition duration-300"
                style={{
                  backgroundColor: ctaBgColor,
                  color: ctaTextColor,
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                {banner?.ctaText || "Explore Collection"}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ===== 메인 상품 그리드 ===== */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Shop Our Collection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.length === 0 ? (
              <div className="col-span-4 text-center text-gray-500">
                No products found.
              </div>
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
                    <p className="text-gray-600">
                      {product.price ? `$${product.price}` : ""}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== 카테고리 ===== */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Shop our best sellers!
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {categories.length === 0 ? (
              <div className="col-span-4 text-center text-gray-500">
                No categories found.
              </div>
            ) : (
              categories.map((cat) => (
                <Link
                  href={`/collections/${cat.value}`}
                  className="relative group"
                  key={cat.value}
                >
                  <Image
                    src={cat.image || "/default-image.png"}
                    alt={cat.label}
                    width={400}
                    height={400}
                    className="rounded-lg group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-black/25 flex justify-center items-center rounded-lg">
                    <h3 className="text-white text-2xl font-bold">{cat.label}</h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== 리뷰(데모) ===== */}
      <section className="bg-[#f8f8f8] py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                width={28}
                height={28}
                fill="#d1a980"
                className="mx-1"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.568-.955L10 0l2.942 5.955 6.568.955-4.755 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <h2 className="text-4xl font-serif font-semibold mb-2 text-[#4a5c47]">
            What Our Customers Say
          </h2>
          <p className="mb-10 text-lg text-gray-500">
            5-star reviews from dog lovers across Australia.
            <br />
            See how HelloLoveDani makes every day more special!
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-600 mb-6">
                “Absolutely love these bandanas! The embroidery is beautiful and
                the fabric feels premium. My pup gets compliments every time we
                go for a walk.”
              </p>
              <span className="font-bold text-[#4a5c47]">Jessica L. · Sydney</span>
            </div>
            <div>
              <p className="text-gray-600 mb-6">
                “My dog usually hates wearing collars, but the harness from
                HelloLoveDani is so comfy he actually gets excited when I pull
                it out. Super cute design too!”
              </p>
              <span className="font-bold text-[#4a5c47]">Ben W. · Melbourne</span>
            </div>
            <div>
              <p className="text-gray-600 mb-6">
                “Fast shipping, lovely packaging, and the quality is even better
                than expected. I got a custom order for my friend’s dog and she
                loved it. Highly recommend!”
              </p>
              <span className="font-bold text-[#4a5c47]">Emma P. · Brisbane</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 인스타그램 ===== */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#175943]">
            Instagram with HelloLoveDani
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {["/insta1.png", "/insta2.png", "/insta3.png", "/insta4.png", "/insta5.png", "/insta6.png"].map(
              (src, idx) => (
                <a
                  href="https://instagram.com/hellolovedani"
                  target="_blank"
                  rel="noopener noreferrer"
                  key={idx}
                >
                  <img
                    src={src}
                    alt={`Instagram photo ${idx + 1}`}
                    className="rounded-lg shadow hover:scale-105 transition"
                  />
                </a>
              )
            )}
          </div>
          <a
            href="https://instagram.com/hellolovedani"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD600] text-[#175943] font-semibold rounded-full shadow hover:bg-[#FFE082] transition text-lg"
          >
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