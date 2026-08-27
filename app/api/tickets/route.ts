import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { execSync } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdirSync, rmSync, createWriteStream } from 'fs';
import { crypto } from '@/lib/crypto';

/* ────────────────────────────────────────────────────────────
   /api/tickets — ticket lookup + check-in + void + Apple Wallet
   ──────────────────────────────────────────────────────────── */

const PKPASS_ICON_B64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABUWAyFAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA2klEQVRoge3YMQ6AIBAF0M9Gm2lTc2JlaG1haW5pc2ljaGdpYWNrY2FpYWFtIABNkgCa8Nomgm2CqD+fx2+F/89/nuJ/5LHvA/6Lx2fjn7PAn5/A3wdG/1+Af47/7vgvAf5v9v+P9B2qAj8F9B4BdQAd+iDg2wxFkRT4wcMMAIYBKX7g0vk/gGHAsgBJXALuGTACqxn/9H94/v0YYLcAe2YC+gO+N/yXAf4H/qFwdLAR8AJIBIR8EsYPQGVhfBFwGEgJ0NOB0A7YBuwG5DgfAGSAaMb3NQB9JgKkn+gD5PwOSIf70MgB0HexByQAaPh/ef79BKDZfNT7BIKADwRM+uAfASJ+fj4CdgBdeQQAzxvoA+YCBNcB3Av5L+4DsA72hGMAjqmYAnJ1nQDQd6Z/BEDkOQ+A/0pmAERtE9ANkKYBR4BcE9QPB9AL2A3QYYBty1MB5CdgCskdAJS2nwNsA/xDwAHAeySbgacArJMGAE2BmYABoHkMyGXgIQJuAf5q+gEAAONnJgEo/A0AAAAASUVORK5CYII=';

/* ── Apple Wallet pass builder ──────────────────────────────── */

function buildPass(ticket: any, booking: any): { manifest: any; pass: any } {
  const ref = booking.reference;
  const pax = ticket.passengerName;
  const flightNo = ticket.flightNo;
  const origin = ticket.originCode;
  const dest = ticket.destinationCode;
  const seat = ticket.seat || 'TBD';
  const cabin = ticket.cabinClass === 'C' ? 'Business' : 'Economy';
  const serial = ticket.ticketNo.toUpperCase();
  const ticketUri = `CongoConnect://ticket/${serial}?ref=${ref}&p=${encodeURIComponent(pax)}&f=${flightNo}&o=${origin}&d=${dest}`;

  const manifest = {
    manifestVersion: 1,
    apnsTokens: [],
    groups: [{ quantity: 1, format: 'pkiulid', topics: [crypto.randomBytes(16).toString('hex').toUpperCase()] }],
    logos: {
      '2x': { width: 600, height: 600, url: 'icon@2x.png' },
      '3x': { width: 900, height: 900, url: 'icon@3x.png' },
    },
    authenticationToken: crypto.randomBytes(32).toString('hex'),
    serialNumber: serial,
    passTypeIdentifier: 'pass.com.congoconnect.ticket',
    teamIdentifier: 'CGCONN',
  };

  const pass = {
    formatVersion: 1,
    serialNumber: serial,
    barcode: {
      format: 'pdf417',
      data: `CongoConnect://ticket/${serial}?ref=${ref}&p=${encodeURIComponent(pax)}`,
      message: `Ticket ${serial} — ${pax}`,
      altText: `CongoConnect ticket ${serial}`,
    },
    barcodeData: `CongoConnect://ticket/${serial}?ref=${ref}`,
    qrCode: { message: ticketUri, encoding: 'iso-8859-1', minVersion: 1, maxVersion: 40 },
    relevantDate: ticket.departDate,
    userInfo: {
      primaryName: pax,
      primarySubtitle: `${origin} → ${dest}`,
      secondaryName: flightNo,
      secondarySubtitle: `Seat ${seat} · ${cabin}`,
      auxiliaryLine1: `Ref: ${ref}`,
      auxiliaryLine2: `Boarding pass for ${pax}`,
    },
    styling: {
      foregroundColor: 'D4AF37',
      backgroundColor: '0B2545',
      spotlightHighlight: 0.5,
      labelColor: 'FFFFFF',
      styles: {
        header: { fontSize: 12, fontName: 'Helvetica-Bold', color: 'D4AF37' },
        primary: { fontSize: 16, fontName: 'Helvetica-Bold', color: 'FFFFFF' },
        secondary: { fontSize: 12, fontName: 'Helvetica', color: 'D4AF37' },
        auxiliary: { fontSize: 10, fontName: 'Helvetica', color: 'FFFFFF' },
      },
    },
    order: [{ font: 'system', size: 3, bold: true, text: 'BOARDING PASS' }],
    back: {
      icon: 'logo.png',
      primary: 'CongoConnect',
      secondary: 'Validation web service',
      details: [
        { label: 'Booking reference', value: ref },
        { label: 'Passenger', value: pax },
        { label: 'Flight', value: flightNo },
        { label: 'From', value: origin },
        { label: 'To', value: dest },
        { label: 'Document', value: ticket.idType },
        { label: 'Nationality', value: ticket.nationality },
      ],
      backField2: '',
      backField3: '',
      footer: [{ label: 'This pass is void if removed from ', value: 'Apple Wallet' }],
    },
  };

  return { manifest, pass };
}

function writePassDir(ticket: any, booking: any, outDir: string): void {
  mkdirSync(outDir, { recursive: true });
  const iconBuf = Buffer.from(PKPASS_ICON_B64, 'base64');

  createWriteStream(join(outDir, 'icon.png')).write(iconBuf);
  createWriteStream(join(outDir, 'icon@2x.png')).write(iconBuf);
  createWriteStream(join(outDir, 'icon@3x.png')).write(iconBuf);
  createWriteStream(join(outDir, 'logo.png')).write(iconBuf);

  const { manifest, pass } = buildPass(ticket, booking);
  createWriteStream(join(outDir, 'manifest.json')).write(JSON.stringify(manifest, null, 2));
  createWriteStream(join(outDir, 'pass.json')).write(JSON.stringify(pass, null, 2));
}

function zipPass(outDir: string): Buffer {
  const zipPath = join(outDir, 'pass.zip');
  execSync(`powershell -Command "Compress-Archive -Path '${outDir}/icon.png','${outDir}/icon@2x.png','${outDir}/icon@3x.png','${outDir}/logo.png','${outDir}/manifest.json','${outDir}/pass.json' -DestinationPath '${zipPath}' -Force"`);
  return require('fs').readFileSync(zipPath);
}

/* ── API handlers ────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const walletTicketNo = sp.get('wallet');

  // ── Apple Wallet pass ───────────────────────────────────────
  if (walletTicketNo) {
    const ticket = await prisma.ticket.findUnique({
      where: { ticketNo: walletTicketNo.toUpperCase() },
      include: { booking: { include: { flight: { include: { origin: true, destination: true } } } } },
    });

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    if (ticket.status === 'voided') return NextResponse.json({ error: 'Ticket is voided' }, { status: 409 });

    const tmpDir = join(tmpdir(), `cc-wallet-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`);
    try {
      writePassDir(ticket, ticket.booking, tmpDir);
      const zip = zipPass(tmpDir);
      return new NextResponse(Buffer.from(zip), {
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': `attachment; filename="${ticket.ticketNo}.pkpass"`,
          'Content-Length': String(zip.length),
          'Cache-Control': 'no-store',
        },
      });
    } catch (err: any) {
      return NextResponse.json({ error: `Pass generation failed: ${err.message}` }, { status: 500 });
    } finally {
      try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    }
  }

  // ── Ticket lookup by ref or email ──────────────────────────
  const ref = sp.get('ref');
  const email = sp.get('email');

  if (!ref && !email) {
    return NextResponse.json({ error: 'Provide ?ref= or ?email=' }, { status: 400 });
  }

  const tickets = await prisma.ticket.findMany({
    where: ref
      ? { booking: { reference: ref.toUpperCase() } }
      : { booking: { email: email!.toLowerCase() } },
    include: {
      booking: {
        select: { reference: true, email: true, passengerName: true },
        include: {
          flight: {
            select: { origin: { select: { name: true } }, destination: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { departDate: 'desc' },
  });

  return NextResponse.json({
    count: tickets.length,
    data: tickets.map(t => ({
      ...t,
      booking: {
        ...t.booking,
        flight: {
          origin: t.booking.flight.origin,
          destination: t.booking.flight.destination,
        },
      },
    })),
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.ticketNo) return NextResponse.json({ error: 'ticketNo is required' }, { status: 400 });

  const ticket = await prisma.ticket.findUnique({ where: { ticketNo: body.ticketNo.toUpperCase() } });
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  if (ticket.status === 'voided') return NextResponse.json({ error: 'Ticket is voided' }, { status: 409 });
  if (ticket.status === 'used') return NextResponse.json({ error: 'Ticket already checked in' }, { status: 409 });

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      status: 'used',
      seat: body.seat ?? ticket.seat,
    },
    include: { booking: { select: { reference: true } } },
  });

  return NextResponse.json({
    data: updated,
    message: `Ticket ${updated.ticketNo} checked in`,
  });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const ticketNoParam = (req.nextUrl.searchParams.get('ticketNo') || body?.ticketNo || '').toUpperCase();

  if (!ticketNoParam) return NextResponse.json({ error: 'ticketNo is required' }, { status: 400 });

  const ticket = await prisma.ticket.findUnique({ where: { ticketNo: ticketNoParam } });
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  if (ticket.status === 'voided') return NextResponse.json({ error: 'Ticket already voided' }, { status: 409 });

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: { status: 'voided', voidedAt: new Date() },
  });

  return NextResponse.json({
    data: updated,
    message: `Ticket ${updated.ticketNo} voided`,
  });
}
