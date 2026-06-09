import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "dairy_flat_air";
if (!uri) throw new Error("Set MONGODB_URI before running npm run seed");

const AIRPORTS = {
  NZNE: { code: "NZNE", name: "Dairy Flat Airport", city: "Auckland North", timezoneLabel: "Mainland NZ", utcOffset: "+12:00" },
  YSSY: { code: "YSSY", name: "Sydney Airport", city: "Sydney", timezoneLabel: "Sydney", utcOffset: "+10:00" },
  NZRO: { code: "NZRO", name: "Rotorua Airport", city: "Rotorua", timezoneLabel: "Mainland NZ", utcOffset: "+12:00" },
  NZCI: { code: "NZCI", name: "Tuuta Airport", city: "Chatham Islands", timezoneLabel: "Chatham Islands", utcOffset: "+12:45" },
  NZGB: { code: "NZGB", name: "Claris Airport", city: "Great Barrier Island", timezoneLabel: "Mainland NZ", utcOffset: "+12:00" },
  NZTL: { code: "NZTL", name: "Lake Tekapo Airport", city: "Lake Tekapo", timezoneLabel: "Mainland NZ", utcOffset: "+12:00" }
};

const rules = [
  { days:[5], fn:"DFA101", routeKey:"NZNE-YSSY-FRI", aircraft:"SyberJet SJ30i", capacity:6, orig:"NZNE", dest:"YSSY", dep:"10:00", arr:"11:30", price:1900 },
  { days:[0], fn:"DFA102", routeKey:"YSSY-NZNE-SUN", aircraft:"SyberJet SJ30i", capacity:6, orig:"YSSY", dest:"NZNE", dep:"15:00", arr:"20:30", price:1900 },
  ...[1,2,3,4,5].flatMap(d => [
    { days:[d], fn:"DFA201", routeKey:`NZNE-NZRO-${d}-AM`, aircraft:"Cirrus Vision SF50", capacity:4, orig:"NZNE", dest:"NZRO", dep:"06:45", arr:"07:30", price:310 },
    { days:[d], fn:"DFA202", routeKey:`NZRO-NZNE-${d}-AM`, aircraft:"Cirrus Vision SF50", capacity:4, orig:"NZRO", dest:"NZNE", dep:"08:00", arr:"08:45", price:310 },
    { days:[d], fn:"DFA203", routeKey:`NZNE-NZRO-${d}-PM`, aircraft:"Cirrus Vision SF50", capacity:4, orig:"NZNE", dest:"NZRO", dep:"16:30", arr:"17:15", price:330 },
    { days:[d], fn:"DFA204", routeKey:`NZRO-NZNE-${d}-PM`, aircraft:"Cirrus Vision SF50", capacity:4, orig:"NZRO", dest:"NZNE", dep:"18:00", arr:"18:45", price:330 }
  ]),
  { days:[1,3,5], fn:"DFA301", routeKey:"NZNE-NZGB", aircraft:"Cirrus Vision SF50", capacity:4, orig:"NZNE", dest:"NZGB", dep:"09:00", arr:"09:35", price:260 },
  { days:[2,4,6], fn:"DFA302", routeKey:"NZGB-NZNE", aircraft:"Cirrus Vision SF50", capacity:4, orig:"NZGB", dest:"NZNE", dep:"10:00", arr:"10:35", price:260 },
  { days:[2,5], fn:"DFA401", routeKey:"NZNE-NZCI", aircraft:"HondaJet Elite", capacity:5, orig:"NZNE", dest:"NZCI", dep:"09:00", arr:"13:00", price:1250 },
  { days:[3,6], fn:"DFA402", routeKey:"NZCI-NZNE", aircraft:"HondaJet Elite", capacity:5, orig:"NZCI", dest:"NZNE", dep:"10:00", arr:"12:30", price:1250 },
  { days:[1], fn:"DFA501", routeKey:"NZNE-NZTL", aircraft:"HondaJet Elite", capacity:5, orig:"NZNE", dest:"NZTL", dep:"11:00", arr:"12:45", price:790 },
  { days:[2], fn:"DFA502", routeKey:"NZTL-NZNE", aircraft:"HondaJet Elite", capacity:5, orig:"NZTL", dest:"NZNE", dep:"10:00", arr:"12:00", price:790 }
];

function pad(n) { return String(n).padStart(2, "0"); }
function dateKey(date) { return `${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())}`; }
function isoLocal(date, time, offset) { return `${dateKey(date)}T${time}:00${offset}`; }
function weekdayUtc(date) { return date.getUTCDay(); }
function startDate() {
  const today = new Date();
  const utc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  utc.setUTCDate(utc.getUTCDate() - 14);
  return utc;
}
function addDays(date, n) { const copy = new Date(date); copy.setUTCDate(copy.getUTCDate() + n); return copy; }

function buildSchedules() {
  const start = startDate();
  const docs = [];
  for (let i = 0; i < 140; i++) {
    const date = addDays(start, i);
    for (const rule of rules) {
      if (!rule.days.includes(weekdayUtc(date))) continue;
      const origin = AIRPORTS[rule.orig];
      const destination = AIRPORTS[rule.dest];
      const departureLocal = isoLocal(date, rule.dep, origin.utcOffset);
      const arrivalLocal = isoLocal(date, rule.arr, destination.utcOffset);
      docs.push({
        flightNumber: rule.fn,
        routeKey: rule.routeKey,
        aircraft: rule.aircraft,
        capacity: rule.capacity,
        origin,
        destination,
        departureLocal,
        arrivalLocal,
        departureUtc: new Date(departureLocal),
        arrivalUtc: new Date(arrivalLocal),
        price: rule.price,
        bookings: []
      });
    }
  }
  return docs.sort((a,b) => a.departureUtc - b.departureUtc);
}

function parseCustomers() {
  const csv = fs.readFileSync(path.join(process.cwd(), "seed", "customers.csv"), "utf8").trim().split(/\r?\n/);
  return csv.map(line => {
    const [sourceId, title, firstName, lastName, gender, email] = line.split(",");
    return { sourceId, title, firstName, lastName, gender, email };
  }).filter(c => c.email && c.email.includes("@"));
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);

  await db.collection("customers").deleteMany({});
  await db.collection("schedules").deleteMany({});
  await db.collection("bookings").deleteMany({});

  const parsedCustomers = parseCustomers();

  const uniqueCustomers = Array.from(
    new Map(parsedCustomers.map((customer) => [customer.email, customer])).values()
  );

  await db.collection("customers").insertMany(uniqueCustomers);

  await db.collection("schedules").insertMany(buildSchedules());

  await db.collection("customers").createIndex({ email: 1 }, { unique: true });
  await db.collection("schedules").createIndex({ flightDate: 1, origin: 1, destination: 1 });
  await db.collection("schedules").createIndex({ "bookings.reference": 1 });
  console.log("Seed complete");
} finally {
  await client.close();
}
