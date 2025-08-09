'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection as fbCollection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';

type FireProduct = {
  name: string;
  image?: string;
  images?: string[];
  price?: number;
  basePrice?: number | null;
  variants?: { price?: number }[];
  category?: string;
};

type CardProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  href: string;
  category?: string;
};

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

export default function CollectionPageClient({ collection }: { collection: string }) {
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const col = decodeURIComponent(collection).toLowerCase();
        const q = query(fbCollection(db, 'products'), where('category', '==', col));
        const querySnapshot = await getDocs(q);

        const list: CardProduct[] = querySnapshot.docs.map(doc => {
          const data = doc.data() as FireProduct;
          return {
            id: doc.id,
            name: data.name,
            price: computePrice(data),
            image: pickImage(data),
            href: `/products/${doc.id}`,
            category: data.category,
          };
        });

        setProducts(list);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [collection]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 capitalize">
        {decodeURIComponent(collection)}
      </h1>

      {loading ? (
        <div className="text-center py-20">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-32">
              No products found in this category.
            </div>
          ) : (
            products.map(product => (
              <Link
                href={product.href}
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition hover:shadow-lg"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  width={533}
                  height={533}
                  className="object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600">${product.price}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}