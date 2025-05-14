
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeagueNavigationProps {
  activeTab: string;
  onChange: (value: string) => void;
}

const LeagueNavigation: React.FC<LeagueNavigationProps> = ({ activeTab, onChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onChange}>
      <TabsList className="bg-sleeper-dark grid grid-cols-6 h-12">
        <TabsTrigger value="matchup" className="tab-trigger">Matchup</TabsTrigger>
        <TabsTrigger value="team" className="tab-trigger">Team</TabsTrigger>
        <TabsTrigger value="league" className="tab-trigger">League</TabsTrigger>
        <TabsTrigger value="players" className="tab-trigger">Players</TabsTrigger>
        <TabsTrigger value="trend" className="tab-trigger">Trend</TabsTrigger>
        <TabsTrigger value="trades" className="tab-trigger">Trades</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default LeagueNavigation;
