'use client'
import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface Category {
  id: string;
  label: string;
  value: string;
  image?: string;
  order: number;
}

export default function CategoryAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const snap = await getDocs(collection(db, "categories"));
    const data = snap.docs.map((doc, idx) => {
      const d = doc.data();
      return {
        id: doc.id,
        label: d.label,
        value: d.value,
        image: d.image || "",
        order: d.order ?? idx, // order 없으면 index
      };
    });
    // order로 정렬
    data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setCategories(data);
  };

  // 카테고리 추가/수정
  const handleAddOrEdit = async () => {
    if (!name || !slug) return;
    if (editId) {
      // 수정
      await updateDoc(doc(db, "categories", editId), {
        label: name,
        value: slug,
        image,
      });
    } else {
      // 추가
      await addDoc(collection(db, "categories"), {
        label: name,
        value: slug,
        image,
        order: categories.length,
      });
    }
    setName("");
    setSlug("");
    setImage("");
    setEditId(null);
    fetchCategories();
  };

  // 카테고리 삭제
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
    fetchCategories();
  };

  // 수정 모드
  const handleEdit = (cat: Category) => {
    setName(cat.label);
    setSlug(cat.value);
    setImage(cat.image || "");
    setEditId(cat.id);
  };

  // ▲ 버튼 클릭
  const handleMoveUp = async (idx: number) => {
    if (idx === 0) return;
    const newCats = [...categories];
    [newCats[idx - 1], newCats[idx]] = [newCats[idx], newCats[idx - 1]];
    await updateOrders(newCats);
  };

  // ▼ 버튼 클릭
  const handleMoveDown = async (idx: number) => {
    if (idx === categories.length - 1) return;
    const newCats = [...categories];
    [newCats[idx], newCats[idx + 1]] = [newCats[idx + 1], newCats[idx]];
    await updateOrders(newCats);
  };

  // Firestore order 필드 일괄 갱신
  const updateOrders = async (newCats: Category[]) => {
    await Promise.all(
      newCats.map((cat, i) =>
        updateDoc(doc(db, "categories", cat.id), { order: i })
      )
    );
    fetchCategories();
  };

  return (
    <div>
      <h2 className="font-bold text-xl mb-2">카테고리 관리</h2>
      <div className="flex gap-2 mb-2">
        <input
          placeholder="카테고리명(한글/영문)"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded px-2"
        />
        <input
          placeholder="슬러그(bandanas)"
          value={slug}
          onChange={e => setSlug(e.target.value)}
          className="border rounded px-2"
        />
        <input
          placeholder="이미지 URL"
          value={image}
          onChange={e => setImage(e.target.value)}
          className="border rounded px-2"
        />
        <button onClick={handleAddOrEdit} className="bg-blue-200 rounded px-3">{editId ? '수정' : '추가'}</button>
        {editId && (
          <button onClick={() => {
            setEditId(null); setName(""); setSlug(""); setImage("");
          }} className="bg-gray-200 rounded px-3">취소</button>
        )}
      </div>
      <ul className="bg-white bg-opacity-70 rounded-lg">
        {categories.map((cat, idx) => (
          <li key={cat.id} className="flex items-center gap-2 py-2 px-2 border-b">
            <img src={cat.image} alt="" className="w-8 h-8 rounded" />
            <span className="font-bold">{cat.label}</span>
            <span className="text-gray-400">({cat.value})</span>
            <button onClick={() => handleEdit(cat)} className="text-blue-500 px-1">수정</button>
            <button onClick={() => handleDelete(cat.id)} className="text-red-500 px-1">삭제</button>
            {/* ▲, ▼ 순서 변경 버튼 */}
            <button
              onClick={() => handleMoveUp(idx)}
              disabled={idx === 0}
              style={{
                color: '#fff',
                background: idx === 0 ? '#d1d5db' : '#ffa000',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: 28,
                height: 28,
                fontSize: 17,
                border: '2px solid #bbb',
                marginLeft: 6,
                marginRight: 3,
                opacity: idx === 0 ? 0.5 : 1,
                transition: 'background 0.2s',
                cursor: idx === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px 0 #bbb2',
              }}
              title="위로"
            >▲</button>
            <button
              onClick={() => handleMoveDown(idx)}
              disabled={idx === categories.length - 1}
              style={{
                color: '#fff',
                background: idx === categories.length - 1 ? '#d1d5db' : '#1976d2',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: 28,
                height: 28,
                fontSize: 17,
                border: '2px solid #bbb',
                marginLeft: 3,
                marginRight: 6,
                opacity: idx === categories.length - 1 ? 0.5 : 1,
                transition: 'background 0.2s',
                cursor: idx === categories.length - 1 ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px 0 #bbb2',
              }}
              title="아래로"
            >▼</button>
          </li>
        ))}
      </ul>
    </div>
  );
}