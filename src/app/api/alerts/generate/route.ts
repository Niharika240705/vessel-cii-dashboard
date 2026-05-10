import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AlertType, AlertSeverity } from '@prisma/client';

export async function POST() {
  return generateAlerts();
}

export async function GET() {
  return generateAlerts();
}

async function generateAlerts() {
  try {
    const vessels = await prisma.vessel.findMany({
      include: {
        ciiRatings: { orderBy: { year: 'desc' }, take: 1 },
        complianceDocs: true,
        voyages: {
          where: {
            departureTime: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
            }
          },
          include: { fuelConsumptions: true },
          orderBy: { departureTime: 'desc' }
        }
      }
    });

    let newAlertsCount = 0;

    for (const vessel of vessels) {
      // 1. CII Risk Check
      const latestRating = vessel.ciiRatings[0];
      if (latestRating) {
        // Evaluate current AER trajectory
        const aer = latestRating.aerScore;
        const req = latestRating.requiredCii;
        
        let grade = 'C';
        if (aer < req * 0.85) grade = 'A';
        else if (aer < req * 0.94) grade = 'B';
        else if (aer < req * 1.06) grade = 'C';
        else if (aer < req * 1.19) grade = 'D';
        else grade = 'E';

        if (grade === 'D' || grade === 'E') {
          // Check if alert already exists for this type and isn't resolved
          const existing = await prisma.alert.findFirst({
            where: { vesselId: vessel.id, type: AlertType.CII_RISK, resolvedAt: null }
          });
          
          if (!existing) {
            await prisma.alert.create({
              data: {
                vesselId: vessel.id,
                type: AlertType.CII_RISK,
                severity: grade === 'E' ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
                message: `${vessel.name} is tracking towards a ${grade} rating. Projected AER: ${aer.toFixed(2)}.`
              }
            });
            newAlertsCount++;
          }
        }
      }

      // 2. Compliance Document Expiry
      const now = new Date();
      for (const doc of vessel.complianceDocs) {
        if (!doc.expiryDate) continue;
        
        const daysToExpiry = (doc.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        let severity: AlertSeverity | null = null;
        let message = '';
        
        if (daysToExpiry < 0) {
          severity = AlertSeverity.HIGH;
          message = `${doc.documentType} for ${vessel.name} is OVERDUE by ${Math.abs(Math.floor(daysToExpiry))} days.`;
        } else if (daysToExpiry <= 30) {
          severity = AlertSeverity.MEDIUM;
          message = `${doc.documentType} for ${vessel.name} expires in ${Math.floor(daysToExpiry)} days.`;
        } else if (daysToExpiry <= 90) {
          severity = AlertSeverity.LOW;
          message = `${doc.documentType} for ${vessel.name} expires in ${Math.floor(daysToExpiry)} days.`;
        }

        if (severity) {
          // Avoid duplicate unresolved alerts for the exact same document
          const existing = await prisma.alert.findFirst({
            where: { vesselId: vessel.id, type: AlertType.DOC_EXPIRY, message: message, resolvedAt: null }
          });

          if (!existing) {
            await prisma.alert.create({
              data: {
                vesselId: vessel.id,
                type: AlertType.DOC_EXPIRY,
                severity,
                message
              }
            });
            newAlertsCount++;
          }
        }
      }

      // 3. Fuel Anomaly
      if (vessel.voyages.length > 1) {
        const latestVoyage = vessel.voyages[0]; // ordered by desc
        const prevVoyages = vessel.voyages.slice(1);
        
        const getFuelPerNm = (voy: any) => {
          const totalFuel = voy.fuelConsumptions.reduce((sum: number, f: any) => sum + f.quantity, 0);
          return voy.distanceSailed > 0 ? totalFuel / voy.distanceSailed : 0;
        };

        const latestRate = getFuelPerNm(latestVoyage);
        
        let prevSum = 0;
        let prevCount = 0;
        prevVoyages.forEach(v => {
           const rate = getFuelPerNm(v);
           if (rate > 0) {
               prevSum += rate;
               prevCount++;
           }
        });

        if (prevCount > 0 && latestRate > 0) {
            const avgPrevRate = prevSum / prevCount;
            if (latestRate > avgPrevRate * 1.20) { // > 20% anomaly
                const anomalyPct = ((latestRate - avgPrevRate) / avgPrevRate) * 100;
                
                // Allow generating multiple anomaly alerts, but let's check if we made one for THIS specific voyage's timestamp.
                // We'll just check if an anomaly alert was created in the last 2 days to prevent spam.
                const recentAlert = await prisma.alert.findFirst({
                    where: { 
                        vesselId: vessel.id, 
                        type: AlertType.FUEL_ANOMALY,
                        createdAt: { gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
                    }
                });

                if (!recentAlert) {
                    await prisma.alert.create({
                        data: {
                            vesselId: vessel.id,
                            type: AlertType.FUEL_ANOMALY,
                            severity: AlertSeverity.MEDIUM,
                            message: `Fuel consumption anomaly detected on ${vessel.name}: ${anomalyPct.toFixed(1)}% above 90-day rolling average.`
                        }
                    });
                    newAlertsCount++;
                }
            }
        }
      }
    }

    return NextResponse.json({ success: true, newAlertsGenerated: newAlertsCount });
  } catch (error) {
    console.error('Alert Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
