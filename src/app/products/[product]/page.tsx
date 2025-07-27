'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

// 상품 타입 선언
type Product = {
  id?: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  images?: string[];     // 여러 이미지 지원
  options?: { color?: string; size?: string; stock?: number }[];
  stock?: number;
  origin?: string;
  detail?: string;
};

// 추천 상품 Firestore에서 불러오기용
type SimpleProduct = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

const sizes = ["XS", "S", "M", "L", "XL"];

// 상세 정보 아코디언 데이터
const accordionData: { title: string; content: string }[] = [
  // ... (생략, 기존 그대로)
];

// 리뷰 타입
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

  // 상품 데이터 타입 적용!
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Firestore에서 상품 데이터 가져오기
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    async function fetchProduct() {
      const docRef = doc(db, "products", productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProductData({
          ...docSnap.data(),
          id: productId,
        } as Product); // ← 타입 단언
      } else {
        setProductData(null);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [productId]);

  // 이미지(여러개 지원)
  const productImages =
    productData?.images
      ? Array.isArray(productData.images)
        ? productData.images
        : [productData.images]
      : productData?.image
        ? [productData.image]
        : [];

  const productPrice = productData?.price !== undefined
    ? (typeof productData.price === "number" ? `$${productData.price}` : productData.price)
    : "";

  const productDescription = productData?.description || "";
  const productName = productData?.name || "";

  const [mainImage, setMainImage] = useState(productImages[0]);
  useEffect(() => {
    setMainImage(productImages[0]);
  }, [productImages[0]]);

  // UI 상태
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // 리뷰 관련 상태
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState<Review>({
    rating: 0,
    title: "",
    content: "",
    name: "",
    email: "",
  });

  // 별점 클릭
  const handleRating = (n: number) => setReviewData({ ...reviewData, rating: n });

  // 리뷰 폼 제출
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviews([...reviews, reviewData]);
    setReviewData({
      rating: 0,
      title: "",
      content: "",
      name: "",
      email: "",
    });
    setShowReviewForm(false);
  };

  // 장바구니 추가
  const handleAddToCart = () => {
    addToCart({
      id: productId,
      name: productName,
      price: Number(String(productPrice).replace(/[^0-9.]/g, "")),
      image: mainImage,
      size: selectedSize,
      quantity,
    });
  };

  // 🔥 추천 상품 Firestore에서 실시간 불러오기
  const [recommendedProducts, setRecommendedProducts] = useState<SimpleProduct[]>([]);
  useEffect(() => {
    async function fetchRecommended() {
      const querySnapshot = await getDocs(collection(db, "products"));
      const products: SimpleProduct[] = [];
      querySnapshot.forEach(docu => {
        // 자기 자신은 추천에서 제외
        if (docu.id !== productId) {
          const data = docu.data();
          products.push({
            id: docu.id,
            name: data.name,
            price: data.price,
            image: data.image,
          });
        }
      });
      setRecommendedProducts(products);
    }
    if (productId) fetchRecommended();
  }, [productId]);

  if (loading) return <div className="p-10 text-2xl text-center">Loading...</div>;
  if (!productData) return <div className="p-10 text-2xl text-center">Not Found</div>;

  // 실제 화면 렌더링
  return (
    <div className="bg-[var(--bg-base)] min-h-screen pb-24">
      <Link href="/" className="text-[var(--text-primary)] hover:underline mb-8 inline-block font-semibold">
        &larr; Back to Home
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* 왼쪽: 이미지 섹션 */}
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
            {productImages.map((img: string, idx: number) => (
              <button
                key={img || idx}
                onClick={() => setMainImage(img)}
                className={`border rounded-lg overflow-hidden ${mainImage === img ? "border-[#FFD600] shadow" : "border-[#eee]"}`}
                style={{ width: 80, height: 80 }}
                tabIndex={0}
              >
                {img ? (
                  <Image
                    src={img}
                    alt={`thumbnail-${idx + 1}`}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center text-xs text-gray-400">No Image</div>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* 오른쪽: 정보 섹션 */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-extrabold mb-2 text-[var(--text-primary)]">{productName}</h1>
          {productPrice && (
            <p className="text-2xl font-semibold text-[var(--text-primary)] mb-2">{productPrice}</p>
          )}
          {productDescription && (
            <p className="text-lg text-gray-700 mb-6">{productDescription}</p>
          )}
          <div>
            <div className="font-semibold mb-1">Size</div>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-full border font-semibold transition
                    ${selectedSize === size
                      ? "bg-[#FFD600] text-[var(--text-primary)] border-[#FFD600] shadow"
                      : "bg-white text-[var(--text-primary)] border-[#EEE] hover:bg-[#FFF8E1]"}
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-1">Quantity</div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center text-xl"
              >-</button>
              <span className="text-xl font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center text-xl"
              >+</button>
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
              <div
                key={section.title}
                className="mb-4 rounded-xl shadow bg-[#E5E0D8]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="flex w-full justify-between items-center py-4 px-6 text-xl font-bold text-[var(--text-primary)] focus:outline-none"
                >
                  <span>{section.title}</span>
                  <span className="text-2xl">{openIdx === idx ? '−' : '+'}</span>
                </button>
                {openIdx === idx && (
                  <div className="pb-4 px-6 transition-all duration-200 text-base">{section.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔥 추천 상품 Firestore에서 실시간 표시 */}
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
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={160}
                      height={160}
                      className="object-cover"
                    />
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
                    <span key={n} className={`text-xl ${r.rating >= n ? "text-yellow-500" : "text-gray-300"}`}>&#9733;</span>
                  ))}
                </div>
                <div className="font-bold mb-1">{r.title}</div>
                <div className="text-gray-700 mb-1">{r.content}</div>
                <div className="text-xs text-gray-500">by {r.name}</div>
              </div>
            ))}
          </div>
        )}
        <button
          className="px-8 py-3 bg-[#cbbaba] text-white font-semibold rounded mb-6"
          onClick={() => setShowReviewForm(true)}
        >
          Write a review
        </button>
      </div>

      {/* Write Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white p-8 rounded shadow-lg w-full max-w-lg"
          >
            <h4 className="text-xl font-semibold mb-2 text-center">Write a review</h4>
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`text-3xl cursor-pointer ${reviewData.rating >= n ? "text-yellow-500" : "text-gray-300"}`}
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
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#cbbaba] text-white rounded"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}







