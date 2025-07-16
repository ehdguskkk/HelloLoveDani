'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const sizes = ["XS", "S", "M", "L", "XL"];

// 샘플 상품 이미지들
const sampleImages = [
  "https://ext.same-assets.com/1667191207/2069186592.jpeg", // 메인
  "https://ext.same-assets.com/1667191207/4094797300.jpeg", // 추가1
  "https://ext.same-assets.com/1667191207/2829183725.jpeg", // 추가2
  "https://ext.same-assets.com/1667191207/2639193925.jpeg", // 추가3
];

const accordionData = [
  {
    title: "Details",
    content: (
      <ul className="list-disc ml-6 text-[var(--text-primary)]">
        <li>Our unique triangle-tie shape makes this bandana easy to tie on (no folding needed)</li>
        <li>Mint green merrow hem</li>
        <li>Made in Australia with love</li>
      </ul>
    ),
  },
  {
    title: "Fit and Sizing",
    content: (
      <div className="text-[var(--text-primary)]">
        <p className="mb-2">Please measure your dog's neck to ensure a perfect fit. When in doubt, size up!</p>
        <ul className="list-disc ml-6">
          <li>Small: Fits necks up to 13", measures 7" top to point</li>
          <li>Medium: Fits necks up to 18", measures 9.5" top to point</li>
          <li>Large: Fits necks up to 26", measures 11.5" top to point</li>
        </ul>
        <p className="mt-2">Consult our <span className="underline cursor-pointer text-blue-500">size guide</span> for additional details.</p>
      </div>
    ),
  },
  {
    title: "Materials and Care",
    content: (
      <ul className="list-disc ml-6 text-[var(--text-primary)]">
        <li>100% cotton</li>
        <li>Machine wash cold, air dry flat</li>
      </ul>
    ),
  },
];

// 추천 상품 샘플 데이터
const recommended = [
  {
    name: "Lake Blue Gingham Waste Bag Holder",
    price: "$24",
    image: "https://ext.same-assets.com/1667191207/3124710205.jpeg",
  },
  {
    name: "Sundae Funday Collar Walk Set",
    price: "$99",
    image: "https://ext.same-assets.com/1667191207/1597653608.jpeg",
  },
  {
    name: "Sundae Funday Lady Bow Collar",
    price: "$52",
    image: "https://ext.same-assets.com/1667191207/3722775241.jpeg",
  },
  {
    name: "Sundae Funday Lady Dog Bow",
    price: "$23",
    image: "https://ext.same-assets.com/1667191207/1065292971.jpeg",
  },
  {
    name: "Sundae Funday Dog Collar",
    price: "$35",
    image: "https://ext.same-assets.com/1667191207/1926382913.jpeg",
  },
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

  // 예시 데이터
  const productData = {
    id: productId || "happy-place",
    name: "Happy Place Reversible Bandana",
    price: "$39.00 USD",
    images: sampleImages,
    description: "A stylish and reversible bandana for your furry friend.",
  };

  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(productData.images[0]);
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
  const handleRating = (n: number) => {
    setReviewData({ ...reviewData, rating: n });
  };

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

  const handleAddToCart = () => {
    addToCart({
      id: productData.id,
      name: productData.name,
      price: Number(String(productData.price).replace(/[^0-9.]/g, "")),
      image: mainImage,
      size: selectedSize,
      quantity,
    });
    alert("장바구니에 담았습니다!");
  };

  return (
    <div className="bg-[var(--bg-base)] min-h-screen pb-24">
      <Link href="/" className="text-[var(--text-primary)] hover:underline mb-8 inline-block font-semibold">
        &larr; Back to Home
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* 왼쪽: 이미지 섹션 */}
        <div>
          <div className="mb-4">
            <Image
              src={mainImage}
              alt={productData.name}
              width={600}
              height={600}
              className="rounded-xl object-contain bg-white"
              style={{ maxHeight: 600, width: '100%', objectFit: 'contain' }}
            />
          </div>
          {/* 썸네일 */}
          <div className="flex gap-3">
            {productData.images.map((img, idx) => (
              <button
                key={img}
                onClick={() => setMainImage(img)}
                className={`border rounded-lg overflow-hidden ${mainImage === img ? "border-[#FFD600] shadow" : "border-[#eee]"}`}
                style={{ width: 80, height: 80 }}
                tabIndex={0}
              >
                <Image
                  src={img}
                  alt={`thumbnail-${idx + 1}`}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        {/* 오른쪽: 정보 섹션 */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-extrabold mb-2 text-[var(--text-primary)]">{productData.name}</h1>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mb-2">{productData.price}</p>
          <p className="text-lg text-gray-700 mb-6">{productData.description}</p>
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

      {/* 추천 상품 */}
      <div className="mt-16 px-2 md:px-0">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-[var(--text-primary)]">You Might Also Like</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {recommended.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center w-40">
              <div className="rounded-lg overflow-hidden shadow bg-white mb-2">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={160}
                  height={160}
                  className="object-cover"
                />
              </div>
              <div className="text-center">
                <div className="font-bold text-[var(--text-primary)]">{item.name}</div>
                <div className="text-lg text-gray-700">{item.price}</div>
              </div>
            </div>
          ))}
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