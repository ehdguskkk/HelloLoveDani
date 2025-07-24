'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection as fbCollection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  href: string;
  category?: string;
};

export default function CollectionPageClient({ collection }: { collection: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const col = decodeURIComponent(collection).toLowerCase();
        const q = query(
          fbCollection(db, 'products'),
          where('category', '==', col)
        );
        const querySnapshot = await getDocs(q);
        const list: Product[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          list.push({
            id: doc.id,
            name: data.name,
            price: data.price,
            image: data.image,
            href: `/products/${doc.id}`,
            category: data.category,
          });
        });
        setProducts(list);
      } catch (err) {
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
                  style={{ objectFit: 'contain' }}
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