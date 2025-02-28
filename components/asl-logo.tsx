export default function ASLLogo() {
  return (
    <div className="flex items-center">
      <span className="text-3xl font-serif italic">ASL</span>
      <div className="ml-2 flex space-x-1">
        {/* Sign language finger spelling for "LEARN" */}
        {/* <div className="w-5 h-6 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-5">
            <path
              d="M9 10L5 14M9 14L5 10M19 10L15 14M19 14L15 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div> */}
        <div className="w-5 h-6 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-5">
            <path d="M12 4V20M18 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="w-5 h-6 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-5">
            <path
              d="M8 4L16 12L8 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="w-5 h-6 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-5">
            <path d="M12 4V20M6 4L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="w-5 h-6 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-5">
            <path d="M8 4L8 20M16 4L16 20M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}

