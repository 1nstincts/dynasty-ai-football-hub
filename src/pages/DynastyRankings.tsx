import React from 'react';
import DynastyRankings from '@/components/Player/DynastyRankings';
import { Card } from '@/components/ui/card';

const DynastyRankingsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dynasty Rankings</h1>
        <p className="text-sleeper-gray">Comprehensive player rankings for dynasty fantasy football leagues</p>
      </div>
      
      <DynastyRankings />
    </div>
  );
};

export default DynastyRankingsPage;