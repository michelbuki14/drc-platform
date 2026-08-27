'use client';

import { useEffect, useRef, useState } from 'react';

export interface CargoStreamState {
  snapshot: any | null;
  lastEvent: any | null;
  connected: boolean;
}

/**
 * Subscribe to the real-time cargo SSE stream.
 * Requires an authenticated session (the endpoint enforces it).
 */
export function useCargoStream(trackingNo: string | null) {
  const [state, setState] = useState<CargoStreamState>({ snapshot: null, lastEvent: null, connected: false });
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!trackingNo) return;
    const es = new EventSource(`/api/cargo/live/stream?trackingNo=${encodeURIComponent(trackingNo)}`);
    esRef.current = es;

    es.addEventListener('snapshot', (e: MessageEvent) => {
      setState((s) => ({ ...s, snapshot: JSON.parse(e.data), connected: true }));
    });
    es.addEventListener('update', (e: MessageEvent) => {
      setState((s) => ({ ...s, lastEvent: JSON.parse(e.data), connected: true }));
    });
    es.addEventListener('heartbeat', () => {
      setState((s) => ({ ...s, connected: true }));
    });
    es.onerror = () => {
      setState((s) => ({ ...s, connected: false }));
    };

    return () => es.close();
  }, [trackingNo]);

  return state;
}
