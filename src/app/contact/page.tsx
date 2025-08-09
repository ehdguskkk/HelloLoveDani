'use client';

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

type Form = { name: string; email: string; phone: string; message: string };
const initial: Form = { name: '', email: '', phone: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState<Form>(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [botTrap, setBotTrap] = useState('');

  const onChange =
    (key: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Please enter a valid email.';
    if (form.message.trim().length < 5) return 'Please write a short message.';
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (botTrap) return;

    const v = validate();
    if (v) { setError(v); setDone(null); return; }

    setLoading(true); setError(null); setDone(null);

    try {
      await addDoc(collection(db, 'inquiries'), {
        type: 'contact',
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        status: 'new',
        unread: true,
        createdAt: serverTimestamp(),
      });
      setDone('Thanks! Your message has been sent.');
      setForm(initial);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? 'Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[var(--accent)] mb-4">Contact Us</h1>
      <p className="text-gray-700 max-w-2xl mb-8">
        We love to hear from you! If you have a wholesale order, a question or would like to share
        a review, please reach out.
      </p>

      {done && <div className="mb-6 rounded-lg bg-green-50 text-green-800 px-4 py-3 border border-green-200">{done}</div>}
      {error && <div className="mb-6 rounded-lg bg-red-50 text-red-800 px-4 py-3 border border-red-200">{error}</div>}

      <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
        <input type="text" value={botTrap} onChange={e => setBotTrap(e.target.value)} className="hidden" aria-hidden tabIndex={-1} autoComplete="off" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm text-gray-600">Name</label>
            <input value={form.name} onChange={onChange('name')} className="w-full rounded-lg border px-4 py-3" placeholder="Your name" />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-600">Email *</label>
            <input type="email" value={form.email} onChange={onChange('email')} className="w-full rounded-lg border px-4 py-3" placeholder="you@example.com" required />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm text-gray-600">Phone number</label>
          <input value={form.phone} onChange={onChange('phone')} className="w-full rounded-lg border px-4 py-3" placeholder="Optional" />
        </div>

        <div>
          <label className="block mb-2 text-sm text-gray-600">Comment</label>
          <textarea value={form.message} onChange={onChange('message')} rows={6} className="w-full rounded-lg border px-4 py-3" placeholder="How can we help?" />
        </div>

        <button type="submit" disabled={loading} className={`px-8 py-3 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-[#D09C57] hover:bg-[#c68c40]'}`}>
          {loading ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}