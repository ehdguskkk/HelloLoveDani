'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 여기에 emailjs 등으로 메일 전송 로직 추가 가능
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="mb-8">
        We love to hear from you!<br />
        If you have a wholesale order, a question or would like to share a review, please reach out.
      </p>
      {submitted ? (
        <div className="text-green-600 text-lg">Thank you for your message! We'll get back to you soon.</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-1/2 border px-4 py-3 rounded"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
              className="w-1/2 border px-4 py-3 rounded"
              required
            />
          </div>
          <input
            type="text"
            name="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            className="w-full border px-4 py-3 rounded"
          />
          <textarea
            name="message"
            placeholder="Comment"
            value={form.message}
            onChange={handleChange}
            className="w-full border px-4 py-3 rounded h-32"
            required
          />
          <button
            type="submit"
            className="bg-[var(--accent)] text-[var(--bg-primary)] px-8 py-3 rounded font-bold hover:bg-[var(--accent-light)] transition"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}