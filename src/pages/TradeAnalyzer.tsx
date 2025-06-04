import React from 'react';
import TradeAnalyzerComponent from '@/components/Trade/TradeAnalyzer';
import { Card } from '@/components/ui/card';

const TradeAnalyzerPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Trade Analyzer</h1>
        <p className="text-sleeper-gray">Evaluate fantasy football trades with our advanced analysis tools</p>
      </div>
      
      <TradeAnalyzerComponent />
    </div>
  );
};

export default TradeAnalyzerPage;