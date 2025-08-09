'use client';

import { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { db, storage } from '@/firebase';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import type { Product, Variant } from './adminTypes';
import { DEFAULT_SIZES } from './adminTypes';
import VariantEditor from './VariantEditor';

// 간단 uuid
const uuid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// 갤러리 아이템 (URL 또는 새 파일)
type GalleryItem = { id: string; url?: string; file?: File; preview?: string };

export default function ProductAdmin() {
  // ── 폼 상태 ───────────────────────────────────────────────
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [detail, setDetail] = useState('');
  const [origin, setOrigin] = useState('');
  const [stock, setStock] = useState<number | ''>('');
  const [basePrice, setBasePrice] = useState<number | ''>('');

  // 🔥 이미지: 갤러리 리스트(기존 URL + 신규 파일 프리뷰 함께 관리)
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // 🔥 옵션(variants)
  const [variants, setVariants] = useState<Variant[]>(
    DEFAULT_SIZES.map((size) => ({ id: uuid(), size, price: 0, stock: 0, active: true }))
  );
  const [autoSyncPrice, setAutoSyncPrice] = useState(true);

  useEffect(() => {
    if (!autoSyncPrice) return;
    if (typeof basePrice !== 'number') return;
    setVariants((prev) => prev.map((v) => ({ ...v, price: basePrice })));
  }, [basePrice, autoSyncPrice]);

  // ── 카테고리/상품 목록 ────────────────────────────────────
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    setCategories(
      snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          label: (data.label || data.name || '').trim(),
          value: ((data.value || data.slug || '').trim()).toLowerCase(),
        };
      })
    );
  };
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    setProducts(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[]);
  };
  useEffect(() => { fetchCategories(); fetchProducts(); }, []);

  // ── 이미지 핸들러들 ───────────────────────────────────────
  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setGallery((prev) => [...prev, { id: uuid(), url }]);
    setImageUrlInput('');
  };

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const items: GalleryItem[] = files.map((f) => ({
      id: uuid(),
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setGallery((prev) => [...prev, ...items]);
    // 입력 초기화 (같은 파일 다시 선택 가능)
    e.currentTarget.value = '';
  };

  const removeImage = (index: number) => {
    setGallery((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    setGallery((prev) => {
      const next = [...prev];
      const newIdx = index + dir;
      if (newIdx < 0 || newIdx >= next.length) return prev;
      [next[index], next[newIdx]] = [next[newIdx], next[index]];
      return next;
    });
  };

  const setAsCover = (index: number) => {
    setGallery((prev) => {
      if (index === 0) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  // ── 파일 업로드 후 URL 얻기 ────────────────────────────────
  const uploadGalleryAndGetUrls = async (slugForPath: string) => {
    const urls: string[] = [];
    // 순서 유지: 갤러리 순서대로 URL 생성
    for (let i = 0; i < gallery.length; i++) {
      const g = gallery[i];
      if (g.url) {
        urls.push(g.url);
        continue;
      }
      if (g.file) {
        const ext = g.file.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `products/${slugForPath}/${Date.now()}_${i}.${ext}`);
        await uploadBytes(storageRef, g.file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
      }
    }
    return urls;
  };

  // ── 저장/수정 ─────────────────────────────────────────────
  const handleSubmit = async () => {
    // slug 대용: 영문 소문자/하이픈
    const slug =
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || uuid();

    // 이미지 업로드 → URL 배열
    const imageUrls = await uploadGalleryAndGetUrls(slug);

    // variants 가격 보정
    const finalVariants: Variant[] = (variants ?? []).map((v) => ({
      ...v,
      price: typeof v.price === 'number' && v.price > 0
        ? v.price
        : (typeof basePrice === 'number' ? basePrice : 0),
    }));

    // 리스트 노출용 최저가
    const displayPrice =
      finalVariants.length > 0
        ? Math.min(...finalVariants.map((v) => Number(v.price || 0)))
        : (typeof basePrice === 'number' ? basePrice : 0);

    const data: any = {
      name,
      category,
      shortDesc,
      longDesc: detail,
      origin,
      images: imageUrls,                // ✅ 여러 장 저장
      image: imageUrls[0] || '',        // 하위호환(대표 이미지)
      basePrice: finalVariants.length ? null : (typeof basePrice === 'number' ? basePrice : null),
      variants: finalVariants,
      price: displayPrice,
      stock: stock === '' ? 0 : Number(stock),
      visible: true,
      updatedAt: Date.now(),
      ...(editId ? {} : { createdAt: Date.now() }),
    };

    if (editId) {
      await updateDoc(doc(db, 'products', editId), data);
    } else {
      const created = await addDoc(collection(db, 'products'), data);
      // 새로 생성 후 편집 모드로 유지하려면 아래 라인 사용:
      // setEditId(created.id);
    }

    resetForm();
    await fetchProducts();
  };

  const resetForm = () => {
    // 미리보기 해제
    gallery.forEach((g) => g.preview && URL.revokeObjectURL(g.preview!));
    setGallery([]);
    setName('');
    setCategory('');
    setShortDesc('');
    setDetail('');
    setOrigin('');
    setStock('');
    setBasePrice('');
    setAutoSyncPrice(true);
    setVariants(DEFAULT_SIZES.map((size) => ({ id: uuid(), size, price: 0, stock: 0, active: true })));
    setEditId(null);
  };

  // 편집/복제
  const handleEdit = (product: Product, isCopy = false) => {
    setEditId(isCopy ? null : (product.id || null));
    setName(product.name || '');
    setCategory((product as any).category || '');
    setShortDesc((product as any).shortDesc || (product as any).description || '');
    setDetail((product as any).longDesc || (product as any).detail || '');
    setOrigin((product as any).origin || '');
    setStock((product as any).stock ?? '');

    // 이미지 갤러리 불러오기
    const imgs: string[] =
      (product as any).images && Array.isArray((product as any).images) && (product as any).images.length
        ? (product as any).images
        : ((product as any).image ? [(product as any).image] : []);

    // 기존 프리뷰 해제 후 교체
    gallery.forEach((g) => g.preview && URL.revokeObjectURL(g.preview!));
    setGallery(imgs.map((u) => ({ id: uuid(), url: u })));

    // 가격/옵션
    const pv = (product as any).variants as Variant[] | undefined;
    const bp = (product as any).basePrice ?? (product as any).price ?? '';
    if (pv && pv.length) {
      setVariants(pv.map((v) => ({ ...v, id: v.id || uuid() })));
      setBasePrice('');
    } else {
      setVariants(DEFAULT_SIZES.map((size) => ({
        id: uuid(),
        size,
        price: typeof bp === 'number' ? bp : 0,
        stock: 0,
        active: true,
      })));
      setBasePrice(typeof bp === 'number' ? bp : '');
    }
    setAutoSyncPrice(true);
  };

  const toggleVisible = async (id: string | undefined, visible: boolean) => {
    if (!id) return;
    await updateDoc(doc(db, 'products', id), { visible, updatedAt: Date.now() });
    fetchProducts();
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!window.confirm('정말 삭제할까요?')) return;
    await deleteDoc(doc(db, 'products', id));
    fetchProducts();
  };

  // ── CSV 업로드(선택) ──────────────────────────────────────
  const [csvProducts, setCsvProducts] = useState<any[]>([]);
  const handleCsvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text.split('\n').map((r) => r.split(','));
      // 헤더: name,price,category,shortDesc,image,stock,origin,longDesc
      const items = rows.slice(1).filter(r => r.some(Boolean)).map((row) => {
        const name = row[0]?.trim() || '';
        const base = Number(row[1]) || 0;
        const cat = row[2]?.trim() || '';
        const sdesc = row[3]?.trim() || '';
        const img = row[4]?.trim() || '';
        const stk = Number(row[5]) || 0;
        const org = row[6]?.trim() || '';
        const ldesc = row[7]?.trim() || '';
        const vts: Variant[] = DEFAULT_SIZES.map((size) => ({
          id: uuid(), size, price: base, stock: 0, active: true,
        }));
        return {
          name,
          category: cat,
          shortDesc: sdesc,
          longDesc: ldesc,
          origin: org,
          images: img ? [img] : [],
          image: img,
          basePrice: null,
          variants: vts,
          price: base,
          stock: stk,
          visible: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      });
      setCsvProducts(items);
    };
    reader.readAsText(f);
  };
  const handleBulkUpload = async () => {
    if (csvProducts.length === 0) return;
    await Promise.all(csvProducts.map((data) => addDoc(collection(db, 'products'), data)));
    setCsvProducts([]);
    fetchProducts();
  };

  // ── 검색/필터/요약 ────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filteredProducts = useMemo(() => {
    return products
      .filter((p: any) => (!search || (p.name || '').toLowerCase().includes(search.toLowerCase())))
      .filter((p: any) => (!filterCategory || p.category === filterCategory));
  }, [products, search, filterCategory]);

  const lowStock = useMemo(() => {
    return products.filter((p: any) => {
      if (Array.isArray(p.variants) && p.variants.length) {
        return p.variants.some((v: any) => typeof v.stock === 'number' && v.stock <= 5);
      }
      return typeof p.stock === 'number' && p.stock <= 5;
    });
  }, [products]);

  const getDisplayPrice = (p: any) => {
    if (typeof p.price === 'number' && p.price > 0) return p.price;
    if (typeof p.basePrice === 'number') return p.basePrice;
    if (Array.isArray(p.variants) && p.variants.length) {
      return Math.min(...p.variants.map((v: any) => Number(v.price || 0)));
    }
    return 0;
  };

  // ── 렌더 ──────────────────────────────────────────────────
  return (
    <div className="border p-4 rounded mb-10">
      <h2 className="font-bold mb-2">상품 등록/수정</h2>

      {/* 기본 정보 */}
      <div className="flex flex-wrap gap-2 mb-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="상품명" className="border p-2" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2">
          <option value="">카테고리 선택</option>
          {categories.filter((opt) => opt.value && opt.label).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="간단설명" className="border p-2 w-64" />
        <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="상세설명" className="border p-2 w-80" />
        <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="원산지" className="border p-2 w-40" />
        <input value={stock} type="number" onChange={(e) => setStock(Number(e.target.value))} placeholder="전체 재고(선택)" className="border p-2 w-40" />
      </div>

      {/* 🔥 이미지 업로드/URL 추가/정렬 */}
      <div className="mb-4 border rounded p-3 bg-[#faf9f7]">
        <div className="font-semibold mb-2">이미지(여러 장)</div>
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <input
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="이미지 URL 붙여넣기"
            className="border p-2 w-80"
          />
          <button className="border px-3 py-2 rounded" onClick={addImageUrl}>URL 추가</button>
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="border p-2" />
          <span className="text-xs opacity-70">첫 이미지가 대표로 사용됩니다.</span>
        </div>

        {gallery.length === 0 ? (
          <div className="text-sm text-gray-500">아직 추가된 이미지가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {gallery.map((g, idx) => (
              <div key={g.id} className="relative">
                <img
                  src={g.url || g.preview}
                  alt={`img-${idx}`}
                  className="w-full h-28 object-cover rounded border"
                />
                <div className="absolute top-1 left-1">
                  {idx === 0 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-green-600 text-white">대표</span>
                  ) : (
                    <button
                      className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-white opacity-90"
                      onClick={() => setAsCover(idx)}
                    >
                      대표로
                    </button>
                  )}
                </div>
                <div className="absolute bottom-1 left-1 right-1 flex justify-between">
                  <button
                    className="text-[10px] px-2 py-0.5 rounded bg-white/90 border"
                    onClick={() => moveImage(idx, -1)}
                  >
                    ↑
                  </button>
                  <button
                    className="text-[10px] px-2 py-0.5 rounded bg-white/90 border"
                    onClick={() => moveImage(idx, 1)}
                  >
                    ↓
                  </button>
                  <button
                    className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white"
                    onClick={() => removeImage(idx)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 가격/옵션 */}
      <div className="mb-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">기본 가격</span>
          <input
            value={basePrice}
            type="number"
            step="0.01"
            onChange={(e) => setBasePrice(e.target.value ? Number(e.target.value) : '')}
            placeholder="예: 25"
            className="border p-2 w-28"
          />
        </div>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={autoSyncPrice} onChange={(e) => setAutoSyncPrice(e.target.checked)} />
          기본가격을 사이즈 가격에 자동 적용
        </label>

        <button onClick={handleSubmit} className="ml-auto bg-blue-600 px-4 py-2 rounded text-white">
          {editId ? '수정 저장' : '상품 등록'}
        </button>
        {editId && <button onClick={resetForm} className="bg-gray-300 px-2 py-1 rounded">취소</button>}
      </div>

      {/* 🔥 사이즈별 가격/재고 편집기 */}
      <VariantEditor value={variants} onChange={setVariants} />

      {/* CSV 업로드 (선택) */}
      <div className="my-4 border-t pt-2">
        <h3 className="font-bold">상품 일괄 등록(CSV)</h3>
        <p className="text-xs opacity-70 mb-1">헤더: name,price,category,shortDesc,image,stock,origin,longDesc</p>
        <input type="file" accept=".csv" onChange={handleCsvChange} className="border p-1" />
        {csvProducts.length > 0 &&
          <button onClick={handleBulkUpload} className="ml-2 bg-green-600 text-white px-2 py-1 rounded">일괄 등록 실행</button>
        }
      </div>

      {/* 검색/필터 */}
      <div className="flex gap-2 mb-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="상품명 검색" className="border p-2" />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border p-2">
          <option value="">전체 카테고리</option>
          {categories.filter((opt) => opt.value && opt.label).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 재고 부족 안내 */}
      <div className="mb-2">
        <b>재고 부족(옵션 5개 이하 포함):</b>{' '}
        {lowStock.map((p: any) => p.name).join(', ') || '없음'}
      </div>

      {/* 목록 */}
      <h2 className="font-bold mb-1">상품 목록</h2>
      <ul>
        {filteredProducts.map((p: any) => (
          <li key={p.id} className="mb-2 flex items-center justify-between border-b pb-2">
            <span className="flex items-center gap-3">
              {(p.image || p.images?.[0]) && (
                <img
                  src={p.image || p.images?.[0]}
                  alt={p.name}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <span>
                <b>{p.name}</b> ({p.category || '-'}) - ${getDisplayPrice(p)}
                {Array.isArray(p.variants) && p.variants.length > 0 && p.variants.map((v: any) => (
                  <span key={v.id || v.size} className="ml-2 text-xs bg-gray-200 px-1 rounded">
                    {v.size} ${v.price}{typeof v.stock === 'number' ? ` 재고:${v.stock}` : ''}
                  </span>
                ))}
              </span>
              <label className="ml-3">
                <input
                  type="checkbox"
                  checked={p.visible !== false}
                  onChange={() => toggleVisible(p.id, !(p.visible !== false))}
                />
                진열
              </label>
            </span>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(p)} className="text-blue-600">수정</button>
              <button onClick={() => handleDelete(p.id)} className="text-red-600">삭제</button>
              <button onClick={() => handleEdit(p, true)} className="text-yellow-700">복제</button>
              <a
                href={`/products/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline ml-2"
              >
                미리보기
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}