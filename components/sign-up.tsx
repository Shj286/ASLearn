"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { signInWithGoogle } from "@/app/actions";

export default function SignUp({ onSubmit }: { onSubmit: (formData: FormData) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <div className="flex items-center">
              <span className="text-3xl font-serif italic">ASL</span>
              <div className="ml-1 flex">
                {/* Sign language finger spelling for "LEARN" */}
                <span className="text-xs tracking-widest mt-1">LEARN</span>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <div>
              <h2 className="text-2xl font-bold leading-9 tracking-tight">Get Started Now!</h2>
            </div>

            <div className="mt-6">
              <form action={onSubmit} method="POST" className="space-y-6">
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium leading-6 text-gray-900">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <Input id="fullname" name="fullname" type="text" autoComplete="name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required className="border-gray-300" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Input id="email" name="email" type="email" autoComplete="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border-gray-300" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                      Password
                    </label>
                    <div className="text-sm">
                      <Link href="#" className="text-blue-600 hover:text-blue-500 text-xs">
                        forgot password
                      </Link>
                    </div>
                  </div>
                  <div className="mt-1">
                    <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="border-gray-300" />
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
                    <label htmlFor="remember-me" className="text-xs text-gray-900">
                      Remember for 30 days
                    </label>
                  </div>
                </div>

                <div>
                  <Button type="submit" className="w-full bg-[#3b6e29] hover:bg-[#2e5720] text-white py-2 rounded">
                    Signup
                  </Button>
                </div>
              </form>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              <div className="mt-6 ">
                <button type="button" className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50" onClick={signInWithGoogle}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" fill="#EA4335" />
                  </svg>
                  <span className="text-xs">Sign in with Google</span>
                </button>
              </div>
            </div>

            <p className="mt-10 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="login" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full flex items-center justify-center">
          <svg width="300" height="500" viewBox="0 0 300 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full max-h-full">
            <path d="M150 50C170 80 200 120 190 160C180 200 150 220 140 260C130 300 150 340 180 380C210 420 250 450 270 480" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M120 100C140 120 170 150 160 180C150 210 120 230 110 260C100 290 110 320 130 350C150 380 180 410 190 440" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M180 150C200 170 220 200 210 230C200 260 170 280 160 310C150 340 160 370 180 400C200 430 230 460 240 490" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <ellipse cx="190" cy="160" rx="20" ry="30" transform="rotate(-20 190 160)" stroke="black" strokeWidth="1.5" fill="none" />
            <ellipse cx="140" cy="260" rx="20" ry="30" transform="rotate(-20 140 260)" stroke="black" strokeWidth="1.5" fill="none" />
            <ellipse cx="180" cy="380" rx="20" ry="30" transform="rotate(-20 180 380)" stroke="black" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}
