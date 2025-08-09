import { supabase } from '@/lib/supabaseClient';

// Next.js 14 이상에서는 async server component 사용 가능!
export default async function AboutPage() {
  // static_pages에서 type이 'about'인 row 불러오기
  const { data, error } = await supabase
    .from('static_pages')
    .select('*')
    .eq('type', 'about')
    .single();

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 text-red-500">
        Failed to load About Us page. Please try again later.<br />
        {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold text-[var(--accent)] mb-6">About Us</h1>

      {data?.image_url && (
        <img
          src={data.image_url}
          alt="About main"
          className="w-56 h-56 object-cover rounded-2xl shadow-xl border-4 border-[var(--accent)] mb-8"
        />
      )}

      <div className="text-lg mb-8 whitespace-pre-line">
        {data?.content}
      </div>
    </div>
  );
}