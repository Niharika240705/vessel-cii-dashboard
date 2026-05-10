import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FuelType } from '@prisma/client';

export interface ForecastResponse {
  forecastData: {
    month: string;
    actual?: number;
    predicted: number;
    threshold: number;
  }[];
  projectedAttainedCii: number;
  projectedGrade: string;
  requiredCii: number;
  totalDistance: number;
  totalCo2: number;
}

const CF_FACTORS: Record<string, number> = {
  HFO: 3.114,
  VLSFO: 3.151,
  MGO: 3.206,
  LNG: 2.750,
  METHANOL: 1.375,
  AMMONIA: 0,
};

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = params.id;
    
    const searchParams = request.nextUrl.searchParams;
    const speedReduction = parseFloat(searchParams.get('speedReduction') || '0');
    const fuelTypeOverride = searchParams.get('fuelTypeOverride') as FuelType | null;

    const vessel = await prisma.vessel.findUnique({
      where: { id },
      include: {
        ciiRatings: { orderBy: { year: 'desc' }, take: 1 },
        voyages: {
          where: { departureTime: { gte: new Date('2024-01-01'), lte: new Date('2024-06-30') } },
          include: { fuelConsumptions: true },
          orderBy: { departureTime: 'asc' }
        }
      }
    });

    if (!vessel) return NextResponse.json({ error: 'Vessel not found' }, { status: 404 });

    const requiredCii = vessel.ciiRatings[0]?.requiredCii || 4.5;
    const targetYear = 2024;
    
    // Aggregate actuals by month
    const monthMap = new Map<string, { distance: number, co2: number, fuelAmt: number }>();
    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    allMonths.forEach(m => monthMap.set(m, { distance: 0, co2: 0, fuelAmt: 0 }));

    let totalActualDist = 0;
    let totalActualFuelAmt = 0;
    let totalActualCo2 = 0;
    let lastVoyageDate = new Date(`${targetYear}-01-01`);
    let lastKnownFuelType = 'VLSFO';

    vessel.voyages.forEach(v => {
      const month = v.departureTime.toLocaleString('default', { month: 'short' });
      const stat = monthMap.get(month)!;
      stat.distance += v.distanceSailed;
      totalActualDist += v.distanceSailed;
      
      if (v.arrivalTime > lastVoyageDate) lastVoyageDate = v.arrivalTime;

      v.fuelConsumptions.forEach(f => {
        const co2 = f.quantity * CF_FACTORS[f.fuelType];
        stat.co2 += co2;
        stat.fuelAmt += f.quantity;
        totalActualCo2 += co2;
        totalActualFuelAmt += f.quantity;
        lastKnownFuelType = f.fuelType;
      });
    });

    // If no voyages yet, default to start of year
    const daysPassed = Math.max(1, (lastVoyageDate.getTime() - new Date(`${targetYear}-01-01`).getTime()) / (1000 * 60 * 60 * 24));
    
    // Average trailing run rates
    const avgDailyDist = totalActualDist > 0 ? totalActualDist / daysPassed : 288; // fallback 12 knots * 24h
    const avgDailyFuel = totalActualFuelAmt > 0 ? totalActualFuelAmt / daysPassed : (vessel.deadweight * 0.0002 * avgDailyDist); 
    const remainingDays = Math.max(0, 365 - daysPassed);

    // Apply "What-If" Speed Reductions using Cubic Law 
    // speedReduction is given as a positive number (e.g. 2 means -2 knots)
    const oldSpeed = 12; // assumed average base speed
    const newSpeed = Math.max(1, oldSpeed - speedReduction);
    const speedRatio = newSpeed / oldSpeed;

    const remainingDailyDist = avgDailyDist * speedRatio;
    // Fuel per day ~ v^3
    const remainingDailyFuel = avgDailyFuel * Math.pow(speedRatio, 3);
    
    const projectedRemainingDist = remainingDailyDist * remainingDays;
    const projectedRemainingFuel = remainingDailyFuel * remainingDays;
    
    // Apply "What-If" Fuel Switch
    let remainingCo2Factor = CF_FACTORS[lastKnownFuelType] || CF_FACTORS['VLSFO'];
    if (fuelTypeOverride && CF_FACTORS[fuelTypeOverride] !== undefined) {
        remainingCo2Factor = CF_FACTORS[fuelTypeOverride];
    }
    
    const projectedRemainingCo2 = projectedRemainingFuel * remainingCo2Factor;
    
    const totalYearDist = totalActualDist + projectedRemainingDist;
    const totalYearCo2 = totalActualCo2 + projectedRemainingCo2;
    
    const projectedAer = totalYearDist > 0 ? (totalYearCo2 * 1000000) / (vessel.deadweight * totalYearDist) : 0;

    let finalGrade = 'C';
    if (projectedAer < requiredCii * 0.85) finalGrade = 'A';
    else if (projectedAer < requiredCii * 0.94) finalGrade = 'B';
    else if (projectedAer < requiredCii * 1.06) finalGrade = 'C';
    else if (projectedAer < requiredCii * 1.19) finalGrade = 'D';
    else finalGrade = 'E';

    // Build month-by-month trajectory
    const currentMonthIdx = remainingDays === 365 ? -1 : lastVoyageDate.getMonth();
    const forecastData = [];
    
    let cumulativeDist = 0;
    let cumulativeCo2 = 0;
    
    for (let i = 0; i < 12; i++) {
      const m = allMonths[i];
      const stat = monthMap.get(m)!;
      
      if (i <= currentMonthIdx) {
        cumulativeDist += stat.distance;
        cumulativeCo2 += stat.co2;
        const aer = cumulativeDist > 0 ? (cumulativeCo2 * 1000000) / (vessel.deadweight * cumulativeDist) : 0;
        forecastData.push({
            month: m,
            actual: Number(aer.toFixed(2)),
            predicted: Number(aer.toFixed(2)),
            threshold: Number(requiredCii.toFixed(2))
        });
      } else {
        // Projections for remaining months
        const daysInMonth = new Date(targetYear, i + 1, 0).getDate();
        // If we are in the current month, only extrapolate the remaining days of this month
        let extrapDays = daysInMonth;
        if (i === currentMonthIdx + 1 && lastVoyageDate.getDate() > 1) {
             extrapDays = daysInMonth - lastVoyageDate.getDate();
        }

        cumulativeDist += remainingDailyDist * extrapDays;
        cumulativeCo2 += (remainingDailyFuel * extrapDays) * remainingCo2Factor;
        const aer = cumulativeDist > 0 ? (cumulativeCo2 * 1000000) / (vessel.deadweight * cumulativeDist) : 0;
        
        forecastData.push({
            month: m,
            predicted: Number(aer.toFixed(2)),
            threshold: Number(requiredCii.toFixed(2))
        });
      }
    }

    return NextResponse.json({
      forecastData,
      projectedAttainedCii: Number(projectedAer.toFixed(2)),
      projectedGrade: finalGrade,
      requiredCii: Number(requiredCii.toFixed(2)),
      totalDistance: Number(totalYearDist.toFixed(0)),
      totalCo2: Number(totalYearCo2.toFixed(1))
    });
  } catch (error) {
    console.error('Forecast Engine Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
