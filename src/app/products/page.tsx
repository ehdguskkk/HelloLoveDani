'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

import { db } from '@/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ADMIN_EMAIL = "sae4762@gmail.com"; // 관리자 이메일만 접근 가능

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 로그인 상태 감지
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider());
  };
  const handleLogout = async () => {
    await signOut(auth);
  };

  // 관리자 이메일만 접근 가능!
  if (!user)
    return (
      <div className="h-screen flex items-center justify-center">
        <button className="bg-yellow-500 px-8 py-3 rounded text-lg text-white" onClick={handleGoogleLogin}>
          구글 로그인으로 관리자 진입
        </button>
      </div>
    );
  if (user.email !== ADMIN_EMAIL)
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <span>관리자 권한이 없습니다.<br />현재 로그인: {user.email}</span>
        <button className="bg-gray-300 px-6 py-2 rounded" onClick={handleLogout}>로그아웃</button>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">어드민 상품 관리 페이지</h1>
      <button className="bg-red-400 px-4 py-1 rounded text-white mb-6" onClick={handleLogout}>로그아웃</button>
      <ProductAdmin />
    </div>
  );
}

// ---------- 관리자 상품 등록/삭제 컴포넌트 ----------
function ProductAdmin() {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  // 상품 목록 불러오기
  useEffect(() => {
    async function fetchProducts() {
      const snapshot = await getDocs(collection(db, 'products'));
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    fetchProducts();
  }, []);

  // 상품 추가
  const handleAdd = async () => {
    if (!name || !price || !category) return alert('필수값 입력!');
    await addDoc(collection(db, 'products'), {
      name,
      image,
      price: Number(price),
      category,
    });
    setName(''); setImage(''); setPrice(''); setCategory('');
    // 새로고침
    const snapshot = await getDocs(collection(db, 'products'));
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // 상품 삭제
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="border p-4 rounded max-w-xl mt-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="상품명" className="border p-2" />
        <input value={image} onChange={e => setImage(e.target.value)} placeholder="이미지 URL" className="border p-2" />
        <input value={price} type="number" onChange={e => setPrice(Number(e.target.value))} placeholder="가격" className="border p-2 w-24" />
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="카테고리" className="border p-2" />
        <button onClick={handleAdd} className="bg-blue-500 px-4 py-2 rounded text-white">상품 등록</button>
      </div>
      <div>
        <h2 className="font-bold mb-2">상품 목록</h2>
        <ul>
          {products.map(product => (
            <li key={product.id} className="mb-2 flex items-center justify-between border-b pb-2">
              <span>
                <b>{product.name}</b> ({product.category}) - ${product.price}
                {product.image && (
                  <img src={product.image} alt={product.name} className="inline-block ml-3 w-12 h-12 object-cover rounded" />
                )}
              </span>
              <button onClick={() => handleDelete(product.id)} className="text-red-500 ml-4">삭제</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}