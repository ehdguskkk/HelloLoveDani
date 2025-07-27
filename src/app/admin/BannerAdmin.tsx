'use client';
import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Banner } from './adminTypes';

export default function BannerAdmin() {
  // ----------- 3. 배너 관리 -----------
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
    // Firestore에 저장시 id 필드는 빼고 저장 (Firestore가 자동생성)
    const { id, ...bannerData } = banner;
    if (editId) {
      await updateDoc(doc(db, "banners", editId), bannerData as any);
      setEditId(null);
    } else {
      await addDoc(collection(db, "banners"), bannerData as any);
    }
    setBanner({ image: '', link: '', title: '', order: 1, visible: true });
    fetchBanners();
  };
  const handleEdit = (b: Banner) => {
    setEditId(b.id!);
    setBanner({ ...b });
  };
  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
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
              <button onClick={() => handleDelete(b.id)} className="text-red-500">삭제</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}