'use client';

// Fields used: userProfile.name; AIChatMessage.id, sender, text, timestamp, dataOrigin;
// conversation list/id; suggested prompt chips; typing indicator.

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, AIChatMessage } from '@/types';
import { OriginBadge } from '../common/OriginBadge';
import { Bot, Sparkles, Send, Trash2 } from 'lucide-react';

interface AICoachViewProps {
  userProfile: UserProfile;
}

const defaultPrompts = [
  'How do I break through a bench press plateau?',
  'What should I eat 1 hour before a heavy leg day?',
  'How should I adjust macros on active rest days?',
  'Explain the difference between RPE 8 and RPE 9.5 for hypertrophy.',
];

export const AICoachView: React.FC<AICoachViewProps> = ({ userProfile }) => {
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(defaultPrompts);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    fetch('/api/ai/conversations')
      .then((res) => res.json())
      .then((json) => {
        const latest = json.data?.items?.[0];
        if (!latest) {
          setMessages([
            {
              id: 'msg-init',
              sender: 'ai',
              text: `Hi ${userProfile.name.split(' ')[0]}. Ask about training, nutrition timing, or recovery. I will use your logged scans, food log, and workouts — I will not invent measurements.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              dataOrigin: 'AI_RECOMMENDATION',
            },
          ]);
          return;
        }
        setConversationId(latest.id);
        setMessages(latest.messages || []);
      })
      .catch(() => undefined);
  }, [userProfile.name]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isTyping) return;

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Coach unavailable');
      setConversationId(json.data.conversationId);
      setMessages((prev) => [...prev, json.data.message]);
      if (json.data.suggestedPrompts?.length) {
        setSuggestedPrompts(json.data.suggestedPrompts);
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unable to reach the coach.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (conversationId) {
      await fetch(`/api/ai/conversations/${conversationId}`, { method: 'DELETE' });
    }
    setConversationId(undefined);
    setSuggestedPrompts(defaultPrompts);
    setMessages([
      {
        id: 'msg-init',
        sender: 'ai',
        text: `FitForge AI Coach memory refreshed. Ask about biomechanics, nutrition timing, recovery, or exercise execution using your logged data.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataOrigin: 'AI_RECOMMENDATION',
      },
    ]);
  };

  return (
    <div
      id="ai-coach-view"
      className="bg-[#12161A] border border-[#252B30] rounded-2xl flex flex-col h-[calc(100vh-140px)] min-h-[580px] animate-in fade-in"
    >
      <div className="p-4 md:p-5 border-b border-[#252B30] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B8F34A] to-[#8EE020] text-[#0B0D0F] flex items-center justify-center shadow-[0_0_15px_rgba(184,243,74,0.3)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                FitForge AI Head Coach
              </h2>
              <span className="w-2 h-2 rounded-full bg-[#45D483] animate-pulse" />
            </div>
            <p className="text-xs text-[#9AA3A0]">
              CSCS Biomechanics & Sports Nutrition Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OriginBadge origin="AI_RECOMMENDATION" />
          <button
            type="button"
            onClick={() => void handleClearHistory()}
            className="p-2 rounded-xl bg-[#181D22] border border-[#252B30] text-[#9AA3A0] hover:text-white"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar space-y-4">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-[#B8F34A]/20 border border-[#B8F34A]/40 text-[#B8F34A] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isAI
                    ? 'bg-[#181D22] border border-[#252B30] text-[#F5F7F2]'
                    : 'bg-[#B8F34A] text-[#0B0D0F] font-medium'
                }`}
              >
                {isAI && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#252B30]/60 text-[10px] text-[#9AA3A0]">
                    <span className="font-bold text-[#B8F34A] uppercase tracking-wider">
                      FitForge AI Intelligence
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}

                <div className="whitespace-pre-line">{msg.text}</div>

                {!isAI && (
                  <div className="text-right text-[10px] text-[#0B0D0F]/70 mt-1">
                    {msg.timestamp}
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-xl bg-[#181D22] border border-[#252B30] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  {userProfile.name.charAt(0)}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-[#B8F34A]/20 border border-[#B8F34A]/40 text-[#B8F34A] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#181D22] border border-[#252B30] px-4 py-3 rounded-2xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B8F34A] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#B8F34A] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#B8F34A] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        {errorMsg ? <p className="text-xs text-[#F05D5E]">{errorMsg}</p> : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2 bg-[#0B0D0F]/40 border-t border-[#252B30] flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-[10px] uppercase font-bold text-[#9AA3A0] shrink-0">Suggested:</span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => void handleSend(p)}
            className="px-3 py-1 rounded-xl bg-[#181D22] border border-[#252B30] hover:border-[#B8F34A]/50 text-[#9AA3A0] hover:text-white text-xs whitespace-nowrap transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="p-3 md:p-4 bg-[#12161A] border-t border-[#252B30]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            id="input-ai-coach-chat"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your coach anything (e.g. Form check, macro split, recovery)..."
            className="flex-1 bg-[#0B0D0F] border border-[#252B30] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-[#9AA3A0]/50 focus:border-[#B8F34A] outline-none"
          />
          <button
            id="btn-send-ai-coach"
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-5 py-3 rounded-xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_15px_rgba(184,243,74,0.3)] disabled:opacity-40 transition-all"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
