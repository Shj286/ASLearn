import { getUser, createUser } from "@/lib/queries";
import { hash } from "bcrypt-ts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();
    
    // Check if user already exists
    const existingUser = await getUser({ email });
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: "User already exists with this email" 
      });
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create the user
    const result = await createUser({
      email,
      password: hashedPassword,
      fullName,
    });
    
    console.log("User created with ID:", result.insertedId);
    
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
