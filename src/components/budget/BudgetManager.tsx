import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  ArrowRight,
  CheckCircle,
  FileSpreadsheet,
  Globe,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types';
import { useTrip } from '../../context/TripContext';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../services/api';
import { ExpenseCategoryPieChart } from './ExpenseCategoryPieChart';
import { SmartCurrencyConverter } from './SmartCurrencyConverter';

interface BudgetManagerProps {
  tripId: string;
  totalBudget: number;
  tripCurrency: string;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({ tripId, totalBudget, tripCurrency }) => {
  const { expenses, addExpense, deleteExpense, group, activeTrip, updateTrip } = useTrip();
  const { formatPrice, convertAmount, currentCurrency } = useCurrency();

  const [settlements, setSettlements] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [budgetSubTab, setBudgetSubTab] = useState<'overview' | 'currency' | 'settlements'>('overview');

  // New Expense form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [paidByName, setPaidByName] = useState('Lara Croft');
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Cash' | 'Bank Transfer' | 'UPI' | 'Other'>('Credit Card');
  const [splitEqually, setSplitEqually] = useState(true);

  const categories: ExpenseCategory[] = [
    'Accommodation',
    'Flights',
    'Food',
    'Transportation',
    'Activities',
    'Shopping',
    'Other',
  ];

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const percentUsed = Math.min(100, Math.round((totalSpent / (totalBudget || 1)) * 100));

  // Category Aggregates
  const categoryTotals = categories.map((cat) => {
    const total = expenses
      .filter((e) => e.category.toLowerCase() === cat.toLowerCase())
      .reduce((sum, e) => sum + e.amount, 0);
    const pct = totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0;
    return { category: cat, total, percentage: pct };
  }).filter((c) => c.total > 0);

  useEffect(() => {
    loadSettlements();
  }, [expenses]);

  const loadSettlements = async () => {
    try {
      const res = await api.getSettlements(tripId);
      if (res.success) {
        setSettlements(res.data);
      }
    } catch (e) {
      console.error('Error fetching settlements:', e);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title || isNaN(num) || num <= 0) return;

    const members = group?.members || [
      { userId: 'usr-1', name: 'Lara Croft' },
      { userId: 'usr-2', name: 'Madhav Sharma' },
    ];

    const splitAmt = num / members.length;
    const splits = members.map((m) => ({
      userId: m.userId,
      userName: m.name,
      amount: splitAmt,
      settled: m.name === paidByName,
    }));

    await addExpense({
      title,
      amount: num,
      currency: tripCurrency,
      category,
      paidById: 'usr-1',
      paidByName,
      paymentMethod,
      date: new Date().toISOString().split('T')[0],
      splits,
    });

    setTitle('');
    setAmount('');
    setShowAddModal(false);
  };

  const handleApplyBudgetAdjustment = async (newBudget: number) => {
    if (activeTrip) {
      await updateTrip(activeTrip.id, { budget: newBudget });
    }
  };

  const effectiveTrip = activeTrip || ({
    id: tripId,
    destination: 'Rome',
    budget: totalBudget,
    currency: tripCurrency,
    startDate: '2026-10-01',
    endDate: '2026-10-06',
  } as any);

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-100/90 p-1 dark:border-slate-800 dark:bg-slate-850">
          <button
            onClick={() => setBudgetSubTab('overview')}
            className={`flex items-center gap-2 py-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              budgetSubTab === 'overview'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Budget Overview & Analytics</span>
          </button>

          <button
            onClick={() => setBudgetSubTab('currency')}
            className={`flex items-center gap-2 py-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              budgetSubTab === 'currency'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Smart Currency & AI Trends</span>
            <span className="rounded-full bg-indigo-100 px-1.5 py-0.2 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Live FX
            </span>
          </button>

          <button
            onClick={() => setBudgetSubTab('settlements')}
            className={`flex items-center gap-2 py-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              budgetSubTab === 'settlements'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Group Splits ({settlements.length})</span>
          </button>
        </div>
      </div>

      {budgetSubTab === 'currency' ? (
        <SmartCurrencyConverter
          trip={effectiveTrip}
          expenses={expenses}
          onApplyBudgetAdjustment={handleApplyBudgetAdjustment}
        />
      ) : budgetSubTab === 'settlements' ? (
        /* Group Expense Settlements in full focus */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Group Expense Splits & Settlements</span>
              </h3>
              <p className="text-xs text-slate-500">
                Automated debt simplification for group travelers
              </p>
            </div>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {settlements.length} {settlements.length === 1 ? 'Pending Settlement' : 'Pending Settlements'}
            </span>
          </div>

          <div className="space-y-2.5">
            {settlements.length === 0 ? (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50/60 p-4 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All balances are settled up between travelers! No pending debts.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {settlements.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{s.fromUser}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{s.toUser}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                        owes {formatPrice(s.amount, s.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Quick Smart Currency Highlight Banner on Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/40 p-4 text-xs dark:border-indigo-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Smart Destination Currency & Local Spending Intelligence</span>
                  <span className="rounded-md bg-indigo-100 px-1.5 py-0.2 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {effectiveTrip.destination || 'Rome'}
                  </span>
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                  Live exchange rates, purchasing power benchmarks, and AI suggestions based on local spending trends.
                </p>
              </div>
            </div>

            <button
              onClick={() => setBudgetSubTab('currency')}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <span>Open Currency Converter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Budget Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Budget Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Total Budget</span>
                <Wallet className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {formatPrice(totalBudget, tripCurrency)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Allocated for this journey
              </p>
            </div>

            {/* Total Spent Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Total Spent</span>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {formatPrice(totalSpent, tripCurrency)}
              </p>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-2 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    percentUsed > 90 ? 'bg-rose-500' : percentUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {percentUsed}% of budget used
              </span>
            </div>

            {/* Remaining Budget Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Remaining Funds</span>
                <DollarSign className={`w-4 h-4 ${remainingBudget < 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
              </div>
              <p
                className={`text-2xl font-bold font-mono tabular-nums ${
                  remainingBudget < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatPrice(remainingBudget, tripCurrency)}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {remainingBudget < 0 ? 'Over budget!' : 'Safe spending buffer'}
              </span>
            </div>
          </div>

          {/* Interactive Expense Category Visualization (Recharts Pie / Donut Chart) */}
          <ExpenseCategoryPieChart
            expenses={expenses}
            tripCurrency={tripCurrency}
            formatPrice={formatPrice}
            totalBudget={totalBudget}
          />

          {/* Group Expense Settlements (Splitwise parity) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Group Expense Splits & Settlements</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Automated debt simplification for group travelers
                </p>
              </div>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {settlements.length} {settlements.length === 1 ? 'Pending Settlement' : 'Pending Settlements'}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {settlements.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50/60 p-3.5 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All balances are settled up between travelers! No pending debts.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {settlements.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{s.fromUser}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{s.toUser}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                          owes {formatPrice(s.amount, s.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Expenses History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Logged Expenses ({expenses.length})
            </h3>
            <p className="text-xs text-slate-500">All travel receipts, tickets, and bookings</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Expense</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Expense Details</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">Paid By</th>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                <th className="py-2.5 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No expenses logged yet. Click "Log Expense" to add your first expense.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{exp.title}</p>
                      {exp.notes && <p className="text-[11px] text-slate-400 line-clamp-1">{exp.notes}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-700 dark:text-slate-300">{exp.paidByName}</span>
                      <span className="block text-[10px] text-slate-400">{exp.paymentMethod}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{exp.date}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                        {formatPrice(exp.amount, exp.currency)}
                      </span>
                      {currentCurrency !== exp.currency && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          ≈ {formatPrice(convertAmount(exp.amount, exp.currency, currentCurrency), currentCurrency)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Log New Expense</h3>
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vatican Guided Tour"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ({tripCurrency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono tabular-nums text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paid By
                  </label>
                  <select
                    value={paidByName}
                    onChange={(e) => setPaidByName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                  >
                    <option value="Lara Croft">Lara Croft</option>
                    <option value="Madhav Sharma">Madhav Sharma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'Credit Card' | 'Cash' | 'Bank Transfer' | 'UPI' | 'Other')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
