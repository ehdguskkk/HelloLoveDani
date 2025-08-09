'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

type FireProduct = {
  name: string;
  image?: string;
  images?: string[];
  price?: number;
  basePrice?: number | null;
  variants?: { price?: number }[];
};

type CardProduct = {
  id: string;
  name: string;
  image: string;     // 썸네일 (images[0] 우선)
  price: number;     // 표시가
};

interface Props {
  excludeId?: string; // 현재 보고 있는 상품 id
}

function pickImage(p: FireProduct) {
  return (Array.isArray(p.images) && p.images.length ? p.images[0] : p.image) || '';
}

function computePrice(p: FireProduct) {
  if (Array.isArray(p.variants) && p.variants.length) {
    return Math.min(...p.variants.map(v => Number(v.price || 0)));
  }
  if (typeof p.basePrice === 'number') return p.basePrice;
  if (typeof p.price === 'number') return p.price;
  return 0;
}

export default function RecommendedProducts({ excludeId }: Props) {
  const [products, setProducts] = useState<CardProduct[]>([]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'products'));
      const arr: CardProduct[] = snap.docs
        .filter(d => (excludeId ? d.id !== excludeId : true))
        .map(d => {
          const data = d.data() as FireProduct;
          return {
            id: d.id,
            name: data.name,
            image: pickImage(data),
            price: computePrice(data),
          };
        });
      setProducts(arr);
    })();
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8 mb-8">
      {products.map(p => (
        <Link href={`/products/${p.id}`} key={p.id} className="block group">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition">
            {/* 미리보기/원격 모두 호환을 위해 img 사용 */}
            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          </div>
          <div className="mt-2 text-center">
            <span className="font-semibold text-[#175943]">{p.name}</span>
            <div className="text-gray-500 text-sm">${p.price}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}