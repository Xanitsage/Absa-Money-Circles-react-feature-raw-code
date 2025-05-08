import { ReactNode, useEffect, useState } from "react";
import BottomNavigation from "./BottomNavigation";
import { useLocation } from "wouter";
import { CircleDetails } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import AbbyAssistant from "./AbbyAssistant";
import { ThemeToggle } from "./theme-toggle";
import absaLogo from "../assets/absa_logo.png";
import absaAbbyLogo from "../assets/absa_abby_logo.png";
import { ScrollArea } from "./ui/scroll-area";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [circleTitle, setCircleTitle] = useState<string>("");
  const [showAbby, setShowAbby] = useState(false);

  // Get circle details for header if we're on a circle detail page
  const circleId = location.startsWith("/circle/") ? location.split("/")[2] : null;

  const { data: circleDetails } = useQuery<CircleDetails>({
    queryKey: ['/api/circles', circleId],
    enabled: !!circleId
  });

  useEffect(() => {
    if (circleDetails) {
      setCircleTitle(circleDetails.name);
    } else {
      setCircleTitle("");
    }
  }, [circleDetails]);

  return (
    <div className="bg-background min-h-screen relative pb-16">
      {/* Header */}
      <header className="bg-background px-2 sm:px-4 py-2 sm:py-3 flex justify-between items-center shadow-sm z-10 sticky top-0 border-b border-border h-12 sm:h-14">
        <div className="flex items-center">
          {location !== "/" && location !== "/circles" && location !== "/create" ? (
            <button 
              onClick={() => window.history.back()} 
              className="mr-2 rounded-full p-2 bg-secondary text-foreground hover:bg-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setLocation('/absa-app')}
              className="flex items-center justify-center"
            >
              <img 
                src={absaLogo} 
                alt="Absa Logo" 
                className="h-8 mr-2" 
              />
            </button>
          )}
          <h1 className="font-semibold text-lg text-foreground">
            {circleTitle ? circleTitle : "Money Circles"}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {!showAbby && (
            <button 
              onClick={() => setShowAbby(true)}
              className="relative rounded-full p-1 hover:bg-secondary group"
            >
              <img 
                src={absaAbbyLogo} 
                alt="Absa Abby" 
                className="h-5 w-5" 
              />
            </button>
          )}
          <button 
            onClick={() => setLocation('/notifications')} 
            className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary"
            aria-label="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
          </button>
          <button 
            onClick={() => setLocation('/profile')} 
            className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary"
            aria-label="Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-16">
        <div className="px-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />



      {/* Abby Assistant Modal */}
      {showAbby && <AbbyAssistant onClose={() => setShowAbby(false)} />}
    </div>
  );
}