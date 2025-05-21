
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LeagueNavigation from '../components/League/LeagueNavigation';
import Standings from '../components/League/Standings';
import TeamRoster from '../components/Team/TeamRoster';
import MatchupView from '../components/Matchup/MatchupView';
import LeagueChat from '../components/League/LeagueChat';
import DataImportButton from '../components/Admin/DataImportButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeagueService } from '@/services/LeagueService';
import { Skeleton } from '@/components/ui/skeleton';

const League = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const [activeTab, setActiveTab] = useState('standings');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [leagueName, setLeagueName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock team ID for the user's team
  const currentTeamId = '123';
  
  // Ensure leagueId is always a string
  const safeLeagueId = leagueId || '1';
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    const fetchLeagueDetails = async () => {
      setIsLoading(true);
      try {
        const leagueDetails = await LeagueService.getLeagueDetails(safeLeagueId);
        if (leagueDetails) {
          setLeagueName(leagueDetails.name);
        }
      } catch (error) {
        console.error("Failed to fetch league details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagueDetails();
  }, [safeLeagueId]);
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        {isLoading ? (
          <Skeleton className="h-8 w-64" />
        ) : (
          <h1 className="text-2xl font-bold">{leagueName || `League ${safeLeagueId}`}</h1>
        )}
        <div className="flex gap-2">
          <LeagueNavigation activeTab={activeTab} onChange={handleTabChange} />
          <DataImportButton />
        </div>
      </div>
      
      <Tabs defaultValue="standings" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="matchups">Matchups</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standings">
          <Standings />
        </TabsContent>
        
        <TabsContent value="roster">
          <TeamRoster teamId={currentTeamId} />
        </TabsContent>
        
        <TabsContent value="matchups">
          <MatchupView 
            leagueId={safeLeagueId} 
            week={currentWeek} 
            onChangeWeek={setCurrentWeek} 
          />
        </TabsContent>
        
        <TabsContent value="chat">
          <LeagueChat leagueId={safeLeagueId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default League;
