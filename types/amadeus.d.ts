// Type declarations for the Amadeus Node SDK (amadeus@11.0.0).
//
// The npm package ships CommonJS JS only — no bundled .d.ts.
// v11 namespace objects expose callable `.get({ params })` / `.post({ body })`
// methods. These methods proxy to the internal HTTP client, building REST paths
// from the namespace hierarchy (e.g. `schedule.flights.get()` →
// `GET /v2/schedule/flights`).
//
// Namespace objects also expose a `.client` sub-object (the raw HTTP client)
// for arbitrary path access, plus sub-resources like `locations.airports`,
// `locations.cities`, `urls.checkinLinks`, etc.
//
// This shim uses `declare module 'amadeus'` so any file doing
// `import Amadeus from 'amadeus'` gets proper types.
//
// With tsconfig esModuleInterop=true, the import maps to the CommonJS
// default export (the Amadeus class).

declare module 'amadeus' {
  // ── Options ────────────────────────────────────────────────────────────────
  interface AmadeusOptions {
    clientId?: string;
    clientSecret?: string;
    hostname?: 'test' | 'production';
    logger?: any;
  }

  // ── Response shape ─────────────────────────────────────────────────────────
  interface AmadeusResponse {
    data: any;
    status?: number;
    body?: Record<string, any>;
  }

  // ── The SDK class ──────────────────────────────────────────────────────────
  class Amadeus {
    constructor(options?: AmadeusOptions);

    // Raw HTTP client — accepts a path like '/v2/shopping/flight-offers' and
    // optional query/body params.
    client: {
      get(path: string, params?: Record<string, any>): Promise<AmadeusResponse>;
      post(path: string, body?: Record<string, any>): Promise<AmadeusResponse>;
    };

    version: string;

    // ── Shopping APIs ────────────────────────────────────────────────────────
    shopping: {
      flightOffersSearch: {
        /** GET /v2/shopping/flight-offers — search flight offers */
        get(params: FlightOffersSearchParams): Promise<AmadeusResponse>;
      };
      flightOffers: {
        /** POST /v2/shopping/flight-offers/{offerId}/pricing */
        pricing: {
          get(offerId: string): Promise<AmadeusResponse>;
        };
        /** GET /v1/shopping/flight-offers/{offerId}/upselling */
        upselling: {
          get(offerId: string): Promise<AmadeusResponse>;
        };
        /** Flight delay prediction for an itinerary */
        prediction: {
          get(params: FlightPredictionParams): Promise<AmadeusResponse>;
        };
      };
      flightDestinations: {
        get(params: FlightDestinationsParams): Promise<AmadeusResponse>;
      };
      flightDates: {
        get(params: FlightDatesParams): Promise<AmadeusResponse>;
      };
      seatmaps: {
        get(params: SeatmapsParams): Promise<AmadeusResponse>;
      };
      hotelOffersSearch: {
        get(params: HotelOffersSearchParams): Promise<AmadeusResponse>;
      };
      hotelOffer(id: string): {
        get(): Promise<AmadeusResponse>;
      };
      activities: {
        get(params: ActivitiesParams): Promise<AmadeusResponse>;
      };
      activity(id: string): {
        get(): Promise<AmadeusResponse>;
      };
      availability: {
        get(params: AvailabilityParams): Promise<AmadeusResponse>;
      };
      transferOffers: {
        post(body: TransferOffersBody): Promise<AmadeusResponse>;
      };
    };

    // ── Schedule / Flights status ────────────────────────────────────────────
    // v11 exposes flight status under the `schedule` namespace as
    // `schedule.flights.get({ identification, carrierActions })` →
    // `GET /v2/schedule/flights`
    schedule: {
      flights: {
        /** Get flight status by identification (flight number, etc.) */
        get(params: ScheduleFlightsParams): Promise<AmadeusResponse>;
      };
    };

    // ── Reference Data ───────────────────────────────────────────────────────
    referenceData: {
      urls: {
        checkinLinks: {
          get(params: CheckinLinksParams): Promise<AmadeusResponse>;
        };
      };
      locations: {
        airports: {
          get(params: LocationSimpleParams): Promise<AmadeusResponse>;
        };
        cities: {
          get(params: LocationSimpleParams): Promise<AmadeusResponse>;
        };
        hotel: {
          get(params: LocationSimpleParams): Promise<AmadeusResponse>;
        };
        hotels: {
          byCity: {
            get(params: HotelsByCityParams): Promise<AmadeusResponse>;
          };
          byGeocode: {
            get(params: HotelsByGeocodeParams): Promise<AmadeusResponse>;
          };
          byHotels: {
            get(params: HotelsByHotelsParams): Promise<AmadeusResponse>;
          };
        };
        pointsOfInterest: {
          get(params: LocationSimpleParams): Promise<AmadeusResponse>;
          bySquare: {
            get(params: PointsOfInterestBySquareParams): Promise<AmadeusResponse>;
          };
        };
      };
      airlines: {
        get(params: AirlinesParams): Promise<AmadeusResponse>;
      };
      recommendedLocations: {
        get(params: RecommendedLocationsParams): Promise<AmadeusResponse>;
      };
    };

    // ── Booking / Orders ─────────────────────────────────────────────────────
    booking: {
      flightOrders: {
        get(params?: Record<string, any>): Promise<AmadeusResponse>;
        getById(id: string): Promise<AmadeusResponse>;
      };
      hotelBookings: {
        get(params?: Record<string, any>): Promise<AmadeusResponse>;
        getById(id: string): Promise<AmadeusResponse>;
      };
      hotelOrders: {
        get(params?: Record<string, any>): Promise<AmadeusResponse>;
        getById(id: string): Promise<AmadeusResponse>;
      };
    };

    // ── Travel / eReputation / Media / Ordering ─────────────────────────────
    travel: {
      predictions: {
        flightDelay: {
          get(params: FlightDelayParams): Promise<AmadeusResponse>;
        };
      };
    };

    eReputation: {
      hotel: {
        get(params: HotelReputationParams): Promise<AmadeusResponse>;
      };
    };

    media: {
      hotelImage: {
        get(hotelId: string): Promise<AmadeusResponse>;
      };
    };

    ordering: {
      transferOrder(id: string): {
        transfers: {
          cancellation: {
            post(body?: Record<string, any>): Promise<AmadeusResponse>;
          };
        };
      };
    };

    airport: {
      predictions: {
        onTime: {
          get(params: AirportOnTimeParams): Promise<AmadeusResponse>;
        };
      };
    };

    analytics: {
      itineraryPriceMetrics: {
        get(params: ItineraryPriceMetricsParams): Promise<AmadeusResponse>;
      };
    };

    // ── Location utilities ───────────────────────────────────────────────────
    location: {
      airport: {
        get(params: LocationSimpleParams): Promise<AmadeusResponse>;
      };
      city: {
        get(params: LocationSimpleParams): Promise<AmadeusResponse>;
      };
      any: {
        get(params: LocationSimpleParams): Promise<AmadeusResponse>;
      };
    };

    direction: {
      arriving: {
        get(params: LocationSimpleParams): Promise<AmadeusResponse>;
      };
      departing: {
        get(params: LocationSimpleParams): Promise<AmadeusResponse>;
      };
    };
  }

  // ── Request parameter interfaces ────────────────────────────────────────────

  interface FlightOffersSearchParams {
    originLocationCode: string;             // e.g. 'FIH'
    destinationLocationCode: string;        // e.g. 'CDG'
    departureDate: string;                  // YYYY-MM-DD
    adults?: string | number;               // default '1'
    children?: string | number;
    infants?: string | number;
    currencyCode?: string;                  // e.g. 'USD'
    includedAirlineCodes?: string;          // comma-separated, e.g. 'SN,AF'
    max?: number;                           // max results
    nonStop?: boolean;
    travelClass?: 'ECONOMY' | 'BUSINESS' | 'FIRST' | 'ECONOMY_PREMIUM';
    paymentPolicy?: 'PRE_PAYMENT' | 'NOT_PRE_PAYMENT';
  }

  interface FlightDestinationsParams {
    originLocationCode: string;
    max?: number;
    currencyCode?: string;
  }

  interface FlightDatesParams {
    originLocationCode: string;
    destinationLocationCode: string;
    adults?: string | number;
    currencyCode?: string;
  }

  interface SeatmapsParams {
    offerId: string;
  }

  interface HotelOffersSearchParams {
    hotelId?: string;
    destination?: string;
    checkInDate?: string;
    checkOutDate?: string;
    adults?: string | number;
    paymentPolicy?: boolean;
    standards?: string;
    max?: number;
  }

  interface ActivitiesParams {
    destinationCode?: string;
    longitude?: string;
    latitude?: string;
    radius?: number;
    max?: number;
  }

  interface AvailabilityParams {
    offerId: string;
    paxItems?: Array<{ adults?: number; children?: number; infants?: number }>;
  }

  interface TransferOffersBody {
    departure?: { airportCode?: string; date?: string; time?: string };
    arrival?: { airportCode?: string; date?: string; time?: string };
    passengers?: number;
    currencyCode?: string;
  }

  interface FlightPredictionParams {
    offerId: string;
  }

  // ── Schedule / Flights status ──────────────────────────────────────────────
  interface ScheduleFlightsParams {
    identification: string;           // flight number e.g. 'AF420'
    carrierActions?: boolean;
  }

  // ── Reference Data params ──────────────────────────────────────────────────
  interface LocationSimpleParams {
    keyword?: string;
    subType?: string;
    countryCode?: string;
    max?: number;
  }

  interface HotelsByCityParams {
    cityCode: string;
    countryCode?: string;
    radius?: number;
    id?: string;
    longitude?: number;
    latitude?: number;
    max?: number;
  }

  interface HotelsByGeocodeParams {
    longitude: number;
    latitude: number;
    radius?: number;
    max?: number;
  }

  interface HotelsByHotelsParams {
    hotelIds: string;                 // comma-separated
  }

  interface PointsOfInterestBySquareParams {
    squareLatitude: number;
    squareLongitude: number;
    max?: number;
  }

  interface AirlinesParams {
    airlineCodes?: string;            // comma-separated
    max?: number;
  }

  interface RecommendedLocationsParams {
    cityCodes: string;                // comma-separated IATA
    travelerCountryCode: string;      // ISO 3166-1 alpha-2
  }

  // ── Flight predictions / delay ─────────────────────────────────────────────
  interface FlightDelayParams {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    departureTime: string;            // HH:mm:ss
    arrivalDate: string;
    arrivalTime: string;
    aircraftCode: string;
    carrierCode: string;
    flightNumber: string;
    duration: string;                 // ISO 8601 e.g. 'PT1H5M'
  }

  // ── Hotel reputation ───────────────────────────────────────────────────────
  interface HotelReputationParams {
    hotelId: string;
    max?: number;
  }

  // ── Airport on-time performance ────────────────────────────────────────────
  interface AirportOnTimeParams {
    airportCode: string;
    date: string;                     // YYYY-MM-DD
  }

  // ── Itinerary price metrics ────────────────────────────────────────────────
  interface ItineraryPriceMetricsParams {
    originIataCode: string;
    destinationIataCode: string;
    departureDate: string;
    currencyCode?: string;
    adults?: number;
    children?: number;
    travelClass?: string;
  }

  // ── Export the class as the module's default ───────────────────────────────
  const Amadeus: typeof Amadeus;
  export default Amadeus;
}
