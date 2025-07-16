import Image from 'next/image';
import Link from 'next/link';

// 1. 타입을 명확하게 선언!
type PageProps = {
  params: {
    collection: string;
  };
};

// 2. [중요] async를 제거한 순수 함수 선언식!
export default function CollectionPage({ params }: PageProps) {
  const products = [
    { name: "Happy Place Reversible Bandana", price: "$39.00 USD", image: "https://ext.same-assets.com/1667191207/2069186592.jpeg", href: "/products/happy-place-reversible-bandana" },
    { name: "Happy Place Womens T-shirt - Bandana Bundle", price: "$89.00 USD", image: "https://ext.same-assets.com/1667191207/3569243583.jpeg", href: "/products/happy-place-womens-t-shirt-bandana-bundle" },
    { name: "Sunshine Club Reversible Bandana", price: "$39.00 USD", image: "https://ext.same-assets.com/1667191207/3395452387.jpeg", href: "/products/sunshine-club-reversible-bandana" },
    { name: "Sunshine Club Womens T-shirt - Bandana Bundle", price: "$89.00 USD", image: "https://ext.same-assets.com/1667191207/3395452387.jpeg", href: "/products/sunshine-club-womens-t-shirt-bandana-bundle" },
    { name: "Coffee & Cuddles Reversible Bandana", price: "$39.00 USD", image: "https://ext.same-assets.com/1667191207/1996840431.jpeg", href: "/products/coffee-cuddles-reversible-bandana" },
    { name: "Coffee & Cuddless Womens T-shirt - Bandana Bundle", price: "$89.00 USD", image: "https://ext.same-assets.com/1667191207/1996840431.jpeg", href: "/products/coffee-cuddless-womens-t-shirt-bandana-bundle" },
    { name: "Happy Place T-Shirt", price: "$59.00 USD", image: "https://ext.same-assets.com/1667191207/246136332.jpeg", href: "/products/happy-place-t-shirt" },
    { name: "Sunshine Club T-Shirt", price: "$59.00 USD", image: "https://ext.same-assets.com/1667191207/3202248317.jpeg", href: "/products/sunshine-club-t-shirt" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 capitalize">{params.collection}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product, index) => (
          <Link href={product.href} key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Image src={product.image} alt={product.name} width={533} height={533} />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{product.name}</h3>
              <p className="text-gray-600">{product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}