import Link from "next/link";
import WebcamStream from "@/components/webcam-stream";
import { getLesson } from "@/lib/utils";
import ASLLogo from "@/components/asl-logo";

export default async function Page (props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  
  const lesson = getLesson(id);
  const signs = new Set(lesson?.signs);
  
  if(signs.size == 0) // display finished!

  return (
    <div className="w-full">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white">
        <ASLLogo />

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
              <WebcamStream mode={lesson?.mode} signs={signs} />
            </div>

            {/* Title Card */}
            <div className="bg-white p-6 rounded-md">
              <p className="text-center mt-2 text-gray-600">
                {lesson?.title_card}
              </p>
            </div>
          </div>

          {/* Right Column - Tutorial Info */}
          <div className="space-y-4">
            <video 
              src={`${lesson?.video}?v=${Date.now()}`} 
              className="bg-white p-6 rounded-md w-full"
              controls
            />
            {/* Tutorials List */}
            <div className="bg-white p-6 rounded-md">
              <h2 className="text-2xl font-medium mb-4">
                {lesson?.tutorial_title}
              </h2>
              <ol className="list-decimal list-inside space-y-3">
                {lesson?.instructions.map((instruction, index) => {
                  return(
                    <li className="font-medium" key={index}>{instruction}</li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
