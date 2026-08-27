import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const VERSION = process.env.npm_package_version || '1.0.0';

/**
 * GET /api/health  — liveness/readiness probe.
 * Reports server time, uptime, DB connectivity, and request count.
 */
let requestCount = 0;

export async function GET() {
  requestCount++;
  try {
    const { prisma } = await import('@/lib/db');
    const [userCount, flightCount] = await Promise.all([
      prisma.user.count(),
      prisma.flight.count(),
    ]);
    logger.info('health ok', { users: userCount, flights: flightCount });
    return NextResponse.json({
      status: 'ok',
      version: VERSION,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      requests: requestCount,
      db: { users: userCount, flights: flightCount },
    });
  } catch (err) {
    logger.error('health degraded', { error: String(err) });
    return NextResponse.json(
      { status: 'degraded', version: VERSION, timestamp: new Date().toISOString(), error: String(err) },
      { status: 503 }
    );
  }
}
