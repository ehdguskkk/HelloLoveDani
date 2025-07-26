'use client';
import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Order, Product } from './adminTypes';

export default function OrderAdmin() {
// ----------- 4. 주문관리 -----------
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    getDocs(collection(db, "orders")).then(snap =>
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)))
    );
  }, []);
  return (
    <div className="border p-4 rounded mb-10 max-w-xl">
      <h2 className="font-bold mb-2">주문 관리</h2>
      <ul>
        {orders.map(o => (
          <li key={o.id} className="mb-1 border-b pb-1">
            <div>주문자: {o.user} | 금액: ${o.total} | 상태: {o.status} | {o.createdAt}</div>
            <div>상품: {o.products?.map((p, i) => <span key={i}>{(p as Product).name}({(p as any).qty}) </span>)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
