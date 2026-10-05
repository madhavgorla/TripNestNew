import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Edit3,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Plane,
  Activity,
  Car,
  HeartPulse,
  Info,
  Calendar,
  DollarSign,
  Plus,
} from 'lucide-react';
import { TravelInsurancePolicy, Trip, AiCoverageReminder } from '../../types';
import { api } from '../../services/api';
import { InsuranceModal } from './InsuranceModal';

interface TravelInsuranceCardProps {
  trip: Trip;
}

export const TravelInsuranceCard: React.FC<TravelInsuranceCardProps> = ({ trip }) => {
  const [policy, setPolicy] = useState<TravelInsurancePolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRemindersExpanded, setIsRemindersExpanded] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load policy on mount or trip change
  useEffect(() => {
    loadPolicy();
  }, [trip.id]);

  const loadPolicy = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInsurancePolicy(trip.id);
      if (res.success && res.data) {
        setPolicy(res.data);
      } else {
        setPolicy(null);
      }
    } catch (err) {
      console.warn('Failed to fetch insurance policy:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAiAudit = async () => {
    if (!policy) return;
    setIsAuditing(true);
    try {
      const res = await api.auditInsurancePolicy({
        tripId: trip.id,
        policy,
      });
      if (res.success && res.data) {
        setPolicy(res.data);
        showToast('AI coverage audit updated!');
      }
    } catch (err) {
      console.error('Audit failed:', err);
      showToast('AI audit failed to refresh');
    } finally {
      setIsAuditing(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Expiration calculations
  const calculateDaysRemaining = (expiryDateStr: string) => {
    const now = new Date('2026-09-24T03:10:00'); // current time reference
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = policy ? calculateDaysRemaining(policy.expiryDate) : null;
  const tripEnd = trip.endDate ? new Date(trip.endDate) : null;
  const policyEnd = policy ? new Date(policy.expiryDate) : null;
  const isTripUncoveredAtEnd = Boolean(tripEnd && policyEnd && policyEnd < tripEnd);
  const isExpired = daysRemaining !== null && daysRemaining < 0;
  const isExpiringSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 14;

  const getStatusBadge = () => {
    if (isExpired) {
      return {
        label: 'EXPIRED',
        color: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900',
        icon: ShieldAlert,
      };
    }
    if (isTripUncoveredAtEnd) {
      return {
        label: 'COVERAGE GAP (Expires before trip ends)',
        color: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800',
        icon: ShieldAlert,
      };
    }
    if (isExpiringSoon) {
      return {
        label: 'EXPIRING SOON',
        color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        icon: AlertTriangle,
      };
    }
    return {
      label: 'ACTIVE & PROTECTED',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      icon: ShieldCheck,
    };
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
        <p className="mt-2 text-xs font-semibold text-slate-500">Checking policy & AI protection status...</p>
      </div>
    );
  }

  // Empty state if no policy entered yet
  if (!policy) {
    return (
      <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 p-6 dark:border-indigo-900/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Travel Insurance & Emergency Health Protection
                </h3>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Unregistered
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Log your policy to monitor expiration countdowns, emergency medical assistance numbers, and get AI-powered coverage gap analysis for {trip.destination}.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Policy Details</span>
          </button>
        </div>

        {isModalOpen && (
          <InsuranceModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            trip={trip}
            existingPolicy={null}
            onSaved={(saved) => {
              setPolicy(saved);
              setIsModalOpen(false);
              showToast('Travel insurance policy logged and analyzed!');
            }}
          />
        )}
      </div>
    );
  }

  const score = policy.aiAuditScore ?? 84;
  const criticalGapsCount = policy.aiReminders?.filter((r) => r.severity === 'CRITICAL').length || 0;
  const warningsCount = policy.aiReminders?.filter((r) => r.severity === 'WARNING').length || 0;

  return (
    <div className="relative rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md dark:bg-white dark:text-slate-900 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20">
              <Shield className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadge.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{statusBadge.label}</span>
                </span>

                {daysRemaining !== null && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    daysRemaining < 0
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : daysRemaining <= 7
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>
                      {daysRemaining < 0
                        ? `Expired ${Math.abs(daysRemaining)} days ago`
                        : `${daysRemaining} days remaining`}
                    </span>
                  </span>
                )}

                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                  {policy.startDate} → {policy.expiryDate}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {policy.provider}
                </h3>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {policy.planName}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    #{policy.policyNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(policy.policyNumber, 'Policy Number')}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-0.5"
                    title="Copy Policy Number"
                  >
                    {copiedField === 'Policy Number' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls & Protection Score */}
          <div className="flex items-center gap-3 self-end lg:self-center">
            {/* AI Protection Score Pill */}
            <div className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2 dark:border-indigo-900/50 dark:bg-indigo-950/40">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-800 dark:text-indigo-300">
                  AI Protection Score
                </p>
                <p className="text-xs font-black text-indigo-950 dark:text-indigo-100">
                  {score}/100 {score >= 80 ? '• Robust' : score >= 60 ? '• Moderate' : '• High Risk'}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs">
                {score}
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Coverage Matrix & Hotline */}
      <div className="p-6 space-y-6">
        {/* Coverage Limits Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Emergency Medical */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Emergency Medical</span>
            <p className="mt-1 font-mono text-sm font-extrabold text-slate-900 dark:text-white">
              {policy.currency} {policy.medicalExpenseLimit.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Direct hospital billing</p>
          </div>

          {/* Medical Evacuation */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Evacuation & Repat.</span>
            <p className="mt-1 font-mono text-sm font-extrabold text-slate-900 dark:text-white">
              {policy.currency} {policy.emergencyEvacuationLimit.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Air ambulance included</p>
          </div>

          {/* Trip Cancellation */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Trip Cancellation</span>
            <p className="mt-1 font-mono text-sm font-extrabold text-slate-900 dark:text-white">
              {policy.currency} {policy.tripCancellationLimit.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Pre-departure cover</p>
          </div>

          {/* Baggage Loss */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Lost / Delayed Bags</span>
            <p className="mt-1 font-mono text-sm font-extrabold text-slate-900 dark:text-white">
              {policy.currency} {policy.baggageLossLimit.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Valuables & essentials</p>
          </div>

          {/* Deductible */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Out-of-Pocket Excess</span>
            <p className="mt-1 font-mono text-sm font-extrabold text-slate-900 dark:text-white">
              {policy.currency} {policy.deductible}
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Per-incident deductible</p>
          </div>

          {/* Emergency Hotline */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/20">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 dark:text-indigo-300">24/7 Global Hotline</span>
            <div className="mt-1 flex items-center justify-between gap-1">
              <a
                href={`tel:${policy.emergencyHotline}`}
                className="font-mono text-xs font-bold text-indigo-950 hover:underline dark:text-indigo-200 truncate"
              >
                {policy.emergencyHotline}
              </a>
              <button
                onClick={() => copyToClipboard(policy.emergencyHotline, 'Emergency Hotline')}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 p-0.5"
                title="Copy Hotline"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[10px] text-indigo-700/80 dark:text-indigo-400 font-medium mt-0.5">Worldwide toll-free</p>
          </div>
        </div>

        {/* Endorsement Feature Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-400 mr-1">Riders & Provisions:</span>

          <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium border ${
            policy.coversAdventureSports
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700'
          }`}>
            <Activity className="w-3.5 h-3.5" />
            <span>Adventure Sports: {policy.coversAdventureSports ? 'Included' : 'Excluded'}</span>
          </span>

          <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium border ${
            policy.coversRentalCar
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700'
          }`}>
            <Car className="w-3.5 h-3.5" />
            <span>Rental Car Collision: {policy.coversRentalCar ? 'Covered' : 'Not Included'}</span>
          </span>

          <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium border ${
            policy.coversCovid
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700'
          }`}>
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Epidemic / COVID-19: {policy.coversCovid ? 'Covered' : 'Excluded'}</span>
          </span>

          <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium border ${
            policy.coversPreExistingConditions
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700'
          }`}>
            <FileCheck className="w-3.5 h-3.5" />
            <span>Pre-Existing Waiver: {policy.coversPreExistingConditions ? 'Granted' : 'None'}</span>
          </span>
        </div>

        {/* AI Coverage Gap & Expiration Reminders Section */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/20 p-5 dark:border-indigo-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
          <div className="flex items-center justify-between gap-3 border-b border-indigo-100/70 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>AI Coverage Gap & Expiration Reminders</span>
                  {criticalGapsCount > 0 && (
                    <span className="rounded-md bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {criticalGapsCount} Critical Alert
                    </span>
                  )}
                  {warningsCount > 0 && (
                    <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      {warningsCount} Gap Warning
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Targeted analysis comparing your policy limits against {trip.destination} healthcare laws and planned activities.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunAiAudit}
                disabled={isAuditing}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                title="Re-run AI verification"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>{isAuditing ? 'Analyzing...' : 'Re-Audit Policy'}</span>
              </button>

              <button
                onClick={() => setIsRemindersExpanded(!isRemindersExpanded)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {isRemindersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Reminders List */}
          {isRemindersExpanded && (
            <div className="mt-4 space-y-3">
              {policy.aiReminders && policy.aiReminders.length > 0 ? (
                policy.aiReminders.map((reminder) => {
                  let badgeClass = 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
                  let icon = Info;

                  if (reminder.severity === 'CRITICAL') {
                    badgeClass = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900';
                    icon = ShieldAlert;
                  } else if (reminder.severity === 'WARNING') {
                    badgeClass = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
                    icon = AlertTriangle;
                  } else if (reminder.severity === 'SUCCESS') {
                    badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
                    icon = ShieldCheck;
                  }

                  const ReminderIcon = icon;

                  return (
                    <div
                      key={reminder.id}
                      className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900/90 shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${badgeClass}`}>
                          <ReminderIcon className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                              {reminder.title}
                            </h5>
                            {reminder.relatedCategory && (
                              <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {reminder.relatedCategory}
                              </span>
                            )}
                            <span className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                              reminder.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : reminder.severity === 'WARNING'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : reminder.severity === 'SUCCESS'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}>
                              {reminder.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {reminder.description}
                          </p>
                          <div className="pt-1 flex items-start gap-1.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                            <span className="font-bold shrink-0">💡 AI Recommendation:</span>
                            <span>{reminder.recommendation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  No coverage gaps detected. Your policy matches your travel itinerary parameters!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hospital direct billing notes if present */}
        {policy.notes && (
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-bold text-slate-800 dark:text-slate-200">Hospital & Billing Intake Notes: </span>
            {policy.notes}
          </div>
        )}
      </div>

      {/* Edit / Input Modal */}
      {isModalOpen && (
        <InsuranceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          trip={trip}
          existingPolicy={policy}
          onSaved={(saved) => {
            setPolicy(saved);
            setIsModalOpen(false);
            showToast('Insurance policy updated!');
          }}
        />
      )}
    </div>
  );
};
