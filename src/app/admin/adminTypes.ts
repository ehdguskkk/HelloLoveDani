// src/app/admin/adminTypes.ts

export const ADMIN_EMAIL = "sae4762@gmail.com";

export const CATEGORY_OPTIONS = [
  { label: "Bandanas", value: "bandanas" },
  { label: "Ribbon Ties", value: "ribbon-ties" },
  { label: "Walk Set", value: "walk-set" },
];

// 🔥 상품 타입
export type ProductOption = { color?: string; size?: string; stock?: number | string };
export type Product = {
  id?: string;
  name: string;
  image?: string;
  price: number;
  category: string;
  description?: string;
  options?: ProductOption[];
  stock?: number;
  origin?: string;
  size?: string;
  color?: string;
  detail?: string;
  visible?: boolean;
  
};

// 🔥 카테고리 타입
export type Category = { id?: string; label: string; value: string; image?: string; order?: number; };

// 🔥 배너 타입
export type Banner = { id?: string; image: string; link: string; title: string; order: number; visible: boolean };
// 주문
export type Order = { id: string; products: Product[]; total: number; user: string; status: string; createdAt: string };
// 리뷰
export type Review = { id: string; productId: string; user: string; rating: number; title: string; content: string; createdAt: string };
// QnA
export type Qna = { id: string; productId: string; user: string; question: string; answer?: string; createdAt: string };