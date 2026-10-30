import React, { useState } from 'react';
import { Staff } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign,
  Lock,
  ShieldCheck,
  TrendingUp,
  Globe,
  PieChart,
  BarChart3,
  Building,
} from 'lucide-react';

interface SalaryOverviewChartProps {
  staffList: Staff[];
}

type CurrencyOption = 'INR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyConfig {
  locale: string;
  currency: string;
  rateFromINR: number; // Conversion rate from INR base
  symbol: string;
}

const CURRENCY_CONFIGS: Record<CurrencyOption, CurrencyConfig> = {
  INR: { locale: 'en-IN', currency: 'INR', rateFromINR: 1.0, symbol: '₹' },
  USD: { locale: 'en-US', currency: 'USD', rateFromINR: 0.012, symbol: '$' },
  EUR: { locale: 'de-DE', currency: 'EUR', rateFromINR: 0.011, symbol: '€' },
  GBP: { locale: 'en-GB', currency: 'GBP', rateFromINR: 0.0095, symbol: '£' },
};

export const SalaryOverviewChart: React.FC<SalaryOverviewChartProps> = ({ staffList }) => {
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>('INR');

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // Format monetary figures according to chosen locale
  const formatSalary = (amountInINR: number): string => {
    const config = CURRENCY_CONFIGS[selectedCurrency];
    const converted = amountInINR * config.rateFromINR;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      maximumFractionDigits: 0,
    }).format(converted);
  };

  // If NON-ADMIN: Enforce Role-Based Visibility Quality Bar
  if (!isAdmin) {
    return (
      <GlassCard glow="coral" className="p-6 relative overflow-hidden bg-rose-50/50 dark:bg-slate-900/40 border border-rose-200 dark:border-coral-500/30">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-coral-500/10 border border-rose-200 dark:border-coral-500/30 flex items-center justify-center text-rose-600 dark:text-coral-400 flex-shrink-0">
            <Lock className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Institutional Payroll & Salary Analytics Restricted
              </h3>
              <Badge variant="emergency" size="sm">Admin Role Required</Badge>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Institutional salary distributions, department budgets, and individual clinician compensation
              are classified confidential. In accordance with role-based clinical governance,
              financial metrics are hidden from non-admin accounts.
            </p>
            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-[11px] text-gray-500 dark:text-slate-400 font-mono">
              <span>Current Session: {user?.full_name}</span>
              <span>•</span>
              <span className="capitalize font-bold text-amber-700 dark:text-amber-300">Role: {user?.role}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  // ADMIN VIEW: Full salary overview chart formatted by locale
  const totalPayrollINR = staffList.reduce((acc, s) => acc + (s.salary || 0), 0);
  const avgSalaryINR = staffList.length > 0 ? totalPayrollINR / staffList.length : 0;

  // Department-wise payroll aggregation
  const deptMap: Record<string, number> = {};
  staffList.forEach((s) => {
    const sal = s.salary || 0;
    deptMap[s.department] = (deptMap[s.department] || 0) + sal;
  });

  const sortedDepts = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);
  const highestDept = sortedDepts[0] || ['Emergency', 0];
  const maxDeptSalary = Math.max(...Object.values(deptMap), 1);

  // Role-wise payroll aggregation
  const roleMap: Record<string, { count: number; total: number }> = {};
  staffList.forEach((s) => {
    const role = s.role;
    const sal = s.salary || 0;
    if (!roleMap[role]) roleMap[role] = { count: 0, total: 0 };
    roleMap[role].count += 1;
    roleMap[role].total += sal;
  });

  return (
    <GlassCard className="p-5 space-y-5">
      {/* Header with Locale / Currency Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Institutional Salary & Compensation Overview</span>
            <Badge variant="success" size="sm">Admin Authorized</Badge>
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Role-based financial aggregation formatted dynamically by locale.
          </p>
        </div>

        {/* Currency & Locale Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-slate-400" />
          <span className="text-xs text-gray-600 dark:text-slate-400">Locale Format:</span>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value as CurrencyOption)}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="INR">INR (₹ - India)</option>
            <option value="USD">USD ($ - US)</option>
            <option value="EUR">EUR (€ - Euro)</option>
            <option value="GBP">GBP (£ - UK)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800">
          <p className="text-[11px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Total Monthly Payroll</p>
          <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatSalary(totalPayrollINR)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Disbursed across {staffList.length} staff</p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800">
          <p className="text-[11px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Average Compensation</p>
          <p className="text-xl font-black font-mono text-teal-600 dark:text-cyan-400 mt-1">
            {formatSalary(avgSalaryINR)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Per full-time clinical employee</p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800">
          <p className="text-[11px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Peak Department Payroll</p>
          <p className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
            {formatSalary(highestDept[1])}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{highestDept[0]} Department</p>
        </div>
      </div>

      {/* Department-wise Salary Overview Chart */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-teal-600 dark:text-clinical-400" />
            <span>Department-Wise Monthly Payroll Distribution</span>
          </span>
          <span className="text-gray-500 dark:text-slate-400 font-mono text-[11px]">
            Share of Hospital Budget
          </span>
        </div>

        <div className="space-y-2.5">
          {sortedDepts.map(([dept, amount]) => {
            const pctOfTotal = totalPayrollINR > 0 ? (amount / totalPayrollINR) * 100 : 0;
            const barWidth = (amount / maxDeptSalary) * 100;

            return (
              <div key={dept} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-900 dark:text-white">{dept}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatSalary(amount)}</span>
                    <span className="text-[11px] text-gray-500 dark:text-slate-400">({pctOfTotal.toFixed(1)}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-wise Breakdown Pills */}
      <div className="pt-2 border-t border-gray-200 dark:border-slate-800">
        <p className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-2">
          Role-Wise Compensation Summary
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(roleMap).map(([role, data]) => (
            <div key={role} className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold block truncate">
                {role} ({data.count})
              </span>
              <span className="text-xs font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                {formatSalary(data.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

