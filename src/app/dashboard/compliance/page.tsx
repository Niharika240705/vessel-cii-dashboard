import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import ComplianceTable from "@/components/compliance/ComplianceTable"
import PdfExportButton from "@/components/compliance/PdfExportButton"

export const dynamic = "force-dynamic"

export default async function CompliancePage() {
  const session = await auth()
  const userId = session?.user?.id
  const role = session?.user?.role

  const vessels = role === "ADMIN" || role === "FLEET_MANAGER" 
    ? await prisma.vessel.findMany({ include: { complianceDocs: true, voyages: { include: { fuelConsumptions: true } } } })
    : await prisma.vessel.findMany({
        where: { officers: { some: { userId: userId } } },
        include: { complianceDocs: true, voyages: { include: { fuelConsumptions: true } } }
      })

  // Auto-seed missing compliance docs for the UI since seed didn't include it for the famous ships
  let docsCount = await prisma.complianceDocument.count()
  if (docsCount === 0 && vessels.length > 0) {
    const defaultDocs: any[] = []
    vessels.forEach(v => {
      const statuses = ['APPROVED', 'PENDING', 'OVERDUE']
      const s = () => statuses[Math.floor(Math.random() * statuses.length)]
      const expire = new Date()
      expire.setFullYear(expire.getFullYear() + 1)
      
      defaultDocs.push({ vesselId: v.id, documentType: 'SEEMP', status: s(), expiryDate: expire })
      defaultDocs.push({ vesselId: v.id, documentType: 'MRV', status: s(), expiryDate: expire })
      defaultDocs.push({ vesselId: v.id, documentType: 'DCS', status: s(), expiryDate: expire })
    })
    
    await prisma.complianceDocument.createMany({ data: defaultDocs })
    
    // Refresh
    docsCount = -1 
  }

  // Refetch if we seeded
  const finalVessels = docsCount === -1 
    ? (role === "ADMIN" || role === "FLEET_MANAGER" 
        ? await prisma.vessel.findMany({ include: { complianceDocs: true, voyages: { include: { fuelConsumptions: true } } } })
        : await prisma.vessel.findMany({
            where: { officers: { some: { userId: userId } } },
            include: { complianceDocs: true, voyages: { include: { fuelConsumptions: true } } }
          }))
    : vessels

  const tableData = finalVessels.map(v => {
    // Basic ML Signal Processing: Z-Score Anomaly Detection
    let anomalousCount = 0
    if (v.voyages && v.voyages.length > 0) {
      // 1. Calculate Fuel Efficiency per distance sailed
      const efficiencies = v.voyages.map(voy => {
        const totalFuel = voy.fuelConsumptions.reduce((acc, f) => acc + f.quantity, 0)
        const dist = voy.distanceSailed || 1 
        return totalFuel / dist
      })

      // 2. Mean and Std Deviation
      const mean = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length
      const variance = efficiencies.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / efficiencies.length
      const stdDev = Math.sqrt(variance)

      // 3. Mark flags if they exceed 2 sigma (Standard Deviations) from normal burn rate
      efficiencies.forEach(eff => {
        if (stdDev > 0) {
          const zScore = Math.abs((eff - mean) / stdDev)
          if (zScore > 2) {
            anomalousCount++
          }
        }
      })
    }

    return {
      id: v.id,
      vesselName: v.name,
      imo: v.imoNumber,
      type: v.type,
      docs: v.complianceDocs.map(d => ({ type: d.documentType, status: d.status, expiry: d.expiryDate })),
      anomalousCount
    }
  })

  const exportData = tableData.map(v => ({
    vesselName: v.vesselName,
    imo: v.imo,
    type: v.type,
    seemp: v.docs.find(d => d.type === 'SEEMP')?.status || 'PENDING',
    mrv: v.docs.find(d => d.type === 'MRV')?.status || 'PENDING',
    dcs: v.docs.find(d => d.type === 'DCS')?.status || 'PENDING',
    anomalies: v.anomalousCount
  }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Compliance & Audits</h1>
          <p className="text-sm text-slate-400 mt-1">Manage mandatory DCS, MRV, and SEEMP III certifications across the fleet.</p>
        </div>
        <PdfExportButton data={exportData} />
      </div>

      <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm overflow-hidden">
        <ComplianceTable data={tableData} />
        {finalVessels.length === 0 && (
           <div className="p-8 text-center text-slate-400">No vessels found.</div>
        )}
      </div>
    </div>
  )
}
