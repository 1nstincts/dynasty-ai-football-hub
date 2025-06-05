import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { LeagueHistoryArchive } from '../components/League/LeagueHistoryArchive';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const LeagueHistory: React.FC = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const { leagues } = useSelector((state: RootState) => state.leagues);
  const [leagueName, setLeagueName] = useState<string>('');

  useEffect(() => {
    if (leagueId && leagues) {
      const league = leagues.find(l => l.id === leagueId);
      if (league) {
        setLeagueName(league.name);
      }
    }
  }, [leagueId, leagues]);

  const handleBack = () => {
    navigate(`/league/${leagueId}`);
  };

  if (!leagueId) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Missing league information.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {leagueName ? `${leagueName} - ` : ''}League History
        </h1>
      </div>

      <LeagueHistoryArchive leagueId={leagueId} />
    </div>
  );
};

export default LeagueHistory;