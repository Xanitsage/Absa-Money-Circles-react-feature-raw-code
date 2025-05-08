import { useEffect, useRef } from "react";

interface ConfettiProps {
  active: boolean;
  count?: number;
  colors?: string[];
}

export default function Confetti({ 
  active, 
  count = 30, 
  colors = ["hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--chart-3))"] 
}: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active || !containerRef.current) return;
    
    // Clear previous confetti
    const container = containerRef.current;
    container.innerHTML = '';
    
    // Create new confetti pieces
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      
      container.appendChild(confetti);
    }
    
    // Clean up after animation
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [active, count, colors]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none"></div>
  );
}
