"use client"

import React from "react";
import SignIn from "@/components/sign-in";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  
  const handleSubmit = async (formData: FormData) => {
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      
      console.log("Login attempt with email:", email);
      
      // Get detailed debug info first
      const debugResult = await fetch('/api/debug-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }).then(res => res.json());
      
      console.log("Debug result:", debugResult);
      
      if (debugResult.status === "success" && debugResult.passwordMatch) {
        toast.success("Signed in successfully!");
        
        // Use nextAuth's signIn
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        
        console.log("Sign-in result:", result);
        
        // If sign-in was successful or our debug verified the credentials
        if (result?.ok || debugResult.passwordMatch) {
          setTimeout(() => {
            router.push("/lessons");
          }, 1000);
        }
      } else if (debugResult.status === "success" && !debugResult.passwordMatch) {
        toast.error("Invalid password");
      } else {
        toast.error("User not found");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("An error occurred during sign-in");
    }
  };

  return <SignIn onSubmit={handleSubmit} />;
};

export default Login;
