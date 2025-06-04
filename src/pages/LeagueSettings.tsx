import React from 'react';
import { useParams } from 'react-router-dom';
import LeagueSettingsComponent from '@/components/League/LeagueSettings';

const LeagueSettingsPage: React.FC = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  
  if (!leagueId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">No League Selected</h1>
          <p className="text-sleeper-gray">Please select a league to view its settings</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <LeagueSettingsComponent />
    </div>
  );
};

export default LeagueSettingsPage;