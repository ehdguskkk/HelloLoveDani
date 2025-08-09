'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

type SizeRow = { size: string; neck: string; for: string };
type SizeGuideDoc = {
  type?: 'size_guide';
  title?: string;
  intro?: string;
  notes?: string;
  image?: string;
  table?: SizeRow[];
};

const FALLBACK: SizeRow[] = [
  { size: 'XS', neck: '20–25 cm', for: 'Puppy, Toy Breed' },
  { size: 'S', neck: '25–32 cm', for: 'Small Dogs (e.g. Maltese, Pomeranian)' },
  { size: 'M', neck: '32–40 cm', for: 'Medium Dogs (e.g. Shiba Inu, Cocker Spaniel)' },
  { size: 'L', neck: '40–48 cm', for: 'Large Dogs (e.g. Golden Retriever)' },
  { size: 'XL', neck: '48–55 cm', for: 'XL Dogs' },
];

export default function SizeGuidePage() {
  const [data, setData] = useState<SizeGuideDoc | null>(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'pages', 'size-guide'));
      setData((snap.data() as SizeGuideDoc) || null);
    })();
  }, []);

  const rows = data?.table?.length ? data!.table! : FALLBACK;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[var(--accent)] mb-6">Size Guide</h1>

      {data?.intro && (
        <p className="text-gray-700 mb-2">{data.intro}</p>
      )}
      {data?.notes && (
        <p className="text-gray-500 font-semibold mb-6">{data.notes}</p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left">
              <th className="p-4">Size</th>
              <th className="p-4">Neck Circumference</th>
              <th className="p-4">Suitable For</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.size}-${i}`} className={i % 2 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-4 font-medium">{r.size}</td>
                <td className="p-4">{r.neck}</td>
                <td className="p-4">{r.for}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-gray-600 mt-8">
        If you are in between sizes, we recommend choosing the larger size for a more comfortable fit.
        {' '}For personalized sizing help, please <a href="/contact" className="underline">contact us</a>.
      </p>
    </div>
  );
}