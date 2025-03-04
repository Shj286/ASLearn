import { getUser } from "@/lib/queries";
import { hash } from "bcrypt-ts";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();
    
    console.log(`Registration - email: ${email}, name: ${fullName}`);
    
    // Check if user already exists
    const existingUser = await getUser({ email });
    if (existingUser) {
      console.log(`Registration - user already exists: ${email}`);
      return NextResponse.json({ 
        success: false, 
        message: "User already exists with this email" 
      });
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    console.log(`Registration - password hashed, first chars: ${hashedPassword.substring(0, 10)}...`);
    
    // Create the user directly using the MongoDB client
    const client = await clientPromise;
    const db = client.db("aslearn");
    
    const result = await db.collection("users").insertOne({
      fullName,
      email,
      password: hashedPassword,
      createdAt: new Date()
    });
    
    console.log(`Registration - user created with ID: ${result.insertedId}`);
    
    return NextResponse.json({ 
      success: true,
      message: "User registered successfully",
      userId: result.insertedId
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ 
      success: false, 
      message: String(error) 
    }, { status: 500 });
  }
}
