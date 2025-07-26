'use client';
import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Qna } from './adminTypes';

export default function QnaAdmin() {
// ----------- 6. Q&A관리 -----------
  const [qnas, setQnas] = useState<Qna[]>([]);
  useEffect(() => {
    getDocs(collection(db, "qna")).then(snap =>
      setQnas(snap.docs.map(d => ({ id: d.id, ...d.data() } as Qna)))
    );
  }, []);
  return (
    <div className="border p-4 rounded mb-10 max-w-xl">
      <h2 className="font-bold mb-2">Q&A 관리</h2>
      <ul>
        {qnas.map(q => (
          <li key={q.id} className="mb-1 border-b pb-1">
            <div>상품ID: {q.productId} | {q.user} | Q: {q.question}</div>
            <div>A: {q.answer || <span className="text-red-500">아직 미답변</span>}</div>
            <div>{q.createdAt}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
