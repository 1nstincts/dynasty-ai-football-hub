
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface TeamRosterProps {
  teamId: string;
}

interface RosterPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  status?: string;
  starter: boolean;
}

const TeamRoster: React.FC<TeamRosterProps> = ({ teamId }) => {
  // In a real app, we would fetch the team's roster from the store or API
  const team = useSelector((state: RootState) => 
    state.teams.teams.find(t => t.id === teamId)
  );

  // Mock data for demonstration
  const rosterPlayers: RosterPlayer[] = [
    { id: '1', name: 'J. Daniels', position: 'QB', team: 'WAS', starter: true },
    { id: '2', name: 'Q. Judkins', position: 'RB', team: 'CLE', starter: true },
    { id: '3', name: 'J. Blue', position: 'RB', team: 'DAL', starter: true },
    { id: '4', name: 'C. Lamb', position: 'WR', team: 'DAL', starter: true },
    { id: '5', name: 'J. Waddle', position: 'WR', team: 'MIA', starter: true },
    { id: '6', name: 'M. Evans', position: 'WR', team: 'TB', starter: true },
    { id: '7', name: 'M. Nabers', position: 'WR', team: 'NYG', starter: true },
    { id: '8', name: 'C. Loveland', position: 'TE', team: 'CHI', starter: true },
    { id: '9', name: 'L. Likely', position: 'TE', team: 'BAL', starter: false },
    { id: '10', name: 'M. Harrison', position: 'WR', team: 'ARI', starter: false },
    { id: '11', name: 'T. Hunter', position: 'WR', team: 'JAX', starter: false },
    { id: '12', name: 'C. Stroud', position: 'QB', team: 'HOU', starter: false },
  ];

  const starters = rosterPlayers.filter(player => player.starter);
  const bench = rosterPlayers.filter(player => !player.starter);

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

  if (!team) {
    return (
      <div className="p-4 text-center">
        <p className="text-sleeper-gray">Team not found</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Starters</h2>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-sleeper-dark px-2 py-1 rounded">
            <span className="text-sleeper-accent font-semibold">OWN:</span> 100%
          </span>
          <span className="text-xs bg-sleeper-dark px-2 py-1 rounded">
            <span className="text-sleeper-accent font-semibold">START:</span> 95%
          </span>
          <span className="text-xs bg-sleeper-dark px-2 py-1 rounded">
            <span className="text-sleeper-accent font-semibold">PTS:</span> 0.00
          </span>
        </div>
      </div>

      <div className="fantasy-card mb-6">
        <div className="text-xs text-sleeper-gray px-4 py-2 border-b border-sleeper-dark flex">
          <div className="w-1/12"></div>
          <div className="w-4/12">Player</div>
          <div className="w-2/12 text-center">Opponent</div>
          <div className="w-1/12 text-center">PTS</div>
          <div className="w-1/12 text-center">START %</div>
          <div className="w-1/12 text-center">OWN %</div>
          <div className="w-2/12 text-center">Status</div>
        </div>

        {starters.map(player => (
          <div key={player.id} className="player-row">
            <div className="w-1/12">
              <span className={`player-position ${getPositionClass(player.position)}`}>
                {player.position}
              </span>
            </div>
            <div className="w-4/12 font-medium">{player.name}</div>
            <div className="w-2/12 text-center text-sleeper-gray">@{player.team}</div>
            <div className="w-1/12 text-center">0.00</div>
            <div className="w-1/12 text-center text-sleeper-gray">98%</div>
            <div className="w-1/12 text-center text-sleeper-gray">100%</div>
            <div className="w-2/12 text-center text-sleeper-accent">Active</div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">Bench</h2>
      <div className="fantasy-card">
        <div className="text-xs text-sleeper-gray px-4 py-2 border-b border-sleeper-dark flex">
          <div className="w-1/12"></div>
          <div className="w-4/12">Player</div>
          <div className="w-2/12 text-center">Opponent</div>
          <div className="w-1/12 text-center">PTS</div>
          <div className="w-1/12 text-center">START %</div>
          <div className="w-1/12 text-center">OWN %</div>
          <div className="w-2/12 text-center">Status</div>
        </div>

        {bench.map(player => (
          <div key={player.id} className="player-row">
            <div className="w-1/12">
              <span className={`player-position ${getPositionClass(player.position)}`}>
                {player.position}
              </span>
            </div>
            <div className="w-4/12 font-medium">{player.name}</div>
            <div className="w-2/12 text-center text-sleeper-gray">@{player.team}</div>
            <div className="w-1/12 text-center">0.00</div>
            <div className="w-1/12 text-center text-sleeper-gray">45%</div>
            <div className="w-1/12 text-center text-sleeper-gray">92%</div>
            <div className="w-2/12 text-center text-sleeper-accent">BYE</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamRoster;
