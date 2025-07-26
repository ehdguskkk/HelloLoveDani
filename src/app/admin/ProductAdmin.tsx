'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { db, storage } from '@/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Product, ProductOption } from './adminTypes';

export default function ProductAdmin() {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [optionInput, setOptionInput] = useState<ProductOption>({ color: '', size: '', stock: '' });
  const [stock, setStock] = useState<number | ''>('');
  const [origin, setOrigin] = useState('');
  const [detail, setDetail] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  // 카테고리 목록을 Firestore에서 가져오기
  const [categories, setCategories] = useState<{label: string; value: string}[]>([]);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    setCategories(snapshot.docs.map(doc => {
      const data = doc.data();
      // label/value 없는 값 방어 및 소문자 value로 변환
      return {
        label: (data.label || data.name || '').trim(),
        value: ((data.value || data.slug || '').trim()).toLowerCase(),
      };
    }));
  };

  // 카테고리 콘솔 출력 (배열 확인)
  useEffect(() => {
    console.log("실시간 업데이트된 카테고리: ", categories);
  }, [categories]);

  // 검색/필터
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // CSV 업로드
  const [csvProducts, setCsvProducts] = useState<Product[]>([]);

  // 상품 목록 불러오기
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
  };

  useEffect(() => { 
    fetchProducts(); 
    fetchCategories();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };
  const uploadImage = async () => {
    if (!file) return image;
    const storageRef = ref(storage, `products/${file.name}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleAddOption = () => {
    if (!optionInput.color && !optionInput.size) return;
    setOptions([...options, { ...optionInput, stock: Number(optionInput.stock || 0) }]);
    setOptionInput({ color: '', size: '', stock: '' });
  };
  const handleRemoveOption = (idx: number) => {
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    let imageUrl = image;
    if (file) imageUrl = await uploadImage();

    const data: Product = {
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

  const handleEdit = (product: Product, isCopy = false) => {
    setEditId(isCopy ? null : product.id || null);
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

  const toggleVisible = async (id: string | undefined, visible: boolean) => {
    if (!id) return;
    await updateDoc(doc(db, "products", id), { visible });
    fetchProducts();
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!window.confirm('정말 삭제할까요?')) return;
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  const handleCsvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text.split('\n').map(r => r.split(','));
      const newProducts: Product[] = rows.slice(1).map(row => ({
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

  const filteredProducts = products
    .filter(p => (!search || p.name.toLowerCase().includes(search.toLowerCase())))
    .filter(p => (!filterCategory || p.category === filterCategory));

  const lowStock = products.filter(p => typeof p.stock === 'number' && p.stock <= 5);

  return (
    <div className="border p-4 rounded mb-10">
      <h2 className="font-bold mb-2">상품 등록/수정</h2>
      <div className="flex flex-wrap gap-2 mb-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="상품명" className="border p-2" />
        <input value={price} type="number" onChange={e => setPrice(Number(e.target.value))} placeholder="가격" className="border p-2 w-24" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="border p-2">
          <option value="">카테고리 선택</option>
          {categories
            .filter(opt => opt.value && opt.label)
            .map((opt, idx) => (
              <option key={opt.value + idx} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="간단설명" className="border p-2" />
        <input value={stock} type="number" onChange={e => setStock(Number(e.target.value))} placeholder="재고" className="border p-2 w-16" />
        <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="원산지" className="border p-2 w-32" />
        <input value={detail} onChange={e => setDetail(e.target.value)} placeholder="상세설명" className="border p-2 w-56" />
        <input value={image} onChange={e => setImage(e.target.value)} placeholder="이미지 URL(직접입력)" className="border p-2 w-56" />
        <input type="file" accept="image/*" onChange={handleFileChange} className="border p-2" />
        {file && <img src={URL.createObjectURL(file)} alt="미리보기" className="w-16 h-16 object-cover rounded" />}
        <button onClick={handleSubmit} className="bg-blue-500 px-4 py-2 rounded text-white">
          {editId ? "수정 저장" : "상품 등록"}
        </button>
        {editId && <button onClick={resetForm} className="ml-2 bg-gray-300 px-2 py-1 rounded">취소</button>}
      </div>

      <div className="mb-2 flex gap-2">
        <input value={optionInput.color as string} onChange={e => setOptionInput(o => ({ ...o, color: e.target.value }))} placeholder="색상" className="border p-2 w-20" />
        <input value={optionInput.size as string} onChange={e => setOptionInput(o => ({ ...o, size: e.target.value }))} placeholder="사이즈" className="border p-2 w-20" />
        <input value={optionInput.stock as string} onChange={e => setOptionInput(o => ({ ...o, stock: e.target.value }))} placeholder="옵션 재고" className="border p-2 w-20" />
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

      <div className="my-4 border-t pt-2">
        <h3 className="font-bold">상품 일괄 등록(CSV)</h3>
        <input type="file" accept=".csv" onChange={handleCsvChange} className="border p-1" />
        {csvProducts.length > 0 &&
          <button onClick={handleBulkUpload} className="ml-2 bg-green-500 text-white px-2 py-1 rounded">일괄 등록 실행</button>
        }
      </div>

      <div className="flex gap-2 mb-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="상품명 검색" className="border p-2" />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border p-2">
          <option value="">전체 카테고리</option>
          {categories
            .filter(opt => opt.value && opt.label)
            .map((opt, idx) => (
              <option key={opt.value + idx} value={opt.value}>{opt.label}</option>
            ))}
        </select>
      </div>

      <div className="mb-2">
        <b>재고 부족 상품(5개 이하):</b> {lowStock.map(p => p.name).join(', ') || '없음'}
      </div>

      <h2 className="font-bold mb-1">상품 목록</h2>
      <ul>
        {filteredProducts.map(product => (
          <li key={product.id} className="mb-2 flex items-center justify-between border-b pb-2">
            <span>
              <b>{product.name}</b> ({product.category}) - ${product.price}
              {product.options && product.options.length > 0 &&
                product.options.map((opt, i) => (
                  <span key={i} className="ml-2 text-xs bg-gray-200 px-1 rounded">
                    {opt.color}/{opt.size} 재고:{opt.stock}
                  </span>
                ))
              }
              {typeof product.stock === 'number' && <> / 재고:{product.stock}</>}
              {product.origin && <> / {product.origin}</>}
              {product.image && (
                <img src={product.image} alt={product.name} className="inline-block ml-3 w-12 h-12 object-cover rounded" />
              )}
              <label className="ml-3">
                <input type="checkbox" checked={product.visible !== false} onChange={() => toggleVisible(product.id, !product.visible)} />
                진열
              </label>
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