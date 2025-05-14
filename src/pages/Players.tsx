
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import PlayerList from '@/components/Player/PlayerList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Players = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Player Database</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-sleeper-gray" />
            <Input
              type="text"
              placeholder="Find player"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 w-64 bg-sleeper-dark border border-sleeper-dark rounded text-white placeholder-sleeper-gray text-sm"
            />
          </div>
          
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="bg-sleeper-dark border border-sleeper-dark text-white rounded p-2 text-sm h-10"
          >
            <option value="ALL">ALL</option>
            <option value="QB">QB</option>
            <option value="RB">RB</option>
            <option value="WR">WR</option>
            <option value="TE">TE</option>
            <option value="K">K</option>
            <option value="DEF">DEF</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="bg-sleeper-dark border-sleeper-dark shadow-md">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Players</span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="secondary" className="text-xs">
                  Watchlist
                </Button>
                <Button size="sm" variant="secondary" className="text-xs">
                  Free Agents
                </Button>
                <Button size="sm" variant="secondary" className="text-xs">
                  Rookies
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerList leagueId="" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Players;
