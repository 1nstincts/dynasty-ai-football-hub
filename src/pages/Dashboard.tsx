
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Dashboard = () => {
  const [isCreatingLeague, setIsCreatingLeague] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [leagueType, setLeagueType] = useState('dynasty');
  const [leagueSize, setLeagueSize] = useState('12');
  const [aiTeamCount, setAiTeamCount] = useState('');

  const { leagues } = useSelector((state: RootState) => state.leagues);
  
  const mockLeagues = [
    { id: '1', name: 'La Liga', type: 'dynasty', size: 12, teams: [] },
    { id: '2', name: 'The Barclays Premier League', type: 'redraft', size: 10, teams: [] },
  ];

  const handleCreateLeague = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would dispatch an action to create a league
    console.log('Creating league:', { leagueName, leagueType, leagueSize, aiTeamCount });
    
    setLeagueName('');
    setLeagueType('dynasty');
    setLeagueSize('12');
    setAiTeamCount('');
    setIsCreatingLeague(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Leagues</h1>
        <Dialog open={isCreatingLeague} onOpenChange={setIsCreatingLeague}>
          <DialogTrigger asChild>
            <Button className="bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90">
              <Plus className="h-4 w-4 mr-2" /> Create League
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-sleeper-dark border-sleeper-dark">
            <DialogHeader>
              <DialogTitle>Create a New League</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateLeague} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leagueName">League Name</Label>
                <Input
                  id="leagueName"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  required
                  className="bg-sleeper-darker border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leagueType">League Type</Label>
                <Select value={leagueType} onValueChange={setLeagueType}>
                  <SelectTrigger className="bg-sleeper-darker border-border">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-sleeper-dark border-border">
                    <SelectItem value="dynasty">Dynasty</SelectItem>
                    <SelectItem value="redraft">Redraft</SelectItem>
                    <SelectItem value="keeper">Keeper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leagueSize">League Size</Label>
                <Select value={leagueSize} onValueChange={setLeagueSize}>
                  <SelectTrigger className="bg-sleeper-darker border-border">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-sleeper-dark border-border">
                    <SelectItem value="8">8 Teams</SelectItem>
                    <SelectItem value="10">10 Teams</SelectItem>
                    <SelectItem value="12">12 Teams</SelectItem>
                    <SelectItem value="14">14 Teams</SelectItem>
                    <SelectItem value="16">16 Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aiTeamCount">AI Team Count</Label>
                <Input
                  id="aiTeamCount"
                  value={aiTeamCount}
                  onChange={(e) => setAiTeamCount(e.target.value)}
                  type="number"
                  min="0"
                  max={Number(leagueSize) - 1}
                  placeholder={`0-${Number(leagueSize) - 1}`}
                  className="bg-sleeper-darker border-border"
                />
              </div>
              
              <Button type="submit" className="w-full bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90">
                Create League
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockLeagues.map(league => (
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
    </div>
  );
};

export default Dashboard;
