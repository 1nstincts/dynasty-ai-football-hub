
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  MessageSquare, 
  Inbox, 
  Users, 
  Award, 
  Settings,
  TrendingUp,
  Database,
  BarChart,
  BarChart2,
  Calculator,
  Calendar,
  TrendingDown,
  Brain,
  Timer,
  Clipboard,
  FileText,
  DollarSign,
  Globe,
  PieChart,
  Smartphone
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { leagues } = useSelector((state: RootState) => state.leagues);

  return (
    <aside className="w-64 h-screen bg-sleeper-dark border-r border-r-border flex flex-col">
      <div className="p-4 border-b border-b-border">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <span className="text-sleeper-accent">D</span>ynasty
        </h1>
      </div>

      <div className="p-4 border-b border-b-border">
        <Link to="/" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
          <MessageSquare className="mr-2 h-5 w-5 text-sleeper-gray" />
          <span className="text-sleeper-gray">Direct Messages</span>
        </Link>
        <Link to="/inbox" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
          <Inbox className="mr-2 h-5 w-5 text-sleeper-gray" />
          <span className="text-sleeper-gray">Inbox</span>
        </Link>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs uppercase font-semibold text-sleeper-gray">Leagues</h2>
          <button className="text-sleeper-gray hover:text-white">
            <span className="text-xl">+</span>
          </button>
        </div>
        <div className="space-y-1">
          {leagues.length > 0 ? (
            leagues.map((league) => (
              <Link
                key={league.id}
                to={`/league/${league.id}`}
                className="flex items-center p-2 rounded hover:bg-sleeper-darker"
              >
                <div className="w-8 h-8 bg-sleeper-primary rounded-full flex items-center justify-center mr-2">
                  {league.name.charAt(0)}
                </div>
                <span className="text-white">{league.name}</span>
              </Link>
            ))
          ) : (
            <div className="text-sleeper-gray text-sm p-2">
              No leagues yet. Create one!
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-t-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs uppercase font-semibold text-sleeper-gray">Tools</h2>
        </div>
        <div className="space-y-1">
          <Link to="/players" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <Database className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Player Database</span>
          </Link>
          <Link to="/rankings" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <TrendingUp className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Dynasty Rankings</span>
          </Link>
          <Link to="/values" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <BarChart className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Player Values</span>
          </Link>
          <Link to="/trade-analyzer" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <Award className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Trade Analyzer</span>
          </Link>
          <Link to="/projections" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <Calculator className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Points Projections</span>
          </Link>
          <Link to="/schedule" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <Calendar className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Schedule Generator</span>
          </Link>
          <Link to="/dynasty-calculator" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <TrendingDown className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Dynasty Calculator</span>
          </Link>
          <Link to="/team-analysis" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <Brain className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">AI Team Analysis</span>
          </Link>
          <Link to="/player-comparison" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <BarChart2 className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Player Comparison</span>
          </Link>
          <Link to="/dynasty-window" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <Timer className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Dynasty Window</span>
          </Link>
          <Link to="/draft-war-room" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <Clipboard className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Draft War Room</span>
          </Link>
          <Link to="/league-rules-analysis" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <FileText className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Rules Analysis</span>
          </Link>
          <Link to="/contract-management" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <DollarSign className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Salary Cap</span>
          </Link>
          <Link to="/social" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <Globe className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Community Hub</span>
          </Link>
          {leagues.length > 0 && (
            <div className="group relative">
              <div className="flex items-center p-2 rounded hover:bg-sleeper-darker cursor-pointer">
                <PieChart className="mr-2 h-5 w-5 text-sleeper-gray" />
                <span className="text-sleeper-gray">Matchup Forecast</span>
              </div>
              <div className="absolute left-full top-0 ml-2 w-48 bg-sleeper-dark border border-border rounded shadow-lg hidden group-hover:block z-10">
                {leagues.map(league => (
                  <Link 
                    key={`forecast-${league.id}`}
                    to={`/league/${league.id}`} 
                    className="block p-2 hover:bg-sleeper-darker text-sleeper-gray"
                  >
                    {league.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Link to="/mobile-app" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <Smartphone className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Mobile App</span>
          </Link>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-t-border">
        <div className="space-y-1">
          <Link to="/mock-drafts" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <Users className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Mock Drafts</span>
          </Link>
          <Link to="/settings" className="flex items-center p-2 rounded hover:bg-sleeper-darker">
            <Settings className="mr-2 h-5 w-5 text-sleeper-gray" />
            <span className="text-sleeper-gray">Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
