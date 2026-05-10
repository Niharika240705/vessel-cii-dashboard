"use client";

import { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { useFleetMode } from '@/store/useFleetMode';

interface Props {
  vesselId: string;
  availableYears: number[];
}

export default function DownloadReportButton({ vesselId, availableYears }: Props) {
  const defaultYear = availableYears.length > 0 ? Math.max(...availableYears) : new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { mode } = useFleetMode();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/vessels/${vesselId}/report?year=${selectedYear}&mode=${mode}`);
      if (!response.ok) throw new Error('Failed to generate report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Get filename from Content-Disposition header if possible, else default
      const disposition = response.headers.get('content-disposition');
      let filename = `Report_${selectedYear}.pdf`;
      if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
          }
      }
      a.download = filename; 
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-3 py-2 bg-[#0B1F3A] border border-[#1e3456] rounded-lg text-sm text-slate-300 hover:text-white hover:bg-[#112747] transition-colors flex items-center gap-2"
        >
          {selectedYear} <ChevronDown size={14} />
        </button>
        {showDropdown && (
          <div className="absolute top-full mt-1 right-0 w-24 bg-[#0B1F3A] border border-[#1e3456] rounded-lg shadow-xl z-50 overflow-hidden">
            {availableYears.length > 0 ? availableYears.map(year => (
              <button
                key={year}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-[#112747] hover:text-white transition-colors"
                onClick={() => { setSelectedYear(year); setShowDropdown(false); }}
              >
                {year}
              </button>
            )) : (
               <div className="w-full text-left px-4 py-2 text-sm text-slate-500">No data</div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
      >
        {isDownloading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <Download size={16} />
        )}
        {isDownloading ? 'Generating...' : 'Export PDF'}
      </button>
    </div>
  );
}
