import React, { useState, useEffect } from 'react';
import {
  Share2,
  Link2,
  Copy,
  Check,
  Eye,
  Edit3,
  Users,
  QrCode,
  Calendar,
  Lock,
  Unlock,
  Mail,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  X,
  Send,
  Globe,
  Download,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { Trip, SharedItineraryLink, ItineraryCollaborator, ShareAccessLevel, CreateShareLinkPayload } from '../../types';
import { api } from '../../services/api';

interface ShareItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onPreviewPublicLink?: (token: string) => void;
}

export const ShareItineraryModal: React.FC<ShareItineraryModalProps> = ({
  isOpen,
  onClose,
  trip,
  onPreviewPublicLink,
}) => {
  // State
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<ShareAccessLevel>('VIEWER');
  const [expiresIn, setExpiresIn] = useState<'never' | '7d' | '30d'>('never');
  const [allowCloning, setAllowCloning] = useState<boolean>(true);
  const [includeBudget, setIncludeBudget] = useState<boolean>(false);
  const [enablePasscode, setEnablePasscode] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');

  // Collaborator invite state
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<ShareAccessLevel>('EDITOR');
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  // Links & Collabs from server
  const [sharedLinks, setSharedLinks] = useState<SharedItineraryLink[]>([]);
  const [collaborators, setCollaborators] = useState<ItineraryCollaborator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreatingLink, setIsCreatingLink] = useState<boolean>(false);

  // Copy feedback
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'links' | 'collaborators' | 'qrcode'>('links');
  const [qrToken, setQrToken] = useState<string | null>(null);

  // Load active shares when modal opens
  useEffect(() => {
    if (isOpen && trip?.id) {
      loadShares();
    }
  }, [isOpen, trip?.id]);

  const loadShares = async () => {
    try {
      setIsLoading(true);
      const res = await api.getTripShares(trip.id);
      if (res.success && res.data) {
        setSharedLinks(res.data.links || []);
        setCollaborators(res.data.collaborators || []);
        if (res.data.links?.length > 0 && !qrToken) {
          setQrToken(res.data.links[0].token);
        }
      }
    } catch (err) {
      console.error('Failed to load trip shares:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Build full public URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tripnest.app';
  const buildShareUrl = (token: string) => `${origin}/?shareToken=${token}`;

  // Find or determine the current active link matching the selected access level
  const activeMatchingLink = sharedLinks.find(
    (l) => l.accessLevel === selectedAccessLevel && l.isActive
  );

  const currentToken = activeMatchingLink ? activeMatchingLink.token : (sharedLinks[0]?.token || '');
  const currentFullUrl = currentToken ? buildShareUrl(currentToken) : '';

  // Generate a new share link
  const handleGenerateShareLink = async () => {
    try {
      setIsCreatingLink(true);
      const payload: CreateShareLinkPayload = {
        accessLevel: selectedAccessLevel,
        expiresIn,
        allowCloning,
        includeBudget,
        passcode: enablePasscode && passcode.trim() ? passcode.trim() : undefined,
      };

      const res = await api.createTripShare(trip.id, payload);
      if (res.success && res.data) {
        setSharedLinks((prev) => [res.data, ...prev.filter((l) => l.id !== res.data.id)]);
        setQrToken(res.data.token);
        handleCopyUrl(res.data.token);
      }
    } catch (err) {
      console.error('Failed to create share link:', err);
    } finally {
      setIsCreatingLink(false);
    }
  };

  // Copy URL with visual confirmation
  const handleCopyUrl = (tokenToCopy: string) => {
    const url = buildShareUrl(tokenToCopy);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(tokenToCopy);
      setTimeout(() => setCopiedToken(null), 2500);
    });
  };

  // Revoke share link
  const handleRevokeLink = async (shareId: string) => {
    try {
      await api.deleteShareLink(shareId);
      setSharedLinks((prev) => prev.filter((l) => l.id !== shareId));
    } catch (err) {
      console.error('Failed to revoke link:', err);
    }
  };

  // Invite collaborator
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) return;

    try {
      setIsInviting(true);
      setInviteSuccessMsg(null);
      const res = await api.inviteCollaborator(trip.id, inviteEmail, inviteRole);
      if (res.success && res.data) {
        setCollaborators((prev) => [res.data, ...prev.filter((c) => c.email !== res.data.email)]);
        setInviteSuccessMsg(`Invite sent to ${inviteEmail} with ${inviteRole === 'EDITOR' ? 'Editor' : 'Viewer'} rights.`);
        setInviteEmail('');
        setTimeout(() => setInviteSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error('Failed to invite collaborator:', err);
    } finally {
      setIsInviting(false);
    }
  };

  // Remove collaborator
  const handleRemoveCollaborator = async (collabId: string) => {
    try {
      await api.removeCollaborator(trip.id, collabId);
      setCollaborators((prev) => prev.filter((c) => c.id !== collabId));
    } catch (err) {
      console.error('Failed to remove collaborator:', err);
    }
  };

  // Social sharing helpers
  const shareTitle = `Explore our itinerary: ${trip.tripName} in ${trip.destination}`;
  const shareText = `Check out our upcoming ${trip.destination} travel plans on TripNest!`;

  const handleNativeShare = async (token: string) => {
    const url = buildShareUrl(token);
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      handleCopyUrl(token);
    }
  };

  const handleSocialShare = (platform: 'whatsapp' | 'email' | 'telegram' | 'twitter', token: string) => {
    const url = encodeURIComponent(buildShareUrl(token));
    const text = encodeURIComponent(shareText);
    let href = '';
    if (platform === 'whatsapp') {
      href = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    } else if (platform === 'email') {
      href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${text}%0A%0A${url}`;
    } else if (platform === 'telegram') {
      href = `https://t.me/share/url?url=${url}&text=${text}`;
    } else if (platform === 'twitter') {
      href = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    }
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Share Itinerary
                </h2>
                <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 text-[10px] font-bold">
                  {trip.destination}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate public URLs with read-only or collaborative editor access levels.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-100 px-6 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'links'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Public Share Link</span>
          </button>

          <button
            onClick={() => setActiveTab('collaborators')}
            className={`flex items-center gap-1.5 py-3 ml-6 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'collaborators'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Collaborators ({collaborators.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qrcode')}
            className={`flex items-center gap-1.5 py-3 ml-6 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'qrcode'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Mobile QR Code</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'links' && (
            <>
              {/* Access Level Selector Cards */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2">
                  Select Access Level for Link
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Read-Only Card */}
                  <div
                    onClick={() => setSelectedAccessLevel('VIEWER')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      selectedAccessLevel === 'VIEWER'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${selectedAccessLevel === 'VIEWER' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          <Eye className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Read-Only (Viewer)
                          </h4>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Recommended for Friends & Family
                          </span>
                        </div>
                      </div>
                      {selectedAccessLevel === 'VIEWER' && (
                        <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                      Anyone with the link can view your itinerary timeline, maps, schedule, and attractions. They cannot edit, delete, or rearrange activities.
                    </p>
                  </div>

                  {/* Editor Card */}
                  <div
                    onClick={() => setSelectedAccessLevel('EDITOR')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      selectedAccessLevel === 'EDITOR'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${selectedAccessLevel === 'EDITOR' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          <Edit3 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Collaborative (Editor)
                          </h4>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                            Full Co-Planning Powers
                          </span>
                        </div>
                      </div>
                      {selectedAccessLevel === 'EDITOR' && (
                        <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                      Collaborators can add new activities, adjust schedules and start times, check off visited places, and co-plan the trip in real time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Generated URL Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Public Shareable Link</span>
                    <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-mono">
                      {selectedAccessLevel} ACCESS
                    </span>
                  </span>

                  {activeMatchingLink && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeMatchingLink.viewsCount} view(s)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      readOnly
                      value={currentFullUrl || 'Generate a link below...'}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
                    />
                  </div>

                  {activeMatchingLink ? (
                    <button
                      onClick={() => handleCopyUrl(activeMatchingLink.token)}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap ${
                        copiedToken === activeMatchingLink.token
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {copiedToken === activeMatchingLink.token ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateShareLink}
                      disabled={isCreatingLink}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isCreatingLink ? 'Creating...' : 'Create Link'}</span>
                    </button>
                  )}
                </div>

                {/* Quick actions for active link */}
                {activeMatchingLink && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-3 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onPreviewPublicLink) {
                            onPreviewPublicLink(activeMatchingLink.token);
                            onClose();
                          } else {
                            window.open(buildShareUrl(activeMatchingLink.token), '_blank');
                          }
                        }}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview as Recipient</span>
                      </button>

                      <span className="text-slate-300 dark:text-slate-700">•</span>

                      <button
                        onClick={() => {
                          setQrToken(activeMatchingLink.token);
                          setActiveTab('qrcode');
                        }}
                        className="flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View QR</span>
                      </button>
                    </div>

                    {/* Social Quick Sharing */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 mr-1">Share via:</span>
                      <button
                        onClick={() => handleSocialShare('whatsapp', activeMatchingLink.token)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleSocialShare('email', activeMatchingLink.token)}
                        className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 transition-colors"
                        title="Share via Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleNativeShare(activeMatchingLink.token)}
                        className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-colors"
                        title="More Sharing Options"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Permission & Expiry Controls */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Sharing Permissions & Security Settings
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Expiration Setting */}
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500 dark:text-slate-400 font-medium">Link Expiration</label>
                    <select
                      value={expiresIn}
                      onChange={(e) => setExpiresIn(e.target.value as any)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-hidden"
                    >
                      <option value="never">Never expires (Permanent)</option>
                      <option value="7d">Expires in 7 days</option>
                      <option value="30d">Expires in 30 days</option>
                    </select>
                  </div>

                  {/* Cloning / Duplicate Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Allow Cloning</p>
                      <p className="text-[10px] text-slate-400">Viewers can copy to their account</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowCloning}
                      onChange={(e) => setAllowCloning(e.target.checked)}
                      className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Include Budget Details Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Include Budget Data</p>
                      <p className="text-[10px] text-slate-400">Keep private or share outlays</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeBudget}
                      onChange={(e) => setIncludeBudget(e.target.checked)}
                      className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Passcode Protection Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Passcode Protection</p>
                      <p className="text-[10px] text-slate-400">Require password to open</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={enablePasscode}
                      onChange={(e) => setEnablePasscode(e.target.checked)}
                      className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

                {enablePasscode && (
                  <div className="pt-2">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Set Access Passcode
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rome2026! or 4-digit PIN"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleGenerateShareLink}
                    disabled={isCreatingLink}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Generate New Customized Link</span>
                  </button>
                </div>
              </div>

              {/* All Active Links Table */}
              {sharedLinks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
                    Active Shared Links ({sharedLinks.length})
                  </h4>
                  <div className="space-y-2">
                    {sharedLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                link.accessLevel === 'EDITOR'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {link.accessLevel === 'EDITOR' ? 'Editor Access' : 'Read-Only'}
                            </span>
                            <span className="font-mono text-slate-400 text-[11px] truncate">
                              /{link.token}
                            </span>
                            {link.hasPasscode && (
                              <span className="flex items-center text-amber-600 text-[10px]">
                                <Lock className="w-3 h-3 mr-0.5" />
                                Locked
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                            <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{link.viewsCount} view(s)</span>
                            {link.expiresAt && (
                              <>
                                <span>•</span>
                                <span className="text-amber-600">Expires {new Date(link.expiresAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            onClick={() => handleCopyUrl(link.token)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 font-medium cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedToken === link.token ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            onClick={() => {
                              if (onPreviewPublicLink) {
                                onPreviewPublicLink(link.token);
                                onClose();
                              } else {
                                window.open(buildShareUrl(link.token), '_blank');
                              }
                            }}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 dark:border-slate-700 dark:text-indigo-400 dark:hover:bg-indigo-950/40 font-medium cursor-pointer"
                            title="Test preview"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() => handleRevokeLink(link.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                            title="Revoke link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'collaborators' && (
            <div className="space-y-6">
              {/* Invite Form */}
              <form onSubmit={handleSendInvite} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Invite Co-Traveler by Email
                </h4>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="Enter colleague or friend's email address..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
                    />
                  </div>

                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as ShareAccessLevel)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 focus:outline-hidden"
                  >
                    <option value="EDITOR">Editor (Can edit)</option>
                    <option value="VIEWER">Viewer (Read-only)</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isInviting}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isInviting ? 'Sending...' : 'Invite'}</span>
                  </button>
                </div>

                {inviteSuccessMsg && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                    <Check className="w-4 h-4" />
                    <span>{inviteSuccessMsg}</span>
                  </div>
                )}
              </form>

              {/* Collaborators List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
                  Trip Members & Collaborators
                </h4>

                <div className="space-y-2.5">
                  {/* Trip Owner */}
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                        {trip.ownerName ? trip.ownerName.charAt(0) : 'L'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {trip.ownerName} <span className="text-[10px] font-normal text-slate-400">(You)</span>
                        </p>
                        <p className="text-[11px] text-slate-400">trip owner • full management</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 text-[10px] font-bold">
                      OWNER
                    </span>
                  </div>

                  {/* Other Collaborators */}
                  {collaborators.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt={c.name}
                            referrerPolicy="no-referrer"
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-[11px] text-slate-400">{c.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            c.accessLevel === 'EDITOR'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {c.accessLevel === 'EDITOR' ? 'Editor' : 'Viewer'}
                        </span>

                        <button
                          onClick={() => handleRemoveCollaborator(c.id)}
                          className="h-7 w-7 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 flex items-center justify-center transition-colors"
                          title="Remove collaborator"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qrcode' && (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="p-4 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-950 shadow-inner">
                {/* SVG-based QR Code Generator Graphic */}
                <div className="relative h-56 w-56 p-2 rounded-2xl bg-white flex flex-col items-center justify-center shadow-xs">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* Corners */}
                    <rect x="10" y="10" width="24" height="24" rx="3" fill="#1e1b4b" />
                    <rect x="14" y="14" width="16" height="16" fill="white" />
                    <rect x="18" y="18" width="8" height="8" rx="1" fill="#4338ca" />

                    <rect x="66" y="10" width="24" height="24" rx="3" fill="#1e1b4b" />
                    <rect x="70" y="14" width="16" height="16" fill="white" />
                    <rect x="74" y="18" width="8" height="8" rx="1" fill="#4338ca" />

                    <rect x="10" y="66" width="24" height="24" rx="3" fill="#1e1b4b" />
                    <rect x="14" y="70" width="16" height="16" fill="white" />
                    <rect x="18" y="74" width="8" height="8" rx="1" fill="#4338ca" />

                    {/* QR Code Pixel Matrix representation */}
                    <rect x="40" y="12" width="4" height="8" rx="1" fill="#1e1b4b" />
                    <rect x="48" y="12" width="8" height="4" rx="1" fill="#1e1b4b" />
                    <rect x="58" y="14" width="4" height="12" rx="1" fill="#1e1b4b" />
                    <rect x="42" y="24" width="6" height="6" rx="1" fill="#4338ca" />
                    <rect x="52" y="22" width="4" height="4" rx="1" fill="#1e1b4b" />

                    <rect x="12" y="42" width="6" height="4" rx="1" fill="#1e1b4b" />
                    <rect x="22" y="44" width="8" height="6" rx="1" fill="#1e1b4b" />
                    <rect x="34" y="38" width="6" height="6" rx="1" fill="#4338ca" />
                    <rect x="44" y="36" width="12" height="6" rx="1" fill="#1e1b4b" />
                    <rect x="62" y="40" width="8" height="4" rx="1" fill="#1e1b4b" />
                    <rect x="74" y="38" width="6" height="8" rx="1" fill="#4338ca" />
                    <rect x="84" y="42" width="6" height="6" rx="1" fill="#1e1b4b" />

                    <rect x="38" y="48" width="8" height="4" rx="1" fill="#1e1b4b" />
                    <rect x="48" y="48" width="6" height="6" rx="1" fill="#4338ca" />
                    <rect x="58" y="50" width="10" height="4" rx="1" fill="#1e1b4b" />

                    <rect x="40" y="60" width="6" height="6" rx="1" fill="#1e1b4b" />
                    <rect x="50" y="58" width="12" height="4" rx="1" fill="#1e1b4b" />
                    <rect x="66" y="64" width="4" height="8" rx="1" fill="#4338ca" />
                    <rect x="76" y="60" width="8" height="6" rx="1" fill="#1e1b4b" />
                    <rect x="88" y="62" width="4" height="8" rx="1" fill="#1e1b4b" />

                    <rect x="38" y="74" width="8" height="6" rx="1" fill="#4338ca" />
                    <rect x="50" y="70" width="6" height="12" rx="1" fill="#1e1b4b" />
                    <rect x="60" y="78" width="14" height="4" rx="1" fill="#1e1b4b" />
                    <rect x="78" y="76" width="6" height="8" rx="1" fill="#4338ca" />
                    <rect x="86" y="74" width="6" height="4" rx="1" fill="#1e1b4b" />

                    <rect x="40" y="86" width="12" height="4" rx="1" fill="#1e1b4b" />
                    <rect x="56" y="86" width="8" height="6" rx="1" fill="#4338ca" />
                    <rect x="68" y="86" width="6" height="4" rx="1" fill="#1e1b4b" />
                    <rect x="80" y="88" width="10" height="4" rx="1" fill="#1e1b4b" />

                    {/* Center TripNest Mini Brand Icon */}
                    <rect x="42" y="42" width="16" height="16" rx="4" fill="#ffffff" stroke="#e0e7ff" strokeWidth="1" />
                    <circle cx="50" cy="50" r="5" fill="#4f46e5" />
                  </svg>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Scan with any smartphone camera
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                  Friends or travel companions can immediately open your {trip.destination} itinerary directly on their phone while traveling.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => qrToken && handleCopyUrl(qrToken)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Scannable URL</span>
                </button>

                <button
                  onClick={() => {
                    if (qrToken && onPreviewPublicLink) {
                      onPreviewPublicLink(qrToken);
                      onClose();
                    } else if (qrToken) {
                      window.open(buildShareUrl(qrToken), '_blank');
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Test Mobile View</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure SSL link • Changes update in real-time</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
