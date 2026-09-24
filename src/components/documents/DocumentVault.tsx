import React, { useState } from 'react';
import {
  FileCheck,
  UploadCloud,
  FileText,
  AlertTriangle,
  Download,
  Trash2,
  Calendar,
  CheckCircle,
  Eye,
  Plus,
  CheckSquare,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { DocumentCategory, TravelDocument } from '../../types';
import { PackingChecklist } from '../packing/PackingChecklist';
import { TravelInsuranceCard } from './TravelInsuranceCard';

export const DocumentVault: React.FC = () => {
  const { documents, addDocument, deleteDocument, activeTrip, itineraryDays } = useTrip();

  const [activeSubView, setActiveSubView] = useState<'documents' | 'insurance' | 'packing'>('documents');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Passport');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<TravelDocument | null>(null);

  const categories: DocumentCategory[] = [
    'Passport',
    'Visa',
    'Flight Tickets',
    'Hotel Bookings',
    'Travel Insurance',
    'Identity Documents',
    'Other',
  ];

  // Expiry Checker
  const checkExpiryStatus = (expDate?: string) => {
    if (!expDate) return null;
    const now = new Date();
    const expiry = new Date(expDate);
    const diffMonths = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (diffMonths < 0) {
      return { status: 'EXPIRED', message: 'Expired!', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950' };
    }
    if (diffMonths <= 3) {
      return {
        status: 'WARNING',
        message: `Expires in ${Math.round(diffMonths)} months`,
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
      };
    }
    return { status: 'VALID', message: 'Valid', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' };
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    await addDocument({
      name: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
      category,
      expiryDate: expiryDate || undefined,
      notes,
      fileSize: '1.4 MB',
    });

    setDocName('');
    setExpiryDate('');
    setNotes('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-view Navigation: Digital Vault vs Travel Insurance vs Packing Checklist */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-100/90 p-1 dark:border-slate-800 dark:bg-slate-850">
          <button
            onClick={() => setActiveSubView('documents')}
            className={`flex items-center gap-2 py-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubView === 'documents'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Vault Documents ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('insurance')}
            className={`flex items-center gap-2 py-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubView === 'insurance'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Travel Insurance & AI Audit</span>
          </button>

          <button
            onClick={() => setActiveSubView('packing')}
            className={`flex items-center gap-2 py-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubView === 'packing'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Packing Checklist</span>
          </button>
        </div>
      </div>

      {activeSubView === 'packing' && activeTrip ? (
        <PackingChecklist trip={activeTrip} itineraryDays={itineraryDays} />
      ) : activeSubView === 'insurance' && activeTrip ? (
        <div className="space-y-6">
          <TravelInsuranceCard trip={activeTrip} />
        </div>
      ) : (
        <>
          {/* Travel Insurance Card at top of Documents Vault */}
          {activeTrip && (
            <TravelInsuranceCard trip={activeTrip} />
          )}

          {/* Vault Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Travel Document Vault</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Encrypted cloud storage for visas, passport scans, boarding passes, and emergency travel insurance.
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>

          {/* Expiry Alerts Banner if any document is close to expiry */}
          {documents.some((d) => d.expiryDate && checkExpiryStatus(d.expiryDate)?.status === 'WARNING') && (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold">Travel Document Expiry Notice</p>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                  One or more essential travel documents expire within 3-6 months. Most international borders require at least 6 months remaining passport validity.
                </p>
              </div>
            </div>
          )}

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No documents uploaded yet</p>
                <p className="text-xs text-slate-400 mt-1">Upload boarding passes, hotel vouchers, and ID scans.</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Upload Document
                </button>
              </div>
            ) : (
              documents.map((doc) => {
                const exp = checkExpiryStatus(doc.expiryDate);
                return (
                  <div
                    key={doc.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                          {doc.category}
                        </span>
                        {exp && (
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${exp.color}`}>
                            {exp.message}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-indigo-600 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{doc.fileSize} • Uploaded {doc.uploadDate}</p>
                          {doc.notes && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{doc.notes}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPreviewDoc(doc)}
                          className="flex items-center gap-1 text-xs text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <a
                          href={doc.fileUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>

                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Add Travel Document</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schengen Visa Multi-Entry.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Reference Numbers
                </label>
                <textarea
                  rows={2}
                  placeholder="Seat numbers, policy ID, emergency contact..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
                >
                  Upload & Encrypt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedPreviewDoc.name}</h3>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl my-4 border border-dashed border-slate-200 dark:border-slate-700">
              <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{selectedPreviewDoc.name}</p>
              <p className="text-[11px] text-slate-400 mt-1">{selectedPreviewDoc.category} • {selectedPreviewDoc.fileSize}</p>
              {selectedPreviewDoc.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 px-4 italic">
                  "{selectedPreviewDoc.notes}"
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
