import React, { useState } from 'react';
import { Resource, ResourceSummary } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { ShortageAlertBanner } from './ShortageAlertBanner';
import { RestockModal } from './RestockModal';
import { SurgeSimulatorModal } from './SurgeSimulatorModal';
import { ThresholdEditModal } from './ThresholdEditModal';
import { ResourceUsageAreaChart } from './ResourceUsageAreaChart';
import { ResourceToastStack } from './ResourceToastStack';
import { TableSkeleton, ChartSkeleton } from '../common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import {
  Bed,
  Wind,
  Pill,
  Activity,
  PackagePlus,
  Flame,
  Search,
  Sliders,
  Lock,
  LineChart,
  Clock,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';

interface ResourceDashboardProps {
  resources: Resource[];
  summary: ResourceSummary | null;
  isLoading: boolean;
  onRefresh: () => void;
  onRestock: (resourceId: string, units: number, notes?: string) => Promise<void>;
  onUpdateThreshold?: (resourceId: string, minThreshold: number, notes?: string) => Promise<void>;
}

export const ResourceDashboard: React.FC<ResourceDashboardProps> = ({
  resources,
  summary,
  isLoading,
  onRefresh,
  onRestock,
  onUpdateThreshold,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [restockResource, setRestockResource] = useState<Resource | null>(null);
  const [thresholdModalResource, setThresholdModalResource] = useState<Resource | null>(null);
  const [isSurgeModalOpen, setIsSurgeModalOpen] = useState(false);
  const [activeChartResourceId, setActiveChartResourceId] = useState<string>(
    resources.length > 0 ? resources[0].resource_id : ''
  );

  const categories = ['All', 'Beds', 'Oxygen', 'Medicines', 'Equipment'];

  const filteredResources = resources.filter((r) => {
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.resource_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenRestockById = (resourceId: string) => {
    const found = resources.find((r) => r.resource_id === resourceId);
    if (found) {
      setRestockResource(found);
    }
  };

  const handleOpenThresholdEdit = (res: Resource) => {
    setThresholdModalResource(res);
  };

  const handleSelectForChart = (resourceId: string) => {
    setActiveChartResourceId(resourceId);
  };

  const bedsKPI = summary?.beds;
  const o2KPI = summary?.oxygen;

  return (
    <div className="space-y-6">
      {/* Non-blocking Toast Stack sorted by severity (CRITICAL first, then WARNING) */}
      {summary?.alerts && summary.alerts.length > 0 && (
        <ResourceToastStack
          alerts={summary.alerts}
          onOpenRestock={handleOpenRestockById}
          onSelectResource={handleSelectForChart}
        />
      )}

      {/* Top Banner & Surge Sandbox Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Resource Inventory & Shortage Prediction</span>
            <Badge variant="info">Rule-Based Forecasting</Badge>
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Automated 48-hour depletion forecasts, reorder thresholds, and MCI surge sandbox.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSurgeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Flame className="w-4 h-4 animate-pulse" />
            <span>MCI Surge Stress-Test</span>
          </button>
        </div>
      </div>

      {/* Real-Time Predictive Shortage Alerts Banner */}
      {summary?.alerts && summary.alerts.length > 0 && (
        <ShortageAlertBanner
          alerts={summary.alerts}
          onOpenRestock={handleOpenRestockById}
        />
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Beds Capacity Card */}
        <GlassCard
          glow={bedsKPI?.is_critical_shortage ? 'coral' : 'none'}
          className="p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Hospital Beds Reserve
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {bedsKPI?.available_units || 0}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  / {bedsKPI?.total_capacity || 0} total
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className={`text-xs font-bold ${
                    bedsKPI?.is_critical_shortage ? 'text-rose-600 dark:text-coral-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {bedsKPI?.availability_percentage || 0}% Available
                </span>
                {bedsKPI?.is_critical_shortage && (
                  <span className="text-[10px] text-rose-700 dark:text-coral-400 font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-coral-500/20">
                    &lt;10% CRITICAL
                  </span>
                )}
              </div>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                bedsKPI?.is_critical_shortage
                  ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-coral-500/20 dark:border-coral-500/30 dark:text-coral-400 animate-pulse'
                  : 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-slate-800 dark:text-clinical-400 dark:border-slate-700'
              }`}
            >
              <Bed className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        {/* Oxygen Burn Rate Card */}
        <GlassCard
          glow={o2KPI?.status === 'Critical' ? 'coral' : 'none'}
          className="p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Medical Oxygen Stock
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {o2KPI?.available_liters?.toLocaleString() || 0}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400">Liters</span>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-slate-300">
                Burn Rate: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{o2KPI?.total_burn_rate_lph || 0} L/hr</span>
              </p>
              {o2KPI?.hours_remaining && (
                <p className="text-[11px] font-bold text-rose-600 dark:text-coral-400 mt-0.5">
                  Supply Runout Forecast: ~{o2KPI.hours_remaining} Hours
                </p>
              )}
            </div>
            <div
              className={`p-3 rounded-xl border ${
                o2KPI?.status === 'Critical'
                  ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-coral-500/20 dark:border-coral-500/30 dark:text-coral-400 animate-pulse'
                  : 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-slate-800 dark:text-sky-400 dark:border-slate-700'
              }`}
            >
              <Wind className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        {/* Critical Medicines Card */}
        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Pharmaceutical Stocks
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {summary?.critical_medicines_count || 0}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400">breached reorder points</span>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-slate-300">
                Rule engine automatically alerts on 48h emergency stock exhaustion.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-slate-800 dark:text-amber-400 dark:border-slate-700">
              <Pill className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        {/* Equipment Saturation Card */}
        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Critical Equipment
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {summary?.saturated_equipment_count || 0}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400">units near &gt;85% saturation</span>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-slate-300">
                ICU Mechanical Ventilators & CRRT Dialysis load monitored.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-slate-800 dark:text-emerald-400 dark:border-slate-700">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Historical Usage & Dashed Forward Projection Area Chart */}
      {isLoading ? (
        <ChartSkeleton height="h-72" />
      ) : (
        resources.length > 0 && (
          <ResourceUsageAreaChart
            resources={resources}
            activeResourceId={activeChartResourceId}
            onSelectResource={handleSelectForChart}
          />
        )
      )}

      {/* Category Pills & Search */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search resource name, ID, or dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </GlassCard>

      {/* Resources Table / Grid */}
      {isLoading ? (
        <TableSkeleton rows={7} columns={8} />
      ) : (
        <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50/90 dark:bg-slate-900/80 text-[11px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Resource ID & Name</th>
                <th className="py-3 px-4">Category & Dept</th>
                <th className="py-3 px-4">Available / Total</th>
                <th className="py-3 px-4">Daily Usage Rate</th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <span>Reorder Threshold</span>
                    {isAdmin ? (
                      <span className="text-[10px] text-teal-600 dark:text-clinical-400 lowercase font-normal">(admin edit)</span>
                    ) : (
                      <Lock className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-4">48h Depletion Forecast</th>
                <th className="py-3 px-4">Predictive Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-xs">
              {filteredResources.map((res) => {
                const isCrit = res.status === 'Critical' || res.is_critical_shortage;
                const isWarn = res.status === 'Warning';
                const isSelectedForChart = activeChartResourceId === res.resource_id;

                const dailyBurn =
                  res.daily_usage_rate !== undefined
                    ? res.daily_usage_rate
                    : (res.burn_rate_per_hour ? res.burn_rate_per_hour * 24 : 10);

                const threshold =
                  res.reorder_threshold !== undefined
                    ? res.reorder_threshold
                    : res.min_safety_threshold;

                const hoursLeft = res.predicted_exhaustion_hours;
                const willExhaustIn48h =
                  hoursLeft !== undefined && hoursLeft !== null && hoursLeft <= 48;

                return (
                  <tr
                    key={res.id}
                    className={`hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelectedForChart ? 'bg-teal-50/60 dark:bg-clinical-950/20 border-l-2 border-teal-500' : ''
                    }`}
                  >
                    {/* ID & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-700 dark:text-clinical-400 text-[11px] px-1.5 py-0.5 rounded bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-slate-700">
                          {res.resource_id}
                        </span>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <span>{res.name}</span>
                            {isSelectedForChart && (
                              <span className="text-[10px] text-teal-700 dark:text-clinical-400 font-semibold px-1 rounded bg-teal-50 dark:bg-clinical-500/10 border border-teal-200 dark:border-clinical-500/20">
                                Active Chart
                              </span>
                            )}
                          </p>
                          {res.notes && (
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 max-w-sm truncate mt-0.5">
                              {res.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category & Department */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-800 dark:text-slate-200">{res.category}</p>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">{res.department}</p>
                    </td>

                    {/* Available / Total */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isCrit ? 'text-rose-600 dark:text-coral-400' : isWarn ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {res.available_units.toLocaleString()}
                        </span>
                        <span className="text-gray-500 dark:text-slate-400 font-mono text-xs">
                          / {res.total_capacity.toLocaleString()} {res.unit_measure}
                        </span>
                      </div>
                      <div className="w-28 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCrit ? 'bg-rose-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, res.availability_percentage))}%` }}
                        />
                      </div>
                    </td>

                    {/* Daily Usage Rate */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                          {Math.round(dailyBurn)}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400">
                          {res.unit_measure}/day
                        </span>
                      </div>
                      {res.burn_rate_per_hour > 0 && (
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">
                          ~{res.burn_rate_per_hour} {res.unit_measure}/hr
                        </p>
                      )}
                    </td>

                    {/* Reorder Threshold with Admin Edit Trigger */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            res.available_units <= threshold
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-coral-500/20 dark:text-coral-400 dark:border-coral-500/40 font-black'
                              : 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {threshold} {res.unit_measure}
                        </span>

                        {isAdmin ? (
                          <button
                            onClick={() => handleOpenThresholdEdit(res)}
                            title="Edit Reorder Threshold (Admin Only)"
                            className="p-1 rounded hover:bg-teal-50 text-teal-600 hover:text-teal-700 border border-transparent hover:border-teal-200 dark:hover:bg-clinical-500/20 dark:text-clinical-400 dark:hover:text-clinical-300 dark:hover:border-clinical-500/30 transition-all"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span
                            title="Threshold edits restricted to System Administrators"
                            className="text-gray-400 dark:text-slate-500 cursor-not-allowed"
                          >
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 48h Depletion Forecast */}
                    <td className="py-3.5 px-4">
                      {hoursLeft !== undefined && hoursLeft !== null ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Clock
                              className={`w-3.5 h-3.5 ${
                                willExhaustIn48h ? 'text-rose-600 dark:text-coral-400 animate-pulse' : 'text-gray-400 dark:text-slate-400'
                              }`}
                            />
                            <span
                              className={`font-mono text-xs font-bold ${
                                willExhaustIn48h ? 'text-rose-600 dark:text-coral-400' : 'text-gray-700 dark:text-slate-300'
                              }`}
                            >
                              ~{hoursLeft} hrs left
                            </span>
                          </div>
                          {willExhaustIn48h && (
                            <span className="inline-block mt-0.5 text-[10px] text-rose-700 dark:text-coral-300 font-semibold px-1 py-0.2 rounded bg-rose-50 border border-rose-200 dark:bg-coral-500/10">
                              Breaches 48h safety
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400 dark:text-slate-500 font-mono">&gt; 72 hrs safe</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={isCrit ? 'emergency' : isWarn ? 'warning' : 'success'}
                        pulse={isCrit}
                        size="sm"
                      >
                        {isCrit ? 'Shortage Alert' : isWarn ? 'Warning' : 'Optimal'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSelectForChart(res.resource_id)}
                          title="View Historical & Dashed Predictive Chart"
                          className={`p-1.5 rounded-lg border transition-all ${
                            isSelectedForChart
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                              : 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                          }`}
                        >
                          <LineChart className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRestockResource(res)}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-gray-700 dark:text-slate-200 font-semibold text-xs border border-gray-200 dark:border-slate-700 hover:border-teal-600 transition-all flex items-center gap-1"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                          <span>Restock</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
      )}

      {/* Restock Modal */}
      <RestockModal
        isOpen={!!restockResource}
        resource={restockResource}
        onClose={() => setRestockResource(null)}
        onRestock={onRestock}
      />

      {/* Admin Reorder Threshold Modal */}
      <ThresholdEditModal
        isOpen={!!thresholdModalResource}
        resource={thresholdModalResource}
        onClose={() => setThresholdModalResource(null)}
        onSubmit={async (resourceId, newThreshold, notes) => {
          if (onUpdateThreshold) {
            await onUpdateThreshold(resourceId, newThreshold, notes);
          }
        }}
      />

      {/* Surge Stress-Test Modal */}
      <SurgeSimulatorModal
        isOpen={isSurgeModalOpen}
        onClose={() => setIsSurgeModalOpen(false)}
        onRefreshResources={onRefresh}
      />
    </div>
  );
};
