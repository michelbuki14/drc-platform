// In-process pub/sub hub for real-time cargo updates.
// (Swap for Redis pub/sub in multi-instance deployments.)

type Listener = (payload: any) => void;
const hub = new Map<string, Set<Listener>>();

export function publishCargoUpdate(trackingNo: string, payload: any) {
  const set = hub.get(trackingNo);
  if (set) for (const l of set) l(payload);
}

export function subscribeCargo(trackingNo: string, listener: Listener) {
  if (!hub.has(trackingNo)) hub.set(trackingNo, new Set());
  hub.get(trackingNo)!.add(listener);
  return () => hub.get(trackingNo)?.delete(listener);
}
