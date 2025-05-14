
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendingPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  change: number;
  percentage: number;
}

const TrendingPlayers: React.FC = () => {
  // In a real app, we would fetch trending players from the store or API
  
  // Mock data for demonstration
  const trendingUpPlayers: TrendingPlayer[] = [
    { id: '1', name: 'Jacory Croskey-Merritt', position: 'RB', team: 'WAS', change: 38090, percentage: 81 },
    { id: '2', name: 'Chimere Dike', position: 'WR', team: 'TEN', change: 29038, percentage: 86 },
    { id: '3', name: 'Jaylen Lane', position: 'WR', team: 'NYJ', change: 22156, percentage: 48 },
    { id: '4', name: 'Kyle Monangai', position: 'RB', team: 'CAR', change: 18788, percentage: 74 },
    { id: '5', name: 'Jimmy Horn', position: 'WR', team: 'TEX', change: 10153, percentage: 30 },
  ];

  const trendingDownPlayers: TrendingPlayer[] = [
    { id: '6', name: 'Parker Washington', position: 'WR', team: 'JAX', change: -7338, percentage: 53 },
    { id: '7', name: 'Cam Akers', position: 'RB', team: 'MIN', change: -7864, percentage: 38 },
    { id: '8', name: 'Jermaine Burton', position: 'WR', team: 'CIN', change: -6199, percentage: 62 },
    { id: '9', name: 'Emanuel Wilson', position: 'RB', team: 'GB', change: -6838, percentage: 42 },
    { id: '10', name: 'John Metchie', position: 'WR', team: 'HOU', change: -6344, percentage: 37 },
  ];

  const formatChange = (change: number) => {
    const absChange = Math.abs(change);
    const sign = change >= 0 ? '+' : '-';
    return `${sign}${absChange.toLocaleString()}`;
  };

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
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="text-xl font-bold">Trending up</h2>
        </div>
        
        <div className="fantasy-card">
          {trendingUpPlayers.map((player, index) => (
            <div key={player.id} className="player-row grid grid-cols-12 items-center">
              <div className="col-span-1 text-sleeper-gray">{index + 1}</div>
              <div className="col-span-1">
                <div className="w-8 h-8 bg-sleeper-primary rounded-full flex items-center justify-center">
                  {player.name.charAt(0)}
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex items-center">
                  <span className={`player-position ${getPositionClass(player.position)} mr-2`}>
                    {player.position}
                  </span>
                  <span className="text-xs bg-sleeper-dark px-1 rounded mr-2">
                    {player.team}
                  </span>
                  <span className="font-medium">{player.name}</span>
                </div>
              </div>
              <div className="col-span-2 text-right text-green-500 font-medium">
                {formatChange(player.change)}
              </div>
              <div className="col-span-2 text-right">
                <div className="bg-sleeper-dark rounded-full h-2 w-full">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${player.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-sleeper-gray">Rostered {player.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center mb-4">
          <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
          <h2 className="text-xl font-bold">Trending down</h2>
        </div>
        
        <div className="fantasy-card">
          {trendingDownPlayers.map((player, index) => (
            <div key={player.id} className="player-row grid grid-cols-12 items-center">
              <div className="col-span-1 text-sleeper-gray">{index + 1}</div>
              <div className="col-span-1">
                <div className="w-8 h-8 bg-sleeper-primary rounded-full flex items-center justify-center">
                  {player.name.charAt(0)}
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex items-center">
                  <span className={`player-position ${getPositionClass(player.position)} mr-2`}>
                    {player.position}
                  </span>
                  <span className="text-xs bg-sleeper-dark px-1 rounded mr-2">
                    {player.team}
                  </span>
                  <span className="font-medium">{player.name}</span>
                </div>
              </div>
              <div className="col-span-2 text-right text-red-500 font-medium">
                {formatChange(player.change)}
              </div>
              <div className="col-span-2 text-right">
                <div className="bg-sleeper-dark rounded-full h-2 w-full">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${player.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-sleeper-gray">Rostered {player.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingPlayers;
