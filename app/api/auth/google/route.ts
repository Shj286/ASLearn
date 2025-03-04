import { NextResponse } from "next/server";

// This route helps debug Google OAuth issues
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const error = searchParams.get("error");
    
    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }
    
    const callbackUrl = searchParams.get("callbackUrl") || "/lessons";
    
    return NextResponse.redirect(new URL(`/api/auth/signin/google?callbackUrl=${callbackUrl}`, request.url));
  } catch (error) {
    console.error("Google sign-in error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 