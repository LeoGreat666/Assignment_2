import { AIRPORTS } from "./airports";
import type { AirportCode } from "@/types/models";

export function isAirportCode(value: string | null): value is AirportCode {
  return !!value && Object.prototype.hasOwnProperty.call(AIRPORTS, value);
}

export function isIsoDate(value: string | null) {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
