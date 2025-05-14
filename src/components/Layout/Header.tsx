
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Settings } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const currentLeague = useSelector((state: RootState) => state.leagues.currentLeague);
  const user = useSelector((state: RootState) => state.user.currentUser);

  // Get the current page based on URL
  const getCurrentPageName = () => {
    const path = location.pathname;

    if (path === '/') return 'Dashboard';
    if (path.includes('/league/')) return currentLeague?.name || 'League';
    if (path.includes('/team/')) return 'Team Details';
    if (path.includes('/players')) return 'Players';
    if (path.includes('/trades')) return 'Trades';
    if (path.includes('/draft')) return 'Draft';
    
    return 'Fantasy Football';
  };

  return (
    <header className="bg-sleeper-dark border-b border-b-border flex justify-between items-center p-4">
      <div className="flex items-center">
        {currentLeague && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-sleeper-primary rounded-full flex items-center justify-center mr-2">
              {currentLeague.name.charAt(0)}
            </div>
            <span className="text-white font-semibold">{getCurrentPageName()}</span>
            {currentLeague.type && (
              <span className="ml-2 text-xs bg-sleeper-darker px-2 py-1 rounded text-sleeper-gray">
                {currentLeague.type} {currentLeague.size}-Team
              </span>
            )}
          </div>
        )}
        
        {!currentLeague && (
          <h1 className="text-white font-semibold">{getCurrentPageName()}</h1>
        )}
      </div>

      <div className="flex items-center">
        <Link to="/settings" className="p-2 rounded-full hover:bg-sleeper-darker text-sleeper-gray">
          <Settings className="h-5 w-5" />
        </Link>

        {user && (
          <div className="flex items-center ml-3">
            <div className="w-8 h-8 bg-sleeper-primary rounded-full flex items-center justify-center">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="ml-2 text-white">{user.username}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
