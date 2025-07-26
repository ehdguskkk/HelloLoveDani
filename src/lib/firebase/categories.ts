// src/lib/firebase/categories.ts

// (1) Category 타입에 order 필드 포함
export interface Category {
  name: string;
  href: string;
  order?: number; // 필수 아니어도 되지만, 권장
  [key: string]: any; // 혹시 image, value 등 추가필드 있을 수도 있으니!
}

// (2) getCategories 함수가 항상 order 포함해서 리턴하도록 보장
export async function getCategories(): Promise<Category[]> {
  // 예시: Firestore에서 데이터 받아올 때
  // (아래는 예시 코드입니다. 실제 Firestore 로직에 맞게 수정!)
  // const snapshot = await getDocs(collection(db, 'categories'));
  // return snapshot.docs.map(doc => doc.data() as Category);

  // 임시 하드코딩 예시 (Firestore 구조에 맞게 실제 구현 필요!)
  return [
    {
      name: 'Bandanas',
      href: '/collections/bandanas',
      order: 1,
      // 기타 필드...
    },
    {
      name: 'Ribbon Ties',
      href: '/collections/ribbon-ties',
      order: 2,
      // 기타 필드...
    },
    {
      name: 'Walk Set',
      href: '/collections/walk-set',
      order: 3,
      // 기타 필드...
    },
  ];
}