import { getUser } from "@/lib/queries";
import { compare } from "bcrypt-ts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log(`Debug route - checking email: ${email}`);
    
    const user = await getUser({ email });
    
    if (!user) {
      console.log(`Debug route - no user found for email: ${email}`);
      return NextResponse.json({ 
        status: "error",
        message: "User not found" 
      });
    }
    
    console.log(`Debug route - user found: ${user._id}`);
    console.log(`Debug route - password in DB: ${user.password ? "exists" : "missing"}`);
    
    // If the password exists, compare it
    let passwordMatch = false;
    if (user.password) {
      console.log(`Debug route - comparing passwords`);
      passwordMatch = await compare(password, user.password);
      console.log(`Debug route - password match result: ${passwordMatch}`);
    }
    
    return NextResponse.json({
      status: "success",
      userExists: true,
      passwordMatch,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName,
        hasPassword: !!user.password,
        passwordFirstChars: user.password ? user.password.substring(0, 10) + "..." : null
      }
    });
  } catch (error) {
    console.error("Debug user error:", error);
    return NextResponse.json({ 
      status: "error",
      message: String(error)
    }, { status: 500 });
  }
} 