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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';
import ContractService, {
  Contract,
  ContractInfo,
  ContractTag,
  SalaryCapSettings,
  TeamSalaryCapInfo
} from '../../services/ContractService';
import { 
  BarChart, 
  ResponsiveContainer, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Ban,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Clock,
  Copy,
  DollarSign,
  Edit,
  FilePlus,
  FileText,
  Plus,
  Search,
  Trash,
  Users,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

interface ContractManagerProps {
  leagueId?: string;
  teamId?: string;
}

const ContractManager: React.FC<ContractManagerProps> = ({ leagueId, teamId }) => {
  // State for contracts and settings
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<ContractInfo[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractInfo | null>(null);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for salary cap info
  const [capSettings, setCapSettings] = useState<SalaryCapSettings | null>(null);
  const [teamCapInfo, setTeamCapInfo] = useState<TeamSalaryCapInfo | null>(null);
  const [leagueCapInfo, setLeagueCapInfo] = useState<TeamSalaryCapInfo[]>([]);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState<ContractTag | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'years'>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Access team and league data from Redux
  const { currentTeam } = useSelector((state: RootState) => state.teams);
  const { currentLeague } = useSelector((state: RootState) => state.leagues);
  
  // Get active team and league IDs
  const activeTeamId = teamId || currentTeam?.id;
  const activeLeagueId = leagueId || currentLeague?.id;
  
  // Contract form schema
  const contractSchema = z.object({
    playerId: z.string(),
    value: z.coerce.number().min(0),
    years: z.coerce.number().min(1).max(10),
    startYear: z.coerce.number().min(2020).max(2030),
    guaranteed: z.coerce.number().min(0),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional()
  });
  
  // Settings form schema
  const settingsSchema = z.object({
    capAmount: z.coerce.number().min(1000000),
    floorAmount: z.coerce.number().min(1000000),
    maxContractYears: z.coerce.number().min(1).max(10),
    franchiseTagEnabled: z.boolean(),
    franchiseTagCost: z.coerce.number().min(100).max(200),
    transitionTagEnabled: z.boolean(),
    transitionTagCost: z.coerce.number().min(100).max(200),
    rookieWageScale: z.boolean(),
    penaltiesEnabled: z.boolean(),
    rolloverEnabled: z.boolean(),
    bonusProration: z.boolean(),
    maxCapPenalty: z.coerce.number().min(0).max(100)
  });
  
  // Setup forms
  const contractForm = useForm<z.infer<typeof contractSchema>>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      playerId: '',
      value: 1000000,
      years: 3,
      startYear: new Date().getFullYear(),
      guaranteed: 0,
      notes: '',
      tags: []
    }
  });
  
  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      capAmount: 200000000,
      floorAmount: 180000000,
      maxContractYears: 5,
      franchiseTagEnabled: true,
      franchiseTagCost: 120,
      transitionTagEnabled: true,
      transitionTagCost: 100,
      rookieWageScale: true,
      penaltiesEnabled: true,
      rolloverEnabled: true,
      bonusProration: true,
      maxCapPenalty: 50
    }
  });
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (activeLeagueId) {
        // Fetch cap settings
        const settings = await ContractService.getSalaryCapSettings(activeLeagueId);
        setCapSettings(settings);
        
        if (settings) {
          // Reset settings form with fetched values
          settingsForm.reset({
            capAmount: settings.capAmount,
            floorAmount: settings.floorAmount,
            maxContractYears: settings.maxContractYears,
            franchiseTagEnabled: settings.franchiseTagEnabled,
            franchiseTagCost: settings.franchiseTagCost,
            transitionTagEnabled: settings.transitionTagEnabled,
            transitionTagCost: settings.transitionTagCost,
            rookieWageScale: settings.rookieWageScale,
            penaltiesEnabled: settings.penaltiesEnabled,
            rolloverEnabled: settings.rolloverEnabled,
            bonusProration: settings.bonusProration,
            maxCapPenalty: settings.maxCapPenalty
          });
        }
        
        // Fetch league salary cap info
        const leagueInfo = await ContractService.getLeagueSalaryCapInfo(activeLeagueId);
        setLeagueCapInfo(leagueInfo);
        
        // Fetch contracts
        if (activeTeamId) {
          // Fetch team contracts
          const teamContracts = await ContractService.getTeamContracts(activeTeamId);
          setContracts(teamContracts);
          setFilteredContracts(teamContracts);
          
          // Fetch team cap info
          const teamInfo = await ContractService.getTeamSalaryCapInfo(activeTeamId, activeLeagueId);
          setTeamCapInfo(teamInfo);
        } else {
          // Fetch all league contracts
          const leagueContracts = await ContractService.getLeagueContracts(activeLeagueId);
          setContracts(leagueContracts);
          setFilteredContracts(leagueContracts);
        }
      }
    };
    
    fetchData();
  }, [activeLeagueId, activeTeamId]);
  
  // Apply filters and sorting
  useEffect(() => {
    if (contracts.length === 0) return;
    
    let filtered = [...contracts];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.player.full_name.toLowerCase().includes(term) ||
        c.player.position.toLowerCase().includes(term) ||
        c.player.team.toLowerCase().includes(term)
      );
    }
    
    // Apply position filter
    if (positionFilter !== 'All') {
      filtered = filtered.filter(c => c.player.position === positionFilter);
    }
    
    // Apply tag filter
    if (tagFilter !== 'all') {
      filtered = filtered.filter(c => c.contract.tags.includes(tagFilter));
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.player.full_name.localeCompare(b.player.full_name);
      } else if (sortBy === 'value') {
        comparison = a.contract.value - b.contract.value;
      } else if (sortBy === 'years') {
        comparison = a.contract.years - b.contract.years;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredContracts(filtered);
  }, [contracts, searchTerm, positionFilter, tagFilter, sortBy, sortDirection]);
  
  // Handle contract form submission
  const handleContractSubmit = async (data: z.infer<typeof contractSchema>) => {
    if (!activeTeamId || !activeLeagueId) return;
    
    try {
      // Format tags array
      const tags = data.tags || [];
      
      if (isEditMode && selectedContract) {
        // Update existing contract
        const updatedContract: Contract = {
          ...selectedContract.contract,
          playerId: data.playerId,
          value: data.value,
          years: data.years,
          startYear: data.startYear,
          guaranteed: data.guaranteed,
          notes: data.notes || '',
          tags: tags as ContractTag[],
        };
        
        const success = await ContractService.updateContract(updatedContract);
        
        if (success) {
          // Update local state
          setContracts(contracts.map(c => 
            c.contract.id === updatedContract.id 
              ? { ...c, contract: updatedContract } 
              : c
          ));
          
          // Refresh team cap info
          if (activeTeamId && activeLeagueId) {
            const teamInfo = await ContractService.getTeamSalaryCapInfo(activeTeamId, activeLeagueId);
            setTeamCapInfo(teamInfo);
          }
        }
      } else {
        // Create new contract
        const newContract = await ContractService.createContract({
          playerId: data.playerId,
          teamId: activeTeamId,
          leagueId: activeLeagueId,
          value: data.value,
          years: data.years,
          startYear: data.startYear,
          guaranteed: data.guaranteed,
          bonuses: [],
          tags: tags as ContractTag[],
          notes: data.notes || ''
        });
        
        if (newContract) {
          // Get player details
          const playerInfo = contracts.find(c => c.player.id === data.playerId)?.player;
          
          if (playerInfo) {
            // Add to local state
            setContracts([...contracts, { contract: newContract, player: playerInfo }]);
            
            // Refresh team cap info
            if (activeTeamId && activeLeagueId) {
              const teamInfo = await ContractService.getTeamSalaryCapInfo(activeTeamId, activeLeagueId);
              setTeamCapInfo(teamInfo);
            }
          }
        }
      }
      
      // Close dialog and reset form
      setIsContractDialogOpen(false);
      setSelectedContract(null);
      setIsEditMode(false);
      contractForm.reset();
    } catch (error) {
      console.error('Error submitting contract:', error);
    }
  };
  
  // Handle settings form submission
  const handleSettingsSubmit = async (data: z.infer<typeof settingsSchema>) => {
    if (!activeLeagueId) return;
    
    try {
      const settings: SalaryCapSettings = {
        id: capSettings?.id || 'new',
        leagueId: activeLeagueId,
        capAmount: data.capAmount,
        floorAmount: data.floorAmount,
        maxContractYears: data.maxContractYears,
        franchiseTagEnabled: data.franchiseTagEnabled,
        franchiseTagCost: data.franchiseTagCost,
        transitionTagEnabled: data.transitionTagEnabled,
        transitionTagCost: data.transitionTagCost,
        rookieWageScale: data.rookieWageScale,
        penaltiesEnabled: data.penaltiesEnabled,
        rolloverEnabled: data.rolloverEnabled,
        bonusProration: data.bonusProration,
        maxCapPenalty: data.maxCapPenalty,
        isDefault: true
      };
      
      const success = await ContractService.updateSalaryCapSettings(settings);
      
      if (success) {
        // Update local state
        setCapSettings(settings);
        
        // Refresh cap info
        if (activeLeagueId) {
          const leagueInfo = await ContractService.getLeagueSalaryCapInfo(activeLeagueId);
          setLeagueCapInfo(leagueInfo);
          
          if (activeTeamId) {
            const teamInfo = await ContractService.getTeamSalaryCapInfo(activeTeamId, activeLeagueId);
            setTeamCapInfo(teamInfo);
          }
        }
      }
      
      setIsSettingsDialogOpen(false);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };
  
  // Handle contract deletion
  const handleDeleteContract = async () => {
    if (!selectedContract) return;
    
    try {
      const success = await ContractService.deleteContract(selectedContract.contract.id);
      
      if (success) {
        // Update local state
        setContracts(contracts.filter(c => c.contract.id !== selectedContract.contract.id));
        
        // Refresh team cap info
        if (activeTeamId && activeLeagueId) {
          const teamInfo = await ContractService.getTeamSalaryCapInfo(activeTeamId, activeLeagueId);
          setTeamCapInfo(teamInfo);
        }
      }
      
      setIsDeleteDialogOpen(false);
      setSelectedContract(null);
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Render salary cap overview
  const renderCapOverview = () => {
    if (!teamCapInfo || !capSettings) return null;
    
    // Prepare chart data
    const spendingData = [
      {
        name: 'Spent',
        value: teamCapInfo.totalSpent,
        fill: '#10B981'
      },
      {
        name: 'Available',
        value: teamCapInfo.availableCap,
        fill: '#3B82F6'
      },
      {
        name: 'Dead Cap',
        value: teamCapInfo.deadCap,
        fill: '#EF4444'
      }
    ];
    
    const COLORS = ['#10B981', '#3B82F6', '#EF4444'];
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Salary Cap Overview</CardTitle>
          <CardDescription>
            {teamCapInfo.teamName} - {formatCurrency(teamCapInfo.totalSpent)} / {formatCurrency(capSettings.capAmount)} ({teamCapInfo.capPercentageUsed.toFixed(1)}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-500">Total Salary Cap</div>
                  <div className="text-xl font-semibold">{formatCurrency(capSettings.capAmount)}</div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-500">Available Cap</div>
                  <div className="text-xl font-semibold text-blue-600">{formatCurrency(teamCapInfo.availableCap)}</div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-500">Total Spent</div>
                  <div className="text-xl font-semibold text-green-600">{formatCurrency(teamCapInfo.totalSpent)}</div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-500">Dead Cap</div>
                  <div className="text-xl font-semibold text-red-600">{formatCurrency(teamCapInfo.deadCap)}</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="text-sm text-gray-500">Active Contracts</div>
                <div className="text-xl font-semibold">{teamCapInfo.activeContracts}</div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 border rounded-lg p-3">
                  <div className="text-sm text-gray-500">Franchise Tags</div>
                  <div className="text-xl font-semibold">{teamCapInfo.franchiseTagsUsed}</div>
                </div>
                <div className="flex-1 border rounded-lg p-3">
                  <div className="text-sm text-gray-500">Transition Tags</div>
                  <div className="text-xl font-semibold">{teamCapInfo.transitionTagsUsed}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium mb-3">Top Contracts</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Annual Value</TableHead>
                    <TableHead className="text-right">Years</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamCapInfo.topContracts.map(contract => {
                    const player = contracts.find(c => c.contract.id === contract.id)?.player;
                    return (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{player?.full_name || 'Unknown Player'}</TableCell>
                        <TableCell>{player?.position || 'N/A'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(contract.value)}</TableCell>
                        <TableCell className="text-right">{contract.years}</TableCell>
                        <TableCell className="text-right">{formatCurrency(contract.value * contract.years)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render league cap comparison
  const renderLeagueCapComparison = () => {
    if (!leagueCapInfo.length || !capSettings) return null;
    
    // Sort teams by cap space
    const sortedTeams = [...leagueCapInfo].sort((a, b) => b.availableCap - a.availableCap);
    
    // Prepare chart data
    const chartData = sortedTeams.map(team => ({
      name: team.teamName,
      spent: team.totalSpent,
      available: team.availableCap,
      deadCap: team.deadCap
    }));
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>League Cap Comparison</CardTitle>
          <CardDescription>
            Team salary cap utilization across the league
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{
                  top: 20,
                  right: 30,
                  left: 70,
                  bottom: 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, capSettings.capAmount]} tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <YAxis dataKey="name" type="category" width={70} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="spent" stackId="a" fill="#10B981" name="Spent" />
                <Bar dataKey="deadCap" stackId="a" fill="#EF4444" name="Dead Cap" />
                <Bar dataKey="available" stackId="a" fill="#3B82F6" name="Available" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">% Used</TableHead>
                  <TableHead className="text-right">Contracts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTeams.map(team => (
                  <TableRow key={team.teamId}>
                    <TableCell className="font-medium">{team.teamName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(team.totalSpent)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(team.availableCap)}</TableCell>
                    <TableCell className="text-right">{team.capPercentageUsed.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{team.activeContracts}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render contracts table
  const renderContractsTable = () => {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Player Contracts</CardTitle>
              <CardDescription>
                Manage player contracts and salary cap
              </CardDescription>
            </div>
            
            {activeTeamId && (
              <div className="flex gap-2">
                <Dialog open={isContractDialogOpen} onOpenChange={setIsContractDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setIsEditMode(false);
                      setSelectedContract(null);
                      contractForm.reset({
                        playerId: '',
                        value: 1000000,
                        years: 3,
                        startYear: new Date().getFullYear(),
                        guaranteed: 0,
                        notes: '',
                        tags: []
                      });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contract
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{isEditMode ? 'Edit Contract' : 'Add New Contract'}</DialogTitle>
                      <DialogDescription>
                        {isEditMode ? 'Update contract details' : 'Create a new player contract'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...contractForm}>
                      <form onSubmit={contractForm.handleSubmit(handleContractSubmit)} className="space-y-6">
                        <FormField
                          control={contractForm.control}
                          name="playerId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Player</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={isEditMode}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a player" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {/* This would ideally be populated from the team roster */}
                                  {contracts.map(c => (
                                    <SelectItem key={c.player.id} value={c.player.id}>
                                      {c.player.full_name} ({c.player.position})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={contractForm.control}
                            name="value"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Annual Value</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} min={0} step={100000} />
                                </FormControl>
                                <FormDescription>
                                  Annual salary in dollars
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={contractForm.control}
                            name="years"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contract Length (Years)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} min={1} max={10} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={contractForm.control}
                            name="startYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Year</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} min={2020} max={2030} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={contractForm.control}
                            name="guaranteed"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Guaranteed Money</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} min={0} step={100000} />
                                </FormControl>
                                <FormDescription>
                                  Total guaranteed amount
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={contractForm.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contract Tags</FormLabel>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {Object.values(ContractTag).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant={field.value?.includes(tag) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => {
                                      const current = field.value || [];
                                      if (current.includes(tag)) {
                                        field.onChange(current.filter(t => t !== tag));
                                      } else {
                                        field.onChange([...current, tag]);
                                      }
                                    }}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={contractForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Add any contract notes here..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button type="submit">
                            {isEditMode ? 'Update Contract' : 'Create Contract'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <CircleDollarSign className="h-4 w-4 mr-2" />
                      Cap Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Salary Cap Settings</DialogTitle>
                      <DialogDescription>
                        Configure league salary cap rules and settings
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...settingsForm}>
                      <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={settingsForm.control}
                            name="capAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Salary Cap</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} min={1000000} step={1000000} />
                                </FormControl>
                                <FormDescription>
                                  Total team salary cap
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={settingsForm.control}
                            name="floorAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Salary Floor</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} min={1000000} step={1000000} />
                                </FormControl>
                                <FormDescription>
                                  Minimum team must spend
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={settingsForm.control}
                            name="maxContractYears"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Contract Years</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} min={1} max={10} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={settingsForm.control}
                            name="maxCapPenalty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Cap Penalty (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} min={0} max={100} />
                                </FormControl>
                                <FormDescription>
                                  Maximum allowed dead cap
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <FormField
                              control={settingsForm.control}
                              name="franchiseTagEnabled"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between">
                                  <div>
                                    <FormLabel>Franchise Tag</FormLabel>
                                    <FormDescription>
                                      Enable franchise tags
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={settingsForm.control}
                              name="franchiseTagCost"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Franchise Tag Cost (%)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} min={100} max={200} />
                                  </FormControl>
                                  <FormDescription>
                                    Percentage of top 5 salaries
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="space-y-4">
                            <FormField
                              control={settingsForm.control}
                              name="transitionTagEnabled"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between">
                                  <div>
                                    <FormLabel>Transition Tag</FormLabel>
                                    <FormDescription>
                                      Enable transition tags
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={settingsForm.control}
                              name="transitionTagCost"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Transition Tag Cost (%)</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} min={100} max={200} />
                                  </FormControl>
                                  <FormDescription>
                                    Percentage of top 10 salaries
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={settingsForm.control}
                            name="rookieWageScale"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between">
                                <div>
                                  <FormLabel>Rookie Wage Scale</FormLabel>
                                  <FormDescription>
                                    Predetermined rookie contracts
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={settingsForm.control}
                            name="penaltiesEnabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between">
                                <div>
                                  <FormLabel>Dead Cap Penalties</FormLabel>
                                  <FormDescription>
                                    Penalties for cutting players
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={settingsForm.control}
                            name="rolloverEnabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between">
                                <div>
                                  <FormLabel>Cap Rollover</FormLabel>
                                  <FormDescription>
                                    Unused cap rolls over to next year
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={settingsForm.control}
                            name="bonusProration"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between">
                                <div>
                                  <FormLabel>Bonus Proration</FormLabel>
                                  <FormDescription>
                                    Signing bonuses are prorated
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <DialogFooter>
                          <Button type="submit">
                            Save Settings
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search player or position..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <div>
                <Label htmlFor="position-filter" className="sr-only">Position</Label>
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger id="position-filter" className="w-[120px]">
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Positions</SelectItem>
                    <SelectItem value="QB">QB</SelectItem>
                    <SelectItem value="RB">RB</SelectItem>
                    <SelectItem value="WR">WR</SelectItem>
                    <SelectItem value="TE">TE</SelectItem>
                    <SelectItem value="K">K</SelectItem>
                    <SelectItem value="DEF">DEF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tag-filter" className="sr-only">Tag</Label>
                <Select value={tagFilter} onValueChange={(value) => setTagFilter(value as ContractTag | 'all')}>
                  <SelectTrigger id="tag-filter" className="w-[140px]">
                    <SelectValue placeholder="Contract Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {Object.values(ContractTag).map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sort-by" className="sr-only">Sort By</Label>
                <Select 
                  value={`${sortBy}-${sortDirection}`} 
                  onValueChange={(value) => {
                    const [field, direction] = value.split('-');
                    setSortBy(field as 'name' | 'value' | 'years');
                    setSortDirection(direction as 'asc' | 'desc');
                  }}
                >
                  <SelectTrigger id="sort-by" className="w-[160px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value-desc">Value: High to Low</SelectItem>
                    <SelectItem value="value-asc">Value: Low to High</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                    <SelectItem value="years-desc">Years: Most to Least</SelectItem>
                    <SelectItem value="years-asc">Years: Least to Most</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Annual Value</TableHead>
                  <TableHead className="text-right">Years</TableHead>
                  <TableHead className="text-right">Exp. Year</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length > 0 ? (
                  filteredContracts.map((contractInfo) => (
                    <TableRow key={contractInfo.contract.id}>
                      <TableCell className="font-medium">{contractInfo.player.full_name}</TableCell>
                      <TableCell>{contractInfo.player.position}</TableCell>
                      <TableCell>{contractInfo.player.team}</TableCell>
                      <TableCell className="text-right">{formatCurrency(contractInfo.contract.value)}</TableCell>
                      <TableCell className="text-right">{contractInfo.contract.years}</TableCell>
                      <TableCell className="text-right">{contractInfo.contract.startYear + contractInfo.contract.years}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contractInfo.contract.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedContract(contractInfo);
                              setIsEditMode(true);
                              contractForm.reset({
                                playerId: contractInfo.player.id,
                                value: contractInfo.contract.value,
                                years: contractInfo.contract.years,
                                startYear: contractInfo.contract.startYear,
                                guaranteed: contractInfo.contract.guaranteed,
                                notes: contractInfo.contract.notes,
                                tags: contractInfo.contract.tags as string[]
                              });
                              setIsContractDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedContract(contractInfo);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                      No contracts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Delete confirmation dialog
  const renderDeleteDialog = () => {
    if (!selectedContract) return null;
    
    return (
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedContract.player.full_name}'s contract?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteContract}>
              Delete Contract
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Contract & Salary Cap Management</h1>
        <p className="text-gray-600">
          Manage player contracts and track salary cap usage across your league
        </p>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <CircleDollarSign className="h-4 w-4 mr-2" />
            Cap Overview
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <FileText className="h-4 w-4 mr-2" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="league">
            <Users className="h-4 w-4 mr-2" />
            League Cap
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          {renderCapOverview()}
        </TabsContent>
        
        <TabsContent value="contracts" className="mt-6 space-y-6">
          {renderContractsTable()}
          {renderDeleteDialog()}
        </TabsContent>
        
        <TabsContent value="league" className="mt-6 space-y-6">
          {renderLeagueCapComparison()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractManager;