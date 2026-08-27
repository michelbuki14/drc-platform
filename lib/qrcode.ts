import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: { dark: '#2E3A87', light: '#FFFFFF' },
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return '';
  }
}

export function generateBoardingPassData(booking: any): string {
  return JSON.stringify({
    ref: booking.reference,
    flight: booking.flight?.flightNo,
    passenger: booking.passengers?.[0]?.name,
    seat: booking.passengers?.[0]?.seat,
    date: booking.flight?.departTime,
  });
}
