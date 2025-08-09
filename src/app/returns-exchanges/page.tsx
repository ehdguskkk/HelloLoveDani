import { supabase } from '@/lib/supabaseClient';

export default async function ReturnsExchangesPage() {
  // static_pages에서 type이 'returns'인 데이터 1개만 가져옴
  const { data, error } = await supabase
    .from('static_pages')
    .select('*')
    .eq('type', 'returns')
    .single();

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 text-red-500">
        Failed to load Returns & Exchanges.<br />
        {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-6 text-[var(--accent)]">Returns & Exchanges</h1>
      {/* Supabase에서 content를 불러와서 HTML로 랜더 */}
      <div
        className="text-base"
        dangerouslySetInnerHTML={{ __html: data?.content || '' }}
      />
    </div>
  );
}