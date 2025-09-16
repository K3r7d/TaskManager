import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <CheckSquare className="h-16 w-16 text-primary-glow mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-white/80 mb-8">Oops! This page doesn't exist</p>
        <Button asChild className="gradient-primary">
          <a href="/auth">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
