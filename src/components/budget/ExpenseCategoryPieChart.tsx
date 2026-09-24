import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
} from 'recharts';
import { PieChart as PieIcon, Layers, TrendingUp, Info } from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types';

interface ExpenseCategoryPieChartProps {
  expenses: Expense[];
  tripCurrency: string;
  formatPrice: (amount: number, currency?: string) => string;
  totalBudget?: number;
}

// Visual color palette tailored to each category
export const CATEGORY_COLORS: Record<string, { fill: string; border: string; bg: string }> = {
  Accommodation: { fill: '#6366F1', border: '#4F46E5', bg: 'bg-indigo-500' },
  Flights: { fill: '#0EA5E9', border: '#0284C7', bg: 'bg-sky-500' },
  Food: { fill: '#F59E0B', border: '#D97706', bg: 'bg-amber-500' },
  Transportation: { fill: '#10B981', border: '#059669', bg: 'bg-emerald-500' },
  Activities: { fill: '#8B5CF6', border: '#7C3AED', bg: 'bg-purple-500' },
  Shopping: { fill: '#EC4899', border: '#DB2777', bg: 'bg-pink-500' },
  Entertainment: { fill: '#06B6D4', border: '#0891B2', bg: 'bg-cyan-500' },
  Insurance: { fill: '#14B8A6', border: '#0D9488', bg: 'bg-teal-500' },
  Other: { fill: '#64748B', border: '#475569', bg: 'bg-slate-500' },
};

const DEFAULT_COLOR = { fill: '#94A3B8', border: '#64748B', bg: 'bg-slate-400' };

export const ExpenseCategoryPieChart: React.FC<ExpenseCategoryPieChartProps> = ({
  expenses,
  tripCurrency,
  formatPrice,
  totalBudget,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'donut' | 'pie'>('donut');

  // Compute category aggregates
  const { chartData, totalSpent } = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group expenses by category
    const map: Record<string, { amount: number; count: number }> = {};
    expenses.forEach((e) => {
      const cat = e.category || 'Other';
      if (!map[cat]) {
        map[cat] = { amount: 0, count: 0 };
      }
      map[cat].amount += e.amount;
      map[cat].count += 1;
    });

    const data = Object.keys(map).map((cat) => {
      const amount = map[cat].amount;
      const count = map[cat].count;
      const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
      const palette = CATEGORY_COLORS[cat] || DEFAULT_COLOR;

      return {
        name: cat,
        value: amount,
        count,
        percentage,
        color: palette.fill,
        borderColor: palette.border,
        bgClass: palette.bg,
      };
    }).sort((a, b) => b.value - a.value);

    return { chartData: data, totalSpent: total };
  }, [expenses]);

  const activeCategory = activeIndex !== null && chartData[activeIndex] ? chartData[activeIndex] : null;

  // Custom active shape for hovered slice with smooth glow/expansion
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          className="transition-all duration-300 drop-shadow-md"
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 13}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.35}
        />
      </g>
    );
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {item.name}
            </span>
          </div>
          <div className="mt-1.5 space-y-0.5">
            <p className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
              {formatPrice(item.value, tripCurrency)}
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {item.percentage}% of total expenses • {item.count} {item.count === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
      {/* Header with Title and Toggle Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-500" />
            <span>Expense Category Visualization</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive breakdown of all travel expenditures
          </p>
        </div>

        {/* Donut / Pie view toggle */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={() => setChartType('donut')}
            className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
              chartType === 'donut'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Donut
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
              chartType === 'pie'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Pie
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mb-3">
            <PieIcon className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            No Expense Data Yet
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mt-1">
            Log your flights, hotel stays, food, and activities to visualize your spending trends.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Chart Container */}
          <div className="md:col-span-6 relative flex flex-col items-center justify-center h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  activeShape={renderActiveShape}
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={chartType === 'donut' ? 62 : 0}
                  outerRadius={92}
                  paddingAngle={chartType === 'donut' ? 3 : 1}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  cursor="pointer"
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={activeIndex === index ? '#ffffff' : 'rgba(255,255,255,0.2)'}
                      strokeWidth={activeIndex === index ? 2.5 : 1.5}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label for Donut View */}
            {chartType === 'donut' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {activeCategory ? (
                  <div className="text-center px-4 animate-in fade-in duration-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {activeCategory.name}
                    </span>
                    <p className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                      {formatPrice(activeCategory.value, tripCurrency)}
                    </p>
                    <span
                      className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white"
                      style={{ backgroundColor: activeCategory.color }}
                    >
                      {activeCategory.percentage}%
                    </span>
                  </div>
                ) : (
                  <div className="text-center px-4 animate-in fade-in duration-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Spent
                    </span>
                    <p className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                      {formatPrice(totalSpent, tripCurrency)}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {chartData.length} {chartData.length === 1 ? 'Category' : 'Categories'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category List & Metrics Grid */}
          <div className="md:col-span-6 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
              <span>Category</span>
              <span>Amount (% Total)</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {chartData.map((item, idx) => {
                const isHovered = activeIndex === idx;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseLeave={() => setActiveIndex(null)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer border ${
                      isHovered
                        ? 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500/40 shadow-xs'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="h-3 w-3 rounded-full shrink-0 transition-transform"
                        style={{
                          backgroundColor: item.color,
                          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.count} {item.count === 1 ? 'expense' : 'expenses'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        {formatPrice(item.value, tripCurrency)}
                      </span>
                      <span className="ml-1.5 text-[11px] font-semibold text-slate-400">
                        ({item.percentage}%)
                      </span>
                      {/* Mini bar */}
                      <div className="w-20 bg-slate-200/70 rounded-full h-1 mt-1 dark:bg-slate-700 overflow-hidden ml-auto">
                        <div
                          className="h-1 rounded-full transition-all duration-300"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {totalBudget && totalBudget > 0 && (
              <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span>Budget Utilized:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">
                  {Math.min(100, Math.round((totalSpent / totalBudget) * 100))}% of {formatPrice(totalBudget, tripCurrency)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
