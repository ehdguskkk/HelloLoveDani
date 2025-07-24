'use client';
import { useEffect, useState, ChangeEvent } from 'react';
import { auth, db, storage } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// 관리자 이메일
const ADMIN_EMAIL = "sae4762@gmail.com";

// 카테고리/슬러그 구조 통일
const CATEGORY_OPTIONS = [
  { label: "Bandanas", value: "bandanas" },
  { label: "Ribbon Ties", value: "ribbon-ties" },
  { label: "Walk Set", value: "walk-set" },
];

// 🔥 배너용 기본 구조
type Banner = { id?: string; image: string; link: string; title: string; order: number; visible: boolean };
// 주문
type Order = { id: string; products: any[]; total: number; user: string; status: string; createdAt: string };
// 리뷰
type Review = { id: string; productId: string; user: string; rating: number; title: string; content: string; createdAt: string };
// QnA
type Qna = { id: string; productId: string; user: string; question: string; answer?: string; createdAt: string };

// ----------- 어드민 메인 -----------
export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'product'|'category'|'banner'|'order'|'review'|'qna'>('product');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => await signInWithPopup(auth, new GoogleAuthProvider());
  const handleLogout = async () => await signOut(auth);

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
    <div className="max-w-6xl mx-auto py-8 px-2">
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab('product')} className={tab === 'product' ? 'font-bold underline' : ''}>상품관리</button>
        <button onClick={() => setTab('category')} className={tab === 'category' ? 'font-bold underline' : ''}>카테고리관리</button>
        <button onClick={() => setTab('banner')} className={tab === 'banner' ? 'font-bold underline' : ''}>배너관리</button>
        <button onClick={() => setTab('order')} className={tab === 'order' ? 'font-bold underline' : ''}>주문관리</button>
        <button onClick={() => setTab('review')} className={tab === 'review' ? 'font-bold underline' : ''}>리뷰관리</button>
        <button onClick={() => setTab('qna')} className={tab === 'qna' ? 'font-bold underline' : ''}>Q&A관리</button>
        <button className="bg-red-400 px-3 py-1 rounded text-white ml-auto" onClick={handleLogout}>로그아웃</button>
      </div>
      <div>
        {tab === 'product' && <ProductAdmin />}
        {tab === 'category' && <CategoryAdmin />}
        {tab === 'banner' && <BannerAdmin />}
        {tab === 'order' && <OrderAdmin />}
        {tab === 'review' && <ReviewAdmin />}
        {tab === 'qna' && <QnaAdmin />}
      </div>
    </div>
  );
}

// ----------- 1. 상품 관리(검색/진열/미리보기/옵션/복제/일괄등록/상세/정렬) -----------
function ProductAdmin() {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [optionInput, setOptionInput] = useState({ color: '', size: '', stock: '' });
  const [stock, setStock] = useState<number | ''>('');
  const [origin, setOrigin] = useState('');
  const [detail, setDetail] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  // --- 검색/필터 ---
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // --- 일괄 업로드 ---
  const [csvProducts, setCsvProducts] = useState<any[]>([]);

  // 상품 목록 불러오기
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };
  useEffect(() => { fetchProducts(); }, []);

  // 이미지 파일 업로드 핸들러 (Firebase Storage)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };
  const uploadImage = async () => {
    if (!file) return image;
    const storageRef = ref(storage, `products/${file.name}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // 옵션 추가/제거
  const handleAddOption = () => {
    if (!optionInput.color && !optionInput.size) return;
    setOptions([...options, { ...optionInput, stock: Number(optionInput.stock || 0) }]);
    setOptionInput({ color: '', size: '', stock: '' });
  };
  const handleRemoveOption = (idx: number) => {
    setOptions(options.filter((_, i) => i !== idx));
  };

  // 상품 추가/수정 핸들러
  const handleSubmit = async () => {
    let imageUrl = image;
    if (file) imageUrl = await uploadImage();

    const data = {
      name, price: Number(price), category, description: desc, image: imageUrl,
      options, stock: stock === '' ? 0 : Number(stock), origin, detail, visible: true
    };

    if (editId) {
      await updateDoc(doc(db, "products", editId), data);
    } else {
      await addDoc(collection(db, "products"), data);
    }
    resetForm();
    fetchProducts();
  };

  const resetForm = () => {
    setEditId(null); setName(''); setImage(''); setPrice(''); setCategory(''); setDesc('');
    setFile(null); setOptions([]); setOptionInput({ color: '', size: '', stock: '' });
    setStock(''); setOrigin(''); setDetail('');
  };

  // 수정/복제
  const handleEdit = (product: any, isCopy = false) => {
    setEditId(isCopy ? null : product.id);
    setName(product.name || '');
    setImage(product.image || '');
    setPrice(product.price || '');
    setCategory(product.category || '');
    setDesc(product.description || '');
    setOptions(product.options || []);
    setStock(product.stock ?? '');
    setOrigin(product.origin || '');
    setDetail(product.detail || '');
    setFile(null);
    setOptionInput({ color: '', size: '', stock: '' });
  };

  // 진열/비진열
  const toggleVisible = async (id: string, visible: boolean) => {
    await updateDoc(doc(db, "products", id), { visible });
    fetchProducts();
  };

  // 삭제
  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제할까요?')) return;
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  // 일괄업로드
  const handleCsvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text.split('\n').map(r => r.split(','));
      // columns: name, price, category, desc, image, stock, origin, detail
      const newProducts = rows.slice(1).map(row => ({
        name: row[0], price: Number(row[1]), category: row[2], description: row[3], image: row[4], stock: Number(row[5]), origin: row[6], detail: row[7], visible: true
      }));
      setCsvProducts(newProducts);
    };
    reader.readAsText(file);
  };
  const handleBulkUpload = async () => {
    await Promise.all(csvProducts.map(data => addDoc(collection(db, "products"), data)));
    setCsvProducts([]);
    fetchProducts();
  };

  // --- 검색/필터 결과 ---
  const filteredProducts = products
    .filter(p => (!search || p.name.toLowerCase().includes(search.toLowerCase())))
    .filter(p => (!filterCategory || p.category === filterCategory));

  // --- 재고 부족 알림 ---
  const lowStock = products.filter(p => typeof p.stock === 'number' && p.stock <= 5);

  return (
    <div className="border p-4 rounded mb-10">
      {/* 상품등록/수정폼 */}
      <h2 className="font-bold mb-2">상품 등록/수정</h2>
      <div className="flex flex-wrap gap-2 mb-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="상품명" className="border p-2" />
        <input value={price} type="number" onChange={e => setPrice(Number(e.target.value))} placeholder="가격" className="border p-2 w-24" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="border p-2">
          <option value="">카테고리 선택</option>
          {CATEGORY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="간단설명" className="border p-2" />
        <input value={stock} type="number" onChange={e => setStock(Number(e.target.value))} placeholder="재고" className="border p-2 w-16" />
        <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="원산지" className="border p-2 w-32" />
        <input value={detail} onChange={e => setDetail(e.target.value)} placeholder="상세설명" className="border p-2 w-56" />
        <input value={image} onChange={e => setImage(e.target.value)} placeholder="이미지 URL(직접입력)" className="border p-2 w-56" />
        <input type="file" accept="image/*" onChange={handleFileChange} className="border p-2" />
        {/* 이미지 미리보기 */}
        {file && <img src={URL.createObjectURL(file)} alt="미리보기" className="w-16 h-16 object-cover rounded" />}
        <button onClick={handleSubmit} className="bg-blue-500 px-4 py-2 rounded text-white">
          {editId ? "수정 저장" : "상품 등록"}
        </button>
        {editId && <button onClick={resetForm} className="ml-2 bg-gray-300 px-2 py-1 rounded">취소</button>}
      </div>
      {/* 옵션 복수 입력 */}
      <div className="mb-2 flex gap-2">
        <input value={optionInput.color} onChange={e => setOptionInput(o => ({ ...o, color: e.target.value }))} placeholder="색상" className="border p-2 w-20" />
        <input value={optionInput.size} onChange={e => setOptionInput(o => ({ ...o, size: e.target.value }))} placeholder="사이즈" className="border p-2 w-20" />
        <input value={optionInput.stock} onChange={e => setOptionInput(o => ({ ...o, stock: e.target.value }))} placeholder="옵션 재고" className="border p-2 w-20" />
        <button onClick={handleAddOption} className="bg-gray-300 px-2 py-1 rounded">+ 옵션추가</button>
      </div>
      <ul className="mb-2 flex gap-2 flex-wrap">
        {options.map((opt, idx) => (
          <li key={idx} className="border rounded p-1 bg-gray-100 flex gap-1 items-center">
            색상:{opt.color} / 사이즈:{opt.size} / 재고:{opt.stock}
            <button onClick={() => handleRemoveOption(idx)} className="ml-1 text-red-500">삭제</button>
          </li>
        ))}
      </ul>
      {/* 상품 일괄등록 */}
      <div className="my-4 border-t pt-2">
        <h3 className="font-bold">상품 일괄 등록(CSV)</h3>
        <input type="file" accept=".csv" onChange={handleCsvChange} className="border p-1" />
        {csvProducts.length > 0 &&
          <button onClick={handleBulkUpload} className="ml-2 bg-green-500 text-white px-2 py-1 rounded">일괄 등록 실행</button>
        }
      </div>
      {/* 상품 검색/필터 */}
      <div className="flex gap-2 mb-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="상품명 검색" className="border p-2" />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border p-2">
          <option value="">전체 카테고리</option>
          {CATEGORY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {/* 재고 부족 알림 */}
      <div className="mb-2">
        <b>재고 부족 상품(5개 이하):</b> {lowStock.map(p => p.name).join(', ') || '없음'}
      </div>
      {/* 상품 리스트 */}
      <h2 className="font-bold mb-1">상품 목록</h2>
      <ul>
        {filteredProducts.map(product => (
          <li key={product.id} className="mb-2 flex items-center justify-between border-b pb-2">
            <span>
              <b>{product.name}</b> ({product.category}) - ${product.price}
              {product.options && product.options.length > 0 &&
                product.options.map((opt: any, i: number) => (
                  <span key={i} className="ml-2 text-xs bg-gray-200 px-1 rounded">
                    {opt.color}/{opt.size} 재고:{opt.stock}
                  </span>
                ))
              }
              {product.size && <> / {product.size}</>}
              {product.color && <> / {product.color}</>}
              {typeof product.stock === 'number' && <> / 재고:{product.stock}</>}
              {product.origin && <> / {product.origin}</>}
              {product.image && (
                <img src={product.image} alt={product.name} className="inline-block ml-3 w-12 h-12 object-cover rounded" />
              )}
              {/* 진열ON/OFF */}
              <label className="ml-3">
                <input type="checkbox" checked={product.visible !== false} onChange={() => toggleVisible(product.id, !product.visible)} />
                진열
              </label>
              {/* 재고 부족 경고 */}
              {typeof product.stock === 'number' && product.stock <= 5 &&
                <span className="ml-2 text-red-500">재고 부족!</span>}
            </span>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(product)} className="text-blue-500">수정</button>
              <button onClick={() => handleDelete(product.id)} className="text-red-500">삭제</button>
              <button onClick={() => handleEdit(product, true)} className="text-yellow-600">복제</button>
              <a href={`/products/${product.id}`} target="_blank" rel="noopener noreferrer" className="text-green-700 underline ml-2">
                미리보기
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ----------- 2. 카테고리 관리 -----------
function CategoryAdmin() {
  const [categories, setCategories] = useState<{ id?: string; label: string; value: string }[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // 카테고리 불러오기
  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "categories"));
    setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
  };
  useEffect(() => { fetchCategories(); }, []);

  const handleAddOrUpdate = async () => {
    if (!newLabel || !newValue) return alert('카테고리명, 슬러그 모두 입력!');
    if (editId) {
      await updateDoc(doc(db, "categories", editId), { label: newLabel, value: newValue });
      setEditId(null);
    } else {
      await addDoc(collection(db, "categories"), { label: newLabel, value: newValue });
    }
    setNewLabel(''); setNewValue('');
    fetchCategories();
  };
  const handleEdit = (cat: any) => {
    setEditId(cat.id); setNewLabel(cat.label); setNewValue(cat.value);
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제할까요?')) return;
    await deleteDoc(doc(db, "categories", id));
    fetchCategories();
  };

  return (
    <div className="border p-4 rounded mb-10 max-w-xl">
      <h2 className="font-bold mb-2">카테고리 관리</h2>
      <div className="flex gap-2 mb-2">
        <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="카테고리명(한글/영문)" className="border p-2" />
        <input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="슬러그(bandanas)" className="border p-2" />
        <button onClick={handleAddOrUpdate} className="bg-blue-400 px-2 rounded text-white">{editId ? "수정" : "추가"}</button>
        {editId && <button onClick={() => { setEditId(null); setNewLabel(''); setNewValue(''); }} className="bg-gray-300 px-2 rounded">취소</button>}
      </div>
      <ul>
        {categories.map(cat => (
          <li key={cat.id} className="mb-1 flex items-center justify-between border-b pb-1">
            <span>
              <b>{cat.label}</b> (<code>{cat.value}</code>)
            </span>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(cat)} className="text-blue-500">수정</button>
              <button onClick={() => handleDelete(cat.id!)} className="text-red-500">삭제</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ----------- 3. 배너 관리 -----------
function BannerAdmin() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [banner, setBanner] = useState<Banner>({ image: '', link: '', title: '', order: 1, visible: true });
  const [editId, setEditId] = useState<string | null>(null);

  // 배너 불러오기
  const fetchBanners = async () => {
    const snap = await getDocs(collection(db, "banners"));
    setBanners(snap.docs.map(d => ({ id: d.id, ...d.data() } as Banner)));
  };
  useEffect(() => { fetchBanners(); }, []);

  const handleAddOrUpdate = async () => {
    if (!banner.image || !banner.link || !banner.title) return alert('모든 필수 정보 입력!');
    if (editId) {
      await updateDoc(doc(db, "banners", editId), banner);
      setEditId(null);
    } else {
      await addDoc(collection(db, "banners"), banner);
    }
    setBanner({ image: '', link: '', title: '', order: 1, visible: true });
    fetchBanners();
  };
  const handleEdit = (b: Banner) => {
    setEditId(b.id!);
    setBanner({ ...b });
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제?')) return;
    await deleteDoc(doc(db, "banners", id));
    fetchBanners();
  };

  return (
    <div className="border p-4 rounded mb-10 max-w-xl">
      <h2 className="font-bold mb-2">배너/이벤트 관리</h2>
      <div className="flex gap-2 mb-2 flex-wrap">
        <input value={banner.image} onChange={e => setBanner(b => ({ ...b, image: e.target.value }))} placeholder="배너 이미지 URL" className="border p-2 w-52" />
        <input value={banner.link} onChange={e => setBanner(b => ({ ...b, link: e.target.value }))} placeholder="클릭시 이동 링크" className="border p-2 w-52" />
        <input value={banner.title} onChange={e => setBanner(b => ({ ...b, title: e.target.value }))} placeholder="배너 제목" className="border p-2" />
        <input value={banner.order} type="number" onChange={e => setBanner(b => ({ ...b, order: Number(e.target.value) }))} placeholder="순서" className="border p-2 w-20" />
        <label>
          <input type="checkbox" checked={banner.visible} onChange={e => setBanner(b => ({ ...b, visible: e.target.checked }))} />
          노출
        </label>
        <button onClick={handleAddOrUpdate} className="bg-blue-400 px-2 rounded text-white">{editId ? "수정" : "추가"}</button>
        {editId && <button onClick={() => { setEditId(null); setBanner({ image: '', link: '', title: '', order: 1, visible: true }); }} className="bg-gray-300 px-2 rounded">취소</button>}
      </div>
      <ul>
        {banners.sort((a, b) => a.order - b.order).map(b => (
          <li key={b.id} className="mb-1 flex items-center justify-between border-b pb-1">
            <span>
              <img src={b.image} alt="배너" className="w-20 h-10 object-cover inline-block mr-2" />
              <b>{b.title}</b> | {b.link} | 순서:{b.order} | {b.visible ? "노출" : "비노출"}
            </span>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(b)} className="text-blue-500">수정</button>
              <button onClick={() => handleDelete(b.id!)} className="text-red-500">삭제</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ----------- 4. 주문관리 -----------
function OrderAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    getDocs(collection(db, "orders")).then(snap =>
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)))
    );
  }, []);
  return (
    <div className="border p-4 rounded mb-10 max-w-xl">
      <h2 className="font-bold mb-2">주문 관리</h2>
      <ul>
        {orders.map(o => (
          <li key={o.id} className="mb-1 border-b pb-1">
            <div>주문자: {o.user} | 금액: ${o.total} | 상태: {o.status} | {o.createdAt}</div>
            <div>상품: {o.products?.map((p, i) => <span key={i}>{p.name}({p.qty}) </span>)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ----------- 5. 리뷰관리 -----------
function ReviewAdmin() {
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

// ----------- 6. Q&A관리 -----------
function QnaAdmin() {
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