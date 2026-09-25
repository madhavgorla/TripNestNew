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
  Check,
  Edit2,
  AlertCircle,
  Clock,
  Info,
  Layers,
  Percent,
} from 'lucide-react';
import { Expense, ExpenseCategory, ExpenseSplit, GroupMember } from '../../types';
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
  const { expenses, addExpense, updateExpense, deleteExpense, group, activeTrip, updateTrip } = useTrip();
  const { formatPrice, convertAmount, currentCurrency } = useCurrency();

  const [settlements, setSettlements] = useState<any[]>([]);
  const [memberStats, setMemberStats] = useState<any[]>([]);
  const [totalSharedExpenses, setTotalSharedExpenses] = useState<number>(0);
  const [settledHistory, setSettledHistory] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [budgetSubTab, setBudgetSubTab] = useState<'overview' | 'currency' | 'settlements'>('overview');
  const [settleSuccessMsg, setSettleSuccessMsg] = useState<string | null>(null);

  // Available Group Members (fallback to default 3 co-travelers for rich multi-way settlement)
  const defaultMembers: GroupMember[] = [
    { userId: 'usr-1', name: 'Lara Croft', email: 'lara@tripnest.com', role: 'Owner', joinedAt: '2026-02-01' },
    { userId: 'usr-2', name: 'Madhav Sharma', email: 'madhav@tripnest.com', role: 'Admin', joinedAt: '2026-02-02' },
    { userId: 'usr-3', name: 'Marco Rossi', email: 'marco@tripnest.com', role: 'Member', joinedAt: '2026-02-05' },
  ];
  const members: GroupMember[] = (group?.members && group.members.length >= 2) ? group.members : defaultMembers;

  // New/Edit Expense form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [paidByName, setPaidByName] = useState('Lara Croft');
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Cash' | 'Bank Transfer' | 'UPI' | 'Other'>('Credit Card');
  const [isShared, setIsShared] = useState(true);
  const [splitType, setSplitType] = useState<'EQUAL' | 'CUSTOM'>('EQUAL');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(members.map((m) => m.userId));
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

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
  const categoryTotals = categories
    .map((cat) => {
      const total = expenses
        .filter((e) => e.category.toLowerCase() === cat.toLowerCase())
        .reduce((sum, e) => sum + e.amount, 0);
      const pct = totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0;
      return { category: cat, total, percentage: pct };
    })
    .filter((c) => c.total > 0);

  useEffect(() => {
    loadSettlements();
  }, [expenses, tripId]);

  const loadSettlements = async () => {
    try {
      const res = await api.getSettlements(tripId);
      if (res.success) {
        setSettlements(res.data || []);
        if (res.memberStats) setMemberStats(res.memberStats);
        if (res.totalSharedExpenses !== undefined) setTotalSharedExpenses(res.totalSharedExpenses);
        if (res.settledHistory) setSettledHistory(res.settledHistory);
      }
    } catch (e) {
      console.error('Error fetching settlements:', e);
    }
  };

  // Pre-fill modal for editing
  const handleOpenEdit = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setTitle(exp.title);
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setPaidByName(exp.paidByName);
    setPaymentMethod(exp.paymentMethod || 'Credit Card');
    setIsShared(exp.isShared !== false);
    setSplitType(exp.splitType || 'EQUAL');
    setNotes(exp.notes || '');

    if (exp.splits && exp.splits.length > 0) {
      const splitUserIds = exp.splits.map((s) => s.userId);
      setSelectedMemberIds(splitUserIds);
      const amountsMap: Record<string, string> = {};
      exp.splits.forEach((s) => {
        amountsMap[s.userId] = s.amount.toString();
      });
      setCustomAmounts(amountsMap);
    } else {
      setSelectedMemberIds(members.map((m) => m.userId));
    }

    setShowAddModal(true);
  };

  // Reset form
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingExpenseId(null);
    setTitle('');
    setAmount('');
    setNotes('');
    setCustomAmounts({});
    setSplitType('EQUAL');
    setIsShared(true);
    setSelectedMemberIds(members.map((m) => m.userId));
  };

  // Toggle member participation
  const toggleMemberSelection = (userId: string) => {
    setSelectedMemberIds((prev) => {
      if (prev.includes(userId)) {
        if (prev.length <= 1) return prev; // At least one member
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Equal split calculation with exact remaining paise/cents distribution
  const computeEqualSplits = (totalNum: number, memberList: GroupMember[]): { splits: ExpenseSplit[]; remainderCents: number } => {
    const totalCents = Math.round(totalNum * 100);
    const count = memberList.length;
    const baseCents = Math.floor(totalCents / count);
    const remainder = totalCents % count;

    const splits: ExpenseSplit[] = memberList.map((m, idx) => {
      const cents = baseCents + (idx < remainder ? 1 : 0);
      return {
        userId: m.userId,
        userName: m.name,
        amount: cents / 100,
        settled: m.name === paidByName,
      };
    });

    return { splits, remainderCents: remainder };
  };

  const handleCreateOrUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title || isNaN(num) || num <= 0) return;

    const involvedMembers = members.filter((m) => selectedMemberIds.includes(m.userId));
    const payerMember = members.find((m) => m.name === paidByName) || members[0];

    let computedSplits: ExpenseSplit[] = [];

    if (isShared) {
      if (splitType === 'EQUAL') {
        const { splits } = computeEqualSplits(num, involvedMembers);
        computedSplits = splits;
      } else {
        // Custom Split
        computedSplits = involvedMembers.map((m) => {
          const userAmt = parseFloat(customAmounts[m.userId] || '0') || 0;
          return {
            userId: m.userId,
            userName: m.name,
            amount: userAmt,
            settled: m.name === paidByName,
          };
        });
      }
    } else {
      // Individual expense: Payer owes 100%
      computedSplits = [
        {
          userId: payerMember.userId,
          userName: payerMember.name,
          amount: num,
          settled: true,
        },
      ];
    }

    if (editingExpenseId) {
      await updateExpense(editingExpenseId, {
        title,
        amount: num,
        currency: tripCurrency,
        category,
        paidById: payerMember.userId,
        paidByName,
        paymentMethod,
        isShared,
        splitType,
        splits: computedSplits,
        notes,
      });
    } else {
      await addExpense({
        title,
        amount: num,
        currency: tripCurrency,
        category,
        paidById: payerMember.userId,
        paidByName,
        paymentMethod,
        date: new Date().toISOString().split('T')[0],
        isShared,
        splitType,
        splits: computedSplits,
        notes,
      });
    }

    handleCloseModal();
    loadSettlements();
  };

  // Settlement action: Mark debt transaction as settled
  const handleSettleTransaction = async (settlement: any) => {
    try {
      const res = await api.settleTransaction(
        tripId,
        settlement.fromUser,
        settlement.toUser,
        settlement.amount,
        settlement.currency || tripCurrency
      );
      if (res.success) {
        setSettleSuccessMsg(`Payment of ${formatPrice(settlement.amount, tripCurrency)} from ${settlement.fromUser} to ${settlement.toUser} marked as settled!`);
        await loadSettlements();
        setTimeout(() => setSettleSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error('Failed to settle transaction:', err);
    }
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

  // Check sum of custom amounts in real time
  const involvedMembers = members.filter((m) => selectedMemberIds.includes(m.userId));
  const currentTotalNum = parseFloat(amount) || 0;
  const customSum = involvedMembers.reduce((sum, m) => sum + (parseFloat(customAmounts[m.userId] || '0') || 0), 0);
  const customDiff = Math.round((currentTotalNum - customSum) * 100) / 100;

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
            onClick={() => setBudgetSubTab('settlements')}
            className={`flex items-center gap-2 py-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              budgetSubTab === 'settlements'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Shared Expenses & Settlement</span>
            {settlements.length > 0 && (
              <span className="rounded-full bg-indigo-100 px-1.5 py-0.2 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {settlements.length} Pending
              </span>
            )}
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
          </button>
        </div>

        {/* Log Expense Button */}
        <button
          onClick={() => {
            setEditingExpenseId(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Expense</span>
        </button>
      </div>

      {budgetSubTab === 'currency' ? (
        <SmartCurrencyConverter
          trip={effectiveTrip}
          expenses={expenses}
          onApplyBudgetAdjustment={handleApplyBudgetAdjustment}
        />
      ) : budgetSubTab === 'settlements' ? (
        /* Milestone 4.5: Shared Expenses & Settlements View */
        <div className="space-y-6">
          {settleSuccessMsg && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{settleSuccessMsg}</span>
            </div>
          )}

          {/* Section 1: Member Net Balances Overview */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Individual Net Balances</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculated by comparing total amount paid out of pocket against fair share consumed across all shared expenses.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500 font-mono">
                  Total Shared: <strong>{formatPrice(totalSharedExpenses, tripCurrency)}</strong>
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {memberStats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 transition-all ${
                    stat.status === 'GETS_BACK'
                      ? 'border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-950/40 dark:bg-emerald-950/20'
                      : stat.status === 'OWES'
                      ? 'border-rose-200/80 bg-rose-50/30 dark:border-rose-950/40 dark:bg-rose-950/20'
                      : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {stat.userName}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        stat.status === 'GETS_BACK'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : stat.status === 'OWES'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {stat.status === 'GETS_BACK' ? 'Gets Back' : stat.status === 'OWES' ? 'Owes Money' : 'Settled Up'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Paid Out</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {formatPrice(stat.totalPaid, tripCurrency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Fair Share</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {formatPrice(stat.fairShare, tripCurrency)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Net Position:</span>
                    <span
                      className={`text-sm font-bold font-mono ${
                        stat.netBalance > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : stat.netBalance < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {stat.netBalance > 0 ? `+${formatPrice(stat.netBalance, tripCurrency)}` : formatPrice(stat.netBalance, tripCurrency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Simplified Debt Settlement Plan */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  <span>Optimized Settlement Plan (Minimized Transactions)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Using greedy bipartite matching to eliminate circular debts and minimize intermediate transfers.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {settlements.length} {settlements.length === 1 ? 'Transfer Required' : 'Transfers Required'}
              </span>
            </div>

            {settlements.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/70 p-5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Everyone is all squared up!</p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    No pending balances or reimbursements are owed for this trip.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settlements.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="flex flex-col justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{s.fromUser}</span>
                        <ArrowRight className="w-4 h-4 text-indigo-500" />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{s.toUser}</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {formatPrice(s.amount, s.currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending Payment</span>
                      </span>

                      <button
                        onClick={() => handleSettleTransaction(s)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Settled</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Explanatory Callout */}
            <div className="rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100 text-xs text-indigo-900 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">How Settlement Rounding & Debt Simplification Works</p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  • <strong>Remainder Distribution:</strong> When an amount (e.g. $100.00 / 3) cannot be divided equally, any remaining cents/paise are distributed one-by-one to participants, ensuring the sum of all individual shares strictly equals the bill.
                  <br />
                  • <strong>Minimal Transfers:</strong> Rather than having each person reimburse every individual expense, TripNest balances each traveler's net ledger and computes the minimum number of pairwise payments needed to settle the squad completely.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Overview View with Category Pie Chart & Expense Table */
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

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total Budget</span>
                <Wallet className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                {formatPrice(totalBudget, tripCurrency)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${percentUsed > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                  {percentUsed}%
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total Spent</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                {formatPrice(totalSpent, tripCurrency)}
              </p>
              <span className="text-xs text-slate-400 mt-2 block font-mono">
                {expenses.length} tracked expenses
              </span>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Remaining Pool</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <p
                className={`text-2xl font-bold font-mono mt-2 ${
                  remainingBudget < 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'
                }`}
              >
                {formatPrice(remainingBudget, tripCurrency)}
              </p>
              <span className="text-xs text-slate-400 mt-2 block font-mono">
                {remainingBudget < 0 ? 'Budget exceeded' : 'Available for activities'}
              </span>
            </div>
          </div>

          {/* Category Pie Chart */}
          <ExpenseCategoryPieChart
            categoryTotals={categoryTotals}
            totalSpent={totalSpent}
            tripCurrency={tripCurrency}
          />
        </>
      )}

      {/* Expenses Table */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              Logged Expenses ({expenses.length})
            </h3>
            <p className="text-xs text-slate-400">
              Tracked expenses with payer recording and split details
            </p>
          </div>

          <button
            onClick={() => {
              setEditingExpenseId(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Expense Title</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">Paid By</th>
                <th className="py-2.5 px-4 font-semibold">Split Status</th>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                <th className="py-2.5 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No expenses logged yet. Click "Log Expense" to record your first shared expense.
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
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{exp.paidByName}</span>
                      <span className="block text-[10px] text-slate-400">{exp.paymentMethod}</span>
                    </td>
                    <td className="py-3 px-4">
                      {exp.isShared !== false ? (
                        <span className="rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                          Shared ({exp.splits?.length || 2} ways)
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 text-[10px] font-medium">
                          Individual
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{exp.date}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                        {formatPrice(exp.amount, exp.currency)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="rounded-lg p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                          title="Edit expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log / Edit Expense Modal (Milestone 4.5) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 font-display">
              {editingExpenseId ? 'Edit Shared Expense' : 'Log New Expense'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Record expense details, assign payer, and configure split allocation.
            </p>

            <form onSubmit={handleCreateOrUpdateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trattoria Dinner or Guided Museum Tickets"
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
                    Paid By (Payer)
                  </label>
                  <select
                    value={paidByName}
                    onChange={(e) => setPaidByName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                  >
                    {members.map((m) => (
                      <option key={m.userId} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Shared Expense Checkbox */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isShared"
                      checked={isShared}
                      onChange={(e) => setIsShared(e.target.checked)}
                      className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                    />
                    <label htmlFor="isShared" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                      Mark as Shared Expense
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {isShared ? 'Split among co-travelers' : 'Paid for oneself only'}
                  </span>
                </div>

                {isShared && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3">
                    {/* Split Type Selector: Equal vs Custom */}
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Split Method:
                      </span>
                      <div className="flex rounded-xl bg-slate-200/60 p-0.5 dark:bg-slate-700/60 text-xs">
                        <button
                          type="button"
                          onClick={() => setSplitType('EQUAL')}
                          className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                            splitType === 'EQUAL'
                              ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                              : 'text-slate-500'
                          }`}
                        >
                          Equal Split
                        </button>
                        <button
                          type="button"
                          onClick={() => setSplitType('CUSTOM')}
                          className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                            splitType === 'CUSTOM'
                              ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                              : 'text-slate-500'
                          }`}
                        >
                          Custom Split
                        </button>
                      </div>
                    </div>

                    {/* Member Selection Checkboxes */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                        Select Participating Members ({selectedMemberIds.length}):
                      </span>
                      <div className="space-y-1.5">
                        {members.map((m) => {
                          const isSelected = selectedMemberIds.includes(m.userId);
                          return (
                            <div
                              key={m.userId}
                              className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                                isSelected
                                  ? 'border-indigo-200 bg-white dark:border-indigo-900 dark:bg-slate-800'
                                  : 'border-slate-200/60 bg-slate-100/60 opacity-60 dark:border-slate-800 dark:bg-slate-800/30'
                              }`}
                            >
                              <div
                                onClick={() => toggleMemberSelection(m.userId)}
                                className="flex items-center gap-2 cursor-pointer flex-1"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="h-3.5 w-3.5 rounded accent-indigo-600 pointer-events-none"
                                />
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</span>
                              </div>

                              {/* Amount display per member */}
                              {isSelected && (
                                <div className="text-right font-mono">
                                  {splitType === 'EQUAL' ? (
                                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                                      {formatPrice(
                                        currentTotalNum > 0
                                          ? currentTotalNum / selectedMemberIds.length
                                          : 0,
                                        tripCurrency
                                      )}
                                    </span>
                                  ) : (
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={customAmounts[m.userId] || ''}
                                      onChange={(e) => {
                                        setCustomAmounts({
                                          ...customAmounts,
                                          [m.userId]: e.target.value,
                                        });
                                      }}
                                      className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs text-right font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Remainder note for equal split */}
                      {splitType === 'EQUAL' && currentTotalNum > 0 && (
                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>
                            Exact remainder paise/cents distributed systematically across members so sum strictly equals {formatPrice(currentTotalNum, tripCurrency)}.
                          </span>
                        </p>
                      )}

                      {/* Custom Split validation */}
                      {splitType === 'CUSTOM' && (
                        <div className="mt-2 text-xs flex items-center justify-between">
                          <span className="text-slate-500">Allocated sum:</span>
                          <span
                            className={`font-mono font-bold ${
                              customDiff === 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {formatPrice(customSum, tripCurrency)} / {formatPrice(currentTotalNum, tripCurrency)}
                            {customDiff !== 0 && ` (${customDiff > 0 ? `Unallocated: ${formatPrice(customDiff, tripCurrency)}` : `Over by: ${formatPrice(Math.abs(customDiff), tripCurrency)}`})`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context or bill details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isShared && splitType === 'CUSTOM' && customDiff !== 0}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
                >
                  {editingExpenseId ? 'Update Expense' : 'Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
