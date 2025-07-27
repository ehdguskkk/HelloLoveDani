export const ADMIN_EMAIL = "sae4762@gmail.com";

export const CATEGORY_OPTIONS = [
  { label: "Bandanas", value: "bandanas" },
  { label: "Ribbon Ties", value: "ribbon-ties" },
  { label: "Walk Set", value: "walk-set" },
];

// 🔥 상품(전체) 타입
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

// 주문에서 사용되는 상품 타입 (주문상품)
export type OrderProduct = {
  name: string;
  qty: number;
};

// 주문 타입
export type Order = {
  id: string;
  products: OrderProduct[]; // 주문에는 항상 OrderProduct!
  total: number;
  user: string;
  status: string;
  createdAt: string;
  address?: string;
  phone?: string;
  receiver?: string;
};

// 카테고리 타입
export type Category = {
  id: string;
  label: string;
  value: string;
  order: number;
  image?: string;
};

// QnA 타입
export type Qna = {
  id: string;
  productId: string;
  user: string;
  question: string;
  answer?: string;
  createdAt: string;
};

// 리뷰 타입(예시)
export type Review = {
  id: string;
  productId: string;
  user: string;
  rating: number;
  comment: string;
  createdAt: string;
};