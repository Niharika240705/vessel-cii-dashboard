import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const alertId = params.id;
    if (!alertId) {
      return NextResponse.json({ error: 'Missing alert ID' }, { status: 400 });
    }

    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: { 
        resolvedAt: new Date(),
        isRead: true // Resolving implicitly marks it as read
      }
    });

    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error('Resolve Alert Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
