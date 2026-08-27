'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Msg { role: 'user' | 'bot'; text: string; live?: boolean; }

function answer(qRaw: string): { text: string; live: boolean } {
  const q = qRaw.toLowerCase();
  if (q.includes('gate') || q.includes('where is')) {
    return { text: 'Gates are organized by terminal. Use the Airport Maps section to find your gate, security, lounges, and amenities. (General guidance — live gate data syncs from Flight Status when available.)', live: false };
  }
  if (q.includes('boarding') || q.includes('remind')) {
    return { text: 'Boarding typically begins 45 minutes before departure. Enable notifications on the Flight Status page to receive live boarding reminders.', live: false };
  }
  if (q.includes('restaurant') || q.includes('eat') || q.includes('food')) {
    return { text: 'Kinshasa Grill (Congolese) and Cafe Congo are open in the terminal. Browse menus and pre-order in the Food & Beverage section.', live: false };
  }
  if (q.includes('lounge')) {
    return { text: 'Star Alliance Lounge (T1, L3) and Congo Executive Lounge (T2, L2) are available. Book via the Lounges section from $35.', live: false };
  }
  if (q.includes('transport') || q.includes('taxi') || q.includes('ride')) {
    return { text: 'Taxi, Yango ride-share, bus, metro, and hotel shuttles serve the airport. Book a private or shared transfer in the Transportation section.', live: false };
  }
  if (q.includes('baggage') || q.includes('luggage')) {
    return { text: 'You can track baggage, buy extra allowance, or report delayed/lost bags in the Baggage section. Allowance depends on your cabin class and airline.', live: false };
  }
  if (q.includes('wheelchair') || q.includes('access') || q.includes('assist')) {
    return { text: 'Wheelchair, elderly, child, and interpreter assistance can be requested in the Assistance section. These are confirmed by partner providers.', live: false };
  }
  if (q.includes('wifi')) {
    return { text: 'Connect to "CongoConnect-Free" and accept the terms. A free tier is available with optional upgrades.', live: false };
  }
  if (q.includes('visa') || q.includes('embassy') || q.includes('passport')) {
    return { text: 'The Embassy Desk and airline support are listed in Emergency Services. Verify entry requirements with your embassy before travel.', live: false };
  }
  return { text: 'I can help with gates, boarding, restaurants, lounges, transport, baggage, accessibility, and Wi-Fi. Ask me anything about your airport journey. Responses marked "General" are guidance; live data appears on the relevant service pages.', live: false };
}

const SUGGESTIONS = ['Where is my gate?', 'When does boarding start?', 'Recommend a restaurant', 'How do I book a lounge?', 'I need wheelchair assistance'];

export default function AirportAssistantPage() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'bot', text: 'Bonjour! I\'m your CongoConnect Airport Assistant. How can I help you today?', live: false },
  ]);
  const [input, setInput] = useState('');

  const send = (text: string) => {
    if (!text.trim()) return;
    const { text: reply, live } = answer(text);
    setMessages(m => [...m, { role: 'user', text }, { role: 'bot', text: reply, live }]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <div className="sticky top-16 z-30 border-b border-[#E2DFD9] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[var(--max-width-content)] items-center justify-between px-4 py-3">
          <Link href="/airport" className="flex items-center gap-1.5 text-sm text-[#7D7A74] hover:text-[#0B2545] transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Airport
          </Link>
          <h1 className="text-sm font-display font-bold text-[#0B2545]">AI Airport Assistant</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto flex max-w-[var(--max-width-content)] flex-col px-4 py-4 pb-24" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'bg-[#0B2545] text-white'
                  : 'bg-[#F1EDE7] text-[#1A1A18]'
              }`}>
                {m.text}
                {m.role === 'bot' && (
                  <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    m.live ? 'bg-[#0B2545]/10 text-[#0B2545]' : 'bg-white/50 text-[#7D7A74]'
                  }`}>
                    {m.live ? '● Live' : 'General'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-[#E2DFD9] bg-[#F1EDE7] px-3 py-1 text-xs font-medium text-[#7D7A74] transition-all hover:bg-white hover:border-[#0B2545]/20"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Ask about your airport journey…"
              className="w-full rounded-xl border border-[#E2DFD9] bg-white pl-10 pr-4 py-3 text-sm text-[#1A1A18] placeholder:text-[#7D7A74]/60 shadow-sm focus:outline-none focus:border-[#0B2545] focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
            />
          </div>
          <button
            onClick={() => send(input)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B2545] text-white shadow-sm transition-all hover:bg-[#081A33] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
