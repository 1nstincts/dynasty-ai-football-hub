
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Search } from 'lucide-react';
import { Player } from '../../store/slices/playersSlice';

interface PlayerListProps {
  leagueId: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ leagueId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  
  // In a real app, we would use the filteredPlayers from the store
  // Here we'll use mock data
  const mockPlayers: Player[] = [
    {
      id: '1',
      name: 'Justin Jefferson',
      position: 'WR',
      team: 'MIN',
      age: 25,
      experience: 4,
      stats: { receiving: { yards: 1074, touchdowns: 5, receptions: 68, targets: 100 } },
      projections: { receiving: { yards: 1500, touchdowns: 10, receptions: 100, targets: 150 } },
      dynasty_value: 10000,
      trending: { value: 15570, direction: 'up', percentage: 34 }
    },
    {
      id: '2',
      name: 'Jayden Daniels',
      position: 'QB',
      team: 'WAS',
      age: 23,
      experience: 1,
      stats: { 
        passing: { yards: 2800, touchdowns: 18, interceptions: 2, completions: 250, attempts: 350 },
        rushing: { yards: 500, touchdowns: 5, attempts: 75 }
      },
      projections: { 
        passing: { yards: 4000, touchdowns: 25, interceptions: 8, completions: 350, attempts: 500 },
        rushing: { yards: 750, touchdowns: 8, attempts: 100 }
      },
      dynasty_value: 8000,
      trending: { value: 12000, direction: 'up', percentage: 50 }
    },
    {
      id: '3',
      name: 'Bijan Robinson',
      position: 'RB',
      team: 'ATL',
      age: 22,
      experience: 1,
      stats: { rushing: { yards: 1200, touchdowns: 8, attempts: 220 } },
      projections: { rushing: { yards: 1500, touchdowns: 12, attempts: 280 } },
      dynasty_value: 9000,
      trending: { value: 10000, direction: 'up', percentage: 15 }
    },
    {
      id: '4',
      name: 'Malik Nabers',
      position: 'WR',
      team: 'NYG',
      age: 21,
      experience: 1,
      stats: { receiving: { yards: 800, touchdowns: 5, receptions: 60, targets: 90 } },
      projections: { receiving: { yards: 1200, touchdowns: 8, receptions: 85, targets: 120 } },
      dynasty_value: 7500,
      trending: { value: 9500, direction: 'up', percentage: 20 }
    },
    {
      id: '5',
      name: 'Marvin Harrison Jr.',
      position: 'WR',
      team: 'ARI',
      age: 22,
      experience: 1,
      stats: { receiving: { yards: 750, touchdowns: 6, receptions: 50, targets: 80 } },
      projections: { receiving: { yards: 1100, touchdowns: 9, receptions: 75, targets: 110 } },
      dynasty_value: 8000,
      trending: { value: 9000, direction: 'up', percentage: 12 }
    }
  ];

  // Filter players based on search and position
  const filteredPlayers = mockPlayers.filter(player => {
    // Search filter
    if (searchQuery && !player.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Position filter
    if (positionFilter !== 'ALL' && player.position !== positionFilter) {
      return false;
    }
    
    return true;
  });

  const getPositionClass = (position: string) => {
    switch (position) {
      case 'QB': return 'position-qb';
      case 'RB': return 'position-rb';
      case 'WR': return 'position-wr';
      case 'TE': return 'position-te';
      case 'K': return 'position-k';
      case 'DEF': return 'position-def';
      default: return '';
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Players</h2>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-sleeper-gray" />
            <input
              type="text"
              placeholder="Find player Ctrl + K"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 bg-sleeper-dark border border-sleeper-dark rounded text-white placeholder-sleeper-gray text-sm"
            />
          </div>
          
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="bg-sleeper-dark border border-sleeper-dark text-white rounded p-2 text-sm"
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

      <div className="fantasy-card">
        <div className="text-xs text-sleeper-gray px-4 py-2 border-b border-sleeper-dark grid grid-cols-12">
          <div className="col-span-1">POS</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-1 text-center">FPTS</div>
          <div className="col-span-1 text-center">ADP</div>
          <div className="col-span-3 text-center">Rushing</div>
          <div className="col-span-3 text-center">Receiving</div>
        </div>

        {filteredPlayers.map(player => (
          <div key={player.id} className="player-row grid grid-cols-12">
            <div className="col-span-1">
              <span className={`player-position ${getPositionClass(player.position)}`}>
                {player.position}
              </span>
            </div>
            <div className="col-span-3 font-medium flex items-center">
              <div className="w-6 h-6 bg-sleeper-primary rounded-full flex items-center justify-center mr-2 text-xs">
                {player.team}
              </div>
              {player.name}
            </div>
            <div className="col-span-1 text-center">
              {/* Would calculate fantasy points in a real app */}
              {Math.floor(Math.random() * 200) + 150}
            </div>
            <div className="col-span-1 text-center text-sleeper-gray">
              {Math.floor(Math.random() * 50) + 1}
            </div>
            <div className="col-span-3 text-center">
              {player.stats.rushing ? 
                `${player.stats.rushing.yards} yds, ${player.stats.rushing.touchdowns} TD` : 
                '-'}
            </div>
            <div className="col-span-3 text-center">
              {player.stats.receiving ? 
                `${player.stats.receiving.yards} yds, ${player.stats.receiving.touchdowns} TD` : 
                '-'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
