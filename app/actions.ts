"use server";

import { signIn } from "@/auth";
import { createUser, getUser } from "@/lib/queries";
import { authSchema } from "@/lib/zod";
import { z } from "zod";

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

    await createUser({ fullName: validatedData.name, email: validatedData.email, password: validatedData.password });

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
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

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) return { status: "invalid_data" };
    console.error("Failed: ", error);
    return { status: "failed" };
  }
}

export async function signInWithGoogle(){
  try {
    await signIn("google");
  } catch (error) {
    console.error("Failed to sign in with Google", error)
  }
}
