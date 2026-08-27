'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

interface CargoEvent {
  id: string;
  status: string;
  location: string;
  note?: string;
  createdAt: string;
}

interface CargoShipment {
  id: string;
  trackingNo: string;
  status: string;
  origin: string;
  destination: string;
  weightKg: number;
  contents: string;
  senderName: string;
  recipientName: string;
  shippedAt?: string;
  etaAt?: string;
  deliveredAt?: string;
  events: CargoEvent[];
}

const STATUS_LABELS: Record<string, string> = {
  booked: 'Booked',
  in_transit: 'In Transit',
  customs: 'Customs',
  delayed: 'Delayed',
  delivered: 'Delivered',
  pending: 'Pending',
};

const STATUS_STEPS = ['booked', 'in_transit', 'customs', 'delivered'];

function StatusStep({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
        completed ? 'bg-[#1B4D2E]'
        : active ? 'bg-[#0B2545]'
        : 'bg-[#E2DFD9]'
      }`} />
      <span className={`text-xs font-medium transition-colors duration-200 ${
        active ? 'text-[#0B2545]'
        : completed ? 'text-[#1B4D2E]'
        : 'text-[#7D7A74]'
      }`}>
        {label}
      </span>
    </div>
  );
}

function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc: string; action?: { label: string; href: string } }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#E2DFD9] py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0B2545]/5 mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="font-display text-base font-bold text-[#0B2545]">{title}</h3>
      <p className="mt-1 text-xs text-[#7D7A74]">{desc}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0B2545] px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#081A33] hover:shadow-md"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export default function CargoPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'track' | 'new'>('track');
  const [trackingNo, setTrackingNo] = useState('');
  const [shipment, setShipment] = useState<CargoShipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastTracked, setLastTracked] = useState('');

  const [form, setForm] = useState({
    trackingNo: '',
    origin: '',
    destination: '',
    weightKg: '',
    contents: '',
    senderName: '',
    senderPhone: '',
    recipientName: '',
    recipientPhone: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');

  const trackShipment = useCallback(async () => {
    if (!trackingNo.trim()) {
      setError('Please enter a tracking number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`/api/cargo/track?trackingNo=${encodeURIComponent(trackingNo.trim())}`);
      if (!r.ok) throw new Error('Not found');
      const data = await r.json();
      if (!data.cargo) throw new Error('Not found');
      setShipment(data.cargo);
      setLastTracked(trackingNo.trim());
    } catch {
      setShipment(null);
      setError('Shipment not found. Check the tracking number and try again.');
    } finally {
      setLoading(false);
    }
  }, [trackingNo]);

  const handleBook = async () => {
    if (!form.trackingNo || !form.origin || !form.destination) {
      setBookingSuccess('Please fill in all required fields');
      return;
    }
    setBookingLoading(true);
    setBookingSuccess('');
    try {
      const r = await fetch('/api/cargo/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNo: form.trackingNo,
          origin: form.origin,
          destination: form.destination,
          weightKg: Number(form.weightKg) || 0,
          contents: form.contents || 'General cargo',
          senderName: form.senderName || 'Anonymous',
          senderPhone: form.senderPhone || '',
          recipientName: form.recipientName || 'Recipient',
          recipientPhone: form.recipientPhone || '',
        }),
      });
      if (!r.ok) throw new Error('Failed');
      const data = await r.json();
      setBookingSuccess(`Booking created! Tracking: ${data.cargo?.trackingNo || form.trackingNo}`);
      setForm({
        trackingNo: '', origin: '', destination: '', weightKg: '', contents: '',
        senderName: '', senderPhone: '', recipientName: '', recipientPhone: '',
      });
    } catch {
      setBookingSuccess('Could not create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 text-center">
        <div className="mx-auto h-1 w-24 rounded-full bg-[#D4AF37] mb-3" />
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0B2545]">
          {t('cargo.title') || 'Cargo Tracking'}
        </h1>
        <p className="mt-3 max-w-xl text-base text-[#7D7A74]">
          {t('cargo.desc') || 'Track your shipments across the DRC and beyond. Real-time status updates from pickup to delivery.'}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex rounded-xl bg-[#FAF8F3] p-1 text-sm">
        <button
          onClick={() => setTab('track')}
          className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition-all duration-200 ${
            tab === 'track'
              ? 'bg-white shadow-sm shadow-black/5 text-[#0B2545] border border-[#E2DFD9]'
              : 'text-[#7D7A74] hover:bg-white/50'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 13.5 3a7.5 7.5 0 0 0 7.5 7.5Z" />
            </svg>
            {t('cargo.trackTab') || 'Track'}
          </span>
        </button>
        <button
          onClick={() => setTab('new')}
          className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition-all duration-200 ${
            tab === 'new'
              ? 'bg-white shadow-sm shadow-black/5 text-[#0B2545] border border-[#E2DFD9]'
              : 'text-[#7D7A74] hover:bg-white/50'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0a3 3 0 1 0 3-3m-3 3a3 3 0 1 1-3-3m3 3a3 3 0 1 1-3-3m3 3a3 3 0 1 0 3-3" />
            </svg>
            {t('cargo.bookTab') || 'New Booking'}
          </span>
        </button>
      </div>

      {/* Track tab */}
      {tab === 'track' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E2DFD9] bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="text-sm font-medium text-[#0B2545]">
                {t('cargo.trackingNo') || 'Tracking Number'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingNo}
                  onChange={(e) => setTrackingNo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && trackShipment()}
                  placeholder="e.g. CARGO-001"
                  className="flex-1 rounded-xl border border-[#E2DFD9] bg-[#FAF8F3] px-4 py-2.5 text-sm text-[#1A1A18] placeholder-[#A3A09A] ring-1 ring-[#E2DFD9] focus:border-[#0B2545] focus:outline-none focus:ring-[0_0_0_3px_rgba(11,37,69,0.08)] transition-all"
                />
                <button
                  onClick={trackShipment}
                  disabled={loading}
                  className="shrink-0 rounded-xl bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#081A33] hover:shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4" />
                      </svg>
                      Tracking...
                    </span>
                  ) : (
                    t('cargo.track') || 'Track'
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-[#F5C6A7] bg-[#FEF3EC] p-4 text-sm text-[#9A5B3C]">
              {error}
            </div>
          )}

          {shipment && (
            <div className="space-y-5">
              {/* Status card */}
              <div className="rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        shipment.status === 'delivered' ? 'bg-[#E8F3EC] text-[#1B4D2E]'
                        : shipment.status === 'delayed' ? 'bg-[#FEF3EC] text-[#9A5B3C]'
                        : shipment.status === 'in_transit' ? 'bg-[#E0E7F3] text-[#0B2545]'
                        : 'bg-[#F5E7C7] text-[#8E6D14]'
                      }`}>
                        {STATUS_LABELS[shipment.status] || shipment.status}
                      </span>
                      <span className="text-xs text-[#7D7A74]">
                        {shipment.events?.length || 0} events
                      </span>
                    </div>
                    <h2 className="mt-2 font-display text-xl font-bold text-[#0B2545]">
                      {shipment.trackingNo}
                    </h2>
                    <p className="mt-0.5 text-sm text-[#7D7A74]">
                      {shipment.origin} → {shipment.destination}
                    </p>
                  </div>
                  {shipment.deliveredAt && (
                    <div className="shrink-0 rounded-lg bg-[#E8F3EC] px-3 py-1.5 text-xs font-medium text-[#1B4D2E]">
                      Delivered
                    </div>
                  )}
                </div>

                {/* Quick stats */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="rounded-lg bg-[#FAF8F3] px-3 py-2 text-center">
                    <p className="text-xs text-[#7D7A74]">Weight</p>
                    <p className="text-sm font-semibold text-[#0B2545]">{shipment.weightKg} kg</p>
                  </div>
                  <div className="rounded-lg bg-[#FAF8F3] px-3 py-2 text-center">
                    <p className="text-xs text-[#7D7A74]">Contents</p>
                    <p className="text-sm font-semibold text-[#0B2545] truncate max-w-[120px]">{shipment.contents}</p>
                  </div>
                  {shipment.etaAt && (
                    <div className="rounded-lg bg-[#F5E7C7] px-3 py-2 text-center">
                      <p className="text-xs text-[#7D7A74]">ETA</p>
                      <p className="text-sm font-semibold text-[#8E6D14]">{new Date(shipment.etaAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status timeline */}
              <div className="rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-sm">
                <h3 className="font-display text-sm font-bold text-[#0B2545]">
                  {t('cargo.statusTimeline') || 'Status Timeline'}
                </h3>
                <div className="mt-4 flex items-center justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const isCompleted = shipment.events?.some((e) =>
                      e.status === step ||
                      (step === 'in_transit' && ['booked', 'in_transit'].includes(e.status)) ||
                      (step === 'customs' && ['booked', 'in_transit', 'customs'].includes(e.status))
                    );
                    const isCurrent = shipment.status === step ||
                      (step === 'in_transit' && ['booked', 'in_transit'].includes(shipment.status)) ||
                      (step === 'customs' && ['booked', 'in_transit', 'customs'].includes(shipment.status));
                    const completed = i < STATUS_STEPS.indexOf(shipment.status) || shipment.status === 'delivered';

                    return (
                      <div key={step} className="flex-1">
                        <StatusStep
                          label={STATUS_LABELS[step] || step}
                          active={isCurrent}
                          completed={completed}
                        />
                        {i < STATUS_STEPS.length - 1 && (
                          <div className="mt-0.5 h-0.5 flex-1 bg-[#E2DFD9]">
                            <div className={`h-full transition-all duration-300 ${
                              completed ? 'bg-[#1B4D2E]' : ''
                            }`} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Event list */}
                {shipment.events && shipment.events.length > 0 && (
                  <div className="mt-5 space-y-2">
                    {shipment.events.slice().reverse().map((event) => (
                      <div key={event.id} className="flex gap-3 rounded-xl bg-[#FAF8F3] p-3">
                        <div className={`mt-0.5 shrink-0 h-2 w-2 rounded-full transition-colors ${
                          event.status === shipment.status ? 'bg-[#0B2545]'
                          : event.status === 'delivered' ? 'bg-[#1B4D2E]'
                          : 'bg-[#E2DFD9]'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#0B2545]">
                            {STATUS_LABELS[event.status] || event.status}
                            {event.note && ` — ${event.note}`}
                          </p>
                          <p className="text-xs text-[#7D7A74] mt-0.5">
                            {new Date(event.createdAt).toLocaleString()}
                            {event.location && ` · ${event.location}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!shipment && !loading && !error && (
            <EmptyState
              icon="📦"
              title={t('cargo.emptyTitle') || 'Enter a tracking number'}
              desc={t('cargo.emptyDesc') || 'Track any shipment by entering its tracking number above.'}
              action={{ label: t('cargo.trackNew') || 'Track Now', href: '#' }}
            />
          )}

          {lastTracked && !shipment && !loading && (
            <button
              onClick={() => setTrackingNo(lastTracked)}
              className="text-xs text-[#0B2545] hover:underline"
            >
              ▼ {t('cargo.trackAgain') || 'Track again'}
            </button>
          )}
        </div>
      )}

      {/* New booking tab */}
      {tab === 'new' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E2DFD9] bg-white p-5 sm:p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-[#0B2545]">
              {t('cargo.newBooking') || 'Create New Shipment'}
            </h3>

            <div className="mt-4 grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label className="label mb-1.5">Tracking No *</label>
                <input
                  type="text"
                  value={form.trackingNo}
                  onChange={(e) => setForm({ ...form, trackingNo: e.target.value })}
                  placeholder="CARGO-001"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label mb-1.5">Origin *</label>
                <input
                  type="text"
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  placeholder="Kinshasa"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label mb-1.5">Destination *</label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  placeholder="Lubumbashi"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                  placeholder="50"
                  className="input w-full"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label mb-1.5">Contents</label>
                <textarea
                  value={form.contents}
                  onChange={(e) => setForm({ ...form, contents: e.target.value })}
                  placeholder="Describe the shipment contents..."
                  rows={2}
                  className="input w-full resize-none"
                />
              </div>
              <div className="sm:col-span-2 mt-4 pt-4 border-t border-[#E2DFD9]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7D7A74]">
                  Sender
                </h4>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={form.senderName}
                    onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                    placeholder="Full name"
                    className="input"
                  />
                  <input
                    type="text"
                    value={form.senderPhone}
                    onChange={(e) => setForm({ ...form, senderPhone: e.target.value })}
                    placeholder="+243 81 000 0000"
                    className="input"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 mt-3 pt-4 border-t border-[#E2DFD9]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7D7A74]">
                  Recipient
                </h4>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={form.recipientName}
                    onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                    placeholder="Full name"
                    className="input"
                  />
                  <input
                    type="text"
                    value={form.recipientPhone}
                    onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
                    placeholder="+243 81 000 0000"
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={handleBook}
                disabled={bookingLoading}
                className="rounded-xl bg-[#0B2545] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#081A33] hover:shadow-md disabled:opacity-50"
              >
                {bookingLoading ? 'Creating...' : t('cargo.createBooking') || 'Create Booking'}
              </button>
              {bookingSuccess && (
                <span className={`text-sm ${bookingSuccess.startsWith('Booking') ? 'text-[#1B4D2E]' : 'text-red-600'}`}>
                  {bookingSuccess}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
