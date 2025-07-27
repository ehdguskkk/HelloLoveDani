'use client';
import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Order, Product } from './adminTypes';

export default function OrderAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 상품 전체 불러오기
  useEffect(() => {
    getDocs(collection(db, "products")).then(snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
  }, []);

  // 주문 불러오기
  useEffect(() => {
    getDocs(collection(db, "orders")).then(snap =>
      setOrders(
        snap.docs.map(d => {
          const data = d.data();
          let productsArr = [];
          if (Array.isArray(data.products)) {
            productsArr = data.products;
          } else if (typeof data.products === 'object' && data.products !== null) {
            productsArr = Object.values(data.products);
          }
          return {
            id: d.id,
            ...data,
            products: productsArr,
          } as Order;
        })
      )
    );
    setLoading(false);
  }, []);

  // id로 상품명 가져오기 (콘솔 추가)
  const getProductName = (id: string) => {
  console.log('products:', products);
  console.log('찾으려는 id:', id);
  // 모든 id 한 번 출력
  products.forEach(p => console.log('상품 id:', p.id, 'name:', p.name));
  const prod = products.find(p => p.id === id);
  console.log('prod:', prod);
  return prod ? prod.name : '(알 수 없음)';
};
  // 주문 삭제 함수
  const handleDelete = async (orderId: string) => {
    if (window.confirm("이 주문을 정말 삭제할까요?")) {
      await deleteDoc(doc(db, "orders", orderId));
      setOrders(prev => prev.filter(ord => ord.id !== orderId));
    }
  };

  return (
    <div className="border p-4 rounded mb-10 max-w-xl">
      <h2 className="font-bold mb-2">주문 관리</h2>
      {loading ? (
        <div>불러오는 중...</div>
      ) : (
        <ul>
          {orders.map(o => (
            <li key={o.id} className="mb-3 border-b pb-2">
              <div>
                <b>주문자:</b> {o.user} | <b>금액:</b> ${o.total} | <b>상태:</b> {o.status} | <b>주문일:</b> {o.createdAt}
                {/* 삭제 버튼 추가 */}
                <button
                  onClick={() => handleDelete(o.id)}
                  style={{ color: "red", marginLeft: "16px", fontSize: "0.95em", padding: "2px 8px", border: "1px solid #e2e2e2", borderRadius: "5px", background: "#fff", cursor: "pointer" }}
                >
                  삭제
                </button>
              </div>
              <div>
                <b>상품:</b>{" "}
                {Array.isArray(o.products) && o.products.length > 0
                  ? o.products.map((p: any, i: number) => (
                      <span key={i}>
                        {getProductName(p.id)}({p.qty})
                        {i < o.products.length - 1 ? ", " : ""}
                      </span>
                    ))
                  : <span className="text-gray-400">(알 수 없음)</span>
                }
              </div>
              <div>
                <b>주소:</b> {o.address ? o.address : <span className="text-gray-400">없음</span>}
              </div>
              <div>
                <b>연락처:</b> {o.phone ? o.phone : <span className="text-gray-400">없음</span>}
              </div>
              <div>
                <b>수령인:</b> {o.receiver ? o.receiver : <span className="text-gray-400">없음</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}