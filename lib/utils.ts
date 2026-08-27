export function trackingRef(): string {
  return "BK-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function ticketNo(): string {
  return "NX-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function seatLabel(row: number, letter: string): string {
  return `${row}${letter}`;
}

// Deterministic seat grid for a cabin
export function buildSeatMap(cabinClass: "Y" | "C", totalY: number, totalC: number) {
  if (cabinClass === "C") {
    const rows = Math.ceil(totalC / 4);
    return Array.from({ length: rows }, (_, r) => ({
      row: r + 1,
      seats: ["A", "C", "D", "F"],
    }));
  }
  const rows = Math.ceil(totalY / 6);
  return Array.from({ length: rows }, (_, r) => ({
    row: r + 10,
    seats: ["A", "B", "C", "D", "E", "F"],
  }));
}
