import { NextRequest, NextResponse } from 'next/server';

const AIRPORTS = [
  { code: 'FIH', name: "N'djili International Airport", city: 'Kinshasa', country: 'CD', timezone: 'Africa/Kinshasa', lat: -4.411, lng: 15.649 },
  { code: 'LUB', name: 'Luena International Airport', city: 'Lubumbashi', country: 'CD', timezone: 'Africa/Lubumbashi', lat: -11.673, lng: 27.924 },
  { code: 'GOM', name: 'Goma International Airport', city: 'Goma', country: 'CD', timezone: 'Africa/Goma', lat: -1.705, lng: 29.242 },
  { code: 'FBM', name: 'Kindu Mansia International Airport', city: 'Kindu', country: 'CD', timezone: 'Africa/Kinshasa', lat: -2.917, lng: 25.917 },
  { code: 'FKI', name: 'Bangoka International Airport', city: 'Kisangani', country: 'CD', timezone: 'Africa/Kinshasa', lat: 0.541, lng: 23.487 },
  { code: 'BAA', name: 'Matari Airport', city: 'Bandundu', country: 'CD', timezone: 'Africa/Kinshasa', lat: -13.355, lng: 18.383 },
  { code: 'NBK', name: 'Nikuta Airport', city: 'Kananga', country: 'CD', timezone: 'Africa/Kinshasa', lat: -5.787, lng: 22.514 },
  { code: 'MVY', name: 'Miabo Airport', city: 'Mbuji-Mayi', country: 'CD', timezone: 'Africa/Lubumbashi', lat: -5.848, lng: 23.444 },
  { code: 'PFR', name: 'Papa Wemba International Airport', city: 'Kisangani', country: 'CD', timezone: 'Africa/Kinshasa', lat: 0.517, lng: 23.497 },
  { code: 'TNQ', name: 'Tshikapa Airport', city: 'Tshikapa', country: 'CD', timezone: 'Africa/Lubumbashi', lat: -6.819, lng: 20.775 },
];

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (code) {
    const airport = AIRPORTS.find((a) => a.code === code.toUpperCase());
    if (!airport) return NextResponse.json({ data: null }, { status: 404 });
    return NextResponse.json({ data: airport });
  }

  return NextResponse.json({ data: AIRPORTS });
}
