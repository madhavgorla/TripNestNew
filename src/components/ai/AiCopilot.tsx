import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Plus,
  ArrowRight,
  Bot,
  User,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { api } from '../../services/api';
import { AIProposalAction } from '../../types';

interface AiCopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  actions?: AIProposalAction[];
  timestamp: string;
}

export const AiCopilot: React.FC<AiCopilotProps> = ({ isOpen, onClose }) => {
  const { activeTrip, applyAiProposal } = useTrip();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I am **TripNest AI Copilot**. I have full context of your journey to **${activeTrip?.destination || 'your destination'}** (Budget: ${activeTrip?.currency} ${activeTrip?.budget}, ${activeTrip?.travelers} travelers).\n\nAsk me anything or pick a quick suggestion below:`,
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appliedActionIds, setAppliedActionIds] = useState<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const quickPrompts = [
    `Optimize my ${activeTrip?.destination || 'Rome'} itinerary to save money`,
    `Suggest hidden gem restaurants in ${activeTrip?.destination || 'Rome'}`,
    `Suggest packing list for ${activeTrip?.destination || 'Bali'} in October`,
    `Add an authentic evening cultural food walk`,
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const res = await api.sendAiChat(query, activeTrip?.id || 'trip-rome-2026', messages);
      if (res.success && res.data) {
        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: res.data.reply,
          actions: res.data.actions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ai',
          text: 'I encountered an issue connecting with the AI engine. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAction = async (action: AIProposalAction) => {
    const success = await applyAiProposal(action);
    if (success) {
      setAppliedActionIds((prev) => [...prev, action.id]);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>TripNest AI Copilot</span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                Gemini 3.8
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Synced with {activeTrip?.tripName || 'Active Trip'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 text-slate-800 border border-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700/60'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Action Buttons if proposed by AI */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-slate-200/60 pt-2.5 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Suggested Actions
                  </p>
                  {msg.actions.map((act) => {
                    const isApplied = appliedActionIds.includes(act.id);
                    return (
                      <div
                        key={act.id}
                        className="rounded-xl border border-indigo-200 bg-white p-2.5 dark:border-indigo-900/60 dark:bg-slate-900/80 shadow-xs"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">{act.label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{act.description}</p>
                        <button
                          type="button"
                          disabled={isApplied}
                          onClick={() => handleApplyAction(act)}
                          className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                            isApplied
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Applied to Trip!</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" />
                              <span>Apply to Itinerary</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400 w-fit">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>Analyzing trip context & generating suggestions...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          Quick Inquiries
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 whitespace-nowrap hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask AI Copilot for advice, restaurants, packing..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
