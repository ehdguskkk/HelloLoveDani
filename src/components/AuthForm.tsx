'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

type Mode = 'login' | 'signup';

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fafafa'
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '40px 32px 32px 32px',
          borderRadius: '12px',
          boxShadow: '0 2px 20px 0 rgba(0,0,0,0.07)',
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* 브랜드 네임 */}
        <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 12, color: '#263947' }}>
          HelloLoveDani
        </div>
        {/* 폼 타이틀 */}
        <h2 style={{ marginBottom: 12, color: '#263947' }}>
          {mode === 'login' ? 'Sign In' : 'Sign Up'}
        </h2>

        <form style={{ width: '100%' }} onSubmit={handleAuth}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, display: 'block' }}>
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: 6,
                fontSize: 16,
                outline: 'none'
              }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, display: 'block' }}>
              Password
            </label>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: 6,
                fontSize: 16,
                outline: 'none'
              }}
            />
          </div>
          {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 6,
              background: '#5742ea',
              color: '#fff',
              fontWeight: 600,
              fontSize: 18,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: 18, fontSize: 15, color: '#444' }}>
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button
                style={{
                  color: '#5742ea',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  textDecoration: 'underline'
                }}
                onClick={() => setMode('signup')}
                type="button"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                style={{
                  color: '#5742ea',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  textDecoration: 'underline'
                }}
                onClick={() => setMode('login')}
                type="button"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}