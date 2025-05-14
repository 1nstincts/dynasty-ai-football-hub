
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import TradeBlock from '@/components/Trade/TradeBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Trades = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trades Dashboard</h1>
        
        <Button className="bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90">
          + PROPOSE TRADE
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-sleeper-dark border-sleeper-dark shadow-md">
          <CardHeader>
            <CardTitle>Active Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-sleeper-gray">No active trades yet...</p>
              <Button className="mt-4 bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90">
                PROPOSE A TRADE
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-sleeper-dark border-sleeper-dark shadow-md">
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-sleeper-gray">No trade history yet</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-sleeper-dark border-sleeper-dark shadow-md">
        <CardHeader>
          <CardTitle>Trade Block</CardTitle>
        </CardHeader>
        <CardContent>
          <TradeBlock />
        </CardContent>
      </Card>
    </div>
  );
};

export default Trades;
