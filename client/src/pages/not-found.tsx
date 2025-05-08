
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [_, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-6">
          <span className="text-red-500 text-3xl">!</span>
          <h1>404 Page Not Found</h1>
        </div>
        
        <p className="text-gray-600 mb-8">
          Did you forget to add the page to the router?
        </p>

        <Button 
          onClick={() => setLocation("/")}
          className="bg-primary text-white hover:bg-primary/90"
        >
          Go Back Home
        </Button>
      </div>
    </div>
  );
}
