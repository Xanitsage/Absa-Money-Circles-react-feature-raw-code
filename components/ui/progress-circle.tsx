import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  isCelebrating?: boolean;
}

export default function ProgressCircle({
  percentage,
  size = 40,
  strokeWidth = 10,
  className,
  isCelebrating = false
}: ProgressCircleProps) {
  const [offset, setOffset] = useState(0);
  
  // Calculate circle properties
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    const progressOffset = ((100 - percentage) / 100) * circumference;
    setOffset(progressOffset);
  }, [percentage, circumference]);

  return (
    <div className={cn("relative", className)}>
      <svg 
        className="transform -rotate-90" 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="fill-none stroke-gray-200"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className={cn(
            "fill-none stroke-primary transition-all duration-500 ease-in-out",
            isCelebrating && "stroke-[hsl(var(--accent))]"
          )}
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
        {percentage}%
      </span>
    </div>
  );
}
