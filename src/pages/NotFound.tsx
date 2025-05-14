
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-sleeper-darker">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-sleeper-accent">404</h1>
        <p className="text-xl text-white">Oops! This page doesn't exist</p>
        <div className="flex justify-center">
          <Button asChild className="bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90">
            <Link to="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
