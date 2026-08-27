import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { searchFlights, searchLocations, getFlightDates } from '@/lib/amadeus';

// ── Amadeus client (env-gated) ─────────────────────────────────────────────
// The real Amadeus API client lives in lib/amadeus.ts.
// If credentials aren't configured, we fall back to mock + Prisma data.

function isAmadeusConfigured(): boolean {
  return !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET);
}

// ── Flight shape normalization ──────────────────────────────────────────────
//
// Shape the FlightsPage/FlightCard expects (from app/flights/page.tsx):
//   { id, airline, flightNo, priceUsd, departHour, durationMin,
//     seatsAvailable, origin: { code }, destination: { code },
//     refundable?, includesCheckedBaggage?, cabin?, stopCount? }
//
// Amadeus Flight Offer shape:
//   id, airlineCodes[], price: { amount, currency }, itinerary[].segments[],
//   lastTicketingDate, numberOfBookableSeats, lastCopy

function normAmadeusOffer(offer: any): any {
  const itineraries = offer.itinerary || [];
  const firstItin = itineraries[0];
  const segments = firstItin?.segments || [];
  const first = segments[0];
  const last = segments[segments.length - 1];
  const stops = segments.length - 1;

  const depHour = first?.departure?.at
    ? new Date(first.departure.at).getHours()
    : 0;

  const durMatch = firstItin?.duration?.match(/PT(\d+)H(\d+)M/);
  const durationMin = durMatch
    ? parseInt(durMatch[1]) * 60 + parseInt(durMatch[2])
    : 0;

  const airline = offer.airlineCodes?.[0] || 'AA';
  const carrierCode = first?.carrierCode || airline;
  const flightNo = first?.number
    ? `${carrierCode}-${first.number}`
    : `${carrierCode}-${Math.floor(Math.random() * 9000) + 1000}`;

  const originCode = first?.departure?.iataCode || '';
  const destCode = last?.arrival?.iataCode || '';

  const priceAmount = offer.price?.amount
    ? parseFloat(offer.price.amount)
    : 0;

  return {
    id: offer.id,
    airline,
    flightNo,
    priceUsd: priceAmount,
    departHour: depHour,
    durationMin,
    seatsAvailable: offer.numberOfBookableSeats ?? (stops === 0 ? 3 : 1),
    origin: { code: originCode },
    destination: { code: destCode },
    refundable: offer.lastCopy?.pricingDetail?.includedAirlineCodes?.length > 0 ? false : true,
    includesCheckedBaggage: stops === 0,
    cabin: 'Y',
    stopCount: stops,
    carrierCodes: offer.airlineCodes || [],
    offerId: offer.id,
  };
}

// ── Mock data fallback (when no Amadeus keys configured) ──────────────────

const MOCK_FLIGHTS = [
  {
    id: 'mock-1',
    airline: 'Congo Airways',
    flightNo: 'CG-101',
    priceUsd: 285,
    departHour: 8,
    durationMin: 140,
    seatsAvailable: 12,
    origin: { code: 'FIH' },
    destination: { code: 'JJA' },
    refundable: true,
    includesCheckedBaggage: true,
    cabin: 'Y',
    stopCount: 0,
  },
  {
    id: 'mock-2',
    airline: 'Air France',
    flightNo: 'AF-420',
    priceUsd: 450,
    departHour: 14,
    durationMin: 1280,
    seatsAvailable: 6,
    origin: { code: 'FIH' },
    destination: { code: 'CDG' },
    refundable: true,
    includesCheckedBaggage: true,
    cabin: 'Y',
    stopCount: 1,
  },
  {
    id: 'mock-3',
    airline: 'Brussels Airlines',
    flightNo: 'SN-642',
    priceUsd: 520,
    departHour: 9,
    durationMin: 1260,
    seatsAvailable: 4,
    origin: { code: 'FIH' },
    destination: { code: 'BRU' },
    refundable: true,
    includesCheckedBaggage: true,
    cabin: 'Y',
    stopCount: 1,
  },
  {
    id: 'mock-4',
    airline: 'Kenya Airways',
    flightNo: 'KQ-781',
    priceUsd: 370,
    departHour: 22,
    durationMin: 210,
    seatsAvailable: 8,
    origin: { code: 'FIH' },
    destination: { code: 'NBO' },
    refundable: false,
    includesCheckedBaggage: false,
    cabin: 'Y',
    stopCount: 0,
  },
];

// ── City → IATA code resolution ──────────────────────────────────────────

// When a user searches by city name (e.g. "Kinshasa") but Amadeus
// needs an airport code (e.g. "FIH"), we resolve via the reference data
// API, falling back to a small built-in map for common DRC airports.

const COMMON_AIRPORT_CODES: Record<string, string[]> = {
  'kinshasa': ['FIH', 'FIH1'],
  'kinshasa ndjili': ['FIH'],
  'lubumbashi': ['FBM', 'JJB'],
  'lubumbashi/kolwezi': ['FBM'],
  'kisangani': ['FKI', 'FKI1'],
  'matadi': ['MAT'],
  'mbandaka': ['MBK'],
  'goma': ['GOM'],
  'bukavu': ['BKY'],
  'kananga': ['KGA'],
  'kiesangani': ['FKI'],
  'johannesburg': ['JNB'],
  'addis ababa': ['ADD'],
  'nairobi': ['NBO'],
  'casablanca': ['CMN'],
  'dakar': ['DSS'],
  'abidjan': ['ABJ'],
  'accra': ['ACC'],
  'douala': ['DLA'],
  'yaounde': ['YAO'],
  'libreville': ['LBV'],
  'bangui': ['BGF'],
  'brazzaville': ['BZV'],
  'freetown': ['FNA'],
  'monrovia': ['ROB'],
  'conakry': ['CKY'],
  'kigali': ['KGL'],
  'kampala': ['EBB'],
  'dar es salaam': ['DAR'],
  'dodoma': ['DOD'],
  'cairo': ['CAI'],
  'london': ['LHR', 'LGW'],
  'paris': ['CDG', 'ORY'],
  'brussels': ['BRU'],
  'amsterdam': ['AMS'],
  'new york': ['JFK', 'EWR'],
  'atlanta': ['ATL'],
  'dubai': ['DXB'],
  'doha': ['DOH'],
  'lagos': ['LOS'],
  'luanda': ['LAD'],
  'maputo': ['MPM'],
  'harare': ['HRE'],
  'mumbai': ['BOM'],
  'delhi': ['DEL'],
  'singapore': ['SIN'],
  'bangkok': ['BKK'],
  'istanbul': ['IST'],
  'frankfurt': ['FRA'],
  'munich': ['MUC'],
  'milan': ['MXP', 'LIN'],
  'rome': ['FCO'],
  'madrid': ['MAD'],
  'barcelona': ['BCN'],
  'lisbon': ['LIS'],
  'genoa': ['GOA'],
  'lyon': ['LYS'],
  'geneva': ['GVA'],
  'zurich': ['ZRH'],
  'oslo': ['OSL'],
  'stockholm': ['ARN'],
  'copenhagen': ['CPH'],
  'helsinki': ['HEL'],
  'warsaw': ['WAW'],
  'prague': ['PRG'],
  'budapest': ['BUD'],
  'sofia': ['SOF'],
  'bucharest': ['OTP', 'BBU'],
  'kyiv': ['KBP'],
  'minsk': ['MSQ'],
  'moscow': ['SVO', 'DME'],
  'saint petersburg': ['LED'],
  'tashkent': ['TAS'],
  'almaty': ['ALA'],
  'bishkek': ['FRU'],
  'dushanbe': ['DYU'],
  'ashgabat': ['ASB'],
  'erivan': ['EVN'],
  'baku': ['GYD'],
  'tbilisi': ['TBS'],
  'tehran': ['IKA'],
  'baghdad': ['BGW'],
  'basra': ['BSR'],
  'damascus': ['DAM'],
  'beirut': ['BEY'],
  'amman': ['AMM'],
  'jerusalem': ['JRS'],
  'tel aviv': ['TLV'],
  'riyadh': ['RUH'],
  'jeddah': ['JED'],
  'mecca': ['MEC'],
  'medina': ['MED'],
  'muscat': ['MCT'],
  'abu dhabi': ['AUH'],
  'sharjah': ['SHJ'],
  'manama': ['BAH'],
  'kuwait city': ['KWI'],
  'sanaa': ['DJI'],
  'aden': ['ADE'],
  'alexandria': ['HBE'],
  'assef': ['HDS'],
  'giza': ['CAI'],
  'port said': ['PUB'],
  'suez': ['CWF'],
  'ishanghai': ['PVG', 'SHA'],
  'beijing': ['PEK'],
  'guangzhou': ['CAN'],
  'hong kong': ['HKG'],
  'taipei': ['TPE'],
  'seoul': ['ICN', 'GMP'],
  'tokyo': ['NRT', 'HND'],
  'osaka': ['KIX'],
  'fukuoka': ['FUK'],
  'sapporo': ['CTS'],
  'nagoya': ['NGO'],
  'naha': ['OKA'],
};

// Async version for use inside the GET handler
async function resolveCityToCodeAsync(city: string): Promise<string | null> {
  // Try Amadeus reference data first (if configured)
  if (isAmadeusConfigured()) {
    try {
      const results = await searchLocations({
        keyword: city,
        subType: 'AIRPORT,CITY',
        max: 3,
      });
      if (results.length > 0) {
        return results[0].iataCode;
      }
    } catch {
      // Fall through to built-in map
    }
  }

  // Built-in fallback
  const normalized = city.toLowerCase().replace(/\s+/g, ' ').trim();
  return COMMON_AIRPORT_CODES[normalized]?.[0] ?? null;
}

// ── GET /api/flights?from=&to=&date=&cabin=&pax=&airline= ────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const cabin = (searchParams.get('cabin') || 'Y') as 'Y' | 'C';
  const pax = Number(searchParams.get('pax') || '1');
  const airline = searchParams.get('airline');

  // ── Real Amadeus path ──────────────────────────────────────────────────
  if (isAmadeusConfigured() && from && to && date) {
    try {
      // Resolve city names to IATA codes if needed
      const originCode = await resolveCityToCodeAsync(from);
      const destCode = await resolveCityToCodeAsync(to);

      if (!originCode || !destCode) {
        // Cannot resolve — fall through to mock
        console.warn(`[Amadeus] Could not resolve airport codes: ${from} → ${to}`);
      } else {
        const offers = await searchFlights({
          originLocationCode: originCode,
          destinationLocationCode: destCode,
          departureDate: date,
          adults: pax,
          currencyCode: 'USD',
          includedAirlineCodes: airline ?? undefined,
          max: 50,
          travelClass: cabin === 'C' ? 'BUSINESS' : 'ECONOMY',
        });

        const flights = offers.map(normAmadeusOffer);
        return NextResponse.json({ count: flights.length, data: flights });
      }
    } catch (err: any) {
      console.error('[Amadeus flight-offers-search error]', err?.message ?? err);
      // Fall through to mock + Prisma fallback below
    }
  }

  // ── Prisma fallback (local DB flights) ────────────────────────────────
  const flights = await prisma.flight.findMany({
    include: {
      origin: { select: { name: true, country: true } },
      destination: { select: { name: true, country: true } },
    },
    orderBy: { priceUsd: 'asc' },
  });

  const norm = (s: string) => s.trim().toLowerCase();
  const filtered = flights.filter((f) => {
    if (from && !norm(f.origin.name).includes(norm(from))) return false;
    if (to && !norm(f.destination.name).includes(norm(to))) return false;
    if (airline && !norm(f.airline).includes(norm(airline))) return false;
    return true;
  });

  if (filtered.length > 0) {
    return NextResponse.json({
      count: filtered.length,
      data: filtered.map((f) => ({
        id: f.id,
        airline: f.airline,
        flightNo: f.flightNo,
        priceUsd: f.priceUsd,
        departHour: parseInt(f.departTime?.split('T')[1]?.split(':')[0] || '0'),
        durationMin: f.durationMin,
        seatsAvailable: 1,
        origin: { code: f.originId },
        destination: { code: f.destinationId },
        refundable: false,
        includesCheckedBaggage: false,
        cabin,
        stopCount: 0,
      })),
    });
  }

  // ── No Amadeus, no Prisma matches → mock ─────────────────────────────
  return NextResponse.json({ count: MOCK_FLIGHTS.length, data: MOCK_FLIGHTS });
}

// ── POST /api/flights — create (keep existing; no Amadeus change) ─────────

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const { origin, destination, airline, flightNo, depart, arrive, durationMin, priceUsd } = body;

  if (!origin || !destination || !airline || !flightNo || !depart || !arrive) {
    return NextResponse.json(
      { error: 'origin, destination, airline, flightNo, depart, arrive required' },
      { status: 400 },
    );
  }

  // Resolve city names to IDs via case-insensitive in-memory match
  const allCities = await prisma.city.findMany({ select: { id: true, name: true } });
  const byName = new Map(allCities.map((c) => [c.name.toLowerCase(), c.id]));

  const originId = byName.get(origin.toLowerCase());
  const destId = byName.get(destination.toLowerCase());

  if (!originId) {
    const available = allCities.map((c) => c.name).join(', ');
    return NextResponse.json(
      { error: `Origin city "${origin}" not found. Available: ${available}` },
      { status: 400 },
    );
  }
  if (!destId) {
    const available = allCities.map((c) => c.name).join(', ');
    return NextResponse.json(
      { error: `Destination city "${destination}" not found. Available: ${available}` },
      { status: 400 },
    );
  }

  const flight = await prisma.flight.create({
    data: {
      flightNo,
      airline,
      originId,
      destinationId: destId,
      departTime: depart,
      arriveTime: arrive,
      durationMin: durationMin || 0,
      priceUsd: priceUsd || 0,
      daysOfWeek: '0123456',
    },
  });

  return NextResponse.json({ data: flight }, { status: 201 });
}