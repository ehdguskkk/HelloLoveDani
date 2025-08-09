'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import type { Product } from './adminTypes';

/** 화면에서 실제로 쓰는 필드만 가진 주문 타입 (배포 시 TS 엄격모드 대응) */
type AdminOrder = {
  id: string;
  user?: string;
  total?: number;
  status?: string;
  createdAt?: any;
  products?: { id: string; qty: number }[];
  address?: string;
  phone?: string;
  receiver?: string;
};

export default function OrderAdmin() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 상품/주문 한 번에 로드
  useEffect(() => {
    const load = async () => {
      try {
        const [prodSnap, orderSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'orders')),
        ]);

        const prodList = prodSnap.docs.map(
          (d) => ({ id: d.id, ...(d.data() as any) } as Product)
        );
        setProducts(prodList);

        const orderList: AdminOrder[] = orderSnap.docs.map((d) => {
          const data = d.data() as any;

          // products 형태 정규화 (배열/객체 모두 대응)
          let productsArr: { id: string; qty: number }[] = [];
          if (Array.isArray(data.products)) {
            productsArr = data.products;
          } else if (data.products && typeof data.products === 'object') {
            productsArr = Object.values(data.products);
          }

          return {
            id: d.id,
            ...data,
            products: productsArr,
          } as AdminOrder;
        });

        setOrders(orderList);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // id로 상품명 찾기
  const getProductName = (id: string) => {
    const p = products.find((x) => x.id === id);
    return p ? (p as any).name ?? '(이름 없음)' : '(알 수 없음)';
  };

  // 주문 삭제
  const handleDelete = async (orderId: string) => {
    if (!window.confirm('이 주문을 정말 삭제할까요?')) return;
    await deleteDoc(doc(db, 'orders', orderId));
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  return (
    <div className="border p-4 rounded mb-10 max-w-3xl">
      <h2 className="font-bold mb-3 text-lg">주문 관리</h2>

      {loading ? (
        <div>불러오는 중...</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-500">주문이 없습니다.</div>
      ) : (
        <ul>
          {orders.map((o) => (
            <li key={o.id} className="mb-4 border-b pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  <b>주문자:</b> {o.user ?? <span className="text-gray-400">-</span>}
                </span>
                <span>
                  <b>금액:</b>{' '}
                  {typeof o.total === 'number' ? `$${o.total}` : <span className="text-gray-400">-</span>}
                </span>
                <span>
                  <b>상태:</b> {o.status ?? <span className="text-gray-400">-</span>}
                </span>
                <span>
                  <b>주문일:</b> {o.createdAt ?? <span className="text-gray-400">-</span>}
                </span>

                <button
                  onClick={() => handleDelete(o.id)}
                  className="ml-auto text-red-600 border border-red-200 rounded px-2 py-[2px] hover:bg-red-50"
                >
                  삭제
                </button>
              </div>

              <div className="mt-2">
                <b>상품:</b>{' '}
                {Array.isArray(o.products) && o.products.length > 0 ? (
                  o.products.map((p, i) => (
                    <span key={`${o.id}-${p.id}-${i}`}>
                      {getProductName(p.id)}({p.qty})
                      {i < (o.products?.length ?? 0) - 1 ? ', ' : ''}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">(알 수 없음)</span>
                )}
              </div>

              <div className="mt-1">
                <b>주소:</b> {o.address ?? <span className="text-gray-400">없음</span>}
              </div>
              <div className="mt-1">
                <b>연락처:</b> {o.phone ?? <span className="text-gray-400">없음</span>}
              </div>
              <div className="mt-1">
                <b>수령인:</b> {o.receiver ?? <span className="text-gray-400">없음</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}