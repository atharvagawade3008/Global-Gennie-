import React from 'react';
import { useIncidents } from '../../context/IncidentContext';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Users,
  ShieldCheck,
  Activity,
  BarChart2,
  PieChart,
} from 'lucide-react';

export const AuthorityAnalytics: React.FC = () => {
  const { incidents, responders } = useIncidents();

  // Aggregate Category Data
  const categoriesMap: Record<string, { label: string; count: number; color: string }> = {
    medical_emergency: { label: 'Medical Emergency', count: 0, color: '#dc2626' },
    theft: { label: 'Theft / Snatched', count: 0, color: '#ea580c' },
    lost_person: { label: 'Lost Person', count: 0, color: '#7c3aed' },
    lost_property: { label: 'Lost Property', count: 0, color: '#2563eb' },
    accident: { label: 'Accident / Traffic', count: 0, color: '#d97706' },
    harassment: { label: 'Harassment', count: 0, color: '#db2777' },
    unsafe_area: { label: 'Unsafe Hazard', count: 0, color: '#4f46e5' },
    other: { label: 'General Assistance', count: 0, color: '#0d9488' },
  };

  incidents.forEach((i) => {
    if (categoriesMap[i.category]) {
      categoriesMap[i.category].count += 1;
    } else {
      categoriesMap.other.count += 1;
    }
  });

  const categoryList = Object.values(categoriesMap).filter((c) => c.count > 0);
  const maxCategoryCount = Math.max(...categoryList.map((c) => c.count), 1);

  // Priority Split
  const priorities = [
    { name: 'Critical Priority', count: incidents.filter((i) => i.priority === 'critical').length, color: '#dc2626', bg: 'bg-rose-500' },
    { name: 'High Priority', count: incidents.filter((i) => i.priority === 'high').length, color: '#f59e0b', bg: 'bg-amber-500' },
    { name: 'Medium Priority', count: incidents.filter((i) => i.priority === 'medium').length, color: '#2563eb', bg: 'bg-blue-500' },
    { name: 'Low Priority', count: incidents.filter((i) => i.priority === 'low').length, color: '#16a34a', bg: 'bg-emerald-500' },
  ];

  const totalPriorityCount = priorities.reduce((acc, p) => acc + p.count, 0) || 1;

  // Hourly Activity Curve (08:00 to 22:00)
  const hourlyData = [
    { hour: '08:00', total: 2, resolved: 2 },
    { hour: '10:00', total: 4, resolved: 3 },
    { hour: '12:00', total: 7, resolved: 6 },
    { hour: '14:00', total: 5, resolved: 5 },
    { hour: '16:00', total: 9, resolved: 8 },
    { hour: '18:00', total: 11, resolved: 9 },
    { hour: '20:00', total: 6, resolved: 5 },
    { hour: '22:00', total: 3, resolved: 3 },
  ];

  const maxHourly = Math.max(...hourlyData.map((d) => d.total));

  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;
  const resolutionRate = incidents.length > 0 ? Math.round((resolvedCount / incidents.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Avg Response Time</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">3.8 min</span>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">↓ 18% faster than benchmark</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{resolutionRate}%</span>
          <p className="text-[11px] text-slate-500 mt-1">{resolvedCount} of {incidents.length} closed</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Patrol Units Deployed</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{responders.length} Units</span>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">100% sector surveillance</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Protected Visitors</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">2,410</span>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">Active tourists in sector</p>
        </div>
      </div>

      {/* Analytics Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Volume by Category */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Incidents by Category</h3>
              <p className="text-xs text-slate-500">Distribution across reported safety categories</p>
            </div>
            <BarChart2 className="w-5 h-5 text-blue-600" />
          </div>

          <div className="space-y-3 pt-2">
            {categoryList.map((cat) => {
              const pct = Math.round((cat.count / maxCategoryCount) * 100);
              return (
                <div key={cat.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat.label}</span>
                    <span className="font-bold text-slate-900">{cat.count} cases</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, pct)}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Triage Distribution */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Priority Triage Distribution</h3>
                <p className="text-xs text-slate-500">Severity split of current incident queue</p>
              </div>
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>

            {/* Stacked Percentage Bar */}
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
                {priorities.map((p) => {
                  const widthPct = (p.count / totalPriorityCount) * 100;
                  if (widthPct === 0) return null;
                  return (
                    <div
                      key={p.name}
                      style={{ width: `${widthPct}%`, backgroundColor: p.color }}
                      className="h-full transition-all duration-300"
                      title={`${p.name}: ${p.count}`}
                    />
                  );
                })}
              </div>

              {/* Legend List */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                {priorities.map((p) => (
                  <div key={p.name} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full shrink-0 aspect-square ${p.bg}`} />
                      <span className="text-xs font-semibold text-slate-700">{p.name}</span>
                    </div>
                    <span className="font-black text-sm text-slate-900">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Logged Volume</span>
            <strong className="text-slate-900">{incidents.length} Records</strong>
          </div>
        </div>

        {/* Peak Hourly Timeline */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Peak Incident & Resolution Timeline</h3>
              <p className="text-xs text-slate-500">Hourly activity volume and rapid resolution efficiency</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Live Sensor Sync</span>
            </span>
          </div>

          {/* Bar Chart Bars */}
          <div className="pt-4 grid grid-cols-8 gap-2 items-end h-48 border-b border-slate-200 pb-2">
            {hourlyData.map((d) => {
              const heightPct = Math.round((d.total / maxHourly) * 100);
              const resHeightPct = Math.round((d.resolved / maxHourly) * 100);

              return (
                <div key={d.hour} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Incidents bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-3.5 sm:w-5 bg-amber-500 rounded-t-md transition-all group-hover:bg-amber-600 relative"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1 py-0.5 rounded pointer-events-none transition-opacity">
                        {d.total}
                      </span>
                    </div>

                    {/* Resolved bar */}
                    <div
                      style={{ height: `${resHeightPct}%` }}
                      className="w-3.5 sm:w-5 bg-emerald-500 rounded-t-md transition-all group-hover:bg-emerald-600"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{d.hour}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 aspect-square" />
              <span>Reported Incidents</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 aspect-square" />
              <span>Resolved Cases</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
