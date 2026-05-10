"use client";

import { useState, useEffect } from 'react';
import { Zap, Droplet, MapPin, ChevronDown, ChevronUp, DollarSign, TrendingDown } from 'lucide-react';

interface Recommendation {
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

export default function OptimisationRecommendations({ vesselId }: { vesselId: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/vessels/${vesselId}/recommendations`)
      .then(res => res.json())
      .then(data => {
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [vesselId]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm p-6 animate-pulse">
        <div className="h-6 w-48 bg-[#1e3456] rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-24 bg-[#071326] rounded-xl border border-[#1e3456]"></div>
          <div className="h-24 bg-[#071326] rounded-xl border border-[#1e3456]"></div>
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'SPEED': return <Zap className="text-amber-400" size={20} />;
      case 'FUEL': return <Droplet className="text-emerald-400" size={20} />;
      case 'CONSOLIDATION': return <MapPin className="text-blue-400" size={20} />;
      default: return <TrendingDown className="text-slate-400" size={20} />;
    }
  };

  return (
    <div className="rounded-2xl bg-[#0B1F3A] border border-[#1e3456] shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <TrendingDown size={20} className="text-blue-400" /> Optimisation Recommendations
        </h3>
        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-bold tracking-wider">
          AI Engine
        </span>
      </div>

      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center p-6 text-slate-500 text-sm">No recommendations available.</div>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="bg-[#071326] rounded-xl border border-[#1e3456] overflow-hidden transition-all duration-300">
              {/* Header / Summary */}
              <div 
                className="p-5 cursor-pointer hover:bg-[#0B1F3A] transition-colors flex items-start gap-4"
                onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
              >
                <div className="mt-1 shrink-0 p-2 bg-[#0B1F3A] rounded-lg border border-[#1e3456]">
                  {getIcon(rec.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-white font-semibold text-sm md:text-base">{rec.title}</h4>
                    {expandedId === rec.id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2 md:line-clamp-none leading-relaxed">
                    {rec.description}
                  </p>
                  
                  {/* Quick Stats Row */}
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {rec.projectedCiiImprovement && (
                      <span className="flex items-center gap-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20">
                        <TrendingDown size={14} /> {rec.projectedCiiImprovement}
                      </span>
                    )}
                    {rec.projectedGradeChange && (
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20">
                        {rec.projectedGradeChange}
                      </span>
                    )}
                    {rec.estimatedCostSavingUsd && (
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-300">
                        <DollarSign size={14} className="text-amber-400" /> 
                        Save ${(rec.estimatedCostSavingUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}/voyage
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Details */}
              {expandedId === rec.id && rec.calculationDetails.length > 0 && (
                <div className="px-5 pb-5 pt-2 border-t border-[#1e3456] bg-[#0B1F3A]/50 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Calculation Logic</h5>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                      Confidence: <span className={rec.confidence === 'High' ? 'text-emerald-400' : 'text-amber-400'}>{rec.confidence}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {rec.calculationDetails.map((detail, i) => (
                      <div key={i} className="bg-[#071326] p-3 rounded-lg border border-[#1e3456]">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{detail.label}</div>
                        <div className="text-sm text-slate-200 font-medium">{detail.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
