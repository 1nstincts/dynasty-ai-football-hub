import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Container, Box, Typography } from '@mui/material';
import DynastyWindowCalculator from '../components/Team/DynastyWindowCalculator';
import { Card } from '../components/ui/card';

const DynastyWindow: React.FC = () => {
  const { currentTeam } = useSelector((state: RootState) => state.teams);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Container maxWidth="xl" className="py-8">
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8">
      <Typography variant="h4" component="h1" className="mb-6">
        Dynasty Window Calculator
      </Typography>
      <Card className="p-6">
        {currentTeam ? (
          <DynastyWindowCalculator team={currentTeam} />
        ) : (
          <Box className="text-center py-10">
            <Typography variant="h6">
              Please select a team to analyze its dynasty window
            </Typography>
          </Box>
        )}
      </Card>
    </Container>
  );
};

export default DynastyWindow;