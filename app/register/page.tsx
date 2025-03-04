"use client"

import React from "react";
import SignUp from "@/components/sign-up";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Register = () => {
  const router = useRouter();
  
  const handleSubmit = async (formData: FormData) => {
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const fullName = formData.get("fullname") as string;
      
      console.log("Registration attempt with email:", email);
      
      // Register the user
      const registerResponse = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      }).then(res => res.json());
      
      console.log("Registration result:", registerResponse);
      
      if (registerResponse.success) {
        toast.success("Registration successful! Please log in.");
        
        // Redirect to login page instead of directly signing in
        setTimeout(() => {
          router.push("/login");
        }, 1500); // Short delay so the user can see the success message
      } else {
        toast.error(registerResponse.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
    }
  };

  return <SignUp onSubmit={handleSubmit} />;
};

export default Register;
