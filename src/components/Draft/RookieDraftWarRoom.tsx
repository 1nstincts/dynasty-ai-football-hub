
import React, { useState, useEffect } from 'react';
import { DraftProspect, DraftPick } from '@/types/draft';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Clock, Users, Trophy } from 'lucide-react';

interface RookieDraftWarRoomProps {
  leagueId?: string;
}

const RookieDraftWarRoom: React.FC<RookieDraftWarRoomProps> = ({ leagueId }) => {
  const [prospects, setProspects] = useState<DraftProspect[]>([]);
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    const mockProspects: DraftProspect[] = [
      {
        id: '1',
        full_name: 'Caleb Williams',
        position: 'QB',
        age: 22,
        height: '6\'1"',
        weight: 218,
        college: 'USC',
        draft_grade: 95,
        projected_round: 1
      },
      {
        id: '2',
        full_name: 'Jayden Daniels',
        position: 'QB',
        age: 23,
        height: '6\'4"',
        weight: 210,
        college: 'LSU',
        draft_grade: 92,
        projected_round: 1
      }
    ];

    const mockPicks: DraftPick[] = [
      {
        id: '1',
        round: 1,
        pick: 1,
        overall_pick: 1,
        team_id: 'team1'
      },
      {
        id: '2',
        round: 1,
        pick: 2,
        overall_pick: 2,
        team_id: 'team2'
      }
    ];

    setProspects(mockProspects);
    setDraftPicks(mockPicks);
    setIsLoading(false);
  }, [leagueId]);

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = selectedPosition === 'ALL' || prospect.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rookie Draft War Room</h2>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span className="text-sm text-gray-500">Draft starts in 2 hours</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Draft Board */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Prospects</CardTitle>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    className="pl-10"
                    placeholder="Search prospects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="ALL">All Positions</option>
                  <option value="QB">QB</option>
                  <option value="RB">RB</option>
                  <option value="WR">WR</option>
                  <option value="TE">TE</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredProspects.map((prospect) => (
                  <div
                    key={prospect.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={prospect.avatar_url} />
                        <AvatarFallback>
                          {prospect.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{prospect.full_name}</div>
                        <div className="text-sm text-gray-500">
                          {prospect.position} • {prospect.college}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{prospect.position}</Badge>
                      <span className="text-sm text-gray-500">Rd {prospect.projected_round}</span>
                      <Button size="sm">Draft</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Draft Order & Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Draft Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {draftPicks.slice(0, 5).map((pick) => (
                  <div key={pick.id} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{pick.overall_pick}</span>
                    <span className="text-sm">Team {pick.team_id}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-4 w-4 mr-2" />
                Draft Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Picks Made:</span>
                  <span>0 / 24</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Pick:</span>
                  <span>1.05</span>
                </div>
                <div className="flex justify-between">
                  <span>Time per Pick:</span>
                  <span>60 seconds</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RookieDraftWarRoom;
