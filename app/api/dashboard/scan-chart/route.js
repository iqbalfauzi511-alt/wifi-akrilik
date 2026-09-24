import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getAdminScanChartData, getOwnerScanChartData } from '@/lib/db/queries/stats';
import { ensureDatabaseInitialized } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Build a full array of days for a range, filling 0 for missing days
function buildDayRange(rows, days) {
  const result = [];
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;
    const label = `${d.getDate()} ${monthNames[d.getMonth()]}`;
    const row = rows.find((r) => r.date === key);
    result.push({ date: key, label, count: row ? row.count : 0 });
  }
  return result;
}

export async function GET(request) {
  try {
    await ensureDatabaseInitialized();
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    let days = 7;
    if (period === '30d') days = 30;
    else if (period === 'this_month') {
      days = new Date().getDate();
    } else if (period === 'last_month') {
      days = 30;
    }

    let rows;
    if (session.role === 'admin') {
      rows = await getAdminScanChartData(days);
    } else {
      rows = await getOwnerScanChartData(session.user.id, days);
    }

    const chartData = buildDayRange(rows, days);
    const total = chartData.reduce((a, b) => a + b.count, 0);

    return NextResponse.json({ chartData, total, days });
  } catch (err) {
    console.error('scan-chart API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
