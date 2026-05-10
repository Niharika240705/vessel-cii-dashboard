"use client"

import { Download } from "lucide-react"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { VesselType } from "@prisma/client"

interface ExportData {
  vesselName: string
  imo: string
  type: string
  seemp: string
  mrv: string
  dcs: string
}

export default function PdfExportButton({ data }: { data: ExportData[] }) {
  const handleExport = () => {
    const doc = new jsPDF()

    // Header
    doc.setFillColor(7, 19, 38)
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text("Fleet Compliance & Certification Report", 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(200, 200, 200)
    doc.text(`Generated on: ${new Date().toLocaleDateString()} via VesselCII Dashboard`, 14, 30)

    // Table
    const tableColumn = ["Vessel Name", "IMO Number", "Type", "SEEMP III", "EU MRV", "IMO DCS"]
    const tableRows = data.map(v => [
      v.vesselName,
      v.imo,
      v.type.replace('_', ' '),
      v.seemp,
      v.mrv,
      v.dcs
    ])

    // @ts-ignore - plugin extending jsPDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [13, 158, 117], textColor: [255,255,255] },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      styles: { fontSize: 9 }
    })

    doc.save(`Compliance_Report_${new Date().getTime()}.pdf`)
  }

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 bg-[#0D9E75] hover:bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm shadow-[0_0_10px_rgba(13,158,117,0.3)]"
    >
      <Download size={16} />
      Export Audit PDF
    </button>
  )
}
