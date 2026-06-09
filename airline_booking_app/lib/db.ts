import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "dairy_flat_air";

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

type CachedClient = { client?: MongoClient; promise?: Promise<MongoClient> };
const globalForMongo = globalThis as typeof globalThis & { _mongo?: CachedClient };
const cached = globalForMongo._mongo || (globalForMongo._mongo = {});

export async function getDb(): Promise<Db> {
  if (!cached.promise) {
    cached.client = new MongoClient(uri!);
    cached.promise = cached.client.connect();
  }
  const client = await cached.promise;
  return client.db(dbName);
}
