"use server";

import { hash, compare } from "bcrypt-ts";
import { MongoClient, ServerApiVersion } from "mongodb";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGO_DB_URI!, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 1,
  connectTimeoutMS: 30000,
  heartbeatFrequencyMS: 10000,
  maxIdleTimeMS: 120000,
});

const db = client.db("aslearn");

let clientPromise: Promise<MongoClient> | null = null;

async function connectToDatabase() {
  if (!clientPromise) {
    clientPromise = client.connect().catch((error) => {
      clientPromise = null;
      console.error("Failed to connect to MongoDB: ", error);
      throw error;
    });
  }
  return clientPromise;
}

export async function getUser({ email }: { email: string }) {
  try {
    await connectToDatabase();
    const user = await db.collection("users").findOne({ email });
    console.log("User found:", user ? "Yes" : "No");
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function createUser({ fullName, email, password }: { fullName: string; email: string; password: string }) {
  try {
    await connectToDatabase();

    const hashedPassword = await hash(password, 10);

    return await db.collection("users").insertOne({ fullName, email, password: hashedPassword });
  } catch (error) {
    console.error(`Failed to create user in the database: ${error}`);
    throw error;
  }
}
