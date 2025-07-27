// /components/TestOrderButton.tsx

import { db } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

function TestOrderButton() {
  const handleOrder = async () => {
    await addDoc(collection(db, "orders"), {
      address: "13 Cowan Ln Bowen 4805 Qld",
      createdAt: new Date().toISOString().slice(0, 10),
      phone: "0413 792 342",
      products: [
        { id: "gOwpcppODDQJxKXHjx7j", qty: 1 } // 반드시 실제 products 컬렉션에 있는 id일 것!
      ],
      receiver: "DongHyun Park",
      status: "결제완료",
      total: 23,
      user: "testuser"
    });
    alert("주문 생성됨!");
  };

  return (
    <button onClick={handleOrder}>
      테스트 주문 생성
    </button>
  );
}

export default TestOrderButton;