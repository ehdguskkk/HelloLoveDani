'use client';
import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Review } from './adminTypes';

export default function ReviewAdmin() {
// ----------- 5. 리뷰관리 -----------
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    getDocs(collection(db, "reviews")).then(snap =>
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)))
    );
  }, []);
  return (
    <div className="border p-4 rounded mb-10 max-w-xl">
      <h2 className="font-bold mb-2">리뷰 관리</h2>
      <ul>
        {reviews.map(r => (
          <li key={r.id} className="mb-1 border-b pb-1">
            <div>상품ID: {r.productId} | {r.user} | 평점: {r.rating} | {r.title}</div>
            <div>{r.content}</div>
            <div>{r.createdAt}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
