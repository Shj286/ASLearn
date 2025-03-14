// COMP 3450: Mfon Udoh, Pasang Sherpa, Shubham Jangra
"use client"

import React, { useActionState, useEffect } from "react";
import SignUp from "@/components/sign-up";
import { register, RegisterActionState } from "../actions";
import { redirect } from "next/navigation";
import { toast } from "sonner";

const Register = () => {
  const [state, formAction] = useActionState<RegisterActionState, FormData>(register, {
    status: "idle",
  });

  useEffect(() => {
    if (state.status === "invalid_data") {
      console.error("Invalid data");
      toast.error("Invalid Credentials");
    } else if (state.status === "user_exists") {
      console.error("User exists with that email");
      toast.error("User already exists");
    } else if (state.status === "failed") {
      console.error("Failed to register user");
      toast.error("Failed to Register User");
    } else if (state.status === "success") {
      toast.success("Successfull!");
      redirect("/lessons");
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
  };

  return <SignUp onSubmit={handleSubmit} />;
};

export default Register;
