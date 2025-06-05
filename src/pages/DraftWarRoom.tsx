import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '../store';
import { Container, Typography } from '@mui/material';
import RookieDraftWarRoom from '../components/Draft/RookieDraftWarRoom';
import { Card } from '../components/ui/card';

const DraftWarRoom: React.FC = () => {
  const { leagueId } = useParams<{ leagueId?: string }>();
  const { currentLeague } = useSelector((state: RootState) => state.leagues);
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
        Rookie Draft War Room
        {currentLeague && (
          <span className="text-gray-500 text-xl ml-2">
            - {currentLeague.name}
          </span>
        )}
      </Typography>
      <Card className="p-6">
        <RookieDraftWarRoom leagueId={leagueId || currentLeague?.id} />
      </Card>
    </Container>
  );
};

export default DraftWarRoom;