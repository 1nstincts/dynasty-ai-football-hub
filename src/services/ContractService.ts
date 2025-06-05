import { supabase } from '../integrations/supabase/client';
import { Player } from '../integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

export interface Contract {
  id: string;
  playerId: string;
  teamId: string;
  leagueId: string;
  value: number; // Annual salary
  years: number; // Contract length
  startYear: number; // Starting year
  guaranteed: number; // Guaranteed money
  bonuses: ContractBonus[];
  tags: ContractTag[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractBonus {
  id: string;
  contractId: string;
  name: string; // e.g., "Signing Bonus", "Performance Bonus"
  value: number;
  year: number;
  description?: string;
}

export enum ContractTag {
  ROOKIE = 'rookie',
  FRANCHISE = 'franchise',
  TRANSITION = 'transition',
  RESTRUCTURED = 'restructured',
  EXTENSION = 'extension',
  TRADEABLE = 'tradeable',
  CUTTABLE = 'cuttable'
}

export interface SalaryCapSettings {
  id: string;
  leagueId: string;
  capAmount: number; // Total salary cap
  floorAmount: number; // Salary floor (minimum team must spend)
  maxContractYears: number;
  franchiseTagEnabled: boolean;
  franchiseTagCost: number; // Percentage of top 5 player salaries at position
  transitionTagEnabled: boolean;
  transitionTagCost: number; // Percentage of top 10 player salaries at position
  rookieWageScale: boolean; // Whether rookie contracts are predetermined
  penaltiesEnabled: boolean; // Dead cap penalties for cutting players
  rolloverEnabled: boolean; // Unused cap rolls over to next year
  bonusProration: boolean; // Whether signing bonuses are prorated
  maxCapPenalty: number; // Maximum dead cap hit allowed (percentage)
  isDefault: boolean;
}

export interface TeamSalaryCapInfo {
  teamId: string;
  teamName: string;
  activeContracts: number;
  totalSpent: number;
  availableCap: number;
  capPercentageUsed: number;
  projectedNextYearCap: number;
  deadCap: number;
  franchiseTagsUsed: number;
  transitionTagsUsed: number;
  topContracts: Contract[];
}

export interface ContractInfo {
  contract: Contract;
  player: Player;
}

const ContractService = {
  // Get all contracts for a team
  async getTeamContracts(teamId: string): Promise<ContractInfo[]> {
    const { data, error } = await supabase
      .from('player_contracts')
      .select(`
        id,
        player_id,
        team_id,
        league_id,
        value,
        years,
        start_year,
        guaranteed,
        bonuses,
        tags,
        notes,
        created_at,
        updated_at
      `)
      .eq('team_id', teamId);
    
    if (error) {
      console.error('Error fetching team contracts:', error);
      return [];
    }
    
    const contracts = data.map(contract => ({
      id: contract.id,
      playerId: contract.player_id,
      teamId: contract.team_id,
      leagueId: contract.league_id,
      value: contract.value,
      years: contract.years,
      startYear: contract.start_year,
      guaranteed: contract.guaranteed,
      bonuses: contract.bonuses || [],
      tags: contract.tags || [],
      notes: contract.notes || '',
      createdAt: contract.created_at,
      updatedAt: contract.updated_at
    }));
    
    // Get player details for each contract
    const playerIds = contracts.map(c => c.playerId);
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .in('id', playerIds);
    
    if (playersError) {
      console.error('Error fetching players for contracts:', playersError);
      return [];
    }
    
    return contracts.map(contract => {
      const player = players.find(p => p.id === contract.playerId);
      return {
        contract,
        player: player!
      };
    });
  },
  
  // Get all contracts for a league
  async getLeagueContracts(leagueId: string): Promise<ContractInfo[]> {
    const { data, error } = await supabase
      .from('player_contracts')
      .select(`
        id,
        player_id,
        team_id,
        league_id,
        value,
        years,
        start_year,
        guaranteed,
        bonuses,
        tags,
        notes,
        created_at,
        updated_at
      `)
      .eq('league_id', leagueId);
    
    if (error) {
      console.error('Error fetching league contracts:', error);
      return [];
    }
    
    const contracts = data.map(contract => ({
      id: contract.id,
      playerId: contract.player_id,
      teamId: contract.team_id,
      leagueId: contract.league_id,
      value: contract.value,
      years: contract.years,
      startYear: contract.start_year,
      guaranteed: contract.guaranteed,
      bonuses: contract.bonuses || [],
      tags: contract.tags || [],
      notes: contract.notes || '',
      createdAt: contract.created_at,
      updatedAt: contract.updated_at
    }));
    
    // Get player details for each contract
    const playerIds = contracts.map(c => c.playerId);
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .in('id', playerIds);
    
    if (playersError) {
      console.error('Error fetching players for contracts:', playersError);
      return [];
    }
    
    return contracts.map(contract => {
      const player = players.find(p => p.id === contract.playerId);
      return {
        contract,
        player: player!
      };
    });
  },
  
  // Get a specific contract
  async getContract(contractId: string): Promise<ContractInfo | null> {
    const { data, error } = await supabase
      .from('player_contracts')
      .select(`
        id,
        player_id,
        team_id,
        league_id,
        value,
        years,
        start_year,
        guaranteed,
        bonuses,
        tags,
        notes,
        created_at,
        updated_at
      `)
      .eq('id', contractId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching contract:', error);
      return null;
    }
    
    // Get player details
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', data.player_id)
      .single();
    
    if (playerError || !player) {
      console.error('Error fetching player for contract:', playerError);
      return null;
    }
    
    return {
      contract: {
        id: data.id,
        playerId: data.player_id,
        teamId: data.team_id,
        leagueId: data.league_id,
        value: data.value,
        years: data.years,
        startYear: data.start_year,
        guaranteed: data.guaranteed,
        bonuses: data.bonuses || [],
        tags: data.tags || [],
        notes: data.notes || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      player
    };
  },
  
  // Create a new contract
  async createContract(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract | null> {
    const contractId = uuidv4();
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('player_contracts')
      .insert([
        {
          id: contractId,
          player_id: contract.playerId,
          team_id: contract.teamId,
          league_id: contract.leagueId,
          value: contract.value,
          years: contract.years,
          start_year: contract.startYear,
          guaranteed: contract.guaranteed,
          bonuses: contract.bonuses,
          tags: contract.tags,
          notes: contract.notes,
          created_at: now,
          updated_at: now
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating contract:', error);
      return null;
    }
    
    return {
      id: data.id,
      playerId: data.player_id,
      teamId: data.team_id,
      leagueId: data.league_id,
      value: data.value,
      years: data.years,
      startYear: data.start_year,
      guaranteed: data.guaranteed,
      bonuses: data.bonuses || [],
      tags: data.tags || [],
      notes: data.notes || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },
  
  // Update an existing contract
  async updateContract(contract: Contract): Promise<boolean> {
    const { error } = await supabase
      .from('player_contracts')
      .update({
        player_id: contract.playerId,
        team_id: contract.teamId,
        league_id: contract.leagueId,
        value: contract.value,
        years: contract.years,
        start_year: contract.startYear,
        guaranteed: contract.guaranteed,
        bonuses: contract.bonuses,
        tags: contract.tags,
        notes: contract.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', contract.id);
    
    if (error) {
      console.error('Error updating contract:', error);
      return false;
    }
    
    return true;
  },
  
  // Delete a contract
  async deleteContract(contractId: string): Promise<boolean> {
    const { error } = await supabase
      .from('player_contracts')
      .delete()
      .eq('id', contractId);
    
    if (error) {
      console.error('Error deleting contract:', error);
      return false;
    }
    
    return true;
  },
  
  // Get salary cap settings for a league
  async getSalaryCapSettings(leagueId: string): Promise<SalaryCapSettings | null> {
    const { data, error } = await supabase
      .from('salary_cap_settings')
      .select('*')
      .eq('league_id', leagueId)
      .eq('is_default', true)
      .single();
    
    if (error) {
      console.error('Error fetching salary cap settings:', error);
      
      // Return default settings if no custom settings exist
      return {
        id: 'default',
        leagueId,
        capAmount: 200_000_000, // $200M is roughly the NFL cap
        floorAmount: 180_000_000, // 90% of cap
        maxContractYears: 5,
        franchiseTagEnabled: true,
        franchiseTagCost: 120, // 120% of top 5 player salaries
        transitionTagEnabled: true,
        transitionTagCost: 100, // 100% of top 10 player salaries
        rookieWageScale: true,
        penaltiesEnabled: true,
        rolloverEnabled: true,
        bonusProration: true,
        maxCapPenalty: 50, // 50% of cap
        isDefault: true
      };
    }
    
    return {
      id: data.id,
      leagueId: data.league_id,
      capAmount: data.cap_amount,
      floorAmount: data.floor_amount,
      maxContractYears: data.max_contract_years,
      franchiseTagEnabled: data.franchise_tag_enabled,
      franchiseTagCost: data.franchise_tag_cost,
      transitionTagEnabled: data.transition_tag_enabled,
      transitionTagCost: data.transition_tag_cost,
      rookieWageScale: data.rookie_wage_scale,
      penaltiesEnabled: data.penalties_enabled,
      rolloverEnabled: data.rollover_enabled,
      bonusProration: data.bonus_proration,
      maxCapPenalty: data.max_cap_penalty,
      isDefault: data.is_default
    };
  },
  
  // Create or update salary cap settings
  async updateSalaryCapSettings(settings: SalaryCapSettings): Promise<boolean> {
    // Check if settings already exist
    const { data: existingData, error: checkError } = await supabase
      .from('salary_cap_settings')
      .select('id')
      .eq('league_id', settings.leagueId)
      .eq('is_default', true);
    
    if (checkError) {
      console.error('Error checking existing salary cap settings:', checkError);
      return false;
    }
    
    if (existingData && existingData.length > 0) {
      // Update existing settings
      const { error } = await supabase
        .from('salary_cap_settings')
        .update({
          cap_amount: settings.capAmount,
          floor_amount: settings.floorAmount,
          max_contract_years: settings.maxContractYears,
          franchise_tag_enabled: settings.franchiseTagEnabled,
          franchise_tag_cost: settings.franchiseTagCost,
          transition_tag_enabled: settings.transitionTagEnabled,
          transition_tag_cost: settings.transitionTagCost,
          rookie_wage_scale: settings.rookieWageScale,
          penalties_enabled: settings.penaltiesEnabled,
          rollover_enabled: settings.rolloverEnabled,
          bonus_proration: settings.bonusProration,
          max_cap_penalty: settings.maxCapPenalty,
          is_default: settings.isDefault
        })
        .eq('id', existingData[0].id);
      
      if (error) {
        console.error('Error updating salary cap settings:', error);
        return false;
      }
    } else {
      // Create new settings
      const { error } = await supabase
        .from('salary_cap_settings')
        .insert([
          {
            id: uuidv4(),
            league_id: settings.leagueId,
            cap_amount: settings.capAmount,
            floor_amount: settings.floorAmount,
            max_contract_years: settings.maxContractYears,
            franchise_tag_enabled: settings.franchiseTagEnabled,
            franchise_tag_cost: settings.franchiseTagCost,
            transition_tag_enabled: settings.transitionTagEnabled,
            transition_tag_cost: settings.transitionTagCost,
            rookie_wage_scale: settings.rookieWageScale,
            penalties_enabled: settings.penaltiesEnabled,
            rollover_enabled: settings.rolloverEnabled,
            bonus_proration: settings.bonusProration,
            max_cap_penalty: settings.maxCapPenalty,
            is_default: settings.isDefault
          }
        ]);
      
      if (error) {
        console.error('Error creating salary cap settings:', error);
        return false;
      }
    }
    
    return true;
  },
  
  // Get salary cap info for all teams in a league
  async getLeagueSalaryCapInfo(leagueId: string): Promise<TeamSalaryCapInfo[]> {
    // Get all teams in the league
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('league_id', leagueId);
    
    if (teamsError || !teams) {
      console.error('Error fetching teams:', teamsError);
      return [];
    }
    
    // Get all contracts in the league
    const { data: contracts, error: contractsError } = await supabase
      .from('player_contracts')
      .select(`
        id,
        player_id,
        team_id,
        league_id,
        value,
        years,
        start_year,
        guaranteed,
        bonuses,
        tags,
        notes,
        created_at,
        updated_at
      `)
      .eq('league_id', leagueId);
    
    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      return [];
    }
    
    // Get salary cap settings
    const capSettings = await this.getSalaryCapSettings(leagueId);
    if (!capSettings) {
      console.error('Error fetching cap settings');
      return [];
    }
    
    // Calculate salary cap info for each team
    return teams.map(team => {
      const teamContracts = contracts
        .filter(c => c.team_id === team.id)
        .map(c => ({
          id: c.id,
          playerId: c.player_id,
          teamId: c.team_id,
          leagueId: c.league_id,
          value: c.value,
          years: c.years,
          startYear: c.start_year,
          guaranteed: c.guaranteed,
          bonuses: c.bonuses || [],
          tags: c.tags || [],
          notes: c.notes || '',
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));
      
      const totalSpent = teamContracts.reduce((sum, c) => sum + c.value, 0);
      const deadCap = 0; // Would calculate based on cut players with guarantees
      const availableCap = capSettings.capAmount - totalSpent - deadCap;
      const capPercentageUsed = (totalSpent / capSettings.capAmount) * 100;
      
      // Sort contracts by value to get top contracts
      const topContracts = [...teamContracts].sort((a, b) => b.value - a.value).slice(0, 5);
      
      // Count franchise and transition tags
      const franchiseTagsUsed = teamContracts.filter(c => c.tags.includes(ContractTag.FRANCHISE)).length;
      const transitionTagsUsed = teamContracts.filter(c => c.tags.includes(ContractTag.TRANSITION)).length;
      
      // Calculate projected next year cap
      // This would be more complex in a real app, taking into account contract expirations
      const projectedNextYearCap = capSettings.capAmount * 1.05; // Assume 5% increase
      
      return {
        teamId: team.id,
        teamName: team.name,
        activeContracts: teamContracts.length,
        totalSpent,
        availableCap,
        capPercentageUsed,
        projectedNextYearCap,
        deadCap,
        franchiseTagsUsed,
        transitionTagsUsed,
        topContracts
      };
    });
  },
  
  // Get salary cap info for a specific team
  async getTeamSalaryCapInfo(teamId: string, leagueId: string): Promise<TeamSalaryCapInfo | null> {
    // Get team info
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', teamId)
      .single();
    
    if (teamError || !team) {
      console.error('Error fetching team:', teamError);
      return null;
    }
    
    // Get all contracts for the team
    const { data: contracts, error: contractsError } = await supabase
      .from('player_contracts')
      .select(`
        id,
        player_id,
        team_id,
        league_id,
        value,
        years,
        start_year,
        guaranteed,
        bonuses,
        tags,
        notes,
        created_at,
        updated_at
      `)
      .eq('team_id', teamId);
    
    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      return null;
    }
    
    // Get salary cap settings
    const capSettings = await this.getSalaryCapSettings(leagueId);
    if (!capSettings) {
      console.error('Error fetching cap settings');
      return null;
    }
    
    // Convert contracts to proper format
    const teamContracts = contracts.map(c => ({
      id: c.id,
      playerId: c.player_id,
      teamId: c.team_id,
      leagueId: c.league_id,
      value: c.value,
      years: c.years,
      startYear: c.start_year,
      guaranteed: c.guaranteed,
      bonuses: c.bonuses || [],
      tags: c.tags || [],
      notes: c.notes || '',
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));
    
    const totalSpent = teamContracts.reduce((sum, c) => sum + c.value, 0);
    const deadCap = 0; // Would calculate based on cut players with guarantees
    const availableCap = capSettings.capAmount - totalSpent - deadCap;
    const capPercentageUsed = (totalSpent / capSettings.capAmount) * 100;
    
    // Sort contracts by value to get top contracts
    const topContracts = [...teamContracts].sort((a, b) => b.value - a.value).slice(0, 5);
    
    // Count franchise and transition tags
    const franchiseTagsUsed = teamContracts.filter(c => c.tags.includes(ContractTag.FRANCHISE)).length;
    const transitionTagsUsed = teamContracts.filter(c => c.tags.includes(ContractTag.TRANSITION)).length;
    
    // Calculate projected next year cap
    const projectedNextYearCap = capSettings.capAmount * 1.05; // Assume 5% increase
    
    return {
      teamId: team.id,
      teamName: team.name,
      activeContracts: teamContracts.length,
      totalSpent,
      availableCap,
      capPercentageUsed,
      projectedNextYearCap,
      deadCap,
      franchiseTagsUsed,
      transitionTagsUsed,
      topContracts
    };
  },
  
  // Calculate rookie contract value based on draft position
  calculateRookieContractValue(draftRound: number, draftPick: number, capSettings: SalaryCapSettings): number {
    if (!capSettings.rookieWageScale) {
      return 0; // No predetermined values if rookie wage scale is disabled
    }
    
    // Base values approximating NFL rookie wage scale
    const firstRoundValues = [
      8000000, 7500000, 7000000, 6500000, 6000000, 5800000, 5600000, 5400000,
      5200000, 5000000, 4800000, 4600000, 4400000, 4200000, 4000000, 3800000,
      3600000, 3400000, 3200000, 3000000, 2900000, 2800000, 2700000, 2600000,
      2500000, 2400000, 2300000, 2200000, 2100000, 2000000, 1900000, 1800000
    ];
    
    const laterRoundValues: { [key: number]: number } = {
      2: 1500000,
      3: 1200000,
      4: 1000000,
      5: 800000,
      6: 750000,
      7: 700000
    };
    
    // Calculate value based on draft position
    if (draftRound === 1 && draftPick <= firstRoundValues.length) {
      return firstRoundValues[draftPick - 1];
    } else if (draftRound >= 2 && draftRound <= 7) {
      return laterRoundValues[draftRound] || 700000;
    }
    
    // Default for undrafted or late round picks
    return 650000;
  },
  
  // Calculate dead cap if a player is cut
  calculateDeadCap(contract: Contract, capSettings: SalaryCapSettings): number {
    if (!capSettings.penaltiesEnabled) {
      return 0; // No dead cap if penalties are disabled
    }
    
    // Calculate remaining guaranteed money
    const remainingYears = contract.startYear + contract.years - new Date().getFullYear();
    if (remainingYears <= 0) {
      return 0; // Contract is expired
    }
    
    let deadCap = 0;
    
    // Add remaining guaranteed money
    const guaranteedPerYear = contract.guaranteed / contract.years;
    deadCap += guaranteedPerYear * remainingYears;
    
    // Add unamortized signing bonuses
    if (capSettings.bonusProration) {
      const signingBonuses = contract.bonuses
        .filter(b => b.name.toLowerCase().includes('signing'))
        .reduce((sum, b) => sum + b.value, 0);
      
      const bonusPerYear = signingBonuses / contract.years;
      deadCap += bonusPerYear * remainingYears;
    }
    
    return deadCap;
  },
  
  // Get a mock contract for testing
  getMockContract(playerId: string, teamId: string, leagueId: string): Contract {
    return {
      id: uuidv4(),
      playerId,
      teamId,
      leagueId,
      value: 10000000, // $10M per year
      years: 4,
      startYear: new Date().getFullYear(),
      guaranteed: 20000000, // $20M guaranteed
      bonuses: [
        {
          id: uuidv4(),
          contractId: 'mock',
          name: 'Signing Bonus',
          value: 5000000,
          year: new Date().getFullYear(),
          description: 'Initial signing bonus'
        },
        {
          id: uuidv4(),
          contractId: 'mock',
          name: 'Performance Bonus',
          value: 2000000,
          year: new Date().getFullYear() + 1,
          description: 'Pro Bowl selection'
        }
      ],
      tags: [ContractTag.EXTENSION],
      notes: 'Mock contract for testing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },
  
  // Get mock salary cap settings for testing
  getMockSalaryCapSettings(leagueId: string): SalaryCapSettings {
    return {
      id: 'mock',
      leagueId,
      capAmount: 200000000, // $200M
      floorAmount: 180000000, // $180M
      maxContractYears: 5,
      franchiseTagEnabled: true,
      franchiseTagCost: 120, // 120% of top 5 player salaries
      transitionTagEnabled: true,
      transitionTagCost: 100, // 100% of top 10 player salaries
      rookieWageScale: true,
      penaltiesEnabled: true,
      rolloverEnabled: true,
      bonusProration: true,
      maxCapPenalty: 50, // 50% of cap
      isDefault: true
    };
  }
};

export default ContractService;