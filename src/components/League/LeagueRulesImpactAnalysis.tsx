import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import {
  BarChart,
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import LeagueRulesService, {
  LeagueRules,
  ScoringRule,
  LeagueRulesImpactAnalysis as ImpactAnalysis
} from '../../services/LeagueRulesService';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Plus,
  Trash,
  FileBarChart,
  RefreshCw,
  Settings,
  Zap
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Label } from '../ui/label';

interface LeagueRulesImpactAnalysisProps {
  leagueId?: string;
}

const LeagueRulesImpactAnalysis: React.FC<LeagueRulesImpactAnalysisProps> = ({ leagueId }) => {
  // State for league rules
  const [leagueRules, setLeagueRules] = useState<LeagueRules[]>([]);
  const [selectedRuleSet, setSelectedRuleSet] = useState<LeagueRules | null>(null);
  const [ruleTemplates, setRuleTemplates] = useState<Omit<LeagueRules, 'id' | 'leagueId' | 'isDefault'>[]>([]);
  
  // State for rule editing
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [editedRules, setEditedRules] = useState<LeagueRules | null>(null);
  const [isCreatingRules, setIsCreatingRules] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  // State for impact analysis
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get current league from Redux store
  const { currentLeague } = useSelector((state: RootState) => state.leagues);
  
  // Fetch league rules on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (leagueId || currentLeague?.id) {
        const league = leagueId || currentLeague?.id;
        const rules = await LeagueRulesService.getLeagueRules(league!);
        setLeagueRules(rules);
        
        if (rules.length > 0) {
          // Find default rule set or use the first one
          const defaultRules = rules.find(r => r.isDefault) || rules[0];
          setSelectedRuleSet(defaultRules);
          
          // Run initial analysis
          runImpactAnalysis(defaultRules);
        }
      }
      
      // Get rule templates
      const templates = LeagueRulesService.getRuleTemplates();
      setRuleTemplates(templates);
    };
    
    fetchData();
  }, [leagueId, currentLeague]);
  
  // Run impact analysis for selected rule set
  const runImpactAnalysis = async (rules: LeagueRules) => {
    setIsLoading(true);
    const analysis = await LeagueRulesService.analyzeRulesImpact(rules);
    setImpactAnalysis(analysis);
    setIsLoading(false);
  };
  
  // Handle rule set selection change
  const handleRuleSetChange = (ruleId: string) => {
    const rules = leagueRules.find(r => r.id === ruleId);
    if (rules) {
      setSelectedRuleSet(rules);
      runImpactAnalysis(rules);
    }
  };
  
  // Handle creating a new rule set
  const handleCreateRuleSet = async () => {
    if (!leagueId && !currentLeague?.id) return;
    if (!newRuleName.trim() || !selectedTemplate) return;
    
    const league = leagueId || currentLeague?.id;
    const template = ruleTemplates.find(t => t.name === selectedTemplate);
    
    if (template && league) {
      const newRules = await LeagueRulesService.createLeagueRules({
        leagueId: league,
        name: newRuleName,
        description: template.description,
        rosterSize: template.rosterSize,
        startingPositions: template.startingPositions,
        benchPositions: template.benchPositions,
        scoringRules: template.scoringRules,
        ppr: template.ppr,
        isDefault: false
      });
      
      if (newRules) {
        setLeagueRules([...leagueRules, newRules]);
        setSelectedRuleSet(newRules);
        runImpactAnalysis(newRules);
        setIsCreatingRules(false);
        setNewRuleName('');
        setSelectedTemplate('');
      }
    }
  };
  
  // Handle updating a rule set
  const handleUpdateRuleSet = async () => {
    if (!editedRules) return;
    
    const success = await LeagueRulesService.updateLeagueRules(editedRules);
    
    if (success) {
      // Update local state
      setLeagueRules(leagueRules.map(rule => 
        rule.id === editedRules.id ? editedRules : rule
      ));
      setSelectedRuleSet(editedRules);
      runImpactAnalysis(editedRules);
      setIsEditingRules(false);
      setEditedRules(null);
    }
  };
  
  // Handle deleting a rule set
  const handleDeleteRuleSet = async (ruleId: string) => {
    const success = await LeagueRulesService.deleteLeagueRules(ruleId);
    
    if (success) {
      const updatedRules = leagueRules.filter(rule => rule.id !== ruleId);
      setLeagueRules(updatedRules);
      
      // If we deleted the selected rule set, select another one
      if (selectedRuleSet?.id === ruleId && updatedRules.length > 0) {
        setSelectedRuleSet(updatedRules[0]);
        runImpactAnalysis(updatedRules[0]);
      } else if (updatedRules.length === 0) {
        setSelectedRuleSet(null);
        setImpactAnalysis(null);
      }
    }
  };
  
  // Handle setting a rule set as default
  const handleSetDefaultRuleSet = async (ruleId: string) => {
    if (!leagueId && !currentLeague?.id) return;
    
    const league = leagueId || currentLeague?.id;
    const success = await LeagueRulesService.setDefaultLeagueRules(league!, ruleId);
    
    if (success) {
      // Update local state
      setLeagueRules(leagueRules.map(rule => ({
        ...rule,
        isDefault: rule.id === ruleId
      })));
    }
  };
  
  // Handle editing a scoring rule
  const handleEditScoringRule = (ruleIndex: number, field: keyof ScoringRule, value: string | number) => {
    if (!editedRules) return;
    
    const updatedRules = [...editedRules.scoringRules];
    updatedRules[ruleIndex] = {
      ...updatedRules[ruleIndex],
      [field]: typeof updatedRules[ruleIndex][field] === 'number' ? Number(value) : value
    };
    
    setEditedRules({
      ...editedRules,
      scoringRules: updatedRules,
      ppr: updatedRules.find(r => r.action === 'reception')?.points || 0
    });
  };
  
  // Render the position impact chart
  const renderPositionImpactChart = () => {
    if (!impactAnalysis) return null;
    
    const chartData = Object.values(impactAnalysis.positionImpacts).map(pos => ({
      position: pos.position,
      change: Number(pos.percentageChange.toFixed(1))
    }));
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="position" />
          <YAxis label={{ value: '% Change vs Standard', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value: number) => [`${value}%`, 'Change']} />
          <Legend />
          <Bar 
            dataKey="change" 
            fill="#8884d8" 
            name="% Change vs Standard Scoring"
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render the player impact chart
  const renderPlayerImpactChart = () => {
    if (!impactAnalysis) return null;
    
    // Get top 5 risers and fallers
    const topRisers = [...impactAnalysis.playerImpacts]
      .sort((a, b) => b.percentageChange - a.percentageChange)
      .slice(0, 5);
    
    const topFallers = [...impactAnalysis.playerImpacts]
      .sort((a, b) => a.percentageChange - b.percentageChange)
      .slice(0, 5);
    
    const chartData = [
      ...topRisers.map(player => ({
        name: player.fullName.split(' ')[1], // Last name for brevity
        fullName: player.fullName,
        position: player.position,
        change: Number(player.percentageChange.toFixed(1))
      })),
      ...topFallers.map(player => ({
        name: player.fullName.split(' ')[1], // Last name for brevity
        fullName: player.fullName,
        position: player.position,
        change: Number(player.percentageChange.toFixed(1))
      }))
    ];
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={['dataMin', 'dataMax']} />
          <YAxis dataKey="name" type="category" width={80} />
          <Tooltip 
            formatter={(value: number, name: string, props: any) => [
              `${value}%`, 
              'Change vs Standard'
            ]}
            labelFormatter={(value) => {
              const player = chartData.find(p => p.name === value);
              return player ? `${player.fullName} (${player.position})` : value;
            }}
          />
          <Legend />
          <Bar 
            dataKey="change" 
            fill={(data) => data.change > 0 ? '#4CAF50' : '#FF5252'}
            name="% Change vs Standard Scoring"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render the position tier chart
  const renderPositionTierChart = () => {
    if (!impactAnalysis) return null;
    
    // Get data for QB, RB, WR, TE
    const positions = ['QB', 'RB', 'WR', 'TE'];
    const chartData = positions.map(pos => {
      const impact = impactAnalysis.positionImpacts[pos];
      if (!impact) return null;
      
      // Get players in tiers (top 25%, 50%, 75%, 100%)
      const positionPlayers = impactAnalysis.playerImpacts
        .filter(p => p.position === pos)
        .sort((a, b) => b.customPoints - a.customPoints);
      
      const playerCount = positionPlayers.length;
      
      if (playerCount === 0) return null;
      
      const tier1End = Math.floor(playerCount * 0.25);
      const tier2End = Math.floor(playerCount * 0.5);
      const tier3End = Math.floor(playerCount * 0.75);
      
      const tier1Avg = positionPlayers.slice(0, tier1End).reduce((sum, p) => sum + p.percentageChange, 0) / tier1End;
      const tier2Avg = positionPlayers.slice(tier1End, tier2End).reduce((sum, p) => sum + p.percentageChange, 0) / (tier2End - tier1End);
      const tier3Avg = positionPlayers.slice(tier2End, tier3End).reduce((sum, p) => sum + p.percentageChange, 0) / (tier3End - tier2End);
      const tier4Avg = positionPlayers.slice(tier3End).reduce((sum, p) => sum + p.percentageChange, 0) / (playerCount - tier3End);
      
      return {
        position: pos,
        'Elite': Number(tier1Avg.toFixed(1)),
        'Starter': Number(tier2Avg.toFixed(1)),
        'Backup': Number(tier3Avg.toFixed(1)),
        'Depth': Number(tier4Avg.toFixed(1))
      };
    }).filter(Boolean);
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="position" />
          <YAxis label={{ value: '% Change by Tier', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value: number) => [`${value}%`, 'Change']} />
          <Legend />
          <Bar dataKey="Elite" fill="#8884d8" />
          <Bar dataKey="Starter" fill="#82ca9d" />
          <Bar dataKey="Backup" fill="#ffc658" />
          <Bar dataKey="Depth" fill="#ff8042" />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Render recommendations section
  const renderRecommendations = () => {
    if (!impactAnalysis) return null;
    
    const { recommendations } = impactAnalysis;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Draft Strategy</CardTitle>
            <CardDescription>
              Recommended approaches to optimize your draft with these scoring rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.draftStrategy.map((strategy, index) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Roster Construction</CardTitle>
            <CardDescription>
              How to build your roster to maximize scoring potential
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.rosterConstruction.map((strategy, index) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Players to Target</CardTitle>
              <CardDescription>
                Players who gain the most value in this scoring system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.tradeTargets.slice(0, 5).map((player, index) => (
                  <div key={index} className="flex items-start">
                    <ArrowUp className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{player.fullName}</div>
                      <div className="text-sm text-gray-500">{player.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Players to Avoid</CardTitle>
              <CardDescription>
                Players who lose value in this scoring system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.playersToAvoid.slice(0, 5).map((player, index) => (
                  <div key={index} className="flex items-start">
                    <ArrowDown className="h-5 w-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{player.fullName}</div>
                      <div className="text-sm text-gray-500">{player.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  // Render edit rule set form
  const renderEditRuleForm = () => {
    if (!editedRules) return null;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="rule-name">Rule Set Name</Label>
            <Input 
              id="rule-name" 
              value={editedRules.name} 
              onChange={(e) => setEditedRules({ ...editedRules, name: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="ppr-value">PPR Value</Label>
            <Input 
              id="ppr-value"
              type="number"
              step="0.5"
              min="0"
              max="2"
              value={editedRules.ppr}
              onChange={(e) => setEditedRules({ ...editedRules, ppr: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="rule-description">Description</Label>
          <Input
            id="rule-description"
            value={editedRules.description || ''}
            onChange={(e) => setEditedRules({ ...editedRules, description: e.target.value })}
            className="mt-1"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Scoring Rules</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Threshold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedRules.scoringRules.map((rule, index) => (
                  <TableRow key={rule.id}>
                    <TableCell className="capitalize">
                      {rule.category}
                    </TableCell>
                    <TableCell className="capitalize">
                      {rule.action.replace(/-/g, ' ')}
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        step="0.1"
                        value={rule.points}
                        onChange={(e) => handleEditScoringRule(index, 'points', e.target.value)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      {rule.threshold !== undefined && (
                        <Input 
                          type="number"
                          value={rule.threshold}
                          onChange={(e) => handleEditScoringRule(index, 'threshold', e.target.value)}
                          className="w-20"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-2">Starting Positions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(editedRules.startingPositions).map(([position, count]) => (
              <div key={position}>
                <Label htmlFor={`pos-${position}`}>{position}</Label>
                <Input 
                  id={`pos-${position}`}
                  type="number"
                  min="0"
                  max="10"
                  value={count}
                  onChange={(e) => {
                    const updatedPositions = { ...editedRules.startingPositions };
                    updatedPositions[position] = Number(e.target.value);
                    setEditedRules({ 
                      ...editedRules, 
                      startingPositions: updatedPositions
                    });
                  }}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="roster-size">Roster Size</Label>
            <Input 
              id="roster-size"
              type="number"
              min="10"
              max="30"
              value={editedRules.rosterSize}
              onChange={(e) => setEditedRules({ ...editedRules, rosterSize: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="bench-positions">Bench Positions</Label>
            <Input 
              id="bench-positions"
              type="number"
              min="1"
              max="20"
              value={editedRules.benchPositions}
              onChange={(e) => setEditedRules({ ...editedRules, benchPositions: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => {
            setIsEditingRules(false);
            setEditedRules(null);
          }}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRuleSet}>
            Save Changes
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">League Rules Impact Analysis</h1>
        <p className="text-gray-600">
          Analyze how different scoring systems impact player values and optimize your strategy.
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <CardTitle>Scoring System</CardTitle>
              <CardDescription>
                Select a scoring system to analyze its impact
              </CardDescription>
            </div>
            
            <div className="flex mt-4 sm:mt-0 space-x-2">
              <Dialog open={isCreatingRules} onOpenChange={setIsCreatingRules}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Rule Set
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Rule Set</DialogTitle>
                    <DialogDescription>
                      Create a custom rule set from a template
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="new-rule-name">Rule Set Name</Label>
                      <Input 
                        id="new-rule-name" 
                        placeholder="e.g., My Custom PPR" 
                        value={newRuleName}
                        onChange={(e) => setNewRuleName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="rule-template">Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger id="rule-template" className="mt-1">
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {ruleTemplates.map(template => (
                            <SelectItem key={template.name} value={template.name}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedTemplate && (
                        <p className="text-sm text-gray-500 mt-2">
                          {ruleTemplates.find(t => t.name === selectedTemplate)?.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatingRules(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRuleSet} disabled={!newRuleName || !selectedTemplate}>
                      Create Rule Set
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {selectedRuleSet && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditedRules({...selectedRuleSet});
                      setIsEditingRules(true);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-500">
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Rule Set</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this rule set? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleDeleteRuleSet(selectedRuleSet.id)}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditingRules ? (
            renderEditRuleForm()
          ) : (
            <div>
              <div className="mb-6">
                <Select 
                  value={selectedRuleSet?.id || ''}
                  onValueChange={handleRuleSetChange}
                  disabled={leagueRules.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rule set" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagueRules.map(rule => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.name}
                        {rule.isDefault && ' (Default)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedRuleSet && (
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">PPR: {selectedRuleSet.ppr}</Badge>
                    <Badge variant="outline">Roster Size: {selectedRuleSet.rosterSize}</Badge>
                    <Badge variant="outline">Bench: {selectedRuleSet.benchPositions}</Badge>
                    {!selectedRuleSet.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetDefaultRuleSet(selectedRuleSet.id)}
                        className="ml-auto"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Set as Default
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="starting-positions">
                        <AccordionTrigger>
                          <span className="font-medium">Starting Positions</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {Object.entries(selectedRuleSet.startingPositions).map(([pos, count]) => (
                              <div 
                                key={pos}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <span className="font-medium">{pos}</span>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="scoring-rules">
                        <AccordionTrigger>
                          <span className="font-medium">Scoring Rules</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Category</TableHead>
                                  <TableHead>Action</TableHead>
                                  <TableHead className="text-right">Points</TableHead>
                                  <TableHead className="text-right">Threshold</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedRuleSet.scoringRules.map(rule => (
                                  <TableRow key={rule.id}>
                                    <TableCell className="capitalize">
                                      {rule.category}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                      {rule.action.replace(/-/g, ' ')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {rule.points > 0 && '+'}
                                      {rule.points}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {rule.threshold || '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              )}
              
              {leagueRules.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No rule sets found for this league. Create one to get started.
                  </p>
                  <Button onClick={() => setIsCreatingRules(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Rule Set
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedRuleSet && !isEditingRules && (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              <BookOpen className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="positionImpact">
              <FileBarChart className="w-4 h-4 mr-2" />
              Position Impact
            </TabsTrigger>
            <TabsTrigger value="playerImpact">
              <Zap className="w-4 h-4 mr-2" />
              Player Impact
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Copy className="w-4 h-4 mr-2" />
              Recommendations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            {isLoading ? (
              <Card className="p-8">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 mr-2 animate-spin text-gray-500" />
                  <span>Analyzing league rules impact...</span>
                </div>
              </Card>
            ) : impactAnalysis ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Overview</CardTitle>
                    <CardDescription>
                      How this scoring system impacts fantasy values
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      {impactAnalysis.overallImpact.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-2">Favored Positions</h3>
                        <div className="space-y-2">
                          {impactAnalysis.overallImpact.favoredPositions.length > 0 ? (
                            impactAnalysis.overallImpact.favoredPositions.map((pos, index) => (
                              <Badge key={index} className="mr-2 bg-green-100 text-green-800 hover:bg-green-200">
                                {pos}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">
                              No positions gain significant advantage
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Favored Play Styles</h3>
                        <ul className="space-y-1">
                          {impactAnalysis.overallImpact.favoredStyles.map((style, index) => (
                            <li key={index} className="flex items-center">
                              <ChevronRight className="h-4 w-4 mr-1 text-blue-500 flex-shrink-0" />
                              <span className="text-sm">{style}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Position Impact</CardTitle>
                      <CardDescription>
                        How each position's value changes compared to standard scoring
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {renderPositionImpactChart()}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Position Tier Analysis</CardTitle>
                      <CardDescription>
                        Impact on different player tiers by position
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        {renderPositionTierChart()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Risers & Fallers</CardTitle>
                    <CardDescription>
                      Players most affected by this scoring system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      {renderPlayerImpactChart()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">
                  Select a rule set to analyze its impact
                </p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="positionImpact" className="mt-6">
            {isLoading ? (
              <Card className="p-8">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 mr-2 animate-spin text-gray-500" />
                  <span>Analyzing position impact...</span>
                </div>
              </Card>
            ) : impactAnalysis ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Position Value Changes</CardTitle>
                    <CardDescription>
                      How each position's value changes compared to standard scoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] mb-6">
                      {renderPositionImpactChart()}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.values(impactAnalysis.positionImpacts).map(posImpact => (
                        <div 
                          key={posImpact.position}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{posImpact.position}</h3>
                            <Badge 
                              variant={posImpact.percentageChange >= 0 ? 'default' : 'destructive'}
                              className={posImpact.percentageChange >= 0 ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                            >
                              {posImpact.percentageChange >= 0 ? '+' : ''}
                              {posImpact.percentageChange.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Standard Points:</span>
                              <span>{posImpact.averageBaselinePoints.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Custom Points:</span>
                              <span>{posImpact.averageCustomPoints.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Difference:</span>
                              <span className={posImpact.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {posImpact.difference >= 0 ? '+' : ''}
                                {posImpact.difference.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tier Impact Analysis</CardTitle>
                      <CardDescription>
                        How different player tiers are impacted
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        {renderPositionTierChart()}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Position Winners & Losers</CardTitle>
                      <CardDescription>
                        The most impacted players by position
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="QB" className="w-full">
                        <TabsList className="grid grid-cols-4 mb-4">
                          <TabsTrigger value="QB">QB</TabsTrigger>
                          <TabsTrigger value="RB">RB</TabsTrigger>
                          <TabsTrigger value="WR">WR</TabsTrigger>
                          <TabsTrigger value="TE">TE</TabsTrigger>
                        </TabsList>
                        
                        {['QB', 'RB', 'WR', 'TE'].map(pos => (
                          <TabsContent key={pos} value={pos}>
                            {impactAnalysis.positionImpacts[pos] ? (
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2 text-green-600">Biggest Winners</h4>
                                  <div className="space-y-2">
                                    {impactAnalysis.positionImpacts[pos].topRisers.map((player, idx) => (
                                      <div 
                                        key={idx}
                                        className="flex items-center justify-between p-2 border-b"
                                      >
                                        <div>{player.fullName}</div>
                                        <Badge className="bg-green-100 text-green-800">
                                          +{player.percentageChange.toFixed(1)}%
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2 text-red-600">Biggest Losers</h4>
                                  <div className="space-y-2">
                                    {impactAnalysis.positionImpacts[pos].topFallers.map((player, idx) => (
                                      <div 
                                        key={idx}
                                        className="flex items-center justify-between p-2 border-b"
                                      >
                                        <div>{player.fullName}</div>
                                        <Badge variant="destructive">
                                          {player.percentageChange.toFixed(1)}%
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-6 text-gray-500">
                                No data available for {pos}
                              </div>
                            )}
                          </TabsContent>
                        ))}
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">
                  Select a rule set to analyze position impact
                </p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="playerImpact" className="mt-6">
            {isLoading ? (
              <Card className="p-8">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 mr-2 animate-spin text-gray-500" />
                  <span>Analyzing player impact...</span>
                </div>
              </Card>
            ) : impactAnalysis ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Player Value Changes</CardTitle>
                    <CardDescription>
                      Top risers and fallers in this scoring system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] mb-6">
                      {renderPlayerImpactChart()}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <div className="flex items-center">
                          <ArrowUp className="h-5 w-5 mr-2 text-green-500" />
                          Top Risers
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Players who gain the most value
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Player</TableHead>
                              <TableHead>Pos</TableHead>
                              <TableHead className="text-right">Std Pts</TableHead>
                              <TableHead className="text-right">Custom Pts</TableHead>
                              <TableHead className="text-right">Change</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...impactAnalysis.playerImpacts]
                              .sort((a, b) => b.percentageChange - a.percentageChange)
                              .slice(0, 10)
                              .map(player => (
                                <TableRow key={player.playerId}>
                                  <TableCell>{player.fullName}</TableCell>
                                  <TableCell>{player.position}</TableCell>
                                  <TableCell className="text-right">{player.baselinePoints.toFixed(1)}</TableCell>
                                  <TableCell className="text-right">{player.customPoints.toFixed(1)}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge className="bg-green-100 text-green-800">
                                      +{player.percentageChange.toFixed(1)}%
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            }
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <div className="flex items-center">
                          <ArrowDown className="h-5 w-5 mr-2 text-red-500" />
                          Top Fallers
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Players who lose the most value
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Player</TableHead>
                              <TableHead>Pos</TableHead>
                              <TableHead className="text-right">Std Pts</TableHead>
                              <TableHead className="text-right">Custom Pts</TableHead>
                              <TableHead className="text-right">Change</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...impactAnalysis.playerImpacts]
                              .sort((a, b) => a.percentageChange - b.percentageChange)
                              .slice(0, 10)
                              .map(player => (
                                <TableRow key={player.playerId}>
                                  <TableCell>{player.fullName}</TableCell>
                                  <TableCell>{player.position}</TableCell>
                                  <TableCell className="text-right">{player.baselinePoints.toFixed(1)}</TableCell>
                                  <TableCell className="text-right">{player.customPoints.toFixed(1)}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant="destructive">
                                      {player.percentageChange.toFixed(1)}%
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            }
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>All Players</CardTitle>
                    <CardDescription>
                      Search and filter all players to see scoring impact
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Pos</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead className="text-right">Std Pts</TableHead>
                            <TableHead className="text-right">Custom Pts</TableHead>
                            <TableHead className="text-right">Diff</TableHead>
                            <TableHead className="text-right">Change</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {impactAnalysis.playerImpacts.slice(0, 50).map(player => (
                            <TableRow key={player.playerId}>
                              <TableCell>{player.fullName}</TableCell>
                              <TableCell>{player.position}</TableCell>
                              <TableCell>{player.team}</TableCell>
                              <TableCell className="text-right">{player.baselinePoints.toFixed(1)}</TableCell>
                              <TableCell className="text-right">{player.customPoints.toFixed(1)}</TableCell>
                              <TableCell className="text-right">
                                <span className={player.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {player.difference >= 0 ? '+' : ''}
                                  {player.difference.toFixed(1)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge 
                                  variant={player.percentageChange >= 0 ? 'default' : 'destructive'}
                                  className={player.percentageChange >= 0 ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                                >
                                  {player.percentageChange >= 0 ? '+' : ''}
                                  {player.percentageChange.toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">
                  Select a rule set to analyze player impact
                </p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-6">
            {isLoading ? (
              <Card className="p-8">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 mr-2 animate-spin text-gray-500" />
                  <span>Generating recommendations...</span>
                </div>
              </Card>
            ) : impactAnalysis ? (
              renderRecommendations()
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">
                  Select a rule set to view recommendations
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default LeagueRulesImpactAnalysis;