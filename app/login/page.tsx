"use client"

import React, { useActionState } from "react";
import SignIn from "@/components/sign-in";
import { login, LoginActionState } from "../actions";
import { toast } from "sonner";
import { useEffect } from "react";
import { redirect } from "next/navigation";

const Login = () => {
  const [state, formAction] = useActionState<LoginActionState, FormData>(login, {
    status: "idle",
  });

  useEffect(() => {
    if (state.status === "invalid_data") {
      console.error("Invalid data");
      toast.error("Invalid Credentials");
    } else if (state.status === "failed") {
      console.error("Failed to log in user");
      toast.error("Failed to Login User");
    } else if (state.status === "success") {
      toast.success("Successfull!");
      redirect("/lessons");
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
    formAction(formData);
  };
  return <SignIn onSubmit={handleSubmit} />;
};

export default Login;
