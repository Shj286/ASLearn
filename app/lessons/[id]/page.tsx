import Link from "next/link";
import WebcamStream from "@/components/webcam-stream";

export default async function Page (props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  return (
    <div className="w-full">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white">
        <div className="flex items-center space-x-2">
          <div className="font-serif italic">
            <span className="text-2xl">A</span>
            <span className="text-2xl ml-1">S</span>
            <span className="tracking-widest ml-2">L E A R N</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex space-x-12">
          <Link href="/lessons" className="text-lg font-medium">
            Home
          </Link>
          <Link href="#" className="text-lg font-medium">
            About
          </Link>
          <Link href="#" className="text-lg font-medium">
            Profile
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="bg-[#f9f3e8] w-full px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Video and Title */}
          <div className="md:col-span-2 space-y-4">
            {/* Video/Image Container */}
            <div className="relative bg-white p-2 rounded-md">
              <WebcamStream />
            </div>

            {/* Title Card */}
            <div className="bg-white p-6 rounded-md">
              <h1 className="text-2xl font-medium text-center">Current Lesson ID: {id}</h1>
            </div>
          </div>

          {/* Right Column - Tutorial Info */}
          <div className="space-y-4">
            {/* Purple Sign Image */}
            <div className="bg-white p-2 rounded-md">
              <div className="relative aspect-square bg-purple-500 rounded">
                <div className="p-4 text-white font-handwriting text-lg">forgot how to spell it</div>
                <div className="absolute bottom-0 right-0 p-4">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 15C25 10 35 15 40 25C45 35 50 40 45 45" stroke="white" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tutorials List */}
            <div className="bg-white p-6 rounded-md">
              <h2 className="text-2xl font-medium mb-4">Tutorials</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li className="font-medium">Alphabets</li>
                <li className="font-medium">Greetings</li>
                <li className="font-medium">Introducing yourself</li>
                <li className="font-medium">Common phrases</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
