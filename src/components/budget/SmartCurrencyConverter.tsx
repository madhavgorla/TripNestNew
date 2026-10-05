import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  ArrowRightLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  Check,
  Coffee,
  Utensils,
  Train,
  Ticket,
  Car,
  DollarSign,
  Globe,
  Sliders,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { Trip, Expense, DestinationCurrencyInfo, BudgetAdjustmentRecommendation } from '../../types';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

interface SmartCurrencyConverterProps {
  trip: Trip;
  expenses: Expense[];
  onApplyBudgetAdjustment?: (newBudget: number) => void;
}

export const SmartCurrencyConverter: React.FC<SmartCurrencyConverterProps> = ({
  trip,
  expenses,
  onApplyBudgetAdjustment,
}) => {
  const { currentCurrency, formatPrice } = useCurrency();

  const [currencyInfo, setCurrencyInfo] = useState<DestinationCurrencyInfo | null>(null);
  const [recommendation, setRecommendation] = useState<BudgetAdjustmentRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Conversion Calculator State
  const [amountFrom, setAmountFrom] = useState<string>('100');
  const [amountTo, setAmountTo] = useState<string>('92.40');
  const [isReversed, setIsReversed] = useState<boolean>(false); // false = USD -> Local, true = Local -> USD

  const destination = trip.destination || 'Rome';

  useEffect(() => {
    loadDestinationCurrency();
    loadAiBudgetAdjustment();
  }, [trip.id, destination]);

  const loadDestinationCurrency = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDestinationCurrencyInfo(destination);
      if (res.success && res.data) {
        setCurrencyInfo(res.data);
        // Initialize default conversion
        const rate = res.data.exchangeRateFromUSD;
        setAmountTo((100 * rate).toFixed(2));
      }
    } catch (err) {
      console.warn('Failed to fetch destination currency info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAiBudgetAdjustment = async () => {
    setIsAiLoading(true);
    try {
      const durationDays = trip.startDate && trip.endDate
        ? Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 5;

      const res = await api.getAiBudgetAdjustment({
        tripId: trip.id,
        destination,
        totalBudget: trip.budget || 3200,
        currency: trip.currency || 'USD',
        expenses,
        durationDays,
      });

      if (res.success && res.data) {
        setRecommendation(res.data);
      }
    } catch (err) {
      console.warn('Failed to load AI budget adjustment:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle calculator input changes
  const handleFromChange = (val: string) => {
    setAmountFrom(val);
    const num = parseFloat(val);
    if (isNaN(num) || !currencyInfo) {
      setAmountTo('');
      return;
    }

    if (!isReversed) {
      // USD -> Local
      const converted = num * currencyInfo.exchangeRateFromUSD;
      setAmountTo(converted.toFixed(2));
    } else {
      // Local -> USD
      const converted = num * currencyInfo.exchangeRateToUSD;
      setAmountTo(converted.toFixed(2));
    }
  };

  const handleToChange = (val: string) => {
    setAmountTo(val);
    const num = parseFloat(val);
    if (isNaN(num) || !currencyInfo) {
      setAmountFrom('');
      return;
    }

    if (!isReversed) {
      // Inputting Local -> calculate USD
      const converted = num / currencyInfo.exchangeRateFromUSD;
      setAmountFrom(converted.toFixed(2));
    } else {
      // Inputting USD -> calculate Local
      const converted = num / currencyInfo.exchangeRateToUSD;
      setAmountFrom(converted.toFixed(2));
    }
  };

  const handleSwapCurrencies = () => {
    if (!currencyInfo) return;
    const newReversed = !isReversed;
    setIsReversed(newReversed);

    // Recalculate based on current amountFrom
    const num = parseFloat(amountFrom) || 100;
    if (newReversed) {
      // Now Local -> USD
      setAmountTo((num * currencyInfo.exchangeRateToUSD).toFixed(2));
    } else {
      // Now USD -> Local
      setAmountTo((num * currencyInfo.exchangeRateFromUSD).toFixed(2));
    }
  };

  const handleQuickAmount = (amt: number) => {
    setAmountFrom(amt.toString());
    handleFromChange(amt.toString());
  };

  const handleApplyAdjustment = async () => {
    if (!recommendation) return;
    setIsApplying(true);
    try {
      if (onApplyBudgetAdjustment) {
        onApplyBudgetAdjustment(recommendation.suggestedTotalBudget);
      }
      setAppliedNotice('AI suggested category allocations applied to your budget plan!');
      setTimeout(() => setAppliedNotice(null), 4000);
    } catch (err) {
      console.error('Failed to apply budget adjustments:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const getBenchmarkIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Coffee': return Coffee;
      case 'Utensils': return Utensils;
      case 'Train': return Train;
      case 'Ticket': return Ticket;
      case 'Car': return Car;
      default: return DollarSign;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
        <p className="mt-2 text-xs font-semibold text-slate-500">Fetching live currency rates for {destination}...</p>
      </div>
    );
  }

  const baseCurrencyCode = trip.currency || 'USD';
  const baseCurrencySymbol = baseCurrencyCode === 'EUR' ? '€' : baseCurrencyCode === 'GBP' ? '£' : '$';
  const localCode = currencyInfo?.localCurrencyCode || 'EUR';
  const localSymbol = currencyInfo?.localCurrencySymbol || '€';
  const rateFromBase = currencyInfo?.exchangeRateFromUSD ?? 0.924;
  const rateToBase = currencyInfo?.exchangeRateToUSD ?? 1.082;
  const change24h = currencyInfo?.twentyFourHourChange ?? 0.42;

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {appliedNotice && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/90 text-white px-4 py-2.5 text-xs font-bold shadow-xl animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Main Converter Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 p-6 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 shadow-xs">
        {/* Header with Live Ticker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Smart Destination Currency Converter
                </h3>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {destination} • {localCode} ({localSymbol})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time exchange rates synced to your itinerary destination with local spending intelligence.
              </p>
            </div>
          </div>

          {/* Live Rate Ticker Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto rounded-2xl border border-slate-200/80 bg-white/90 px-3.5 py-2 dark:border-slate-700 dark:bg-slate-800 shadow-2xs">
            <div className="text-right">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                <span>1 {baseCurrencyCode} = {rateFromBase.toFixed(3)} {localCode}</span>
                <span className={`inline-flex items-center text-[10px] font-black ${
                  change24h >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {change24h >= 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                  {change24h >= 0 ? `+${change24h}%` : `${change24h}%`}
                </span>
              </div>
              <p className="text-[9px] text-slate-400">Live interbank mid-market</p>
            </div>

            <button
              onClick={() => {
                loadDestinationCurrency();
                loadAiBudgetAdjustment();
              }}
              title="Refresh live rates"
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isAiLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Interactive Bi-directional Converter Form */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* Box 1: Left Currency */}
          <div className="md:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>{!isReversed ? `Trip Currency (${baseCurrencyCode})` : `Local Currency (${localCode})`}</span>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {!isReversed ? baseCurrencySymbol : localSymbol}
              </span>
            </div>
            <div className="relative mt-1">
              <input
                type="number"
                min="0"
                step="any"
                value={amountFrom}
                onChange={(e) => handleFromChange(e.target.value)}
                placeholder="100"
                className="w-full text-2xl font-black font-mono tracking-tight text-slate-900 focus:outline-hidden dark:text-white bg-transparent"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              {!isReversed ? `Your home / card currency` : `${currencyInfo?.country || destination} legal tender`}
            </p>
          </div>

          {/* Middle Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={handleSwapCurrencies}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-indigo-400 hover:text-indigo-600 hover:scale-105 active:scale-95 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-indigo-400 cursor-pointer"
              title="Swap currencies"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Box 2: Right Currency */}
          <div className="md:col-span-5 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-1">
              <span>{isReversed ? `Trip Currency (${baseCurrencyCode})` : `Local Currency (${localCode})`}</span>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {isReversed ? baseCurrencySymbol : localSymbol}
              </span>
            </div>
            <div className="relative mt-1">
              <input
                type="number"
                min="0"
                step="any"
                value={amountTo}
                onChange={(e) => handleToChange(e.target.value)}
                placeholder="92.40"
                className="w-full text-2xl font-black font-mono tracking-tight text-indigo-950 focus:outline-hidden dark:text-indigo-100 bg-transparent"
              />
            </div>
            <p className="mt-1 text-[11px] text-indigo-700/80 dark:text-indigo-400 font-medium">
              {isReversed ? `Your home / card currency equivalent` : `${currencyInfo?.country || destination} cash / POS target`}
            </p>
          </div>
        </div>

        {/* Quick Amount Chips */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400">Quick amounts:</span>
          {[20, 50, 100, 250, 500].map((val) => (
            <button
              key={val}
              onClick={() => handleQuickAmount(val)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-mono font-bold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer transition-all"
            >
              {!isReversed ? `${baseCurrencySymbol}${val}` : `${localSymbol}${val}`}
            </button>
          ))}
        </div>

        {/* Local Price Benchmark Cheat Sheet */}
        {currencyInfo?.priceBenchmarks && currencyInfo.priceBenchmarks.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-indigo-500" />
                <span>{destination} Local Purchasing Power Cheat Sheet</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Typical on-the-ground expense baseline</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {currencyInfo.priceBenchmarks.map((bm, i) => {
                const IconComponent = getBenchmarkIcon(bm.icon);
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-slate-700/80 dark:bg-slate-800/60 shadow-2xs hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={bm.item}>
                        {bm.item}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-2">
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                        {localSymbol}{bm.localPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ≈ ${bm.usdPrice.toFixed(2)} USD
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      {bm.note}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* AI Budget Adjustment Suggestions Based on Local Spending Trends */}
      {recommendation && (
        <div className="rounded-3xl border border-purple-200/80 bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/30 p-6 dark:border-purple-900/50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/20 shadow-xs space-y-5">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    AI Budget Adjustment & Local Spending Trends
                  </h3>
                  <span className="rounded-full bg-purple-100 px-2 py-0.2 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tailored budget reallocations based on {destination}'s prices, transit walkability, and culinary habits.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadAiBudgetAdjustment}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:bg-slate-800 dark:text-purple-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                <span>{isAiLoading ? 'Re-analyzing...' : 'Refresh AI Analysis'}</span>
              </button>

              <button
                onClick={handleApplyAdjustment}
                disabled={isApplying}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isApplying ? 'Applying...' : 'Apply Recommended Reallocations'}</span>
              </button>
            </div>
          </div>

          {/* AI Rationale Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 dark:border-purple-900/40 dark:bg-purple-950/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-200 mb-1">
                <Lightbulb className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Local Spending Rationale</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {recommendation.spendingTrendRationale}
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Exchange Rate & Purchasing Power Impact</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {recommendation.fxImpactSummary}
              </p>
            </div>
          </div>

          {/* Category-by-Category Suggested Adjustments Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
              <span>Suggested Budget Reallocations by Expense Category</span>
              <span className="text-[10px] text-slate-400">Total Budget stays constant at {formatPrice(recommendation.suggestedTotalBudget, baseCurrencyCode)}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendation.categoryAdjustments.map((adj, i) => {
                const isIncrease = adj.percentageChange > 0;
                const isDecrease = adj.percentageChange < 0;

                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700/80 dark:bg-slate-800/60 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {adj.category}
                      </span>
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-black ${
                        isIncrease
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isDecrease
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {isIncrease ? `+${adj.percentageChange}%` : `${adj.percentageChange}%`}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current</span>
                        <p className="font-mono text-xs font-semibold text-slate-500 line-through">
                          {formatPrice(adj.currentAmount, baseCurrencyCode)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">AI Suggested</span>
                        <p className="font-mono text-sm font-black text-slate-900 dark:text-white">
                          {formatPrice(adj.suggestedAmount, baseCurrencyCode)}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      {adj.rationale}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local Financial & Currency Tips */}
          {recommendation.spendingTips && recommendation.spendingTips.length > 0 && (
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span>Insider Financial & Cash Management Tips for {destination}:</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {recommendation.spendingTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
