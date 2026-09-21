import React from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Masuk — Smart Wi-Fi',
  description: 'Kelola Wi-Fi dan QR bisnis Anda dengan mudah.',
};

export default function LoginPage({ searchParams }) {
  const nextUrl = searchParams?.next || '/dashboard';
  const errorParam = searchParams?.error || '';

  return <LoginForm nextUrl={nextUrl} errorParam={errorParam} />;
}
