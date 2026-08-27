'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';

interface Dining { id: string; name: string; category: string; level: string | null; cuisine: string | null; menu: MenuItem[]; }
interface MenuItem { id: string; name: string; description: string | null; priceUsd: number; prepMin: number | null; category: string | null; }
interface Order { id: string; diningId: string; totalUsd: number; mode: string; status: string; }

const DINING_LEVELS: Record<string, string> = {
  luxury: 'Luxury',
  premium: 'Premium',
  casual: 'Casual',
  fastfood: 'Fast Food',
};

export default function AirportDiningPage() {
  const { t } = useI18n();
  const [dining, setDining] = useState<Dining[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [activeDining, setActiveDining] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [userId] = useState('usr_test001');

  const load = useCallback(async () => {
    const [d, o] = await Promise.all([
      fetch('/api/airport/menus?airportId=apt_fih').then(r => r.ok ? r.json() : { data: [] }),
      fetch(`/api/airport/food-orders?userId=${userId}`).then(r => r.ok ? r.json() : { data: [] }),
    ]);
    setDining(d.data || []);
    setOrders(o.data || []);
    if (!activeDining && (d.data || [])[0]) setActiveDining((d.data as Dining[])[0].id);
    setLoading(false);
  }, [userId, activeDining]);
  useEffect(() => { load(); }, [load]);

  const add = (id: string) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const remove = (id: string) => setCart(c => {
    const n = (c[id] || 0) - 1;
    if (n <= 0) { const { [id]: _, ...rest } = c; return rest; }
    return { ...c, [id]: n };
  });

  const cartItems = Object.entries(cart);
  const total = cartItems.reduce((sum: number, [id, qty]: [string, number]) => {
    const item = dining.flatMap(d => d.menu).find((m: MenuItem) => m.id === id);
    return sum + (item ? item.priceUsd * qty : 0);
  }, 0);

  const place = async () => {
    if (cartItems.length === 0 || !activeDining) return;
    setPlacing(true);
    try {
      const items = cartItems.map(([id, qty]) => ({ itemId: id, qty }));
      const res = await fetch('/api/airport/food-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, diningId: activeDining, items, totalUsd: total }),
      });
      if (res.ok) { setCart({}); await load(); }
    } finally { setPlacing(false); }
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
          <h1 className="text-sm font-display font-bold text-[#0B2545]">Food & Beverage</h1>
          <span className="w-12" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--max-width-content)] px-4 py-6 sm:px-6 sm:py-8 pb-24">
        {loading ? (
          <div className="space-y-2">
            <div className="h-24 rounded-xl bg-[#F1EDE7] animate-pulse" />
            <div className="h-24 rounded-xl bg-[#F1EDE7] animate-pulse" />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {dining.map(d => (
                <div key={d.id} className="rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <button type="button" onClick={() => setActiveDining(d.id)} className="flex w-full items-center justify-between">
                    <div className="text-left">
                      <p className="font-display text-sm font-bold text-[#0B2545]">{d.name}</p>
                      <p className="text-xs text-[#7D7A74]">
                        {d.cuisine} · {DINING_LEVELS[d.level || ''] || d.level}
                        {d.category !== 'restaurant' ? ` · ${d.category}` : ''}
                      </p>
                    </div>
                    {activeDining === d.id && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF37]">
                          <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-[#0B2545]">Order</span>
                      </div>
                    )}
                  </button>
                  {activeDining === d.id && (
                    <div className="mt-3 space-y-2 border-t border-[#E2DFD9] pt-3">
                      {d.menu.map(m => (
                        <div key={m.id} className="flex items-center justify-between py-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-display text-sm font-semibold text-[#0B2545]">{m.name}</p>
                              <p className="text-sm font-bold text-[#0B2545]">${m.priceUsd}</p>
                            </div>
                            {m.description && (
                              <p className="text-xs text-[#7D7A74]">
                                {m.description}
                                {m.prepMin ? ` · ${m.prepMin}min` : ''}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {cart[m.id] ? (
                              <>
                                <button
                                  onClick={() => remove(m.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B2545]/10 text-[#0B2545] transition-colors hover:bg-[#0B2545]/20"
                                  aria-label="Remove item"
                                >
                                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                </button>
                                <span className="w-6 text-center text-sm font-bold text-[#0B2545]">{cart[m.id]}</span>
                              </>
                            ) : null}
                            <button
                              onClick={() => add(m.id)}
                              className="flex h-7 w-10 items-center justify-center rounded-lg bg-[#0B2545] px-2 text-xs font-semibold text-white transition-all hover:bg-[#081A33]"
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm">
                <p className="font-display text-sm font-bold text-[#0B2545]">Your Order</p>
                {cartItems.length === 0 ? (
                  <p className="mt-2 text-xs text-[#7D7A74]">Select items to order.</p>
                ) : (
                  <>
                    <div className="mt-2 space-y-1">
                      {cartItems.map(([id, qty]) => {
                        const item = dining.flatMap(d => d.menu).find((m: MenuItem) => m.id === id);
                        return (
                          <p key={id} className="flex justify-between text-xs">
                            <span className="text-[#7D7A74]">{item?.name} ×{qty}</span>
                            <span className="font-medium text-[#0B2545]">
                              ${((item?.priceUsd || 0) * qty).toFixed(2)}
                            </span>
                          </p>
                        );
                      })}
                    </div>
                    <p className="mt-2 flex justify-between border-t border-[#E2DFD9] pt-2 text-sm font-bold text-[#0B2545]">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </p>
                    <button
                      onClick={place}
                      disabled={placing}
                      className="mt-3 w-full rounded-xl bg-[#0B2545] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#081A33] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {placing ? 'Placing…' : 'Place Order'}
                    </button>
                  </>
                )}
              </div>

              {orders.length > 0 && (
                <div className="rounded-xl border border-[#E2DFD9] bg-white p-4 shadow-sm">
                  <p className="font-display text-sm font-bold text-[#0B2545]">Recent Orders</p>
                  <div className="mt-2 space-y-1">
                    {orders.map(o => (
                      <div key={o.id} className="flex justify-between text-xs">
                        <span className="text-[#7D7A74]">${o.totalUsd} · {o.mode}</span>
                        <span className={`font-medium ${
                          o.status === 'completed' ? 'text-[#1B4D2E]'
                            : o.status === 'confirmed' ? 'text-[#9A5B3C]'
                            : 'text-[#7D7A74]'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
