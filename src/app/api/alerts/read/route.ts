import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { alertIds, markAll } = body;

    if (markAll) {
      await prisma.alert.updateMany({
        where: { isRead: false },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true, message: 'All alerts marked as read' });
    }

    if (alertIds && Array.isArray(alertIds)) {
      await prisma.alert.updateMany({
        where: { id: { in: alertIds } },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true, message: 'Alerts marked as read' });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    console.error('Mark Alerts Read Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
