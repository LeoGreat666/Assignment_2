import type { Airport, AirportCode } from "@/types/models";

export const AIRPORTS: Record<AirportCode, Airport> = {
  NZNE: { code: "NZNE", name: "Dairy Flat Airport", city: "Auckland North", timezoneLabel: "Mainland NZ", utcOffset: "+12:00" },
  YSSY: { code: "YSSY", name: "Sydney Airport", city: "Sydney", timezoneLabel: "Sydney", utcOffset: "+10:00" },
  NZRO: { code: "NZRO", name: "Rotorua Airport", city: "Rotorua", timezoneLabel: "Mainland NZ", utcOffset: "+12:00" },
  NZCI: { code: "NZCI", name: "Tuuta Airport", city: "Chatham Islands", timezoneLabel: "Chatham Islands", utcOffset: "+12:45" },
  NZGB: { code: "NZGB", name: "Claris Airport", city: "Great Barrier Island", timezoneLabel: "Mainland NZ", utcOffset: "+12:00" },
  NZTL: { code: "NZTL", name: "Lake Tekapo Airport", city: "Lake Tekapo", timezoneLabel: "Mainland NZ", utcOffset: "+12:00" }
};

export const airportOptions = Object.values(AIRPORTS);
