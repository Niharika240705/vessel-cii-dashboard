import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VesselType } from '@prisma/client';

export interface Recommendation {
  id: string;
  type: 'SPEED' | 'FUEL' | 'CONSOLIDATION';
  title: string;
  description: string;
  projectedCiiImprovement?: string;
  projectedGradeChange?: string;
  estimatedCostSavingUsd?: number;
  confidence: 'High' | 'Medium' | 'Low';
  calculationDetails: { label: string; value: string }[];
}

const OPTIMAL_SPEEDS: Record<VesselType, number> = {
  BULK_CARRIER: 12,
  TANKER: 13,
  CONTAINER: 18,
  LNG_CARRIER: 17,
  RO_RO: 16,
  GENERAL_CARGO: 12,
  OFFSHORE_PATROL_VESSEL: 15,
  REPLENISHMENT_VESSEL: 14,
  AUXILIARY: 12,
  PATROL_VESSEL: 20,
  LOGISTICS_SUPPORT: 16,
  TRAINING_VESSEL: 14
};

const CF_FACTORS: Record<string, number> = {
  HFO: 3.114,
  VLSFO: 3.151,
  MGO: 3.206,
  LNG: 2.750,
  METHANOL: 1.375,
  AMMONIA: 0,
};

const BUNKER_PRICE_USD = 600;

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const vessel = await prisma.vessel.findUnique({
      where: { id: params.id },
      include: {
        ciiRatings: { orderBy: { year: 'desc' }, take: 1 },
        voyages: {
          orderBy: { departureTime: 'desc' },
          take: 20, // last 20 voyages
          include: { fuelConsumptions: true }
        }
      }
    });

    if (!vessel) return NextResponse.json({ error: 'Vessel not found' }, { status: 404 });

    const recommendations: Recommendation[] = [];
    const latestRating = vessel.ciiRatings[0];
    const currentGrade = latestRating?.rating || 'C';
    const requiredCii = latestRating?.requiredCii || 4.5;
    const attainedCii = latestRating?.attainedCii || 4.5;

    // Helper to determine grade based on AER vs Required
    const getGradeForAer = (aer: number, req: number) => {
      if (aer < req * 0.85) return 'A';
      if (aer < req * 0.94) return 'B';
      if (aer < req * 1.06) return 'C';
      if (aer < req * 1.19) return 'D';
      return 'E';
    };

    // Calculate average speed from recent voyages
    let totalDist = 0;
    let totalHrs = 0;
    let totalFuel = 0;
    let shortVoyagesCount = 0;
    
    // Predominant fuel tracker
    const fuelCounts: Record<string, number> = {};

    vessel.voyages.forEach(voy => {
      totalDist += voy.distanceSailed;
      const hrs = (voy.arrivalTime.getTime() - voy.departureTime.getTime()) / (1000 * 60 * 60);
      if (hrs > 0) totalHrs += hrs;
      
      if (voy.distanceSailed < 200) shortVoyagesCount++;

      voy.fuelConsumptions.forEach(f => {
        totalFuel += f.quantity;
        fuelCounts[f.fuelType] = (fuelCounts[f.fuelType] || 0) + f.quantity;
      });
    });

    const predominantFuel = Object.keys(fuelCounts).length > 0 
      ? Object.keys(fuelCounts).reduce((a, b) => fuelCounts[a] > fuelCounts[b] ? a : b) 
      : 'VLSFO';

    const currentSpeed = totalHrs > 0 ? totalDist / totalHrs : (vessel.speed || 15);
    const optimalSpeed = OPTIMAL_SPEEDS[vessel.type] || 14;

    // 1. Rule: Speed Optimization
    if (currentSpeed > optimalSpeed + 0.5) { // If > 0.5 knots over optimal
      // Calculate projected cubic savings
      const ratio = optimalSpeed / currentSpeed;
      const projectedFuelMultiplier = Math.pow(ratio, 3);
      
      // Calculate savings per standard voyage
      const avgVoyageDist = vessel.voyages.length > 0 ? totalDist / vessel.voyages.length : 1000;
      const fuelPerVoyage = vessel.voyages.length > 0 ? totalFuel / vessel.voyages.length : 100;
      
      const newFuelPerVoyage = fuelPerVoyage * projectedFuelMultiplier;
      const fuelSaved = fuelPerVoyage - newFuelPerVoyage;
      const costSaved = fuelSaved * BUNKER_PRICE_USD;
      
      const speedAerDrop = attainedCii - (attainedCii * projectedFuelMultiplier);
      const newSpeedAer = attainedCii - speedAerDrop;
      const newSpeedGrade = getGradeForAer(newSpeedAer, requiredCii);

      recommendations.push({
        id: 'speed-opt',
        type: 'SPEED',
        title: 'Slow Steaming to Optimal Speed',
        description: `Your current average speed of ${currentSpeed.toFixed(1)}kn exceeds the optimal ${optimalSpeed}kn for ${vessel.type.replace('_', ' ')}s. Slowing down utilizes the cubic fuel-speed law to drastically cut emissions.`,
        projectedCiiImprovement: `-${speedAerDrop.toFixed(2)} AER`,
        projectedGradeChange: currentGrade !== newSpeedGrade ? `${currentGrade} → ${newSpeedGrade}` : undefined,
        estimatedCostSavingUsd: costSaved,
        confidence: totalHrs > 0 ? 'High' : 'Medium',
        calculationDetails: [
          { label: 'Current Speed', value: `${currentSpeed.toFixed(1)} knots` },
          { label: 'Target Speed', value: `${optimalSpeed.toFixed(1)} knots` },
          { label: 'Est. Fuel Reduction', value: `${((1 - projectedFuelMultiplier) * 100).toFixed(1)}%` },
        ]
      });
    }

    // 2. Rule: Fuel Switch
    if (predominantFuel === 'HFO' && ['C', 'D', 'E'].includes(currentGrade)) {
      const targetFuel = 'LNG';
      const currentCf = CF_FACTORS.HFO;
      const newCf = CF_FACTORS.LNG;
      
      const reductionRatio = newCf / currentCf; // 2.750 / 3.114 = 0.883
      const fuelAerDrop = attainedCii - (attainedCii * reductionRatio);
      const newFuelAer = attainedCii - fuelAerDrop;
      const newFuelGrade = getGradeForAer(newFuelAer, requiredCii);

      recommendations.push({
        id: 'fuel-switch',
        type: 'FUEL',
        title: 'Switch from HFO to LNG',
        description: `This vessel primarily burns HFO (CF: 3.114) and holds a ${currentGrade} grade. Switching to LNG (CF: 2.750) provides an immediate mathematical improvement to your CII trajectory.`,
        projectedCiiImprovement: `-${fuelAerDrop.toFixed(2)} AER`,
        projectedGradeChange: currentGrade !== newFuelGrade ? `${currentGrade} → ${newFuelGrade}` : undefined,
        confidence: 'High',
        calculationDetails: [
          { label: 'Current Fuel', value: 'HFO' },
          { label: 'Target Fuel', value: 'LNG' },
          { label: 'Emission Factor Reduction', value: '11.7%' },
        ]
      });
    }

    // 3. Rule: Voyage Consolidation
    if (shortVoyagesCount > 2) {
      recommendations.push({
        id: 'voyage-consolidation',
        type: 'CONSOLIDATION',
        title: 'Consolidate Short Voyages',
        description: `Detected ${shortVoyagesCount} recent voyages under 200nm. Frequent port calls generate disproportionate "port overhead" emissions where fuel is burned without adding productive distance, negatively impacting your AER.`,
        confidence: 'Medium',
        calculationDetails: [
          { label: 'Short Voyages', value: `${shortVoyagesCount} voyages (< 200nm)` },
          { label: 'Action', value: 'Consolidate cargo to reduce port maneuvering overhead' }
        ]
      });
    }

    // Fallback if no recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'maintain-course',
        type: 'SPEED',
        title: 'Maintain Current Trajectory',
        description: `The vessel is currently performing at optimal speed parameters and utilizing efficient fuel. No immediate operational shifts required.`,
        confidence: 'High',
        calculationDetails: []
      });
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendations Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
