"use server";

import { signIn } from "@/auth";
import { createUser, getUser } from "@/lib/queries";
import { authSchema } from "@/lib/zod";
import { z } from "zod";
import { hash, compare } from "bcrypt-ts";
import { redirect } from "next/navigation";

export interface RegisterActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "user_exists" | "invalid_data";
}

export async function register(_: RegisterActionState, formData: FormData): Promise<RegisterActionState> {
  try {
    const validatedData = authSchema.parse({
      name: formData.get("fullname"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const user = await getUser({ email: validatedData.email });

    if (user) return { status: "user_exists" };

    // Hash the password before storing
    const hashedPassword = await hash(validatedData.password, 10);
    
    await createUser({ 
      fullName: validatedData.name, 
      email: validatedData.email, 
      password: hashedPassword 
    });

    // Sign in the user after registration
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password, // Use the original password for sign-in
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }
    return { status: "failed" };
  }
}

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
}

export async function login(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  try {
    const validatedData = authSchema.omit({ name: true }).parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Get the user from the database
    const user = await getUser({ email: validatedData.email });
    
    // If no user found, return failed
    if (!user) {
      console.log("No user found with this email");
      return { status: "failed" };
    }
    
    // Compare the password with the stored hash
    const passwordMatch = await compare(validatedData.password, user.password);
    
    if (!passwordMatch) {
      console.log("Password doesn't match");
      return { status: "failed" };
    }

    // If password matches, sign in the user
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) return { status: "invalid_data" };
    return { status: "failed" };
  }
}

export async function signInWithGoogle() {
  redirect(`/api/auth/signin/google?callbackUrl=/lessons`);
}

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullname") as string;

  // Hash the password
  const hashedPassword = await hash(password, 10);

  // Create the user in your database
  await createUser({
    email,
    password: hashedPassword,
    fullName,
  });

  return { success: true };
}
