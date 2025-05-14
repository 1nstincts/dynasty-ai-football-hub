
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface StandingTeam {
  id: string;
  name: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  avatar?: string;
}

const Standings: React.FC = () => {
  // In a real app, we would fetch the standings from the store or API

  // Mock data for demonstration
  const mockStandings: StandingTeam[] = [
    {
      id: '1', 
      name: 'Russell\'s Daddy', 
      wins: 0, 
      losses: 0, 
      ties: 0, 
      pointsFor: 0, 
      pointsAgainst: 0
    },
    {
      id: '2', 
      name: 'russellwils6n', 
      wins: 0, 
      losses: 0, 
      ties: 0, 
      pointsFor: 0, 
      pointsAgainst: 0
    },
    {
      id: '3', 
      name: 'Nick is Corrupt', 
      wins: 0, 
      losses: 0, 
      ties: 0, 
      pointsFor: 0, 
      pointsAgainst: 0
    },
    {
      id: '4', 
      name: 'Team cstu790', 
      wins: 0, 
      losses: 0, 
      ties: 0, 
      pointsFor: 0, 
      pointsAgainst: 0
    },
    {
      id: '5', 
      name: 'Team asorial', 
      wins: 0, 
      losses: 0, 
      ties: 0, 
      pointsFor: 0, 
      pointsAgainst: 0
    },
    {
      id: '6', 
      name: 'kaiser permanente', 
      wins: 0, 
      losses: 0, 
      ties: 0, 
      pointsFor: 0, 
      pointsAgainst: 0
    },
    {
      id: '7', 
      name: 'Drake and Josh', 
      wins: 0, 
      losses: 0, 
      ties: 0, 
      pointsFor: 0, 
      pointsAgainst: 0
    },
    {
      id: '8', 
      name: 'Touchdown There', 
      wins: 0, 
      losses: 0, 
      ties: 0, 
      pointsFor: 0, 
      pointsAgainst: 0
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Standings</h2>

      <div className="fantasy-card">
        <div className="text-xs text-sleeper-gray px-4 py-2 border-b border-sleeper-dark grid grid-cols-12">
          <div className="col-span-1">Rank</div>
          <div className="col-span-6">Team</div>
          <div className="col-span-1 text-center">W</div>
          <div className="col-span-1 text-center">L</div>
          <div className="col-span-1 text-center">T</div>
          <div className="col-span-1 text-center">PF</div>
          <div className="col-span-1 text-center">PA</div>
        </div>

        {mockStandings.map((team, index) => (
          <div key={team.id} className="player-row grid grid-cols-12">
            <div className="col-span-1 flex items-center">
              {index + 1}
            </div>
            <div className="col-span-6 flex items-center">
              <div className="team-avatar mr-3">
                {team.name.charAt(0)}
              </div>
              <span className="font-medium">{team.name}</span>
            </div>
            <div className="col-span-1 text-center">{team.wins}</div>
            <div className="col-span-1 text-center">{team.losses}</div>
            <div className="col-span-1 text-center">{team.ties}</div>
            <div className="col-span-1 text-center">{team.pointsFor}</div>
            <div className="col-span-1 text-center">{team.pointsAgainst}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Standings;
