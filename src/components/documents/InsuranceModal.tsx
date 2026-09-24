import React, { useState } from 'react';
import {
  X,
  Shield,
  Calendar,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Phone,
  Mail,
  DollarSign,
  Save,
} from 'lucide-react';
import { TravelInsurancePolicy, Trip } from '../../types';
import { api } from '../../services/api';

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  existingPolicy: TravelInsurancePolicy | null;
  onSaved: (policy: TravelInsurancePolicy) => void;
}

export const InsuranceModal: React.FC<InsuranceModalProps> = ({
  isOpen,
  onClose,
  trip,
  existingPolicy,
  onSaved,
}) => {
  if (!isOpen) return null;

  // Form State
  const [provider, setProvider] = useState(existingPolicy?.provider || 'Allianz Global Assistance');
  const [policyNumber, setPolicyNumber] = useState(existingPolicy?.policyNumber || 'AG-8849204-TR');
  const [policyHolderName, setPolicyHolderName] = useState(existingPolicy?.policyHolderName || 'Lara Croft');
  const [planName, setPlanName] = useState(existingPolicy?.planName || 'Comprehensive Worldwide Plan');
  const [startDate, setStartDate] = useState(existingPolicy?.startDate || trip.startDate || '2026-10-01');
  const [expiryDate, setExpiryDate] = useState(existingPolicy?.expiryDate || '2026-10-15');
  const [emergencyHotline, setEmergencyHotline] = useState(existingPolicy?.emergencyHotline || '+1 (800) 284-8300');
  const [assistanceEmail, setAssistanceEmail] = useState(existingPolicy?.assistanceEmail || 'claims@allianzassistance.com');
  const [currency, setCurrency] = useState(existingPolicy?.currency || trip.currency || 'USD');
  const [medicalExpenseLimit, setMedicalExpenseLimit] = useState(existingPolicy?.medicalExpenseLimit?.toString() || '250000');
  const [emergencyEvacuationLimit, setEmergencyEvacuationLimit] = useState(existingPolicy?.emergencyEvacuationLimit?.toString() || '500000');
  const [tripCancellationLimit, setTripCancellationLimit] = useState(existingPolicy?.tripCancellationLimit?.toString() || '5000');
  const [baggageLossLimit, setBaggageLossLimit] = useState(existingPolicy?.baggageLossLimit?.toString() || '2000');
  const [deductible, setDeductible] = useState(existingPolicy?.deductible?.toString() || '100');
  const [coversAdventureSports, setCoversAdventureSports] = useState<boolean>(Boolean(existingPolicy?.coversAdventureSports));
  const [coversRentalCar, setCoversRentalCar] = useState<boolean>(existingPolicy?.coversRentalCar ?? true);
  const [coversCovid, setCoversCovid] = useState<boolean>(existingPolicy ? existingPolicy.coversCovid : true);
  const [coversPreExistingConditions, setCoversPreExistingConditions] = useState<boolean>(Boolean(existingPolicy?.coversPreExistingConditions));
  const [notes, setNotes] = useState(existingPolicy?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Date validation check
  const isExpiringBeforeTripEnd = trip.endDate && expiryDate && new Date(expiryDate) < new Date(trip.endDate);
  const isStartingAfterTripStart = trip.startDate && startDate && new Date(startDate) > new Date(trip.startDate);

  // Quick Preset Helper
  const applyPreset = (preset: 'schengen' | 'adventure' | 'budget') => {
    if (preset === 'schengen') {
      setProvider('AXA Schengen Protection');
      setPlanName('Europe Travel Low-Cost & Visa Compliant');
      setMedicalExpenseLimit('100000');
      setEmergencyEvacuationLimit('250000');
      setDeductible('0');
      setCoversAdventureSports(false);
      setCoversRentalCar(false);
      setCoversCovid(true);
    } else if (preset === 'adventure') {
      setProvider('World Nomads Explorer');
      setPlanName('Adventure Plus Worldwide (Extreme Sports & Gear)');
      setMedicalExpenseLimit('500000');
      setEmergencyEvacuationLimit('1000000');
      setTripCancellationLimit('10000');
      setBaggageLossLimit('3500');
      setDeductible('100');
      setCoversAdventureSports(true);
      setCoversRentalCar(true);
      setCoversCovid(true);
    } else if (preset === 'budget') {
      setProvider('SafetyWing Nomad Insurance');
      setPlanName('Essential Global Health & Evacuation');
      setMedicalExpenseLimit('250000');
      setEmergencyEvacuationLimit('100000');
      setTripCancellationLimit('0');
      setBaggageLossLimit('500');
      setDeductible('250');
      setCoversAdventureSports(false);
      setCoversRentalCar(false);
      setCoversCovid(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!provider.trim()) {
      setValidationError('Please enter your Insurance Provider name.');
      return;
    }
    if (!policyNumber.trim()) {
      setValidationError('Please enter your Policy / Certificate Number.');
      return;
    }
    if (!startDate || !expiryDate) {
      setValidationError('Please select valid start and expiration dates.');
      return;
    }
    if (new Date(startDate) > new Date(expiryDate)) {
      setValidationError('Policy expiration date must be after the policy start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<TravelInsurancePolicy> = {
        id: existingPolicy?.id,
        tripId: trip.id,
        provider: provider.trim(),
        policyNumber: policyNumber.trim(),
        policyHolderName: policyHolderName.trim() || 'Traveler',
        planName: planName.trim() || 'Standard Protection',
        startDate,
        expiryDate,
        emergencyHotline: emergencyHotline.trim(),
        assistanceEmail: assistanceEmail.trim(),
        currency,
        medicalExpenseLimit: parseFloat(medicalExpenseLimit) || 0,
        emergencyEvacuationLimit: parseFloat(emergencyEvacuationLimit) || 0,
        tripCancellationLimit: parseFloat(tripCancellationLimit) || 0,
        baggageLossLimit: parseFloat(baggageLossLimit) || 0,
        deductible: parseFloat(deductible) || 0,
        coversAdventureSports,
        coversRentalCar,
        coversCovid,
        coversPreExistingConditions,
        notes: notes.trim(),
      };

      const res = await api.saveInsurancePolicy(payload);
      if (res.success && res.data) {
        onSaved(res.data);
      } else {
        setValidationError(res.message || 'Failed to save policy');
      }
    } catch (err: any) {
      setValidationError(err?.message || 'Error communicating with insurance API');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {existingPolicy ? 'Edit Travel Insurance Policy' : 'Log Travel Insurance Policy'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI will inspect coverage gaps, expiration timelines, and destination health compliance.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-4 flex items-center gap-2 flex-wrap rounded-2xl bg-indigo-50/60 p-2.5 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Quick Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('schengen')}
            className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            🇪🇺 Schengen Compliant
          </button>
          <button
            type="button"
            onClick={() => applyPreset('adventure')}
            className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            🧗 Explorer & Sports
          </button>
          <button
            type="button"
            onClick={() => applyPreset('budget')}
            className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            💼 Nomad Essential
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Real-time Expiration Warning */}
        {isExpiringBeforeTripEnd && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">Expiration Warning: Policy ends before trip ends!</p>
              <p className="text-[11px] mt-0.5 text-amber-900 dark:text-amber-200">
                Your trip ends on {trip.endDate}, but your selected policy expiry date is {expiryDate}. The final days of travel will be uncovered.
              </p>
            </div>
          </div>
        )}

        {isStartingAfterTripStart && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">Start Date Notice: Policy begins after trip start!</p>
              <p className="text-[11px] mt-0.5 text-amber-900 dark:text-amber-200">
                Your trip departs on {trip.startDate}, but coverage starts on {startDate}.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Row 1: Provider & Policy Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Insurance Provider *
              </label>
              <input
                type="text"
                required
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. Allianz Global Assistance, World Nomads"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Policy / Certificate # *
              </label>
              <input
                type="text"
                required
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="e.g. AG-8849204-TR"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Row 2: Plan Name & Policy Holder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Plan / Package Name
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g. Classic Worldwide Comprehensive"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Policy Holder Name
              </label>
              <input
                type="text"
                value={policyHolderName}
                onChange={(e) => setPolicyHolderName(e.target.value)}
                placeholder="e.g. Lara Croft"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Row 3: Coverage Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Policy Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
              <span className="text-[10px] text-slate-400">Trip departs: {trip.startDate}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Policy Expiration Date *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
              <span className="text-[10px] text-slate-400">Trip returns: {trip.endDate}</span>
            </div>
          </div>

          {/* Row 4: Hotline & Assistance Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                24/7 Emergency Assistance Hotline
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={emergencyHotline}
                  onChange={(e) => setEmergencyHotline(e.target.value)}
                  placeholder="+1 (800) 284-8300"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Claims / Assistance Email
              </label>
              <div className="relative mt-1">
                <input
                  type="email"
                  value={assistanceEmail}
                  onChange={(e) => setAssistanceEmail(e.target.value)}
                  placeholder="claims@assistance.com"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Row 5: Coverage Limits Matrix */}
          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
              <span>Coverage Limits ({currency})</span>
              <span className="text-[10px] text-slate-400 font-normal">Amounts in {currency}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Emergency Medical ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={medicalExpenseLimit}
                  onChange={(e) => setMedicalExpenseLimit(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Evacuation & Repatriation ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={emergencyEvacuationLimit}
                  onChange={(e) => setEmergencyEvacuationLimit(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Trip Cancellation ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={tripCancellationLimit}
                  onChange={(e) => setTripCancellationLimit(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Baggage Loss ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={baggageLossLimit}
                  onChange={(e) => setBaggageLossLimit(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Deductible / Excess ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={deductible}
                  onChange={(e) => setDeductible(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 6: Policy Endorsements Checkboxes */}
          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Endorsements & Specific Inclusions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200/80 p-2.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coversAdventureSports}
                  onChange={(e) => setCoversAdventureSports(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Adventure & Extreme Sports</span>
                  <p className="text-[10px] text-slate-400">Includes cycling, hiking, scuba, skiing & mopeds</p>
                </div>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200/80 p-2.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coversRentalCar}
                  onChange={(e) => setCoversRentalCar(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Rental Car Collision (CDW)</span>
                  <p className="text-[10px] text-slate-400">Covers vehicle damage and theft abroad</p>
                </div>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200/80 p-2.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coversCovid}
                  onChange={(e) => setCoversCovid(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Epidemic / COVID-19 Medical</span>
                  <p className="text-[10px] text-slate-400">Quarantine accommodation & virus care</p>
                </div>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200/80 p-2.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coversPreExistingConditions}
                  onChange={(e) => setCoversPreExistingConditions(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Pre-Existing Conditions Waiver</span>
                  <p className="text-[10px] text-slate-400">Exclusion waived within look-back period</p>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Hospital Direct-Billing & Claims Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Direct billing agreement in Rome with Policlinico Umberto I. Must call hotline within 24h of hospitalization."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving & Auditing...' : 'Save & Run AI Audit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
