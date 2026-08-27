// lib/amadeus.ts — Amadeus Self-Service API client
// Uses the 'amadeus' npm SDK v11.0.0.
// The SDK handles OAuth2 token acquisition and refresh internally.
// Environment variables must be set in .env.local:
//   AMADEUS_API_KEY=
//   AMADEUS_API_SECRET=
// Set AMADEUS_HOSTNAME=test for sandbox, production for live (default: test).

import Amadeus from 'amadeus';

let _client: Amadeus | null = null;

function getClient(): Amadeus {
  if (_client) return _client;

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error(
      'Amadeus API credentials not configured. ' +
      'Set AMADEUS_API_KEY and AMADEUS_API_SECRET in .env.local. ' +
      'Get them at https://developers.amadeus.com/my-apps'
    );
  }

  const hostname = (process.env.AMADEUS_HOSTNAME || 'test') as 'test' | 'production';
  _client = new Amadeus({
    clientId: apiKey,
    clientSecret: apiSecret,
    hostname,
  });
  return _client;
}

// ── Flight Offers Search — POST /v2/shopping/flight-offers ─────────────────
export async function searchFlights(params: FlightOffersSearchParams): Promise<FlightOffer[]> {
  const client = getClient();
  const response = await client.shopping.flightOffersSearch.get(params);
  if (!response.data || !Array.isArray(response.data)) return [];
  return response.data as FlightOffer[];
}

// ── Flight Dates — GET /v2/shopping/flight-dates ────────────────────────────
export async function getFlightDates(params: FlightDatesParams): Promise<FlightDate[]> {
  const client = getClient();
  const response = await client.shopping.flightDates.get(params);
  if (!response.data || !Array.isArray(response.data)) return [];
  return response.data as FlightDate[];
}

// ── Reference Data: airport lookup ───────────────────────────────────────────
// Resolves city names / airport codes to IATA codes.
// Uses the SDK's locations.airports and locations.cities sub-namespaces.
// Accepts an object of search options (matching the call site in route.ts).
export async function searchLocations(params: LocationSearchParams): Promise<LocationResult[]> {
  const client = getClient();
  const results: LocationResult[] = [];
  const { keyword, subType, countryCode, max = 10 } = params;

  if (subType === 'AIRPORT' || subType === 'AIRPORT,CITY') {
    try {
      const resp = await client.referenceData.locations.airports.get({
        keyword: keyword ?? '',
        countryCode: countryCode ?? undefined,
        max,
      });
      if (resp.data && Array.isArray(resp.data)) {
        results.push(...resp.data as LocationResult[]);
      }
    } catch { /* fall through */ }
  }

  if (subType === 'CITY' || subType === 'AIRPORT,CITY') {
    try {
      const resp = await client.referenceData.locations.cities.get({
        keyword: keyword ?? '',
        countryCode: countryCode ?? undefined,
        max: subType === 'CITY' ? max : Math.ceil(max / 2),
      });
      if (resp.data && Array.isArray(resp.data)) {
        results.push(...resp.data as LocationResult[]);
      }
    } catch { /* fall through */ }
  }

  return results.slice(0, max);
}

// ── Optional: City lookup ─────────────────────────────────────────────────────
export async function lookupCity(keyword: string, countryCode?: string, max: number = 10): Promise<LocationResult[]> {
  return searchLocations({ keyword, subType: 'AIRPORT,CITY', countryCode, max });
}

// ── Type definitions ──────────────────────────────────────────────────────────

export interface FlightOffersSearchParams {
  originLocationCode: string;             // e.g. 'FIH'
  destinationLocationCode: string;        // e.g. 'CDG'
  departureDate: string;                  // YYYY-MM-DD
  adults?: number;                        // default 1
  children?: number;
  infants?: number;
  currencyCode?: string;                  // default 'USD'
  includedAirlineCodes?: string;          // comma-separated, e.g. 'SN,AF'
  max?: number;                           // default 50
  nonStop?: boolean;
  travelClass?: 'ECONOMY' | 'BUSINESS' | 'FIRST' | 'ECONOMY_PREMIUM';
  paymentPolicy?: 'PRE_PAYMENT' | 'NOT_PRE_PAYMENT';
}

export interface FlightDatesParams {
  originLocationCode: string;
  destinationLocationCode: string;
  adults?: number;
  currencyCode?: string;
  nonStop?: boolean;
}

export interface LocationSearchParams {
  keyword: string;
  subType: 'AIRPORT' | 'CITY' | 'AIRPORT,CITY';
  countryCode?: string;
  max?: number;
}

export interface FlightOffer {
  id: string;
  type: 'flight-offer';
  airlineCodes: string[];
  price: { amount: string; currency: string };
  itinerary: Itinerary[];
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  lastCopy: PricingDetail | null;
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: number;
  aircraft: { code: string };
  operatingCarrierCode?: string;
  duration: string;
  stops: number;
  marketingCarrierCode?: string;
}

export interface PricingDetail {
  price: { amount: string; currency: string };
  fareProcedure?: string;
  commercialDetail: {
    includedAirlineCodes: string[];
    pricingReasonCode: string;
  };
  pricingTickets?: {
    ticketNumber: string;
    price: { amount: string; currency: string };
    fareBasis: string;
    originDestinations: {
      originDestination: {
        origin: { airportCode: string; cityCode?: string };
        destination: { airportCode: string; cityCode?: string };
      };
      cabin: { code: string };
      airline: { code: string };
      ffornumber?: string;
    }[];
    ticketsAdvisoryNotice?: any[];
    travellerItineraries?: any[];
    passangerCount?: {
      adults: number;
      children: number;
      infants: number;
      flownInfants: number;
    };
  };
}

export interface FlightDate {
  lastTicketingDate: string;
  numberOfBaggageAllowed: number;
  itineraries: Itinerary[];
  price: { amount: string; currency: string };
}

export interface LocationResult {
  type: string;
  iataCode: string;
  name: string;
  countryCode: string;
  countryName: string;
  geoPosition: { latitude: number; longitude: number };
}