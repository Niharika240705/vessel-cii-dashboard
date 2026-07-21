import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderToStream } from '@react-pdf/renderer';
import { PdfReportTemplate } from '@/components/vessels/PdfReportTemplate';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { searchParams } = new URL(req.url);
    const yearStr = searchParams.get('year') || new Date().getFullYear().toString();
    const year = parseInt(yearStr);
    const mode = searchParams.get('mode') || 'COMMERCIAL';

    const vesselId = params.id;

    // Fetch Vessel Details
    const vessel = await prisma.vessel.findUnique({
      where: { id: vesselId },
      include: {
        ciiRatings: {
          where: { year },
          take: 1
        },
        complianceDocs: true,
        voyages: {
          where: {
            departureTime: {
              gte: new Date(`${year}-01-01`),
              lt: new Date(`${year + 1}-01-01`)
            }
          },
          include: { fuelConsumptions: true },
          orderBy: { distanceSailed: 'desc' }
        }
      }
    });

    if (!vessel) {
      return NextResponse.json({ error: 'Vessel not found' }, { status: 404 });
    }

    // Process Data
    const rating = vessel.ciiRatings[0] || null;

    // Fuel Calculation
    const fuelMap: Record<string, { quantity: number, co2: number }> = {};
    let totalFuel = 0;
    
    // CF Factors (simplified for report)
    const CF_FACTORS: Record<string, number> = {
      HFO: 3.114, VLSFO: 3.151, MGO: 3.206, LNG: 2.750, METHANOL: 1.375
    };

    vessel.voyages.forEach(v => {
      v.fuelConsumptions.forEach(f => {
        if (!fuelMap[f.fuelType]) fuelMap[f.fuelType] = { quantity: 0, co2: 0 };
        const cf = CF_FACTORS[f.fuelType] || 3.114;
        fuelMap[f.fuelType].quantity += f.quantity;
        fuelMap[f.fuelType].co2 += f.quantity * cf;
        totalFuel += f.quantity;
      });
    });

    const fuelData = Object.keys(fuelMap).map(type => ({
      fuelType: type,
      quantity: fuelMap[type].quantity,
      co2: fuelMap[type].co2,
      percentage: totalFuel > 0 ? (fuelMap[type].quantity / totalFuel) * 100 : 0
    })).sort((a, b) => b.quantity - a.quantity);

    // Docs
    const docs = vessel.complianceDocs.map(doc => {
      const daysRemaining = doc.expiryDate 
        ? Math.ceil((doc.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;
      return { ...doc, daysRemaining };
    });

    // Top 10 Voyages
    const topVoyages = vessel.voyages.slice(0, 10).map(v => {
      const voyageTotalFuel = v.fuelConsumptions.reduce((sum: number, f: any) => sum + f.quantity, 0);
      return { ...v, totalFuel: voyageTotalFuel };
    });

    const data = {
      vessel,
      year,
      rating,
      fuelData,
      docs,
      topVoyages,
      mode
    };

    const stream = await renderToStream(<PdfReportTemplate data={data} />);

    // We need to convert the stream to a buffer to send in Next.js response
    return new Promise<NextResponse>((resolve, reject) => {
      const buffers: any[] = [];
      stream.on('data', (chunk) => buffers.push(chunk));
      stream.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        const response = new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${vessel.imoNumber}_CII_Report_${year}.pdf"`
          }
        });
        resolve(response);
      });
      stream.on('error', (err) => {
        console.error('PDF Stream Error:', err);
        reject(new NextResponse('Internal Server Error generating PDF', { status: 500 }));
      });
    });

  } catch (error) {
    console.error('Report Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
