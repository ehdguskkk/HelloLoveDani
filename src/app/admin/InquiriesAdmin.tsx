'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/firebase';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

type UnifiedItem = {
  id: string;
  collection: 'inquiries' | 'qna';
  type: 'contact' | 'product';
  productId?: string;
  user?: string;
  name?: string;
  email?: string;
  phone?: string;
  content: string;
  answer?: string;
  createdAt?: any;
  answeredAt?: any;
  unread?: boolean;
};

function toDateText(v: any) {
  try {
    if (!v) return '';
    if (typeof v?.toDate === 'function') return v.toDate().toLocaleString();
    return new Date(v).toLocaleString();
  } catch {
    return '';
  }
}

export default function InquiriesAdmin() {
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'contact' | 'product'>('all');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      // inquiries
      const iq = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const isnap = await getDocs(iq);
      const fromInquiries: UnifiedItem[] = isnap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          collection: 'inquiries',
          type: (data?.type as 'contact' | 'product') || 'contact',
          productId: data?.productId || undefined,
          name: data?.name || undefined,
          email: data?.email || undefined,
          phone: data?.phone || undefined,
          user: data?.user || undefined,
          content: data?.content || data?.message || data?.question || '',
          answer: data?.answer || '',
          createdAt: data?.createdAt,
          answeredAt: data?.answeredAt,
          unread: data?.unread ?? true,
        };
      });

      // qna (호환)
      const qq = query(collection(db, 'qna'), orderBy('createdAt', 'desc'));
      const qsnap = await getDocs(qq);
      const fromQna: UnifiedItem[] = qsnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as any))
        .filter((v) => typeof v.productId === 'string' && typeof v.question === 'string')
        .map((v) => ({
          id: v.id,
          collection: 'qna',
          type: 'product' as const,
          productId: v.productId,
          user: v.user,
          name: v.name,
          email: v.email,
          phone: v.phone,
          content: v.question,
          answer: v.answer,
          createdAt: v.createdAt,
          answeredAt: v.answeredAt,
          unread: v.unread ?? true,
        }));

      setItems([...fromInquiries, ...fromQna]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const list = useMemo(() => {
    let arr = items;
    if (filter !== 'all') arr = arr.filter((i) => i.type === filter);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      arr = arr.filter(
        (i) =>
          (i.content || '').toLowerCase().includes(s) ||
          (i.answer || '').toLowerCase().includes(s) ||
          (i.email || '').toLowerCase().includes(s) ||
          (i.name || '').toLowerCase().includes(s) ||
          (i.productId || '').toLowerCase().includes(s)
      );
    }
    return [...arr].sort((a, b) => {
      const ta = (a.createdAt?.toMillis?.() ?? +new Date(a.createdAt ?? 0)) || 0;
      const tb = (b.createdAt?.toMillis?.() ?? +new Date(b.createdAt ?? 0)) || 0;
      return tb - ta;
    });
  }, [items, filter, q]);

  const startEdit = (id: string, init = '') => {
    setEditing((p) => ({ ...p, [id]: true }));
    setAnswers((p) => ({ ...p, [id]: init }));
  };

  const cancelEdit = (id: string) => {
    setEditing((p) => ({ ...p, [id]: false }));
    setAnswers((p) => ({ ...p, [id]: '' }));
  };

  const saveAnswer = async (it: UnifiedItem) => {
    const val = (answers[it.id] ?? '').trim();
    if (!val) return;
    await updateDoc(doc(db, it.collection, it.id), {
      answer: val,
      answeredAt: serverTimestamp(),
      unread: false,
      status: 'answered',
    });
    setItems((prev) =>
      prev.map((x) => (x.id === it.id ? { ...x, answer: val, unread: false } : x))
    );
    cancelEdit(it.id);
  };

  const markRead = async (it: UnifiedItem) => {
    if (!it.unread) return;
    await updateDoc(doc(db, it.collection, it.id), { unread: false });
    setItems((p) => p.map((x) => (x.id === it.id ? { ...x, unread: false } : x)));
  };

  return (
    <div className="max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#175943]">문의내역</h2>

        <div className="flex gap-2">
          {/* 검색 인풋 */}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="검색 (내용, 답변, 이메일, 상품ID)"
            className="border border-[#2e4d42]/30 bg-white text-[#175943] placeholder-[#6b7d76] rounded px-3 py-2 text-sm"
          />
          {/* 새로고침 버튼 (글자색 강제) */}
          <button
            onClick={load}
            disabled={loading}
            className="text-sm px-3 py-2 rounded border border-[#2e4d42]/30 bg-white text-[#175943] hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? '불러오는 중…' : '새로고침'}
          </button>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-3">
        {(['all', 'contact', 'product'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === t
                ? 'bg-yellow-400 text-[#175943] border-yellow-400 font-semibold'
                : 'bg-white text-[#175943] border-[#2e4d42]/30 hover:bg-gray-50'
            }`}
          >
            {t === 'all' ? '전체' : t === 'contact' ? 'Contact' : '상품 Q&A'}
          </button>
        ))}
      </div>

      {/* 리스트 */}
      {list.length === 0 ? (
        <div className="text-sm text-[#6b7d76]">아직 등록된 문의가 없습니다.</div>
      ) : (
        <ul className="divide-y divide-[#2e4d42]/10">
          {list.map((it) => (
            <li key={`${it.collection}:${it.id}`} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block text-xs px-2 py-[2px] rounded-full ${
                        it.type === 'product'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {it.type === 'product' ? '상품 Q&A' : 'Contact'}
                    </span>
                    {it.productId && (
                      <span className="text-xs text-[#6b7d76]">상품ID: {it.productId}</span>
                    )}
                    <span className="text-xs text-[#6b7d76]">{toDateText(it.createdAt)}</span>
                    {it.unread && (
                      <span className="text-xs bg-red-100 text-red-600 rounded px-2 py-[2px]">
                        새 문의
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-[#175943]">
                    <b className="text-[#175943]">Q:</b> {it.content}
                  </div>

                  <div className="mt-2 text-sm flex items-center flex-wrap gap-2">
                    <b className="text-[#175943]">A:</b>
                    {editing[it.id] ? (
                      <>
                        <input
                          value={answers[it.id] || ''}
                          onChange={(e) =>
                            setAnswers((p) => ({ ...p, [it.id]: e.target.value }))
                          }
                          className="border border-[#2e4d42]/30 bg-white text-[#175943] placeholder-[#6b7d76] rounded px-2 py-1 w-[320px] max-w-full"
                          placeholder="답변을 입력하세요"
                        />
                        <button
                          onClick={() => saveAnswer(it)}
                          className="bg-blue-500 text-white rounded px-3 py-1"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => cancelEdit(it.id)}
                          className="bg-gray-300 text-[#175943] rounded px-3 py-1"
                        >
                          취소
                        </button>
                      </>
                    ) : it.answer ? (
                      <>
                        <span className="text-[#175943]">{it.answer}</span>
                        <button
                          onClick={() => startEdit(it.id, it.answer)}
                          className="ml-2 bg-yellow-300 text-[#175943] rounded px-2 py-1"
                        >
                          수정
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          value={answers[it.id] || ''}
                          onChange={(e) =>
                            setAnswers((p) => ({ ...p, [it.id]: e.target.value }))
                          }
                          className="border border-[#2e4d42]/30 bg-white text-[#175943] placeholder-[#6b7d76] rounded px-2 py-1 w-[320px] max-w-full"
                          placeholder="답변을 입력하세요"
                        />
                        <button
                          onClick={() => saveAnswer(it)}
                          className="bg-yellow-300 text-[#175943] rounded px-3 py-1"
                        >
                          답변 등록
                        </button>
                      </>
                    )}
                  </div>

                  {(it.name || it.email || it.phone || it.user) && (
                    <div className="mt-2 text-xs text-[#6b7d76]">
                      {it.name && <span>이름: {it.name} </span>}
                      {it.email && <span>| 이메일: {it.email} </span>}
                      {it.phone && <span>| 전화: {it.phone} </span>}
                      {it.user && <span>| 사용자: {it.user}</span>}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <button
                    onClick={() => markRead(it)}
                    className="text-xs border border-[#2e4d42]/30 bg-white text-[#175943] rounded px-2 py-1 hover:bg-gray-50 disabled:opacity-60"
                    disabled={!it.unread}
                  >
                    읽음 처리
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}