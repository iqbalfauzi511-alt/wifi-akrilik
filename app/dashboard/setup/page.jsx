import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import SettingsForm from '@/components/customer/SettingsForm';
import Card, { CardHeader } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Setup Profil Bisnis: Cobascan',
};

export default async function BusinessSetupPage() {
  redirect('/dashboard');
}
