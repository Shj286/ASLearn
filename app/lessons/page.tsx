import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

const Lessons = async () => {
  const session = await auth();

  if (!session) redirect("/register");
  return <div>Lessons go here</div>;
};

export default Lessons;
