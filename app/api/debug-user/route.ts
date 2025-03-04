import { getUser } from "@/lib/queries";
import { compare } from "bcrypt-ts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const user = await getUser({ email });
    
    if (!user) {
      return NextResponse.json({ 
        status: "error",
        message: "User not found" 
      });
    }
    
    const passwordMatch = user.password ? await compare(password, user.password) : false;
    
    return NextResponse.json({
      status: "success",
      userExists: true,
      passwordMatch,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName,
        hasPassword: !!user.password
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