
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentLeague } from '@/store/slices/leaguesSlice';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import LeagueNavigation from '@/components/League/LeagueNavigation';
import LeagueChat from '@/components/League/LeagueChat';
import MatchupView from '@/components/Matchup/MatchupView';
import TeamRoster from '@/components/Team/TeamRoster';
import PlayerList from '@/components/Player/PlayerList';
import TrendingPlayers from '@/components/Trend/TrendingPlayers';
import TradeBlock from '@/components/Trade/TradeBlock';
import Standings from '@/components/League/Standings';

const League = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('matchup');
  const [currentWeek, setCurrentWeek] = useState(1);
  
  // In a real app, you would fetch the league details from the API
  // and update the Redux store
  
  // Mock league data
  const mockLeague = {
    id: leagueId || '1',
    name: 'La Liga',
    type: 'dynasty',
    size: 12,
    teams: []
  };
  
  // Set the current league in the store
  useEffect(() => {
    dispatch(setCurrentLeague(mockLeague));
    // In a real app, you would join the league's socket room
    // socketService.joinLeague(leagueId);
    
    return () => {
      // Clean up when unmounting
    };
  }, [leagueId, dispatch]);

  const currentTeamId = '123'; // In a real app, this would be the user's team ID
  
  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <LeagueNavigation activeTab={activeTab} onChange={setActiveTab} />
        
        <Tabs value={activeTab} className="flex-1">
          <TabsContent value="matchup" className="h-full overflow-y-auto">
            <MatchupView 
              leagueId={leagueId || ''} 
              week={currentWeek}
              onChangeWeek={setCurrentWeek} 
            />
          </TabsContent>
          
          <TabsContent value="team" className="h-full overflow-y-auto">
            <TeamRoster teamId={currentTeamId} />
          </TabsContent>
          
          <TabsContent value="league" className="h-full overflow-y-auto">
            <Standings />
          </TabsContent>
          
          <TabsContent value="players" className="h-full overflow-y-auto">
            <PlayerList leagueId={leagueId || ''} />
          </TabsContent>
          
          <TabsContent value="trend" className="h-full overflow-y-auto">
            <TrendingPlayers />
          </TabsContent>
          
          <TabsContent value="trades" className="h-full overflow-y-auto">
            <TradeBlock />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="w-96">
        <LeagueChat leagueId={leagueId || ''} />
      </div>
    </div>
  );
};

export default League;
