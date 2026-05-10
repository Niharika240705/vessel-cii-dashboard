import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const vessel = await prisma.vessel.findUnique({
      where: { id: params.id },
      include: {
        ciiRatings: {
          orderBy: { year: 'asc' }
        }
      }
    });

    if (!vessel || vessel.ciiRatings.length === 0) {
      return NextResponse.json({ error: 'Vessel or historical data not found' }, { status: 404 });
    }

    const currentYear = new Date().getFullYear();
    const historicalRatings = vessel.ciiRatings;
    
    // Calculate Trend
    let trend = 0;
    if (historicalRatings.length >= 2) {
      const latest = historicalRatings[historicalRatings.length - 1];
      const prev = historicalRatings[historicalRatings.length - 2];
      trend = (latest.attainedCii - prev.attainedCii) / (latest.year - prev.year);
    }

    const dataPoints = [];
    let crossingYear: number | null = null;
    let newGrade: string | null = null;
    let currentGrade = historicalRatings[historicalRatings.length - 1].rating;
    
    const getGradeForAer = (aer: number, req: number) => {
      if (aer < req * 0.85) return 'A';
      if (aer < req * 0.94) return 'B';
      if (aer < req * 1.06) return 'C';
      if (aer < req * 1.19) return 'D';
      return 'E';
    };

    const gradeOrder: Record<string, number> = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };

    const minYear = historicalRatings[0].year;
    let prevReq = historicalRatings[0].requiredCii;
    let prevAtt = historicalRatings[0].attainedCii;

    for (let yr = minYear; yr <= 2030; yr++) {
      const hist = historicalRatings.find(h => h.year === yr);
      
      let attainedCii = 0;
      let requiredCii = 0;
      let grade = 'C';
      let isHistorical = false;

      if (hist) {
        attainedCii = hist.attainedCii;
        requiredCii = hist.requiredCii;
        grade = hist.rating;
        isHistorical = true;
        prevReq = requiredCii;
        prevAtt = attainedCii;
        currentGrade = grade;
      } else {
        // Project Future
        requiredCii = prevReq * 0.98; // 2% tightening
        attainedCii = prevAtt + trend;
        grade = getGradeForAer(attainedCii, requiredCii);
        
        prevReq = requiredCii;
        prevAtt = attainedCii;

        // Check crossing
        if (!crossingYear && gradeOrder[grade] > gradeOrder[currentGrade]) {
          crossingYear = yr;
          newGrade = grade;
        }
      }

      dataPoints.push({
        year: yr,
        isHistorical,
        attainedCii: Number(attainedCii.toFixed(2)),
        requiredCii: Number(requiredCii.toFixed(2)),
        grade,
        gap: Number((attainedCii - requiredCii).toFixed(2)),
        // Bands for Stacked Area
        bandA: Number((requiredCii * 0.85).toFixed(2)),
        bandB: Number((requiredCii * 0.94).toFixed(2)),
        bandC: Number((requiredCii * 1.06).toFixed(2)),
        bandD: Number((requiredCii * 1.19).toFixed(2)),
        bandE: Number((requiredCii * 1.5).toFixed(2)), // Cap visual
      });
    }

    let summary = '';
    if (crossingYear && newGrade) {
      // Calculate needed annual reduction to maintain current grade
      // We want attainedCii to stay at requiredCii * factor of current grade.
      // Let's just give a rough estimate of ~3%
      summary = `At current trend, ${vessel.name} is projected to drop to a ${newGrade} rating in ${crossingYear} as the IMO threshold tightens. Operational improvements of ~3% annual CII reduction are needed to maintain a ${currentGrade} rating through 2030.`;
    } else {
      summary = `At current trend, ${vessel.name} is projected to maintain its compliance rating through 2030.`;
    }

    return NextResponse.json({
      dataPoints,
      summary,
      vesselName: vessel.name
    });

  } catch (error) {
    console.error('CII Trajectory Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
