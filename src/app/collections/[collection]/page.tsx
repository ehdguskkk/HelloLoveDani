import CollectionPageClient from './CollectionPageClient';

export default async function Page({ params }: { params: { collection: string } }) {
  // params.collection 언래핑 (Next.js 15에서 Promise면 await 사용)
  const collection = typeof params.collection === 'string' ? params.collection : await params.collection;

  return <CollectionPageClient collection={collection} />;
}