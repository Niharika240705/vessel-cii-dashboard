"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, FileWarning, Flame, CheckCircle, CheckSquare, Bell, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface VesselOpt {
  id: string;
  name: string;
}

interface AlertData {
  id: string;
  vesselId: string;
  type: string;
  severity: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  resolvedAt: string | null;
  vessel: { name: string, imoNumber: string };
}

export default function AlertsClient({ vessels }: { vessels: VesselOpt[] }) {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterType, setFilterType] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterVessel, setFilterVessel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('UNRESOLVED');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'ALL') params.append('type', filterType);
      if (filterSeverity !== 'ALL') params.append('severity', filterSeverity);
      if (filterVessel !== 'ALL') params.append('vesselId', filterVessel);
      if (filterStatus !== 'ALL') params.append('status', filterStatus);

      const res = await fetch(`/api/alerts?${params.toString()}`);
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterType, filterSeverity, filterVessel, filterStatus]);

  const markAllRead = async () => {
    try {
      await fetch('/api/alerts/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });
      fetchAlerts(); // Refresh
    } catch (e) {
      console.error(e);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts/${id}/resolve`, {
        method: 'PATCH'
      });
      fetchAlerts(); // Refresh
    } catch (e) {
      console.error(e);
    }
  };

  const getAlertIcon = (type: string, severity: string) => {
    const color = severity === 'HIGH' ? 'text-rose-500' : severity === 'MEDIUM' ? 'text-amber-500' : 'text-blue-500';
    if (type === 'CII_RISK') return <AlertTriangle className={color} size={20} />;
    if (type === 'DOC_EXPIRY') return <FileWarning className={color} size={20} />;
    if (type === 'FUEL_ANOMALY') return <Flame className={color} size={20} />;
    return <Bell className={color} size={20} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#0B1F3A] border border-[#1e3456] flex items-center justify-center">
            <Bell size={28} className="text-[#3b82f6]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Alerts & Notifications</h1>
            <p className="text-sm text-slate-400 mt-1">Manage compliance risks and operational anomalies</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAlerts} className="px-4 py-2 rounded-lg bg-[#0B1F3A] border border-[#1e3456] text-slate-300 hover:text-white flex items-center gap-2 text-sm transition-colors">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={markAllRead} className="px-4 py-2 rounded-lg bg-[#0D9E75]/20 text-[#0D9E75] border border-[#0D9E75]/30 hover:bg-[#0D9E75]/30 flex items-center gap-2 text-sm font-medium transition-colors">
            <CheckSquare size={16} /> Mark All Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 rounded-2xl bg-[#0B1F3A] border border-[#1e3456] flex flex-wrap gap-4 items-end">
        <div className="flex items-center gap-2 text-slate-400 w-full md:w-auto mb-2 md:mb-0 mr-2">
          <Filter size={18} /> <span className="font-medium text-sm">Filters:</span>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">Type</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full bg-[#071326] border border-[#1e3456] text-slate-200 text-sm rounded-lg p-2 focus:outline-none focus:border-blue-500">
            <option value="ALL">All Types</option>
            <option value="CII_RISK">CII Risk</option>
            <option value="DOC_EXPIRY">Doc Expiry</option>
            <option value="FUEL_ANOMALY">Fuel Anomaly</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">Severity</label>
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="w-full bg-[#071326] border border-[#1e3456] text-slate-200 text-sm rounded-lg p-2 focus:outline-none focus:border-blue-500">
            <option value="ALL">All Severities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">Vessel</label>
          <select value={filterVessel} onChange={e => setFilterVessel(e.target.value)} className="w-full bg-[#071326] border border-[#1e3456] text-slate-200 text-sm rounded-lg p-2 focus:outline-none focus:border-blue-500">
            <option value="ALL">All Vessels</option>
            {vessels.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full bg-[#071326] border border-[#1e3456] text-slate-200 text-sm rounded-lg p-2 focus:outline-none focus:border-blue-500">
            <option value="ALL">All Status</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
            <option value="UNRESOLVED">Unresolved</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alert List */}
      <div className="bg-[#0B1F3A] rounded-2xl border border-[#1e3456] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
            <CheckCircle size={48} className="text-slate-600 mb-4 opacity-50" />
            <p className="text-lg">No alerts found</p>
            <p className="text-sm mt-1">Adjust your filters or take a break.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e3456]">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-5 flex flex-col md:flex-row gap-4 items-start md:items-center transition-colors hover:bg-[#112747] ${!alert.isRead ? 'bg-[#071326]/50' : ''}`}>
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${alert.severity === 'HIGH' ? 'bg-rose-500/10' : alert.severity === 'MEDIUM' ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                    {getAlertIcon(alert.type, alert.severity)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/dashboard/vessels/${alert.vesselId}`} className="font-semibold text-white hover:text-blue-400 transition-colors">
                        {alert.vessel.name}
                      </Link>
                      {!alert.isRead && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                      {alert.resolvedAt && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">Resolved</span>}
                    </div>
                    <p className="text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: alert.message.replace(alert.vessel.name, `<strong>${alert.vessel.name}</strong>`) }}></p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>{new Date(alert.createdAt).toLocaleString()}</span>
                      <span className="uppercase tracking-wider font-semibold">{alert.type.replace('_', ' ')}</span>
                      <span className="uppercase tracking-wider font-semibold">SEV: {alert.severity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                  <Link href={`/dashboard/vessels/${alert.vesselId}`} className="flex-1 md:flex-none text-center px-4 py-2 text-sm bg-[#071326] hover:bg-[#1e3456] border border-[#1e3456] text-white rounded-lg transition-colors">
                    View Vessel
                  </Link>
                  {!alert.resolvedAt && (
                    <button onClick={() => resolveAlert(alert.id)} className="flex-1 md:flex-none text-center px-4 py-2 text-sm bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg transition-colors flex justify-center items-center gap-2">
                      <CheckCircle size={14} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
