import React, { useState } from 'react';
import { Users, Mail, UserPlus, Shield, Check, Copy, Share2, Sparkles } from 'lucide-react';
import { useTrip } from '../../context/TripContext';

export const GroupManager: React.FC = () => {
  const { group, inviteMember, activeTrip } = useTrip();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Owner' | 'Admin' | 'Member'>('Member');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const ok = await inviteMember(inviteEmail, inviteRole);
      if (ok) {
        setNotice(`Invitation sent successfully to ${inviteEmail}`);
        setInviteEmail('');
        setTimeout(() => setNotice(null), 4000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Group Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-700">
              <img
                src={group?.imageUrl || activeTrip?.coverImage || '/src/assets/images/hero_travel_workspace_1790172750348.jpg'}
                alt={group?.name || 'Travel Group'}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {group?.name || `${activeTrip?.tripName || 'Journey'} Travel Squad`}
                </h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  {group?.members.length || 1} Members
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                {group?.description || 'Collaborative itinerary planning, shared expenses, and realtime trip synchronization.'}
              </p>
            </div>
          </div>

          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Invite Link Copied!' : 'Share Invite Link'}</span>
          </button>
        </div>

        {/* Invite Form */}
        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="colleague@tripnest.com or friend's email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
              />
            </div>

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'Owner' | 'Admin' | 'Member')}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
            >
              <option value="Member">Role: Member (Can add activities)</option>
              <option value="Admin">Role: Admin (Can edit trip budget)</option>
              <option value="Owner">Role: Owner (Co-owner)</option>
            </select>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Send Invite</span>
            </button>
          </form>

          {notice && (
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
              {notice}
            </p>
          )}
        </div>
      </div>

      {/* Members List */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Group Members</h3>
          <p className="text-xs text-slate-500">Collaborators with access to this trip</p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(group?.members || [
            {
              userId: 'usr-1',
              name: 'Lara Croft',
              email: 'lara@tripnest.com',
              avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
              role: 'Owner',
              joinedAt: '2026-02-01',
            },
            {
              userId: 'usr-2',
              name: 'Madhav Sharma',
              email: 'madhav@tripnest.com',
              avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
              role: 'Admin',
              joinedAt: '2026-02-02',
            },
          ]).map((member) => (
            <div key={member.userId} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-xl object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{member.name}</p>
                  <p className="text-[11px] text-slate-500">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                    member.role === 'Owner'
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : member.role === 'Admin'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {member.role}
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Joined {member.joinedAt?.split('T')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
