
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonIcon from '@mui/icons-material/Person';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("/");

  useEffect(() => {
    if (location === "/") {
      setActiveTab("/");
    } else if (location === "/circles" || location.startsWith("/circle/")) {
      setActiveTab("/circles");
    } else if (location === "/profile") {
      setActiveTab("/profile");
    } else if (location === "/pay") {
      setActiveTab("/pay");
    }
  }, [location]);

  const navigateTo = (path: string) => {
    setLocation(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg px-3 sm:px-6 md:px-8 py-2 sm:py-3 flex justify-between items-center z-20 max-w-screen-xl mx-auto transition-all duration-200 ease-in-out rounded-tl-md rounded-tr-md">
      <button 
        onClick={() => navigateTo("/")}
        className={`flex flex-col items-center min-w-[4rem] sm:min-w-[5rem] md:min-w-[6rem] space-y-1.5 px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 hover:bg-accent/20 active:scale-95 rounded-xl transition-all duration-200 ${activeTab === "/" ? "text-[#DC0037]" : "text-muted-foreground hover:text-[#DC0037]"}`}
      >
        <HomeIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
        <span className="text-[11px] sm:text-sm md:text-base font-medium">Home</span>
      </button>

      <button 
        onClick={() => navigateTo("/circles")}
        className={`flex flex-col items-center min-w-[4rem] sm:min-w-[5rem] md:min-w-[6rem] space-y-1.5 px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 hover:bg-accent/20 active:scale-95 rounded-xl transition-all duration-200 ${activeTab === "/circles" ? "text-[#DC0037]" : "text-muted-foreground hover:text-[#DC0037]"}`}
      >
        <PeopleIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
        <span className="text-[11px] sm:text-sm md:text-base font-medium">Circles</span>
      </button>

      <div className="relative -mt-8 sm:-mt-10 md:-mt-12 z-10">
        <button 
          onClick={() => navigateTo("/create")}
          className="bg-[#DC0037] text-white rounded-full p-3 sm:p-4 md:p-5 shadow-lg hover:bg-[#b30030] hover:shadow-xl active:scale-95 transition-all duration-200"
        >
          <AddIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"/>
        </button>
      </div>

      <button 
        onClick={() => navigateTo("/pay")}
        className={`flex flex-col items-center min-w-[4rem] sm:min-w-[5rem] md:min-w-[6rem] space-y-1.5 px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 hover:bg-accent/20 active:scale-95 rounded-xl transition-all duration-200 ${activeTab === "/pay" ? "text-[#DC0037]" : "text-muted-foreground hover:text-[#DC0037]"}`}
      >
        <PaymentsIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
        <span className="text-[11px] sm:text-sm md:text-base font-medium">Pay</span>
      </button>

      <button 
        onClick={() => navigateTo("/profile")}
        className={`flex flex-col items-center min-w-[4rem] sm:min-w-[5rem] md:min-w-[6rem] space-y-1.5 px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 hover:bg-accent/20 active:scale-95 rounded-xl transition-all duration-200 ${activeTab === "/profile" ? "text-[#DC0037]" : "text-muted-foreground hover:text-[#DC0037]"}`}
      >
        <PersonIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
        <span className="text-[11px] sm:text-sm md:text-base font-medium">Profile</span>
      </button>
    </nav>
  );
}
