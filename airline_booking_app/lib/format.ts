export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(amount);
}

export function formatLocal(iso: string) {
  return iso.replace("T", " ").replace(/:00([+-])/, "$1");
}

export function seatsLeft(capacity: number, bookings?: unknown[]) {
  return capacity - (bookings?.length || 0);
}
