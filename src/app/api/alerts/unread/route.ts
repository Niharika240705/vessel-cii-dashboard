import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const unreadCount = await prisma.alert.count({
      where: { isRead: false }
    });

    const latestAlerts = await prisma.alert.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        vessel: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ unreadCount, alerts: latestAlerts });
  } catch (error) {
    console.error('Fetch Unread Alerts Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
