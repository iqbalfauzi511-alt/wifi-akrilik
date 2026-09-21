import React from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Masuk — Cobascan',
  description: 'Platform QR + NFC untuk bisnis. Kelola ulasan Google Review dan fasilitas Wi-Fi.',
};

export default function LoginPage({ searchParams }) {
  const nextUrl = searchParams?.next || '/dashboard';
  const errorParam = searchParams?.error || '';

  return <LoginForm nextUrl={nextUrl} errorParam={errorParam} />;
}
