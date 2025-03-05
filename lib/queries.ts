"use server";

import { genSaltSync, hashSync } from "bcrypt-ts";
import client from "./mongodb";
import { MongoClient } from "mongodb";

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
    return await db.collection("users").findOne({ email: email });
  } catch (error) {
    console.error(`Failed to fetch user from the database: ${error}`);
    throw error;
  }
}

export async function createUser({ fullName, email, password }: { fullName: string; email: string; password: string }) {
  try {
    await connectToDatabase();

    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);

    return await db.collection("users").insertOne({ fullName, email, password: hash });
  } catch (error) {
    console.error(`Failed to create user in the database: ${error}`);
    throw error;
  }
}