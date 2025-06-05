import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Matchup } from '@/types/matchup';
import MatchupService from '@/services/MatchupService';
import { RefreshCw } from 'lucide-react';

interface MatchupProbabilityForecastProps {
  leagueId?: string;
  matchupId?: string;
}

const MatchupProbabilityForecast: React.FC<MatchupProbabilityForecastProps> = ({ 
  leagueId, 
  matchupId 
}) => {
  const [matchupData, setMatchupData] = useState<Matchup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchMatchupData();
  }, [matchupId]);
  
  const fetchMatchupData = async () => {
    if (!matchupId) return;
    
    setIsLoading(true);
    try {
      const matchup = await MatchupService.getMatchupById(matchupId);
      if (matchup) {
        setMatchupData(matchup);
      }
    } catch (error) {
      console.error('Error fetching matchup:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Matchup Forecast</h2>
        <Button variant="outline" onClick={fetchMatchupData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading Matchup...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Fetching the latest matchup data...</p>
          </CardContent>
        </Card>
      ) : matchupData ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {matchupData.team1_id} vs. {matchupData.team2_id}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Team 1 Score: {matchupData.team1_score}
            </p>
            <p>
              Team 2 Score: {matchupData.team2_score}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Matchup Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              No matchup found with the ID: {matchupId}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchupProbabilityForecast;
