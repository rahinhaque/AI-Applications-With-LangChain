import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

const client = new MongoClient(uri);
const db = client.db("rahins_ai");

export { client, db };
