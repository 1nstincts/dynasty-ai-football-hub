
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This is the index route that will redirect to the main dashboard
const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-sleeper-darker">
      <p className="text-white">Redirecting to dashboard...</p>
    </div>
  );
};

export default Index;
