"use server";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { MongoClient, ServerApiVersion } from "mongodb";
const uri = "mongodb+srv://mfonezekel:eiLtRodzWT8yPCWz@aslearn.b8raa.mongodb.net/?retryWrites=true&w=majority&appName=ASLearn";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  socketTimeoutMS: 30000,
});

const db = client.db("aslearn");

export async function getUser({ email }: { email: string }) {
  try {
    await client.connect();
    return await db.collection("users").findOne({ email: email });
  } catch (error) {
    console.error(`Failed to fetch user from the database: ${error}`);
    throw error;
  }
}

export async function createUser({ fullName, email, password }: { fullName: string; email: string; password: string }) {
  try {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);

    return await db.collection("users").insertOne({ fullName, email, password: hash });
  } catch (error) {
    console.error(`Failed to create user in the database: ${error}`);
    throw error;
  }
}
