'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addDoc, collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query, updateDoc
} from 'firebase/firestore';
import { db, storage } from '@/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

type AlignH = 'left' | 'center' | 'right';
type AlignV = 'top' | 'center' | 'bottom';

export type Banner = {
  id?: string;
  desktop: string;           // 데스크톱 배경
  mobile?: string;           // 모바일 배경(선택)
  title: string;             // 제목
  subtitle?: string;         // 부제목(선택)
  buttonLabel: string;       // 버튼 문구
  link: string;              // 버튼 링크
  order: number;             // 노출 순서(낮을수록 앞으로)
  visible: boolean;          // 노출 여부
  overlay?: number;          // 배경 어둡기(0~80)
  /** ⬇ 새로 추가된 스타일 필드들 */
  textAlignH?: AlignH;       // 수평 정렬
  textAlignV?: AlignV;       // 수직 정렬
  offsetY?: number;          // 상/하 여백 보정(px)
  titleColor?: string;
  subtitleColor?: string;
  buttonBg?: string;
  buttonText?: string;
};

const DEFAULT: Banner = {
  desktop: '',
  mobile: '',
  title: '',
  subtitle: '',
  buttonLabel: 'Explore Collection',
  link: '/',
  order: 1,
  visible: true,
  overlay: 40,
  textAlignH: 'center',
  textAlignV: 'center',
  offsetY: 0,
  titleColor: '#FFE2A8',
  subtitleColor: '#FFFFFF',
  buttonBg: '#F0C94A',
  buttonText: '#2E2E2E',
};

export default function BannerAdmin() {
  const [form, setForm] = useState<Banner>(DEFAULT);
  const [items, setItems] = useState<Banner[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('order', 'asc'));
    const off = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as Banner) }));
      setItems(rows);
    });
    return off;
  }, []);

  const upload = async (file: File, pathPrefix: string) => {
    const r = ref(storage, `${pathPrefix}/${Date.now()}_${file.name}`);
    await uploadBytes(r, file);
    return await getDownloadURL(r);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, field: 'desktop'|'mobile') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await upload(file, 'banners');
      setForm(prev => ({ ...prev, [field]: url }));
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const reset = () => {
    setEditingId(null);
    setForm(DEFAULT);
  };

  const save = async () => {
    if (!form.desktop) {
      alert('배경 이미지를 넣어주세요.');
      return;
    }
    setLoading(true);
    try {
      const payload: Banner = {
        ...form,
        order: Number(form.order) || 1,
        overlay: Number(form.overlay) ?? 40,
        offsetY: Number(form.offsetY) ?? 0,
      };
      if (editingId) {
        await updateDoc(doc(db, 'banners', editingId), payload);
      } else {
        await addDoc(collection(db, 'banners'), payload);
      }
      reset();
    } finally {
      setLoading(false);
    }
  };

  const edit = (row: Banner) => {
    setEditingId(row.id!);
    setForm({
      ...DEFAULT,
      ...row,
    });
  };

  const remove = async (id?: string) => {
    if (!id) return;
    if (!confirm('삭제하시겠어요?')) return;
    await deleteDoc(doc(db, 'banners', id));
    if (editingId === id) reset();
  };

  /** 미리보기 스타일 계산 */
  const previewStyles = useMemo(() => {
    const hMap: Record<AlignH, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
    const vMap: Record<AlignV, string> = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
    return {
      wrapper: {
        backgroundImage: `url(${form.desktop || '/placeholder.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } as React.CSSProperties,
      mask: {
        background: `rgba(0,0,0,${(form.overlay ?? 40) / 100})`,
      } as React.CSSProperties,
      inner: {
        justifyContent: hMap[form.textAlignH ?? 'center'],
        alignItems: vMap[form.textAlignV ?? 'center'],
      } as React.CSSProperties,
      content: {
        textAlign: (form.textAlignH ?? 'center') as any,
        transform: `translateY(${Number(form.offsetY ?? 0)}px)`,
      } as React.CSSProperties,
      title: { color: form.titleColor ?? '#FFE2A8' } as React.CSSProperties,
      subtitle: { color: form.subtitleColor ?? '#FFFFFF' } as React.CSSProperties,
      button: {
        background: form.buttonBg ?? '#F0C94A',
        color: form.buttonText ?? '#2E2E2E',
      } as React.CSSProperties,
    };
  }, [form]);

  return (
    <div className="max-w-6xl mx-auto py-6">
      <h2 className="text-xl font-semibold mb-4">배너 / 이벤트 관리</h2>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 왼쪽: 폼 */}
        <div className="space-y-4">
          <label className="block">
            <span className="block text-sm mb-1">배경 이미지(URL)</span>
            <input
              value={form.desktop}
              onChange={(e) => setForm({ ...form, desktop: e.target.value })}
              className="w-full rounded border px-3 py-2"
              placeholder="https://..."
            />
          </label>

          <div className="flex gap-2">
            <input type="file" onChange={(e) => handleFile(e, 'desktop')} />
            <input type="file" onChange={(e) => handleFile(e, 'mobile')} />
          </div>

          <label className="block">
            <span className="block text-sm mb-1">모바일 이미지(URL · 선택)</span>
            <input
              value={form.mobile ?? ''}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              className="w-full rounded border px-3 py-2"
              placeholder="https://...(선택)"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block col-span-2">
              <span className="block text-sm mb-1">제목</span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded border px-3 py-2"
                placeholder="타이틀"
              />
            </label>

            <label className="block col-span-2">
              <span className="block text-sm mb-1">부제(선택)</span>
              <input
                value={form.subtitle ?? ''}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full rounded border px-3 py-2"
                placeholder="부제목"
              />
            </label>

            <label className="block">
              <span className="block text-sm mb-1">버튼 문구</span>
              <input
                value={form.buttonLabel}
                onChange={(e) => setForm({ ...form, buttonLabel: e.target.value })}
                className="w-full rounded border px-3 py-2"
                placeholder="Explore Collection"
              />
            </label>

            <label className="block">
              <span className="block text-sm mb-1">버튼 링크</span>
              <input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full rounded border px-3 py-2"
                placeholder="/collections/dog-bandanas"
              />
            </label>
          </div>

          {/* 새로 추가된 스타일 컨트롤 */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm mb-1">수평 정렬</span>
              <select
                value={form.textAlignH}
                onChange={(e) => setForm({ ...form, textAlignH: e.target.value as AlignH })}
                className="w-full rounded border px-3 py-2"
              >
                <option value="left">왼쪽</option>
                <option value="center">가운데</option>
                <option value="right">오른쪽</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-sm mb-1">수직 정렬</span>
              <select
                value={form.textAlignV}
                onChange={(e) => setForm({ ...form, textAlignV: e.target.value as AlignV })}
                className="w-full rounded border px-3 py-2"
              >
                <option value="top">상단</option>
                <option value="center">가운데</option>
                <option value="bottom">하단</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-sm mb-1">상·하 여백 보정(px)</span>
              <input
                type="number"
                value={form.offsetY ?? 0}
                onChange={(e) => setForm({ ...form, offsetY: Number(e.target.value) })}
                className="w-full rounded border px-3 py-2"
              />
            </label>

            <label className="block">
              <span className="block text-sm mb-1">배경 오버레이(0~80)</span>
              <input
                type="number"
                min={0}
                max={80}
                value={form.overlay ?? 40}
                onChange={(e) => setForm({ ...form, overlay: Number(e.target.value) })}
                className="w-full rounded border px-3 py-2"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="block">
              <span className="block text-sm mb-1">제목 색</span>
              <input
                type="color"
                value={form.titleColor ?? '#FFE2A8'}
                onChange={(e) => setForm({ ...form, titleColor: e.target.value })}
                className="h-10 w-full rounded border"
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1">부제 색</span>
              <input
                type="color"
                value={form.subtitleColor ?? '#FFFFFF'}
                onChange={(e) => setForm({ ...form, subtitleColor: e.target.value })}
                className="h-10 w-full rounded border"
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1">버튼 배경</span>
              <input
                type="color"
                value={form.buttonBg ?? '#F0C94A'}
                onChange={(e) => setForm({ ...form, buttonBg: e.target.value })}
                className="h-10 w-full rounded border"
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1">버튼 글자</span>
              <input
                type="color"
                value={form.buttonText ?? '#2E2E2E'}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                className="h-10 w-full rounded border"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm mb-1">순서</span>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full rounded border px-3 py-2"
              />
            </label>
            <label className="flex items-end gap-2">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => setForm({ ...form, visible: e.target.checked })}
              />
              <span>노출</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={loading}
              className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50"
            >
              {editingId ? '수정 저장' : '추가'}
            </button>
            {editingId && (
              <button onClick={reset} className="px-4 py-2 rounded bg-gray-200">
                취소
              </button>
            )}
          </div>
        </div>

        {/* 오른쪽: 미리보기 */}
        <div className="rounded-xl overflow-hidden border">
          <div className="relative h-[400px] md:h-[520px]" style={previewStyles.wrapper}>
            <div className="absolute inset-0" style={previewStyles.mask} />
            <div
              className="relative h-full w-full px-6 md:px-10 flex"
              style={previewStyles.inner}
            >
              <div style={previewStyles.content} className="max-w-[900px]">
                <h3
                  className="text-3xl md:text-6xl font-extrabold drop-shadow"
                  style={previewStyles.title}
                >
                  {form.title || 'Banner Title'}
                </h3>
                {form.subtitle && (
                  <p
                    className="mt-3 text-base md:text-2xl font-medium drop-shadow"
                    style={previewStyles.subtitle}
                  >
                    {form.subtitle}
                  </p>
                )}
                <button
                  className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold shadow"
                  style={previewStyles.button}
                  type="button"
                >
                  {form.buttonLabel || 'Explore'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 등록 리스트 */}
      <div className="mt-8">
        <h3 className="font-semibold mb-2">등록된 배너</h3>
        <div className="space-y-3">
          {items.map(b => (
            <div key={b.id} className="flex items-center gap-3 rounded border p-2">
              <img src={b.desktop} alt="" className="h-14 w-24 object-cover rounded" />
              <div className="text-sm grow">
                <div className="font-medium">{b.title}</div>
                <div className="text-gray-500">
                  순서 {b.order} · {b.visible ? '노출' : '숨김'} · overlay {b.overlay ?? 40}
                </div>
              </div>
              <button onClick={() => edit(b)} className="px-3 py-1 rounded bg-blue-500 text-white">
                수정
              </button>
              <button onClick={() => remove(b.id)} className="px-3 py-1 rounded bg-rose-500 text-white">
                삭제
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}