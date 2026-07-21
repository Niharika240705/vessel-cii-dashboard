import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AlertType, AlertSeverity } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const vesselId = searchParams.get('vesselId');
    const status = searchParams.get('status');

    const whereClause: any = {};

    if (type && type !== 'ALL') whereClause.type = type as AlertType;
    if (severity && severity !== 'ALL') whereClause.severity = severity as AlertSeverity;
    if (vesselId && vesselId !== 'ALL') whereClause.vesselId = vesselId;
    if (status) {
      if (status === 'UNREAD') whereClause.isRead = false;
      if (status === 'READ') whereClause.isRead = true;
      if (status === 'RESOLVED') whereClause.resolvedAt = { not: null };
      if (status === 'UNRESOLVED') whereClause.resolvedAt = null;
    }

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        vessel: {
          select: { name: true, imoNumber: true }
        }
      }
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Fetch Alerts Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
