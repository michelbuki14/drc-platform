import { requireUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { subscribeCargo } from '@/lib/realtime/hub';

// SSE stream of cargo status for a tracking number.
export async function GET(req: NextRequest) {
  const session = requireUser(req);
  if (session instanceof NextResponse) return session;

  const trackingNo = req.nextUrl.searchParams.get('trackingNo');
  if (!trackingNo) {
    return NextResponse.json({ error: 'trackingNo required' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // Initial snapshot
      const cargo = await prisma.cargo.findUnique({ where: { trackingNo } });
      send('snapshot', cargo);

      // Subscribe to live updates
      const unsub = subscribeCargo(trackingNo, (payload) => send('update', payload));

      // Periodic DB poll so the stream stays live even without explicit
      // publish events (e.g. external status changes).
      const poll = setInterval(async () => {
        const latest = await prisma.cargo.findUnique({ where: { trackingNo } });
        if (latest) send('heartbeat', { status: latest.status, at: latest.createdAt });
      }, 5000);

      const ping = setInterval(() => controller.enqueue(encoder.encode(`: ping\n\n`)), 15000);

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(poll);
        clearInterval(ping);
        unsub();
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
