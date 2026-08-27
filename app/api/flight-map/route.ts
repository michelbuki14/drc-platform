import { NextRequest, NextResponse } from 'next/server';

const MAP_POSITIONS = [
  { id: 'map1', flightNo: 'CA-101', lat: -4.411, lng: 15.649, altitude: 35000, speed: 450 },
  { id: 'map2', flightNo: 'CA-205', lat: -11.673, lng: 27.924, altitude: 32000, speed: 420 },
  { id: 'map3', flightNo: 'FA-300', lat: -5.848, lng: 23.444, altitude: 28000, speed: 380 },
  { id: 'map4', flightNo: 'UA-789', lat: -2.917, lng: 25.917, altitude: 38000, speed: 470 },
];

export async function GET(req: NextRequest) {
  const flightNo = req.nextUrl.searchParams.get('flightNo');
  if (flightNo) {
    const p = MAP_POSITIONS.find((p) => p.flightNo === flightNo);
    if (!p) return NextResponse.json({ data: null }, { status: 404 });
    return NextResponse.json({ data: p });
  }

  return NextResponse.json({ data: MAP_POSITIONS });
}
