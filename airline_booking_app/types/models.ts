import type { ObjectId } from "mongodb";

export type AirportCode = "NZNE" | "YSSY" | "NZRO" | "NZCI" | "NZGB" | "NZTL";

export type Airport = {
  code: AirportCode;
  name: string;
  city: string;
  timezoneLabel: string;
  utcOffset: string;
};

export type Customer = {
  _id?: ObjectId;
  sourceId: string;
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
};

export type Booking = {
  reference: string;
  customerId: ObjectId;
  customerName: string;
  customerEmail: string;
  bookedAt: Date;
};

export type Schedule = {
  _id?: ObjectId;
  flightNumber: string;
  routeKey: string;
  aircraft: string;
  capacity: number;
  origin: Airport;
  destination: Airport;
  departureLocal: string;
  arrivalLocal: string;
  departureUtc: Date;
  arrivalUtc: Date;
  price: number;
  bookings: Booking[];
};
