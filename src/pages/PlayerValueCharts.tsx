import React from 'react';
import PlayerValueChartsComponent from '@/components/Player/PlayerValueCharts';

const PlayerValueChartsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Player Value Charts</h1>
        <p className="text-sleeper-gray">Comprehensive player values for dynasty, keeper, and redraft leagues</p>
      </div>
      
      <PlayerValueChartsComponent />
    </div>
  );
};

export default PlayerValueChartsPage;