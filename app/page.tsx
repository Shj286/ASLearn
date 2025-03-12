import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { auth } from "@/auth"
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if(session) redirect("/lessons");

  return (
    <main className="min-h-screen bg-[#faf6eb]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Updated Header to match sign-in page */}
        <header className="mb-12 pt-4">
          <div className="flex items-center">
            <span className="text-3xl font-serif italic">ASL</span>
            <div className="ml-1 flex">
              {/* Sign language finger spelling for "LEARN" */}
              <span className="text-xs tracking-widest mt-1">LEARN</span>
            </div>
          </div>
        </header>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 relative">
          {/* Real-Time Feedback Card */}
          <div className="bg-[#b8e0ff] rounded-3xl p-8 flex items-center justify-between">
            <h2 className="text-xl font-medium">Real-Time Feedback</h2>
            <div className="w-24 h-24 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="10" y="10" width="40" height="70" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M20,50 Q30,40 40,50" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="50" y="20" width="30" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M60,40 L60,60 Q60,70 70,70 L80,70" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Happy Face Icon */}
          <div className="absolute top-0 right-0 md:top-0 md:right-1/4 transform translate-x-1/2 -translate-y-1/2">
            <svg className="w-16 h-16" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="black" strokeWidth="2" />
              <path d="M30,40 Q30,30 40,30" fill="none" stroke="black" strokeWidth="2" />
              <path d="M70,40 Q70,30 60,30" fill="none" stroke="black" strokeWidth="2" />
              <path d="M25,65 Q50,85 75,65" fill="none" stroke="black" strokeWidth="2" />
              <circle cx="20" cy="20" r="3" fill="black" />
              <circle cx="80" cy="20" r="3" fill="black" />
              <path d="M75,15 L85,5" stroke="black" strokeWidth="2" />
              <path d="M25,15 L15,5" stroke="black" strokeWidth="2" />
            </svg>
          </div>

          {/* Tutorials Card */}
          <div className="bg-[#ffcce6] rounded-3xl p-8 flex items-center justify-between">
            <h2 className="text-xl font-medium">Tutorials</h2>
            <div className="w-24 h-24 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="20" y="10" width="60" height="80" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M45,45 L55,50 L45,55 Z" fill="currentColor" />
                <rect x="65" y="30" width="20" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M75,40 L65,50" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M85,70 L95,80" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M85,80 L95,70" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* AI Integration Card */}
          <div className="bg-[#d8c8e3] rounded-3xl p-8 col-span-1 md:col-span-2 md:w-1/2 flex items-center justify-between">
            <h2 className="text-xl font-medium">AI Integration</h2>
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-16 h-16">
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M50,20 L50,10" stroke="currentColor" strokeWidth="2" />
                <path d="M50,90 L50,80" stroke="currentColor" strokeWidth="2" />
                <path d="M20,50 L10,50" stroke="currentColor" strokeWidth="2" />
                <path d="M90,50 L80,50" stroke="currentColor" strokeWidth="2" />
                <path d="M35,35 L25,25" stroke="currentColor" strokeWidth="2" />
                <path d="M65,35 L75,25" stroke="currentColor" strokeWidth="2" />
                <path d="M35,65 L25,75" stroke="currentColor" strokeWidth="2" />
                <path d="M65,65 L75,75" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M40,50 C40,40 60,40 60,50 C60,60 40,60 40,50 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Get Started Button */}
        <div className="flex justify-end">
          <Link
            href="/login"
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-6 py-3 hover:shadow-md transition-shadow"
          >
            <span className="font-medium">Get Started</span>
            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}

