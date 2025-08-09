'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

type PageDoc = {
  /** 탭 제목 */
  title?: string;
  /** 부제 */
  subtitle?: string;
  /** 히어로 이미지 URL (관리자에서 파일 업로드 시 저장된 다운로드 URL) */
  imageUrl?: string;
  /** 본문(HTML) */
  content?: string;
  /** 정렬: left | center | right */
  align?: 'left' | 'center' | 'right';
  /** 배경 오버레이(0~80) */
  overlay?: number;
  /** 색상 설정 */
  colors?: {
    title?: string;
    subtitle?: string;
    buttonBg?: string;
    buttonText?: string;
  };
};

export default function ReturnsExchangesPage() {
  const [data, setData] = useState<PageDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Firestore: pages/returns 문서에서 가져옵니다.
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'pages', 'returns'));
        if (!mounted) return;

        if (snap.exists()) {
          setData(snap.data() as PageDoc);
        } else {
          setError('Returns & Exchanges 페이지 데이터가 없습니다.');
        }
      } catch (e: any) {
        setError(e?.message ?? '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const textAlignClass = useMemo(() => {
    if (!data?.align || data.align === 'center') return 'text-center items-center';
    if (data.align === 'left') return 'text-left items-start';
    return 'text-right items-end';
  }, [data?.align]);

  const overlayOpacity = useMemo(() => {
    // 관리자에서 0~80으로 저장한다고 가정
    const v = Number(data?.overlay ?? 0);
    return Math.max(0, Math.min(v, 80)) / 100;
  }, [data?.overlay]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-6">
        <div className="h-8 w-48 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="h-4 w-64 rounded bg-gray-200 animate-pulse mb-8" />
        <div className="h-48 rounded bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 text-red-500">
        Failed to load Returns & Exchanges.<br />
        {error}
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* 히어로 섹션 */}
      {data?.imageUrl && (
        <section className="relative w-full max-w-[1400px] mx-auto aspect-[16/6] rounded-2xl overflow-hidden mb-10">
          <Image
            src={data.imageUrl}
            alt={data.title || 'Returns & Exchanges'}
            fill
            className="object-cover"
            priority
          />
          {/* 오버레이 */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
          />
          {/* 텍스트 */}
          <div className={`absolute inset-0 flex ${textAlignClass} justify-center p-8`}>
            <div className="max-w-3xl">
              {data.title && (
                <h1
                  className="text-4xl md:text-5xl font-bold drop-shadow-sm mb-4"
                  style={{ color: data.colors?.title || 'var(--banner-title, #FFE08A)' }}
                >
                  {data.title}
                </h1>
              )}
              {data.subtitle && (
                <p
                  className="text-lg md:text-xl drop-shadow-sm"
                  style={{ color: data.colors?.subtitle || 'var(--banner-subtitle, #fff)' }}
                >
                  {data.subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 본문 */}
      <div className="max-w-3xl mx-auto px-6">
        {!data?.imageUrl && data?.title && (
          <h1 className="text-4xl font-bold mb-6 text-[var(--accent)]">
            {data.title}
          </h1>
        )}

        <div
          className="prose max-w-none prose-headings:scroll-mt-24 prose-a:text-[var(--accent)]"
          dangerouslySetInnerHTML={{ __html: data?.content || '' }}
        />
      </div>
    </div>
  );
}