'use client';

import { useEffect, useMemo, useState } from 'react';
import { db, storage } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {
  ref as sRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';

/** ─────────────────────────────────────────────────────────────
 *  타입/상수
 *  ────────────────────────────────────────────────────────────*/
type BasicPageDoc = {
  type?: 'plain';
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  imageAlign?: 'left' | 'center' | 'right';
  updatedAt?: number;
};

type SizeRow = { size: string; neck: string; for: string };
type SizeGuideDoc = {
  type: 'size_guide';
  title?: string;
  intro?: string;
  notes?: string;
  table: SizeRow[];
  image?: string;
  updatedAt?: number;
};

const PAGES = [
  { slug: 'about', label: 'About Us' },
  { slug: 'size-guide', label: 'Size Guide' },
  { slug: 'returns-exchanges', label: 'Returns & Exchanges' },
  { slug: 'contact', label: 'Contact Us' },
];

const DEFAULT_SIZE_ROWS: SizeRow[] = [
  { size: 'XS', neck: '20–25 cm', for: 'Puppy, Toy Breed' },
  { size: 'S', neck: '25–32 cm', for: 'Small Dogs (e.g. Maltese, Pomeranian)' },
  { size: 'M', neck: '32–40 cm', for: 'Medium Dogs (e.g. Shiba Inu, Cocker Spaniel)' },
  { size: 'L', neck: '40–48 cm', for: 'Large Dogs (e.g. Golden Retriever)' },
  { size: 'XL', neck: '48–55 cm', for: 'XL Dogs' },
];

/** ─────────────────────────────────────────────────────────────
 *  유틸
 *  ────────────────────────────────────────────────────────────*/
function PreviewBody({ text }: { text: string }) {
  const blocks = useMemo(() => {
    const lines = text.split('\n');
    const out: Array<{ type: 'p' | 'ul'; content: string[] }> = [];
    let curList: string[] | null = null;

    const flush = () => {
      if (curList?.length) out.push({ type: 'ul', content: curList });
      curList = null;
    };

    for (const raw of lines) {
      const line = raw.trimEnd();
      if (!line.trim()) {
        flush();
        continue;
      }
      if (line.trimStart().startsWith('- ')) {
        if (!curList) curList = [];
        curList.push(line.trimStart().slice(2));
      } else {
        flush();
        out.push({ type: 'p', content: [line] });
      }
    }
    flush();
    return out;
  }, [text]);

  return (
    <div className="space-y-4">
      {blocks.map((b, i) =>
        b.type === 'p' ? (
          <p key={i} className="leading-7 text-[#2c3f38]">
            {b.content[0]}
          </p>
        ) : (
          <ul key={i} className="list-disc list-inside space-y-1 text-[#2c3f38]">
            {b.content.map((li, k) => (
              <li key={k}>{li}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

const safeName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);

/** ─────────────────────────────────────────────────────────────
 *  컴포넌트
 *  ────────────────────────────────────────────────────────────*/
export default function StaticPageAdmin() {
  const [active, setActive] = useState<string>('about');
  const isSizeGuide = active === 'size-guide';

  // 공통(텍스트 페이지)
  const [titleStr, setTitleStr] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [imageAlign, setImageAlign] =
    useState<'left' | 'center' | 'right'>('center');

  // 파일 업로드 진행 상태
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Size Guide
  const [sgIntro, setSgIntro] = useState('');
  const [sgNotes, setSgNotes] = useState('');
  const [rows, setRows] = useState<SizeRow[]>([]);

  const [saving, setSaving] = useState(false);
  const tabLabel = useMemo(
    () => PAGES.find((p) => p.slug === active)?.label || 'Page',
    [active],
  );

  /** 데이터 로드 */
  useEffect(() => {
    const load = async () => {
      const ref = doc(db, 'pages', active);
      const snap = await getDoc(ref);
      const data = snap.data();

      if (!data) {
        if (isSizeGuide) {
          setSgIntro('Not sure which size to choose? Use our simple size guide below!');
          setSgNotes('*All measurements are approximate.');
          setRows(DEFAULT_SIZE_ROWS);
          setImage('');
        } else {
          setTitleStr(tabLabel);
          setSubtitle('');
          setContent('');
          setImage('');
          setImageAlign('center');
        }
        return;
      }

      if (isSizeGuide && data.type === 'size_guide') {
        const d = data as SizeGuideDoc;
        setSgIntro(d.intro || '');
        setSgNotes(d.notes || '');
        setRows(Array.isArray(d.table) && d.table.length ? d.table : DEFAULT_SIZE_ROWS);
        setImage(d.image || '');
      } else {
        const d = data as BasicPageDoc;
        setTitleStr(d.title || tabLabel);
        setSubtitle(d.subtitle || '');
        setContent(d.content || '');
        setImage(d.image || '');
        setImageAlign((d.imageAlign as any) || 'center');
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /** SizeGuide 행 조작 */
  const addRow = () => setRows((prev) => [...prev, { size: '', neck: '', for: '' }]);
  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));
  const moveRow = (idx: number, dir: -1 | 1) =>
    setRows((prev) => {
      const next = [...prev];
      const ni = idx + dir;
      if (ni < 0 || ni >= next.length) return prev;
      [next[idx], next[ni]] = [next[ni], next[idx]];
      return next;
    });
  const updateRow = (idx: number, key: keyof SizeRow, value: string) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));

  /** 저장 */
  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const ref = doc(db, 'pages', active);

      if (isSizeGuide) {
        const payload: SizeGuideDoc = {
          type: 'size_guide',
          title: 'Size Guide',
          intro: sgIntro,
          notes: sgNotes,
          image: image || '',
          table: rows.map((r) => ({
            size: r.size.trim(),
            neck: r.neck.trim(),
            for: r.for.trim(),
          })),
          updatedAt: Date.now(),
        };
        if ((await getDoc(ref)).exists()) await updateDoc(ref, payload as any);
        else await setDoc(ref, payload as any);
      } else {
        const payload: BasicPageDoc = {
          type: 'plain',
          title: titleStr.trim() || tabLabel,
          subtitle: subtitle.trim(),
          content,
          image: image || '',
          imageAlign,
          updatedAt: Date.now(),
        };
        if ((await getDoc(ref)).exists()) await updateDoc(ref, payload as any);
        else await setDoc(ref, payload as any);
      }
      alert('저장되었습니다.');
    } catch (e: any) {
      console.error(e);
      alert(e?.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  /** 파일 업로드 */
  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);

    const path = `pages/${active}/${Date.now()}_${safeName(file.name)}`;
    const ref = sRef(storage, path);
    const task = uploadBytesResumable(ref, file);

    task.on(
      'state_changed',
      (snap) => {
        const p = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setProgress(p);
      },
      (err) => {
        console.error(err);
        alert('업로드 실패: ' + (err?.message || ''));
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setImage(url); // 입력창 자동 채움 + 미리보기 반영
        setUploading(false);
      },
    );
  };

  /** 프리뷰 (텍스트 페이지 전용) */
  const Preview = () => {
    let justify = 'justify-center';
    if (imageAlign === 'left') justify = 'justify-start';
    if (imageAlign === 'right') justify = 'justify-end';

    return (
      <div className="rounded-xl border border-[#2e4d42]/20 bg-white p-6">
        {image ? (
          <div className={`flex ${justify} mb-6`}>
            <img src={image} alt="preview" className="max-h-60 w-auto rounded-2xl shadow-sm" />
          </div>
        ) : null}
        <h3 className="text-2xl md:text-3xl font-extrabold text-[#175943]">
          {titleStr || tabLabel}
        </h3>
        {subtitle && <p className="mt-2 text-[#4a5a54]">{subtitle}</p>}
        {content ? (
          <div className="mt-4">
            <PreviewBody text={content} />
          </div>
        ) : (
          <p className="mt-6 text-sm text-[#7a8a84]">본문을 입력하면 여기에서 미리보기가 표시됩니다.</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* 탭 */}
      <div className="flex gap-3 mb-6">
        {PAGES.map((p) => (
          <button
            key={p.slug}
            onClick={() => setActive(p.slug)}
            className={`px-6 py-3 rounded ${
              active === p.slug
                ? 'bg-yellow-400 text-[#175943] font-bold'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-[var(--accent,#175943)] mb-4">
        {PAGES.find((p) => p.slug === active)?.label}
      </h2>

      {isSizeGuide ? (
        /* ─────────────── Size Guide 그대로 ─────────────── */
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Intro</label>
              <input
                value={sgIntro}
                onChange={(e) => setSgIntro(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-[#175943] placeholder-[#6b7d76]"
                placeholder="Intro text"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Notes</label>
              <input
                value={sgNotes}
                onChange={(e) => setSgNotes(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-[#175943] placeholder-[#6b7d76]"
                placeholder="e.g. *All measurements are approximate."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Image URL (optional)</label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white text-[#175943] placeholder-[#6b7d76]"
              placeholder="https://your-image-url"
            />
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex items-center px-3 py-2 rounded border bg-white text-[#175943] cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickImage}
                  disabled={uploading}
                />
                파일 업로드
              </label>
              {uploading && (
                <span className="text-sm text-[#175943]">{progress}% 업로드 중…</span>
              )}
            </div>
          </div>

          {/* 표 편집기 */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 font-semibold">Size Table</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white border-b">
                  <tr>
                    <th className="text-left p-3 w-20">Size</th>
                    <th className="text-left p-3">Neck Circumference</th>
                    <th className="text-left p-3">Suitable For</th>
                    <th className="p-3 w-36 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">
                        <input
                          value={r.size}
                          onChange={(e) => updateRow(idx, 'size', e.target.value)}
                          className="w-20 border rounded p-2 bg-white text-[#175943]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={r.neck}
                          onChange={(e) => updateRow(idx, 'neck', e.target.value)}
                          className="w-full border rounded p-2 bg-white text-[#175943]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={r.for}
                          onChange={(e) => updateRow(idx, 'for', e.target.value)}
                          className="w-full border rounded p-2 bg-white text-[#175943]"
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => moveRow(idx, -1)} className="px-2 py-1 rounded border">↑</button>
                          <button onClick={() => moveRow(idx, 1)} className="px-2 py-1 rounded border">↓</button>
                          <button onClick={() => removeRow(idx)} className="px-2 py-1 rounded bg-red-600 text-white">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-gray-50">
              <button onClick={addRow} className="px-3 py-2 rounded border">+ 행 추가</button>
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className={`px-6 py-3 rounded text-white ${saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      ) : (
        /* ───────── 텍스트 페이지 (About/Returns/Contact) ───────── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌측 입력 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Title</label>
              <input
                value={titleStr}
                onChange={(e) => setTitleStr(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-[#175943] placeholder-[#6b7d76]"
                placeholder={tabLabel}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Subtitle (optional)</label>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-[#175943] placeholder-[#6b7d76]"
                placeholder="간단한 소개 문구"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Main Image</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-[#175943] placeholder-[#6b7d76]"
                placeholder="https://your-image-url"
              />
              <div className="mt-2 flex items-center gap-3">
                <label className="inline-flex items-center px-3 py-2 rounded border bg-white text-[#175943] cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPickImage}
                    disabled={uploading}
                  />
                  파일 업로드
                </label>
                {uploading && (
                  <span className="text-sm text-[#175943]">{progress}% 업로드 중…</span>
                )}
              </div>

              <div className="flex gap-3 mt-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" name="align" checked={imageAlign === 'left'} onChange={() => setImageAlign('left')} />
                  왼쪽
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="align" checked={imageAlign === 'center'} onChange={() => setImageAlign('center')} />
                  가운데
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="align" checked={imageAlign === 'right'} onChange={() => setImageAlign('right')} />
                  오른쪽
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Content (멀티라인, <span className="font-medium">- </span>로 시작하면 목록 처리)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-56 border rounded p-3 bg-white text-[#175943] placeholder-[#6b7d76]"
                placeholder={`예)\n우리의 미션은...\n\n- 높은 품질\n- 빠른 응대\n- 합리적인 가격`}
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className={`px-6 py-3 rounded text-white ${saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {saving ? '저장 중…' : 'Save'}
            </button>
          </div>

          {/* 우측 미리보기 */}
          <div>
            <div className="mb-2 text-sm text-gray-500">미리보기</div>
            <div className="rounded-xl border border-[#2e4d42]/20 bg-white p-6">
              {image && (
                <div
                  className={`flex ${
                    imageAlign === 'left'
                      ? 'justify-start'
                      : imageAlign === 'right'
                      ? 'justify-end'
                      : 'justify-center'
                  } mb-6`}
                >
                  <img src={image} alt="preview" className="max-h-60 w-auto rounded-2xl shadow-sm" />
                </div>
              )}
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#175943]">
                {titleStr || tabLabel}
              </h3>
              {subtitle && <p className="mt-2 text-[#4a5a54]">{subtitle}</p>}
              {content ? (
                <div className="mt-4">
                  <PreviewBody text={content} />
                </div>
              ) : (
                <p className="mt-6 text-sm text-[#7a8a84]">본문을 입력하면 여기에서 미리보기가 표시됩니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}