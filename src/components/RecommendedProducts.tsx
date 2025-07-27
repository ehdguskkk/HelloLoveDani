// components/RecommendedProducts.tsx

'use client';
import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  image: string;
  price?: number;
};

interface Props {
  excludeId?: string; // 현재 보고 있는 상품 id
}

export default function RecommendedProducts({ excludeId }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    getDocs(collection(db, 'products')).then(snap => {
      let arr = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      // 현재 상품은 추천에서 제외
      if (excludeId) arr = arr.filter(p => p.id !== excludeId);
      setProducts(arr);
    });
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8 mb-8">
      {products.map(product => (
        <Link href={`/products/${product.id}`} key={product.id} className="block group">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="mt-2 text-center">
            <span className="font-semibold text-[#175943]">{product.name}</span>
            <div className="text-gray-500 text-sm">${product.price}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}