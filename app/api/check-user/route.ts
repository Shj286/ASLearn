import { getUser } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    const user = await getUser({ email });
    
    return NextResponse.json({ 
      exists: !!user,
      // Don't include the password in the response
      user: user ? { email: user.email, fullName: user.fullName } : null 
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ error: "Failed to check user" }, { status: 500 });
  }
} 