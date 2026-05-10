import { prisma } from '@/lib/prisma';
import AlertsClient from './AlertsClient';

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const vessels = await prisma.vessel.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return <AlertsClient vessels={vessels} />;
}
