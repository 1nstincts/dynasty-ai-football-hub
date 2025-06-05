import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { League } from '@/types/league';
import LeagueService from '@/services/LeagueService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface LeagueRulesImpactAnalysisProps {
  leagueId?: string;
}

const LeagueRulesImpactAnalysis: React.FC<LeagueRulesImpactAnalysisProps> = ({ leagueId }) => {
  const { leagueId: routeLeagueId } = useParams<{ leagueId?: string }>();
  const currentLeagueId = leagueId || routeLeagueId;
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeagueData = async () => {
      if (!currentLeagueId) return;

      setIsLoading(true);
      try {
        const fetchedLeague = await LeagueService.getLeague(currentLeagueId);
        setLeague(fetchedLeague);
      } catch (error) {
        console.error('Error fetching league:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagueData();
  }, [currentLeagueId]);

  // Mock data for the scoring impact analysis
  const mockData = [
    { name: 'Passing TDs', value: 5 },
    { name: 'Rushing Yards', value: 0.1 },
    { name: 'Receptions', value: 1 },
    { name: 'Sacks', value: -1 },
    { name: 'Interceptions', value: -2 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>League Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading league data...</p>
          ) : league ? (
            <>
              <p>League Name: {league.name}</p>
              <p>League Type: {league.type}</p>
              <p>Number of Teams: {league.size}</p>
            </>
          ) : (
            <p>League not found.</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Scoring Impact Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill={(data: any) => data.value > 0 ? "#4CAF50" : "#FF5252"}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Roster Construction Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            This section will analyze the impact of roster rules on team construction.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeagueRulesImpactAnalysis;
