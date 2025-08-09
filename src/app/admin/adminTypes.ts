// ===== 기본 상수 =====
export const ADMIN_EMAIL = "sae4762@gmail.com";

export const CATEGORY_OPTIONS = [
  { label: "Bandanas", value: "bandanas" },
  { label: "Ribbon Ties", value: "ribbon-ties" },
  { label: "Walk Set", value: "walk-set" },
];

// 앞으로 상품 등록 시 기본으로 깔리는 사이즈 프리셋
export const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type DefaultSize = typeof DEFAULT_SIZES[number];

// ===== 공통 타입 =====
export interface Banner {
  id?: string;        // Firestore 문서 id
  image: string;      // 배너 이미지 URL
  link: string;       // 클릭시 이동 링크
  title: string;      // 배너 제목
  order: number;      // 노출 순서
  visible: boolean;   // 노출 여부
}

export type Category = {
  id?: string;
  name: string;        // 표시 이름
  slug: string;        // URL slug
  order?: number;
  visible?: boolean;
  image?: string;
};

// ====== (신규) 상품 옵션/변형(variants) ======
export type Variant = {
  id: string;                 // uuid
  size: string | DefaultSize; // 'XS' | 'S' | ... (자유 입력도 허용)
  price: number;              // 해당 사이즈 판매가 (AUD)
  stock?: number;             // 재고(선택)
  active?: boolean;           // 판매 여부(선택)
  sku?: string;               // 선택
};

// ====== 상품 ======
export type Product = {
  id?: string;                // 보통 slug와 동일하게 저장
  name: string;
  slug: string;
  category?: string;          // category slug
  images: string[];           // 썸네일 포함
  shortDesc?: string;         // 간단설명
  longDesc?: string;          // 상세설명 (리치텍스트/HTML)
  origin?: string;            // 원산지(선택)
  // 옵션이 있으면 basePrice는 null, 옵션 없으면 basePrice 사용
  basePrice?: number | null;
  variants: Variant[];        // 🔥 사이즈별 가격 리스트
  // 표시/운영용
  published?: boolean;
  createdAt?: number | string;
  updatedAt?: number | string;
};

// ====== 주문/카트 ======
export type CartLine = {
  productId: string;
  name: string;
  qty: number;
  price: number;               // 라인단가 (옵션가격 반영)
  image?: string;
  variantId?: string | null;   // 옵션 구분
  variantLabel?: string;       // "Size M" 등
};

export type Order = {
  id?: string;
  userEmail?: string;
  items: CartLine[];
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  status: "pending" | "paid" | "cancelled" | "refunded";
  createdAt: number | string;
  paidAt?: number | string;
  memo?: string;
  shippingInfo?: {
    name: string;
    phone?: string;
    address1: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
};

// ====== QnA ======
export type Qna = {
  id?: string;
  productId?: string;
  user?: string;
  question: string;
  answer?: string;
  createdAt: number | string;
};

// ====== 리뷰 ======
export type Review = {
  id?: string;
  productId: string;
  user: string;
  rating: number;       // 1~5
  content: string;      // 본문
  createdAt: number | string;
  title?: string;
};