'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

type AboutDoc = {
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;       // 관리자에서 저장한 키
  image_url?: string;      // 혹시 예전 키로 저장된 경우 대비
  align?: 'left' | 'center' | 'right';
};

export default function AboutPage() {
  const [data, setData] = useState<AboutDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'pages', 'about'));
        if (snap.exists()) {
          setData(snap.data() as AboutDoc);
        } else {
          // 문서가 없을 때 기본값
          setData({
            title: 'About Us',
            content:
              'Welcome to HelloLoveDani!\n\nWe make premium handmade pet accessories.',
            align: 'center',
          });
        }
      } catch {
        // 읽기 실패 시에도 기본값
        setData({
          title: 'About Us',
          content:
            'Welcome to HelloLoveDani!\n\nWe make premium handmade pet accessories.',
          align: 'center',
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-6 text-gray-400">
        Loading…
      </div>
    );
  }

  const title = data?.title ?? 'About Us';
  const subtitle = data?.subtitle ?? '';
  const content = data?.content ?? '';
  const imageUrl = data?.imageUrl || data?.image_url || '';
  const align = (data?.align || 'center') as 'left' | 'center' | 'right';

  const alignWrap: Record<'left' | 'center' | 'right', string> = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 flex flex-col gap-6">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full max-h-[360px] object-cover rounded-2xl shadow"
        />
      )}

      <div className={`flex flex-col ${alignWrap[align]}`}>
        <h1 className="text-4xl font-extrabold mb-2">{title}</h1>
        {subtitle && <p className="text-lg text-gray-500 mb-4">{subtitle}</p>}
      </div>

      {content && (
        <div className="prose prose-neutral max-w-none whitespace-pre-line">
          {content}
        </div>
      )}
    </div>
  );
}