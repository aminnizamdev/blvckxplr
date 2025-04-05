
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  React.useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 bg-card border border-border/40 rounded-lg shadow-lg max-w-md animate-fade-in">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-foreground mb-8">
          This page doesn't exist in our token universe
        </p>
        <Button 
          variant="default" 
          size="lg" 
          className="gap-2" 
          onClick={() => window.location.href = '/'}
        >
          <ArrowLeft size={16} />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
