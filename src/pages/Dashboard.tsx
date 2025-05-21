
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LeagueService } from '@/services/LeagueService';
import { setLoading, setLeagues } from '@/store/slices/leaguesSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { leagues, isLoading } = useSelector((state: RootState) => state.leagues);

  useEffect(() => {
    const fetchLeagues = async () => {
      dispatch(setLoading(true));
      try {
        const leaguesData = await LeagueService.getUserLeagues();
        dispatch(setLeagues(leaguesData));
      } catch (error) {
        console.error('Failed to fetch leagues:', error);
        toast({
          title: "Error Loading Leagues",
          description: "Could not load your leagues. Please try again later.",
          variant: "destructive",
        });
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchLeagues();
  }, [dispatch, toast]);

  const handleCreateLeague = () => {
    navigate('/create-league');
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Fantasy Football Hub</h1>
        <p className="text-sleeper-gray mb-6">Manage your dynasty leagues, check player stats, and make strategic moves all in one place.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-sleeper-dark border-sleeper-dark hover:border-sleeper-accent transition-colors cursor-pointer" onClick={handleCreateLeague}>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-sleeper-primary flex items-center justify-center mb-4">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create New League</h3>
              <p className="text-sm text-sleeper-gray">Start a new dynasty, keeper, or redraft league with AI opponents</p>
            </CardContent>
          </Card>
          
          <Card className="bg-sleeper-dark border-sleeper-dark hover:border-sleeper-accent transition-colors cursor-pointer" onClick={() => navigate('/players')}>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-sleeper-primary flex items-center justify-center mb-4">
                <span className="text-xl font-bold">P</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Player Database</h3>
              <p className="text-sm text-sleeper-gray">Browse players, check stats, and analyze performance</p>
            </CardContent>
          </Card>
          
          <Card className="bg-sleeper-dark border-sleeper-dark hover:border-sleeper-accent transition-colors cursor-pointer" onClick={() => navigate('/trades')}>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-sleeper-primary flex items-center justify-center mb-4">
                <span className="text-xl font-bold">T</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Trade Center</h3>
              <p className="text-sm text-sleeper-gray">Propose and review trades across your leagues</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Leagues</h2>
        <Button 
          className="bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90"
          onClick={handleCreateLeague}
        >
          <Plus className="h-4 w-4 mr-2" /> Create League
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="fantasy-card">
              <div className="flex items-center mb-2">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : leagues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leagues.map(league => (
            <Link 
              to={`/league/${league.id}`} 
              key={league.id} 
              className="fantasy-card hover:border-sleeper-accent transition-colors"
            >
              <div className="flex items-center mb-2">
                <div className="team-avatar mr-3">
                  {league.name.charAt(0)}
                </div>
                <h2 className="text-lg font-semibold">{league.name}</h2>
              </div>
              <div className="text-sm text-sleeper-gray">
                <div className="flex justify-between">
                  <span>{league.type.charAt(0).toUpperCase() + league.type.slice(1)}</span>
                  <span>{league.size} Teams</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed border-sleeper-dark rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No Leagues Yet</h3>
          <p className="text-sleeper-gray mb-4">Start by creating your first league</p>
          <Button 
            className="bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90"
            onClick={handleCreateLeague}
          >
            <Plus className="h-4 w-4 mr-2" /> Create League
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
