import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../ui/tabs';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import DraftRoomService, { 
  DraftBoard, 
  DraftPick, 
  DraftProspect, 
  ProspectTier 
} from '../../services/DraftRoomService';
import { 
  ArrowUpDown, 
  Filter, 
  Search, 
  Plus, 
  ListFilter, 
  BarChart3, 
  CalendarDays, 
  Clipboard, 
  Star, 
  RefreshCcw,
  Info,
  Check
} from 'lucide-react';

interface RookieDraftWarRoomProps {
  leagueId?: string;
}

const RookieDraftWarRoom: React.FC<RookieDraftWarRoomProps> = ({ leagueId }) => {
  // State for draft boards
  const [draftBoards, setDraftBoards] = useState<DraftBoard[]>([]);
  const [currentBoard, setCurrentBoard] = useState<DraftBoard | null>(null);
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);
  
  // State for prospects
  const [prospects, setProspects] = useState<DraftProspect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<DraftProspect[]>([]);
  const [prospectTiers, setProspectTiers] = useState<ProspectTier[]>([]);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeTier, setActiveTier] = useState(0); // 0 means all tiers
  const [selectedProspect, setSelectedProspect] = useState<DraftProspect | null>(null);
  const [isCreateDraftModalOpen, setIsCreateDraftModalOpen] = useState(false);
  const [newDraftName, setNewDraftName] = useState('');
  const [newDraftYear, setNewDraftYear] = useState(new Date().getFullYear());
  const [newDraftRounds, setNewDraftRounds] = useState(5);
  
  // Get current team and league from Redux store
  const { currentTeam } = useSelector((state: RootState) => state.teams);
  const { currentLeague } = useSelector((state: RootState) => state.leagues);
  
  // Fetch draft boards and prospects on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (leagueId) {
        const boards = await DraftRoomService.getDraftBoards(leagueId);
        setDraftBoards(boards);
        
        if (boards.length > 0) {
          const boardData = await DraftRoomService.getDraftBoardWithPicks(boards[0].id);
          if (boardData) {
            setCurrentBoard(boardData.board);
            setDraftPicks(boardData.picks);
          }
        }
      }
      
      const rookies = await DraftRoomService.getRookieProspects();
      setProspects(rookies);
      setFilteredProspects(rookies);
      
      const tiers = DraftRoomService.groupProspectsByTier(rookies);
      setProspectTiers(tiers);
    };
    
    fetchData();
  }, [leagueId]);
  
  // Filter prospects when search or filters change
  useEffect(() => {
    let filtered = [...prospects];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.full_name.toLowerCase().includes(term) || 
        p.college.toLowerCase().includes(term)
      );
    }
    
    // Filter by position
    if (positionFilter !== 'ALL') {
      filtered = filtered.filter(p => p.position === positionFilter);
    }
    
    // Filter by tier
    if (activeTier > 0) {
      const tier = prospectTiers.find(t => t.tier === activeTier);
      if (tier) {
        const tierPlayerIds = tier.players.map(p => p.id);
        filtered = filtered.filter(p => tierPlayerIds.includes(p.id));
      }
    }
    
    // Sort
    filtered = filtered.sort((a, b) => {
      // Handle rank specially since lower is better
      if (sortField === 'rank') {
        return sortDirection === 'asc' 
          ? a.rank - b.rank 
          : b.rank - a.rank;
      }
      
      // Handle other fields
      const fieldA = (a as any)[sortField];
      const fieldB = (b as any)[sortField];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      return sortDirection === 'asc'
        ? (fieldA > fieldB ? 1 : -1)
        : (fieldB > fieldA ? 1 : -1);
    });
    
    setFilteredProspects(filtered);
  }, [searchTerm, positionFilter, activeTier, sortField, sortDirection, prospects, prospectTiers]);
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle creating a new draft board
  const handleCreateDraft = async () => {
    if (!leagueId || !newDraftName) return;
    
    const newBoard = await DraftRoomService.createDraftBoard(
      leagueId,
      newDraftName,
      newDraftYear,
      newDraftRounds
    );
    
    if (newBoard) {
      setDraftBoards([newBoard, ...draftBoards]);
      setCurrentBoard(newBoard);
      
      // Fetch the picks
      const boardData = await DraftRoomService.getDraftBoardWithPicks(newBoard.id);
      if (boardData) {
        setDraftPicks(boardData.picks);
      }
    }
    
    setIsCreateDraftModalOpen(false);
    setNewDraftName('');
  };
  
  // Handle changing the current draft board
  const handleChangeDraftBoard = async (boardId: string) => {
    const boardData = await DraftRoomService.getDraftBoardWithPicks(boardId);
    if (boardData) {
      setCurrentBoard(boardData.board);
      setDraftPicks(boardData.picks);
    }
  };
  
  // Handle making a pick
  const handleMakePick = async (pickNumber: number, playerId: string) => {
    if (!currentBoard) return;
    
    const success = await DraftRoomService.makePick(currentBoard.id, pickNumber, playerId);
    
    if (success) {
      // Update the local state
      setDraftPicks(draftPicks.map(pick => {
        if (pick.pick === pickNumber) {
          return { ...pick, playerId, timestamp: new Date().toISOString() };
        }
        return pick;
      }));
      
      setCurrentBoard({
        ...currentBoard,
        currentPick: currentBoard.currentPick + 1
      });
    }
  };
  
  // Get team name from team ID
  const getTeamName = (teamId: string) => {
    // In a real app, you would look up the team from your Redux store or make an API call
    return `Team ${teamId.substring(0, 4)}`;
  };
  
  // Get player name from player ID
  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return '-';
    const player = prospects.find(p => p.id === playerId);
    return player ? player.full_name : 'Unknown Player';
  };
  
  // Get prospect tier name and color
  const getProspectTierInfo = (prospectId: string) => {
    for (const tier of prospectTiers) {
      const player = tier.players.find(p => p.id === prospectId);
      if (player) {
        return { tierName: tier.name, tierColor: tier.color };
      }
    }
    return { tierName: 'Unranked', tierColor: '#888888' };
  };
  
  // Render prospect details
  const renderProspectDetails = () => {
    if (!selectedProspect) return null;
    
    const { tierName, tierColor } = getProspectTierInfo(selectedProspect.id);
    
    return (
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full mr-4">
                {selectedProspect.avatar_url ? (
                  <img 
                    src={selectedProspect.avatar_url} 
                    alt={selectedProspect.full_name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-sleeper-accent rounded-full text-white text-xl font-bold">
                    {selectedProspect.full_name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedProspect.full_name}</h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-700">{selectedProspect.position}</Badge>
                  <Badge style={{ backgroundColor: tierColor }}>{tierName}</Badge>
                  <Badge variant="outline">Rank: #{selectedProspect.rank}</Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">College</p>
                <p className="font-medium">{selectedProspect.college}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{selectedProspect.age}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Height</p>
                <p className="font-medium">{Math.floor(selectedProspect.height / 12)}'{selectedProspect.height % 12}"</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium">{selectedProspect.weight} lbs</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Draft Grade</p>
                <p className="font-medium">{selectedProspect.draftGrade}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Projection</p>
                <p className="font-medium">{selectedProspect.projection}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Pro Comparison</p>
              <p className="font-medium">{selectedProspect.proComparison || 'N/A'}</p>
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
            <h4 className="font-semibold mb-3">Combine Results</h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">40-Yard Dash</p>
                <p className="font-medium">{selectedProspect.combine.fortyYard} sec</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vertical Jump</p>
                <p className="font-medium">{selectedProspect.combine.vertical}"</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bench Press</p>
                <p className="font-medium">{selectedProspect.combine.bench} reps</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Broad Jump</p>
                <p className="font-medium">{selectedProspect.combine.broad}"</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">3-Cone Drill</p>
                <p className="font-medium">{selectedProspect.combine.cone} sec</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Shuttle</p>
                <p className="font-medium">{selectedProspect.combine.shuttle} sec</p>
              </div>
            </div>
            
            <h4 className="font-semibold mb-3">College Stats (Last Season)</h4>
            {selectedProspect.collegeStats && Object.keys(selectedProspect.collegeStats).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(selectedProspect.collegeStats['2023'] || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No stats available</p>
            )}
          </div>
          
          <div className="w-full md:w-1/3">
            <h4 className="font-semibold mb-3">Strengths</h4>
            <ul className="list-disc pl-5 mb-6">
              {selectedProspect.strengths.map((strength, index) => (
                <li key={index} className="mb-1">{strength}</li>
              ))}
            </ul>
            
            <h4 className="font-semibold mb-3">Weaknesses</h4>
            <ul className="list-disc pl-5 mb-6">
              {selectedProspect.weaknesses.map((weakness, index) => (
                <li key={index} className="mb-1">{weakness}</li>
              ))}
            </ul>
            
            <h4 className="font-semibold mb-3">Notes</h4>
            <p className="text-sm">
              {selectedProspect.notes || 'No scouting notes available.'}
            </p>
            
            {currentBoard && currentBoard.isActive && (
              <Button 
                className="w-full mt-4"
                onClick={() => handleMakePick(currentBoard.currentPick, selectedProspect.id)}
                disabled={draftPicks.some(p => p.playerId === selectedProspect.id)}
              >
                Draft {selectedProspect.full_name}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };
  
  // Render prospect card
  const renderProspectCard = (prospect: DraftProspect) => {
    const { tierName, tierColor } = getProspectTierInfo(prospect.id);
    const isSelected = selectedProspect?.id === prospect.id;
    const isDrafted = draftPicks.some(p => p.playerId === prospect.id);
    
    return (
      <div 
        key={prospect.id}
        className={`border rounded-lg p-4 mb-3 cursor-pointer transition-all ${
          isSelected ? 'border-blue-500 bg-blue-50' : 
          isDrafted ? 'border-gray-300 bg-gray-100 opacity-70' : 'border-gray-200 hover:border-gray-400'
        }`}
        onClick={() => setSelectedProspect(prospect)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
              <span className="text-xs font-semibold">{prospect.rank}</span>
            </div>
            <div>
              <h4 className="font-medium">{prospect.full_name}</h4>
              <div className="flex gap-2 text-xs">
                <span className="text-gray-500">{prospect.position}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">{prospect.college}</span>
              </div>
            </div>
          </div>
          <div>
            <Badge style={{ backgroundColor: tierColor }}>
              {tierName}
            </Badge>
            {isDrafted && (
              <Badge variant="outline" className="ml-2">
                Drafted
              </Badge>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Age: </span>
            <span className="font-medium">{prospect.age}</span>
          </div>
          <div>
            <span className="text-gray-500">40: </span>
            <span className="font-medium">{prospect.combine.fortyYard}s</span>
          </div>
          <div>
            <span className="text-gray-500">Grade: </span>
            <span className="font-medium">{prospect.draftGrade}</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Rookie Draft War Room</h1>
        <p className="text-gray-600">
          Analyze rookie prospects, create big boards, and manage your draft strategy.
        </p>
      </div>
      
      <Tabs defaultValue="prospects">
        <TabsList>
          <TabsTrigger value="prospects">
            <Clipboard className="w-4 h-4 mr-2" />
            Prospect Database
          </TabsTrigger>
          <TabsTrigger value="bigBoard">
            <BarChart3 className="w-4 h-4 mr-2" />
            Big Board
          </TabsTrigger>
          <TabsTrigger value="draftBoard" disabled={!leagueId}>
            <CalendarDays className="w-4 h-4 mr-2" />
            Draft Board
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="prospects" className="mt-6">
          {selectedProspect && renderProspectDetails()}
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/4">
              <Card className="p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setPositionFilter('ALL');
                      setActiveTier(0);
                    }}
                  >
                    <RefreshCcw className="w-3 h-3 mr-2" />
                    Reset
                  </Button>
                </div>
                
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search prospects..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="position-filter" className="block mb-2 text-sm">Position</Label>
                  <Select 
                    value={positionFilter} 
                    onValueChange={setPositionFilter}
                  >
                    <SelectTrigger id="position-filter">
                      <SelectValue placeholder="All Positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Positions</SelectItem>
                      <SelectItem value="QB">Quarterback</SelectItem>
                      <SelectItem value="RB">Running Back</SelectItem>
                      <SelectItem value="WR">Wide Receiver</SelectItem>
                      <SelectItem value="TE">Tight End</SelectItem>
                      <SelectItem value="K">Kicker</SelectItem>
                      <SelectItem value="DEF">Defense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block mb-2 text-sm">Prospect Tiers</Label>
                  <div className="space-y-2">
                    <div 
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        activeTier === 0 ? 'bg-gray-100 font-medium' : ''
                      }`}
                      onClick={() => setActiveTier(0)}
                    >
                      <span>All Tiers</span>
                      <span className="text-sm text-gray-500">{prospects.length}</span>
                    </div>
                    
                    {prospectTiers.map(tier => (
                      <div 
                        key={tier.tier}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                          activeTier === tier.tier ? 'bg-gray-100 font-medium' : ''
                        }`}
                        onClick={() => setActiveTier(tier.tier)}
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: tier.color }}
                          />
                          <span>{tier.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{tier.players.length}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Draft Order</h3>
                
                {currentBoard ? (
                  <div className="space-y-2">
                    <div className="flex justify-between mb-4">
                      <h4 className="text-sm font-medium">{currentBoard.name}</h4>
                      <Badge variant={currentBoard.isActive ? 'default' : 'outline'}>
                        {currentBoard.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {draftPicks.slice(0, 20).map(pick => (
                        <div 
                          key={pick.id}
                          className={`flex items-center justify-between p-2 rounded mb-1 ${
                            currentBoard.currentPick === pick.pick ? 'bg-blue-50 border border-blue-200' : 
                            pick.playerId ? 'bg-gray-50' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-xs font-medium">
                              {pick.round}.{pick.pick % 12 === 0 ? 12 : pick.pick % 12}
                            </div>
                            <div className="text-sm">
                              <p className="font-medium">{getTeamName(pick.teamId)}</p>
                              <p className="text-xs text-gray-500">
                                {pick.originalTeamId !== pick.teamId && `From: ${getTeamName(pick.originalTeamId)}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm">
                            {pick.playerId ? (
                              <p className="font-medium">{getPlayerName(pick.playerId)}</p>
                            ) : (
                              <p className="text-gray-400">On the clock</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {draftBoards.length > 1 && (
                      <Select
                        value={currentBoard.id}
                        onValueChange={handleChangeDraftBoard}
                      >
                        <SelectTrigger className="mt-4">
                          <SelectValue placeholder="Select Draft Board" />
                        </SelectTrigger>
                        <SelectContent>
                          {draftBoards.map(board => (
                            <SelectItem key={board.id} value={board.id}>
                              {board.name} ({board.year})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ) : leagueId ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-4">No draft boards found for this league.</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsCreateDraftModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Draft Board
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Select a league to view draft boards</p>
                  </div>
                )}
              </Card>
            </div>
            
            <div className="w-full md:w-3/4">
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h3 className="font-semibold mb-2 sm:mb-0">
                    Rookie Prospects ({filteredProspects.length})
                  </h3>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ListFilter className="w-4 h-4 mr-2" />
                          Position: {positionFilter}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0">
                        <div className="p-2">
                          <div 
                            className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => setPositionFilter('ALL')}
                          >
                            All Positions
                          </div>
                          {['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(pos => (
                            <div 
                              key={pos}
                              className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                              onClick={() => setPositionFilter(pos)}
                            >
                              {pos}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                          Sort: {sortField}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0">
                        <div className="p-2">
                          {['rank', 'full_name', 'age', 'position', 'college'].map(field => (
                            <div 
                              key={field}
                              className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-between"
                              onClick={() => handleSort(field)}
                            >
                              <span className="capitalize">
                                {field === 'full_name' ? 'Name' : field}
                              </span>
                              {sortField === field && (
                                <ArrowUpDown className="w-3 h-3" />
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="w-4 h-4 mr-2" />
                          View: {activeTier > 0 ? prospectTiers.find(t => t.tier === activeTier)?.name || 'Tier' : 'All'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0">
                        <div className="p-2">
                          <div 
                            className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => setActiveTier(0)}
                          >
                            All Tiers
                          </div>
                          {prospectTiers.map(tier => (
                            <div 
                              key={tier.tier}
                              className="p-2 hover:bg-gray-100 rounded cursor-pointer flex items-center"
                              onClick={() => setActiveTier(tier.tier)}
                            >
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: tier.color }}
                              />
                              <span>{tier.name}</span>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {filteredProspects.length > 0 ? (
                    filteredProspects.map(prospect => renderProspectCard(prospect))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500">No prospects match your filters</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="bigBoard" className="mt-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Your Big Board</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Clipboard className="w-4 h-4 mr-2" />
                  Save Board
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Board
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {prospectTiers.map(tier => (
                <div key={tier.tier} className="border rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: tier.color }}
                    />
                    <h4 className="font-semibold">{tier.name} (Tier {tier.tier})</h4>
                    <Badge className="ml-2">{tier.players.length}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tier.players.map(player => (
                      <div 
                        key={player.id}
                        className="border rounded p-3 hover:border-blue-300 cursor-pointer transition-all"
                        onClick={() => setSelectedProspect(player)}
                      >
                        <div className="flex items-center mb-1">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs">{player.rank}</span>
                          </div>
                          <div className="font-medium truncate">{player.full_name}</div>
                        </div>
                        <div className="flex text-xs text-gray-500 justify-between">
                          <span>{player.position}</span>
                          <span>{player.college}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="draftBoard" className="mt-6">
          {leagueId ? (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {currentBoard ? currentBoard.name : 'League Draft Board'}
                </h3>
                <div className="flex gap-2">
                  {draftBoards.length > 1 && (
                    <Select
                      value={currentBoard?.id || ''}
                      onValueChange={handleChangeDraftBoard}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Draft Board" />
                      </SelectTrigger>
                      <SelectContent>
                        {draftBoards.map(board => (
                          <SelectItem key={board.id} value={board.id}>
                            {board.name} ({board.year})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsCreateDraftModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Draft
                  </Button>
                </div>
              </div>
              
              {currentBoard ? (
                <>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="outline">Year: {currentBoard.year}</Badge>
                    <Badge variant="outline">Rounds: {currentBoard.rounds}</Badge>
                    <Badge variant={currentBoard.isActive ? 'default' : 'outline'}>
                      {currentBoard.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      Current Pick: {currentBoard.currentPick > 0 ? currentBoard.currentPick : 'Not Started'}
                    </Badge>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Pick</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead>Player</TableHead>
                          <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {draftPicks.map(pick => (
                          <TableRow 
                            key={pick.id}
                            className={currentBoard.currentPick === pick.pick ? 'bg-blue-50' : ''}
                          >
                            <TableCell className="font-medium">
                              {pick.round}.{pick.pick % 12 === 0 ? 12 : pick.pick % 12}
                            </TableCell>
                            <TableCell>
                              {getTeamName(pick.teamId)}
                              {pick.originalTeamId !== pick.teamId && (
                                <span className="text-xs text-gray-500 ml-2">
                                  (from {getTeamName(pick.originalTeamId)})
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {pick.playerId ? (
                                <div>
                                  <span>{getPlayerName(pick.playerId)}</span>
                                  {prospects.find(p => p.id === pick.playerId) && (
                                    <Badge className="ml-2">
                                      {prospects.find(p => p.id === pick.playerId)?.position}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">
                                  {currentBoard.currentPick === pick.pick ? 'On the clock' : '-'}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {pick.timestamp ? (
                                new Date(pick.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-4">No draft boards found for this league.</p>
                  <Button 
                    variant="outline"
                    onClick={() => setIsCreateDraftModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Draft Board
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Please select a league to view draft boards</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create Draft Modal */}
      <Dialog open={isCreateDraftModalOpen} onOpenChange={setIsCreateDraftModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Draft Board</DialogTitle>
            <DialogDescription>
              Create a new rookie draft board for your league.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="draft-name">Draft Name</Label>
              <Input 
                id="draft-name" 
                placeholder="e.g., 2024 Rookie Draft" 
                value={newDraftName}
                onChange={(e) => setNewDraftName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="draft-year">Draft Year</Label>
              <Select 
                value={String(newDraftYear)} 
                onValueChange={(value) => setNewDraftYear(parseInt(value, 10))}
              >
                <SelectTrigger id="draft-year">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="draft-rounds">Number of Rounds</Label>
              <Select 
                value={String(newDraftRounds)} 
                onValueChange={(value) => setNewDraftRounds(parseInt(value, 10))}
              >
                <SelectTrigger id="draft-rounds">
                  <SelectValue placeholder="Select Rounds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Rounds</SelectItem>
                  <SelectItem value="4">4 Rounds</SelectItem>
                  <SelectItem value="5">5 Rounds</SelectItem>
                  <SelectItem value="6">6 Rounds</SelectItem>
                  <SelectItem value="7">7 Rounds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCreateDraftModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDraft} disabled={!newDraftName}>
              Create Draft Board
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RookieDraftWarRoom;