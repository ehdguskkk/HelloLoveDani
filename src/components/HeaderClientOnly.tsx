'use client';
import Header from './Header';
import Sidebar from './Sidebar';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

interface Category {
  name: string;
  href: string;
  order?: number;
}

export default function HeaderClientOnly() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // 🔥 실시간 카테고리 업데이트 (Firestore onSnapshot 사용)
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const fetchedCategories = snapshot.docs.map(doc => ({
        name: doc.data().label,
        href: `/collections/${doc.data().value}`,
        order: doc.data().order ?? 0,
      }));

      // 항상 order로 정렬
      fetchedCategories.sort((a, b) => a.order - b.order);

      setCategories(fetchedCategories);
      console.log("실시간 업데이트된 카테고리:", fetchedCategories);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
        categories={categories}
      />
    </>
  );
}