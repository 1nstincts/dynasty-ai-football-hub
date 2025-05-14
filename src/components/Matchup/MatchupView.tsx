
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MatchupViewProps {
  leagueId: string;
  week: number;
  onChangeWeek: (week: number) => void;
}

const MatchupView: React.FC<MatchupViewProps> = ({ leagueId, week, onChangeWeek }) => {
  const matchups = useSelector((state: RootState) => 
    state.matchups.matchups.filter(m => m.leagueId === leagueId && m.week === week)
  );

  const handlePreviousWeek = () => {
    if (week > 1) {
      onChangeWeek(week - 1);
    }
  };

  const handleNextWeek = () => {
    // Assume 17 weeks in a season
    if (week < 17) {
      onChangeWeek(week + 1);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Matchups</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePreviousWeek} 
            disabled={week <= 1}
            className="p-1 rounded hover:bg-sleeper-dark disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-medium">
            Week {week}
          </span>
          <button 
            onClick={handleNextWeek} 
            disabled={week >= 17}
            className="p-1 rounded hover:bg-sleeper-dark disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {matchups.length > 0 ? (
          matchups.map(matchup => (
            <div key={matchup.id} className="fantasy-card">
              <div className="flex justify-between">
                <div className="flex-1 p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="team-avatar mr-3">
                      {matchup.homeTeam?.name.charAt(0) || 'H'}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{matchup.homeTeam?.name}</div>
                      <div className="text-xs text-sleeper-gray">0-0</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold">
                    {matchup.homeScore !== null ? matchup.homeScore.toFixed(2) : '0.00'}
                  </div>
                </div>

                <div className="flex items-center px-4 text-sleeper-gray">VS</div>

                <div className="flex-1 p-4 flex items-center justify-between">
                  <div className="text-xl font-bold">
                    {matchup.awayScore !== null ? matchup.awayScore.toFixed(2) : '0.00'}
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-3">
                      <div className="font-semibold">{matchup.awayTeam?.name}</div>
                      <div className="text-xs text-sleeper-gray">0-0</div>
                    </div>
                    <div className="team-avatar">
                      {matchup.awayTeam?.name.charAt(0) || 'A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-sleeper-dark mt-2 pt-2 text-xs text-sleeper-gray px-4 pb-2">
                <div className="flex justify-between">
                  <span>Yet to play (2 QB, 2 RB, 3 WR, TE, K, DEF)</span>
                  <span>Yet to play (2 QB, 2 RB, 3 WR, TE, K, DEF)</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-sleeper-dark rounded-lg p-8 text-center">
            <p className="text-sleeper-gray">No matchups scheduled for this week</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchupView;
