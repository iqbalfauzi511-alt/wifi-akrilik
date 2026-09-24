import { redirect } from 'next/navigation';

export default function DashboardQrRedirect() {
  redirect('/dashboard/devices');
}
