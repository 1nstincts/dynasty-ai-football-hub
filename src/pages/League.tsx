
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import LeagueNavigation from '../components/League/LeagueNavigation';
import Standings from '../components/League/Standings';
import TeamRoster from '../components/Team/TeamRoster';
import MatchupView from '../components/Matchup/MatchupView';
import LeagueChat from '../components/League/LeagueChat';
import DataImportButton from '../components/Admin/DataImportButton';
import StartupDraftSetup from '../components/Draft/StartupDraftSetup';
import DraftRoom from '../components/Draft/DraftRoom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeagueService } from '@/services/LeagueService';
import { DraftService } from '@/services/DraftService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LeagueStatus } from '@/types/draft';

const League = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('standings');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [leagueName, setLeagueName] = useState<string | null>(null);
  const [leagueStatus, setLeagueStatus] = useState<LeagueStatus | null>(null);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock team ID for the user's team
  const currentTeamId = '123';
  
  // Ensure leagueId is always a string
  const safeLeagueId = leagueId || '1';
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleStartDraft = (draftId: string) => {
    setActiveDraftId(draftId);
    setLeagueStatus(prev => prev ? { ...prev, currentPhase: 'draft', draftId } : null);
  };

  const handleDraftComplete = () => {
    setActiveDraftId(null);
    setLeagueStatus(prev => prev ? { ...prev, currentPhase: 'active', hasDrafted: true } : null);
  };

  useEffect(() => {
    const fetchLeagueData = async () => {
      setIsLoading(true);
      try {
        // Fetch league details and status
        const [leagueDetails, status] = await Promise.all([
          LeagueService.getLeagueDetails(safeLeagueId),
          DraftService.getLeagueStatus(safeLeagueId)
        ]);

        if (leagueDetails) {
          setLeagueName(leagueDetails.name);
        }
        
        setLeagueStatus(status);
      } catch (error) {
        console.error("Failed to fetch league data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagueData();
  }, [safeLeagueId]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Show draft setup if league hasn't drafted yet
  if (leagueStatus?.currentPhase === 'setup' && !leagueStatus.hasDrafted) {
    return (
      <StartupDraftSetup
        leagueId={safeLeagueId}
        leagueSize={8} // This should come from league details
        onStartDraft={handleStartDraft}
      />
    );
  }

  // Show active draft room
  if (leagueStatus?.currentPhase === 'draft' && activeDraftId) {
    return (
      <DraftRoom
        draftId={activeDraftId}
        onDraftComplete={handleDraftComplete}
      />
    );
  }

  // Show normal league interface after draft is complete
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold mr-3">{leagueName || `League ${safeLeagueId}`}</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/league/${safeLeagueId}/settings`)}
            className="flex items-center text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            Settings
          </Button>
        </div>
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
