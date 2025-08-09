'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

import ProductAdmin from './ProductAdmin';
import CategoryAdmin from './CategoryAdmin';
import BannerAdmin from './BannerAdmin';
import OrderAdmin from './OrderAdmin';
import ReviewAdmin from './ReviewAdmin';
// QnaAdmin 제거!
import StaticPageAdmin from './StaticPageAdmin';
import InquiriesAdmin from './InquiriesAdmin'; // 문의내역 통합 컴포넌트

// 관리자 화이트리스트(실제 사용하는 이메일로 맞춰 주세요)
const ADMIN_EMAILS = [
  'sae4762@gmail.com',
  'minasong1031@gmail.com', // 필요시 수정/추가
];

export default function AdminPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [tab, setTab] = useState<
    'product' | 'category' | 'banner' | 'order' | 'review' | 'pages' | 'inquiries'
  >('product');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleGoogleLogin = () => signInWithPopup(auth, new GoogleAuthProvider());
  const handleLogout = () => signOut(auth);

  if (!user)
    return (
      <div className="h-screen flex items-center justify-center">
        <button
          className="bg-yellow-500 px-8 py-3 rounded text-lg text-white"
          onClick={handleGoogleLogin}
        >
          구글 로그인으로 관리자 진입
        </button>
      </div>
    );

  if (!user.email || !ADMIN_EMAILS.includes(user.email))
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <span>
          관리자 권한이 없습니다.
          <br />
          현재 로그인: {user.email}
        </span>
        <button className="bg-gray-300 px-6 py-2 rounded" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-8 px-2">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab('product')}
          className={tab === 'product' ? 'font-bold underline' : ''}
        >
          상품관리
        </button>
        <button
          onClick={() => setTab('category')}
          className={tab === 'category' ? 'font-bold underline' : ''}
        >
          카테고리관리
        </button>
        <button
          onClick={() => setTab('banner')}
          className={tab === 'banner' ? 'font-bold underline' : ''}
        >
          배너관리
        </button>
        <button
          onClick={() => setTab('order')}
          className={tab === 'order' ? 'font-bold underline' : ''}
        >
          주문관리
        </button>
        <button
          onClick={() => setTab('review')}
          className={tab === 'review' ? 'font-bold underline' : ''}
        >
          리뷰관리
        </button>
        <button
          onClick={() => setTab('pages')}
          className={tab === 'pages' ? 'font-bold underline' : ''}
        >
          페이지관리
        </button>
        <button
          onClick={() => setTab('inquiries')}
          className={tab === 'inquiries' ? 'font-bold underline' : ''}
        >
          문의내역
        </button>
        <button className="bg-red-400 px-3 py-1 rounded text-white ml-auto" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      <div>
        {tab === 'product' && <ProductAdmin />}
        {tab === 'category' && <CategoryAdmin />}
        {tab === 'banner' && <BannerAdmin />}
        {tab === 'order' && <OrderAdmin />}
        {tab === 'review' && <ReviewAdmin />}
        {tab === 'pages' && <StaticPageAdmin />}
        {tab === 'inquiries' && <InquiriesAdmin />}
      </div>
    </div>
  );
}