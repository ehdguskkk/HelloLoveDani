'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

// ===== 타입 (이 파일 전용, adminTypes 없이 동작) =====
type Variant = {
  id: string;
  size: string;
  price: number;
  stock?: number;
  active?: boolean;
};

type Product = {
  id?: string;
  name: string;
  category?: string;
  description?: string;
  detail?: string;
  origin?: string;
  image?: string;
  images?: string[];
  // 가격 우선순위: 선택된 variant.price → basePrice → price → variants 최저가
  price?: number;              // (하위호환/리스트 캐시)
  basePrice?: number | null;   // 옵션 없을 때만 사용
  variants?: Variant[];        // 🔥 사이즈별 가격
};

// 추천 카드용
type SimpleProduct = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

// (옵션 없는 옛 데이터 대비용)
const FALLBACK_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

// 아코디언 (네 기존 내용 그대로 써도 됨)
const accordionData: { title: string; content: string }[] = [
  // { title: 'Fabric & Care', content: '...' },
  // { title: 'Shipping & Returns', content: '...' },
];

type Review = {
  rating: number;
  title: string;
  content: string;
  name: string;
  email: string;
};

export default function ProductPage() {
  const params = useParams();
  const productId = params.product as string;

  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // ───────────────── Firestore: 상품 읽기 ─────────────────
  useEffect(() => {
    if (!productId) return;
    (async () => {
      setLoading(true);
      const snap = await getDoc(doc(db, 'products', productId));
      setProductData(snap.exists() ? ({ id: productId, ...(snap.data() as any) } as Product) : null);
      setLoading(false);
    })();
  }, [productId]);

  // 이미지 배열 정리(단일/배열 호환)
  const productImages = useMemo(() => {
    if (!productData) return [] as string[];
    if (Array.isArray(productData.images) && productData.images.length) return productData.images;
    if (productData.image) return [productData.image];
    return [];
  }, [productData]);

  const [mainImage, setMainImage] = useState<string | undefined>(undefined);
  useEffect(() => {
    setMainImage(productImages[0]);
  }, [productImages]);

  // ───────────────── 사이즈/가격 상태 ─────────────────
  const hasVariants = !!(productData?.variants && productData.variants.length);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // 옵션 있으면 첫 옵션 자동 선택
  useEffect(() => {
    if (hasVariants) setSelectedVariant(productData!.variants![0]);
    else setSelectedVariant(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVariants, productId]);

  // 화면 표시용 가격
  const displayPrice = useMemo(() => {
    if (!productData) return 0;
    if (selectedVariant) return Number(selectedVariant.price || 0);
    if (typeof productData.basePrice === 'number') return productData.basePrice;
    if (typeof productData.price === 'number') return productData.price;
    if (productData.variants?.length) {
      return Math.min(...productData.variants.map(v => Number(v.price || 0)));
    }
    return 0;
  }, [productData, selectedVariant]);

  const productName = productData?.name ?? '';
  const productDescription = productData?.description ?? '';

  // 수량/장바구니
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // 옵션 없는 옛 데이터용 사이즈 선택 상태(가격은 변하지 않음)
  const [fallbackSize, setFallbackSize] = useState(FALLBACK_SIZES[0]);

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) {
      alert('사이즈를 선택해 주세요.');
      return;
    }
    // CartContext 기존 시그니처(id, name, price, image, size, quantity)에 맞춤
    addToCart({
      id: productId,
      name: productName,
      price: Number(displayPrice),
      image: mainImage,
      size: hasVariants ? selectedVariant?.size : fallbackSize,
      quantity,
      // 필요하면 variantId도 넘길 수 있음:
      // variantId: selectedVariant?.id,
    } as any);
  };

  // ───────────────── 추천 상품 로드 ─────────────────
  const [recommendedProducts, setRecommendedProducts] = useState<SimpleProduct[]>([]);
  useEffect(() => {
    (async () => {
      const qs = await getDocs(collection(db, 'products'));
      const items: SimpleProduct[] = [];
      qs.forEach(d => {
        if (d.id === productId) return;
        const data = d.data() as any;
        let p = 0;
        if (Array.isArray(data.variants) && data.variants.length) {
          p = Math.min(...data.variants.map((v: any) => Number(v.price || 0)));
        } else if (typeof data.basePrice === 'number') {
          p = data.basePrice;
        } else if (typeof data.price === 'number') {
          p = data.price;
        }
        items.push({
          id: d.id,
          name: data.name,
          price: p,
          image: data.image || data.images?.[0],
        });
      });
      setRecommendedProducts(items);
    })();
  }, [productId]);

  // ───────────────── 리뷰 (기존 로직 유지) ─────────────────
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState<Review>({
    rating: 0, title: '', content: '', name: '', email: '',
  });
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const handleRating = (n: number) => setReviewData({ ...reviewData, rating: n });
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviews(prev => [...prev, reviewData]);
    setReviewData({ rating: 0, title: '', content: '', name: '', email: '' });
    setShowReviewForm(false);
  };

  if (loading) return <div className="p-10 text-2xl text-center">Loading...</div>;
  if (!productData) return <div className="p-10 text-2xl text-center">Not Found</div>;

  return (
    <div className="bg-[var(--bg-base)] min-h-screen pb-24">
      <Link href="/" className="text-[var(--text-primary)] hover:underline mb-8 inline-block font-semibold">
        &larr; Back to Home
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* 왼쪽: 이미지 */}
        <div>
          <div className="mb-4">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={productName}
                width={600}
                height={600}
                className="rounded-xl object-contain bg-white"
                style={{ maxHeight: 600, width: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-xl text-gray-400">
                No Image
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {productImages.map((img, idx) => (
              <button
                key={img || idx}
                onClick={() => setMainImage(img)}
                className={`border rounded-lg overflow-hidden ${mainImage === img ? 'border-[#FFD600] shadow' : 'border-[#eee]'}`}
                style={{ width: 80, height: 80 }}
              >
                {img ? (
                  <Image src={img} alt={`thumbnail-${idx + 1}`} width={80} height={80} className="object-cover" />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center text-xs text-gray-400">No Image</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 오른쪽: 정보 */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-extrabold mb-2 text-[var(--text-primary)]">{productName}</h1>

          <p className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            ${displayPrice}
          </p>

          {productDescription && <p className="text-lg text-gray-700 mb-6">{productDescription}</p>}

          {/* 🔥 사이즈 (variants 있을 때만 가격 연동) */}
          {hasVariants ? (
            <div>
              <div className="font-semibold mb-1">Size</div>
              <div className="flex gap-2 flex-wrap">
                {productData!.variants!.map((v) => (
                  <button
                    key={v.id || v.size}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    title={`$${v.price}`}
                    className={`px-4 py-2 rounded-full border font-semibold transition
                      ${selectedVariant?.id === v.id
                        ? 'bg-[#FFD600] text-[var(--text-primary)] border-[#FFD600] shadow'
                        : 'bg-white text-[var(--text-primary)] border-[#EEE] hover:bg-[#FFF8E1]'}
                    `}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // 옵션 없는 옛 데이터용: 사이즈 UI만 표시(가격은 변하지 않음)
            <div>
              <div className="font-semibold mb-1">Size</div>
              <div className="flex gap-2">
                {FALLBACK_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFallbackSize(s)}
                    className={`px-4 py-2 rounded-full border font-semibold transition
                      ${fallbackSize === s
                        ? 'bg-[#FFD600] text-[var(--text-primary)] border-[#FFD600] shadow'
                        : 'bg-white text-[var(--text-primary)] border-[#EEE] hover:bg-[#FFF8E1]'}
                    `}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 수량 */}
          <div>
            <div className="font-semibold mb-1">Quantity</div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center text-xl"
              >
                -
              </button>
              <span className="text-xl font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center text-xl"
              >
                +
              </button>
            </div>
          </div>

          <button
            className="mt-6 w-full py-4 rounded-full bg-[var(--text-primary)] text-[#FFF8E1] text-lg font-bold shadow hover:bg-[#FFD600] hover:text-[var(--text-primary)] transition"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>

          {/* 아코디언 */}
          <div className="mt-8 w-full">
            {accordionData.map((section, idx) => (
              <div key={section.title} className="mb-4 rounded-xl shadow bg-[#E5E0D8]">
                <details className="rounded-xl">
                  <summary className="flex w-full justify-between items-center py-4 px-6 text-xl font-bold text-[var(--text-primary)] cursor-pointer">
                    <span>{section.title}</span>
                  </summary>
                  <div className="pb-4 px-6 text-base">{section.content}</div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔥 추천 상품 */}
      <div className="mt-16 px-2 md:px-0">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-[var(--text-primary)]">You Might Also Like</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {recommendedProducts.length === 0 ? (
            <div className="text-center text-gray-400">No recommended products.</div>
          ) : (
            recommendedProducts.map((item, idx) => (
              <div key={item.id || idx} className="flex flex-col items-center w-40">
                <div className="rounded-lg overflow-hidden shadow bg-white mb-2">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={160} height={160} className="object-cover" />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-xs text-gray-400">No Image</div>
                  )}
                </div>
                <div className="text-center">
                  <div className="font-bold text-[var(--text-primary)]">{item.name}</div>
                  <div className="text-lg text-gray-700">${item.price}</div>
                </div>
                <Link href={`/products/${item.id}`}>
                  <button className="mt-2 px-4 py-2 bg-[#FFD600] rounded-full text-[var(--text-primary)] font-bold shadow hover:bg-[#FFF8E1]">
                    View
                  </button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 리뷰 섹션 */}
      <div className="mt-16 flex flex-col items-center">
        <h3 className="text-2xl font-semibold mb-4">Customer Reviews</h3>
        {reviews.length === 0 ? (
          <div className="mb-6 flex items-center gap-6">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className="text-2xl text-[#cbbaba]">&#9733;</span>
              ))}
            </div>
            <div className="text-gray-700">Be the first to write a review</div>
          </div>
        ) : (
          <div className="mb-6 w-full max-w-2xl space-y-4">
            {reviews.map((r, i) => (
              <div key={i} className="border p-4 rounded shadow bg-white">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`text-xl ${r.rating >= n ? 'text-yellow-500' : 'text-gray-300'}`}>&#9733;</span>
                  ))}
                </div>
                <div className="font-bold mb-1">{r.title}</div>
                <div className="text-gray-700 mb-1">{r.content}</div>
                <div className="text-xs text-gray-500">by {r.name}</div>
              </div>
            ))}
          </div>
        )}
        <button className="px-8 py-3 bg-[#cbbaba] text-white font-semibold rounded mb-6" onClick={() => setShowReviewForm(true)}>
          Write a review
        </button>
      </div>

      {/* 리뷰 작성 모달 */}
      {showReviewForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <form onSubmit={handleReviewSubmit} className="bg-white p-8 rounded shadow-lg w-full max-w-lg">
            <h4 className="text-xl font-semibold mb-2 text-center">Write a review</h4>
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`text-3xl cursor-pointer ${reviewData.rating >= n ? 'text-yellow-500' : 'text-gray-300'}`}
                  onClick={() => handleRating(n)}
                >
                  &#9733;
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Review Title"
              className="w-full border rounded px-3 py-2 mb-3"
              value={reviewData.title}
              onChange={e => setReviewData({ ...reviewData, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Write your comments here"
              className="w-full border rounded px-3 py-2 mb-3"
              value={reviewData.content}
              onChange={e => setReviewData({ ...reviewData, content: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Your Name"
              className="w-full border rounded px-3 py-2 mb-3"
              value={reviewData.name}
              onChange={e => setReviewData({ ...reviewData, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full border rounded px-3 py-2 mb-3"
              value={reviewData.email}
              onChange={e => setReviewData({ ...reviewData, email: e.target.value })}
              required
            />
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowReviewForm(false)}>
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-[#cbbaba] text-white rounded">
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}