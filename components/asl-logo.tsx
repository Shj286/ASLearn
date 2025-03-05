export default function ASLLogo({ size = "normal" }: { size?: "normal" | "large" }) {
  const textSizes = {
    normal: "text-3xl",
    large: "text-4xl"
  };
  
  const subtitleSizes = {
    normal: "text-xs",
    large: "text-sm"
  };
  
  return (
    <div className="flex items-center">
      <span className={`${textSizes[size]} font-serif italic font-bold`}>ASL</span>
      <div className="ml-1 flex">
        <span className={`${subtitleSizes[size]} tracking-widest mt-1`}>LEARN</span>
      </div>
    </div>
  );
}

