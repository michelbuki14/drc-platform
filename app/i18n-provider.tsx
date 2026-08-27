'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface LangConfig {
  code: string;
  name: string;
  flag: string;
}

// Translation structure type
type LocaleSection = Record<string, string>;
type LocaleFull = Record<string, LocaleSection>;
type AllLocales = Record<string, LocaleFull>;

const LANGUAGES: LangConfig[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ln', name: 'Lingala', flag: '🇨🇩' },
];

const I18N: AllLocales = {
  en: {
    nav: {
      home: 'Home',
      flights: 'Flights',
      hotels: 'Hotels',
      vehicles: 'Vehicles',
      attractions: 'Attractions',
      tours: 'Tours',
      shipping: 'Shipping',
      support: 'Support',
      account: 'Account',
      logout: 'Logout',
    },
    common: {
      search: 'Search...',
      book: 'Book Now',
      view: 'View Details',
      back: 'Back',
      next: 'Next',
      confirm: 'Confirm',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Something went wrong',
      success: 'Success!',
      welcome: 'Welcome to CongoConnect',
      subtitle: 'Your gateway to travel in the DRC',
    },
    flight: {
      from: 'From',
      to: 'To',
      departure: 'Departure',
      arrival: 'Arrival',
      duration: 'Duration',
      price: 'Price (USD)',
      seats: 'Seats',
      select: 'Select Flight',
      noFlights: 'No flights found',
    },
    hotel: {
      checkin: 'Check-in',
      checkout: 'Check-out',
      guests: 'Guests',
      rooms: 'Rooms',
      perNight: 'per night',
      noHotels: 'No hotels found',
    },
    vehicle: {
      pickup: 'Pickup Location',
      dropoff: 'Drop-off Location',
      date: 'Pickup Date',
      returnDate: 'Return Date',
      noVehicles: 'No vehicles available',
    },
    booking: {
      title: 'Your Booking',
      reference: 'Booking Reference',
      flight: 'Flight Details',
      passenger: 'Passenger',
      seat: 'Seat',
      class: 'Class',
      total: 'Total Paid',
      status: 'Status',
      confirmed: 'Confirmed',
      pending: 'Pending',
      cancelled: 'Cancelled',
      emailSent: 'Confirmation email sent',
      viewAll: 'View All Bookings',
      create: 'Create Booking',
    },
    search: {
      title: 'Search Results',
      filter: 'Filter',
      clearFilter: 'Clear Filters',
      results: 'results found',
      sortBy: 'Sort by',
      priceLow: 'Price: Low to High',
      priceHigh: 'Price: High to Low',
      dateEarliest: 'Date: Earliest',
      dateLatest: 'Date: Latest',
      airline: 'Airline',
      allAirlines: 'All Airlines',
      apply: 'Apply Filters',
      noResults: 'No results match your filters',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      flights: 'Vols',
      hotels: 'Hôtels',
      vehicles: 'Véhicules',
      attractions: 'Attractions',
      tours: 'Circuits',
      shipping: 'Fret',
      support: 'Assistance',
      account: 'Compte',
      logout: 'Déconnexion',
    },
    common: {
      search: 'Rechercher...',
      book: 'Réserver',
      view: 'Voir les détails',
      back: 'Retour',
      next: 'Suivant',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      loading: 'Chargement...',
      error: 'Une erreur s\'est produite',
      success: 'Succès!',
      welcome: 'Bienvenue sur CongoConnect',
      subtitle: 'Votre porte d\'entrée pour voyager en RDC',
    },
    flight: {
      from: 'De',
      to: 'Vers',
      departure: 'Départ',
      arrival: 'Arrivée',
      duration: 'Durée',
      price: 'Prix (USD)',
      seats: 'Places',
      select: 'Sélectionner ce vol',
      noFlights: 'Aucun vol trouvé',
    },
    hotel: {
      checkin: 'Arrivée',
      checkout: 'Départ',
      guests: 'Voyageurs',
      rooms: 'Chambres',
      perNight: 'par nuit',
      noHotels: 'Aucun hôtel trouvé',
    },
    vehicle: {
      pickup: 'Lieu de prise',
      dropoff: 'Lieu de retour',
      date: 'Date de prise',
      returnDate: 'Date de retour',
      noVehicles: 'Aucun véhicule disponible',
    },
    booking: {
      title: 'Votre réservation',
      reference: 'Référence',
      flight: 'Détails du vol',
      passenger: 'Passager',
      seat: 'Place',
      class: 'Classe',
      total: 'Total payé',
      status: 'Statut',
      confirmed: 'Confirmée',
      pending: 'En attente',
      cancelled: 'Annulée',
      emailSent: 'Email de confirmation envoyé',
      viewAll: 'Voir toutes les réservations',
      create: 'Créer une réservation',
    },
    search: {
      title: 'Résultats de recherche',
      filter: 'Filtrer',
      clearFilter: 'Effacer les filtres',
      results: 'résultats trouvés',
      sortBy: 'Trier par',
      priceLow: 'Prix: Croissant',
      priceHigh: 'Prix: Décroissant',
      dateEarliest: 'Date: La plus proche',
      dateLatest: 'Date: La plus lointaine',
      airline: 'Compagnie',
      allAirlines: 'Toutes les compagnies',
      apply: 'Appliquer les filtres',
      noResults: 'Aucun résultat ne correspond à vos filtres',
    },
  },
  ln: {
    nav: {
      home: 'Ebongi',
      flights: 'Mipepe',
      hotels: 'Misato',
      vehicles: 'Moto',
      attractions: 'Bozali',
      tours: 'Bozali moko',
      shipping: 'Bilembo',
      support: 'Bosalisi',
      account: 'Conti',
      logout: 'Kotolola',
    },
    common: {
      search: 'Tonga...',
      book: 'Botia',
      view: 'Tonga ngai',
      back: 'Koka',
      next: 'Mposa',
      confirm: 'Ndima',
      cancel: 'Longola',
      loading: 'Ekokisama...',
      error: 'Bikosa te',
      success: 'Elandi!',
      welcome: 'Mboté na CongoConnect',
      subtitle: 'Lobo ya voyage na RDC',
    },
    flight: {
      from: 'Kowuta',
      to: 'Kokende',
      departure: 'Bobimoli',
      arrival: 'Bokoteli',
      duration: 'Ngala',
      price: 'Ntóko (USD)',
      seats: 'Ba',
      select: 'Kozonga mipepe',
      noFlights: 'Mipepe ekomi te',
    },
    hotel: {
      checkin: 'Bobodiela',
      checkout: 'Bokalamisi',
      guests: 'Bampeli',
      rooms: 'Batohor',
      perNight: 'ngoyi',
      noHotels: 'Misato ekomi te',
    },
    vehicle: {
      pickup: 'Kokenda',
      dropoff: 'Kokoteli',
      date: 'Lomami ya kokenda',
      returnDate: 'Lomami ya bokoteli',
      noVehicles: 'Moto ekomi te',
    },
    booking: {
      title: 'Réservation elingi',
      reference: 'Elembo',
      flight: 'Mipepe esengeli',
      passenger: 'Bapaya',
      seat: 'Baboli',
      class: 'Bokka',
      total: 'Ntoko mosusu',
      status: 'Bokolo',
      confirmed: 'Endimami',
      pending: 'Kozela',
      cancelled: 'Elongólamí',
      emailSent: 'Email elingi',
      viewAll: 'Tonga bongi',
      create: 'Kozonga réservation',
    },
    search: {
      title: 'Bozali ya tonga',
      filter: 'Kokótisela',
      clearFilter: 'Kobakisa',
      results: 'bozali ekomi',
      sortBy: 'Kóbóndisa',
      priceLow: 'Ntoko: Lonola na kotanga',
      priceHigh: 'Ntoko: Konyama na kotambola',
      dateEarliest: 'Lomami: Yebomololi',
      dateLatest: 'Lomami: Yebongi',
      airline: 'Bekeli',
      allAirlines: 'Bekeli mosusu',
      apply: 'Kopaka',
      noResults: 'Bozali ekomi te na filtre yo',
    },
  },
} as const;

interface TranslationProviderProps {
  children: React.ReactNode;
}

export default function TranslationProvider({ children }: TranslationProviderProps) {
  const [locale, setLocale] = useState<string>('en');
  const [t, setT] = useState<typeof I18N.en>(I18N.en);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('currentLocale') || 'en';
      setLocale(saved);
      setT(I18N[saved as keyof typeof I18N] || I18N.en);
    }
  }, []);

  const changeLocale = (code: string) => {
    setLocale(code);
    setT(I18N[code as keyof typeof I18N] || I18N.en);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentLocale', code);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-sans antialiased">
      {/* Header with language switcher */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border-subtle)] bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold text-sm">
              CC
            </div>
            <span className="hidden sm:block font-display font-bold text-[var(--color-primary)] text-lg">
              CongoConnect
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {Object.entries(I18N.en.nav).map(([key, label]) => (
              <Link
                key={key}
                href={key === 'home' ? '/' : `/${key === 'shipping' ? 'shipping' : key === 'support' ? 'support' : key}`}
                className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side: Language switcher + Account */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 rounded-lg bg-[var(--color-bg)] px-1 py-1 shadow-sm">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeLocale(lang.code)}
                  className={`rounded px-2 py-0.5 text-xs font-medium transition-all ${
                    locale === lang.code
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'
                  }`}
                  title={lang.name}
                >
                  {lang.code.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Account button */}
            <Link href="/account" className="rounded-lg bg-[var(--color-primary)] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[var(--color-accent)] transition-colors">
              {t.nav.account}
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div className="lg:hidden border-b border-[var(--color-border-subtle)] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[600px] items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold text-xs">
              CC
            </div>
            <span className="font-display font-bold text-[var(--color-primary)]">CongoConnect</span>
          </Link>
          <div className="flex items-center gap-1">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLocale(lang.code)}
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-all ${
                  locale === lang.code
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <nav className="mx-auto flex max-w-[600px] flex-wrap items-center justify-center gap-2 px-4 py-2">
          {Object.entries(I18N.en.nav).map(([key, label]) => (
            <Link
              key={key}
              href={key === 'home' ? '/' : `/${key === 'shipping' ? 'shipping' : key === 'support' ? 'support' : key}`}
              className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-[1200px] px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-subtle)] bg-white/50 mt-12">
        <div className="mx-auto max-w-[1200px] px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
          <p>CongoConnect — Made for DRC travelers</p>
        </div>
      </footer>

      {/* Current locale context for screen readers */}
      <span className="sr-only">Current locale: {locale}</span>
    </div>
  );
}

export function useLocale() {
  const [locale, setLocale] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentLocale') || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentLocale', locale);
    }
  }, [locale]);

  const t = I18N[locale as keyof typeof I18N] || I18N.en;

  return { locale, setLocale, t };
}

export function Trans({ key, ...rest }: { key: string } & React.HTMLAttributes<HTMLSpanElement>) {
  const { t } = useLocale();
  // Split key by dots: e.g., "nav.home" -> t.nav.home
  const keys = key.split('.');
  let value: string | undefined = undefined;
  let obj: any = t;
  for (const k of keys) {
    if (obj && obj[k] !== undefined) {
      obj = obj[k];
      if (typeof obj === 'string') {
        value = obj;
        break;
      }
    } else {
      break;
    }
  }
  return <span {...rest}>{value || key}</span>;
}

export { I18N, LANGUAGES };
