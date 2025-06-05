
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store';

import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import League from "./pages/League";
import Players from "./pages/Players";
import Trades from "./pages/Trades";
import CreateLeague from "./pages/CreateLeague";
import PlayerProfile from "./pages/PlayerProfile";
import DynastyRankings from "./pages/DynastyRankings";
import TradeAnalyzer from "./pages/TradeAnalyzer";
import LeagueSettings from "./pages/LeagueSettings";
import PlayerValueCharts from "./pages/PlayerValueCharts";
import ProjectionsCalculator from "./pages/ProjectionsCalculator";
import ScheduleGenerator from "./pages/ScheduleGenerator";
import DynastyValueCalculator from "./pages/DynastyValueCalculator";
import TeamAnalysis from "./pages/TeamAnalysis";
import PlayerComparison from "./pages/PlayerComparison";
import DynastyWindow from "./pages/DynastyWindow";
import DraftWarRoom from "./pages/DraftWarRoom";
import LeagueRulesAnalysis from "./pages/LeagueRulesAnalysis";
import ContractManagement from "./pages/ContractManagement";
import SocialHub from "./pages/SocialHub";
import MatchupForecast from "./pages/MatchupForecast";
import LeagueHistory from "./pages/LeagueHistory";
import MobileApp from "./pages/MobileApp";
import NewFeatures from "./pages/NewFeatures";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/league/:leagueId" element={<League />} />
              <Route path="/league/:leagueId/settings" element={<LeagueSettings />} />
              <Route path="/players" element={<Players />} />
              <Route path="/players/:id" element={<PlayerProfile />} />
              <Route path="/rankings" element={<DynastyRankings />} />
              <Route path="/values" element={<PlayerValueCharts />} />
              <Route path="/trades" element={<Trades />} />
              <Route path="/trade-analyzer" element={<TradeAnalyzer />} />
              <Route path="/create-league" element={<CreateLeague />} />
              <Route path="/projections" element={<ProjectionsCalculator />} />
              <Route path="/schedule" element={<ScheduleGenerator />} />
              <Route path="/dynasty-calculator" element={<DynastyValueCalculator />} />
              <Route path="/team-analysis/:teamId" element={<TeamAnalysis />} />
              <Route path="/team-analysis" element={<TeamAnalysis />} />
              <Route path="/player-comparison" element={<PlayerComparison />} />
              <Route path="/dynasty-window" element={<DynastyWindow />} />
              <Route path="/dynasty-window/:teamId" element={<DynastyWindow />} />
              <Route path="/draft-war-room" element={<DraftWarRoom />} />
              <Route path="/draft-war-room/:leagueId" element={<DraftWarRoom />} />
              <Route path="/league-rules-analysis" element={<LeagueRulesAnalysis />} />
              <Route path="/league-rules-analysis/:leagueId" element={<LeagueRulesAnalysis />} />
              <Route path="/contract-management" element={<ContractManagement />} />
              <Route path="/contract-management/:leagueId" element={<ContractManagement />} />
              <Route path="/contract-management/:leagueId/:teamId" element={<ContractManagement />} />
              <Route path="/social" element={<SocialHub />} />
              <Route path="/social/:tab" element={<SocialHub />} />
              <Route path="/league/:leagueId/matchup-forecast/:matchupId" element={<MatchupForecast />} />
              <Route path="/league/:leagueId/history" element={<LeagueHistory />} />
              <Route path="/mobile-app" element={<MobileApp />} />
              <Route path="/new-features" element={<NewFeatures />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
