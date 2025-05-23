/**
 * Utility functions for NFL season timing and status
 */

export interface SeasonInfo {
  year: number;
  hasStarted: boolean;
  hasEnded: boolean;
  isOffseason: boolean;
  seasonStartDate: Date;
  seasonEndDate: Date;
  status: 'preseason' | 'regular' | 'playoffs' | 'offseason';
}

/**
 * Get current NFL season information
 */
export function getCurrentSeasonInfo(): SeasonInfo {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (0 = January)
  
  // NFL season typically runs from early September to early February
  // The "season year" is the year the season starts in
  let seasonYear: number;
  
  if (currentMonth >= 8) { // September or later
    seasonYear = currentYear;
  } else { // January through August
    seasonYear = currentYear - 1;
  }
  
  // NFL season dates (approximate - these should be updated with actual dates)
  const seasonStartDate = new Date(seasonYear, 8, 1); // September 1st (approximate)
  const regularSeasonEndDate = new Date(seasonYear + 1, 0, 8); // January 8th (approximate)
  const playoffsEndDate = new Date(seasonYear + 1, 1, 15); // February 15th (approximate)
  
  // Determine season status
  let status: 'preseason' | 'regular' | 'playoffs' | 'offseason';
  let hasStarted = false;
  let hasEnded = false;
  
  if (now < seasonStartDate) {
    // Before season starts
    status = 'offseason';
    hasStarted = false;
    hasEnded = false;
  } else if (now >= seasonStartDate && now <= regularSeasonEndDate) {
    // Regular season
    status = 'regular';
    hasStarted = true;
    hasEnded = false;
  } else if (now > regularSeasonEndDate && now <= playoffsEndDate) {
    // Playoffs
    status = 'playoffs';
    hasStarted = true;
    hasEnded = false;
  } else {
    // Offseason (after season ends)
    status = 'offseason';
    hasStarted = true;
    hasEnded = true;
  }
  
  const isOffseason = status === 'offseason';
  
  return {
    year: seasonYear,
    hasStarted,
    hasEnded,
    isOffseason,
    seasonStartDate,
    seasonEndDate: playoffsEndDate,
    status
  };
}

/**
 * Get a formatted message about the current season status
 */
export function getSeasonStatusMessage(): string {
  const seasonInfo = getCurrentSeasonInfo();
  
  switch (seasonInfo.status) {
    case 'offseason':
      if (!seasonInfo.hasStarted) {
        return `The ${seasonInfo.year} NFL season hasn't started yet. Standings will be available once games begin in September.`;
      } else {
        return `The ${seasonInfo.year} season has ended. New standings will be available when the ${seasonInfo.year + 1} season begins.`;
      }
    case 'preseason':
      return `The ${seasonInfo.year} NFL preseason is underway. Regular season standings will be available once games begin.`;
    case 'regular':
      return `The ${seasonInfo.year} NFL regular season is in progress.`;
    case 'playoffs':
      return `The ${seasonInfo.year} NFL playoffs are in progress.`;
    default:
      return 'Season status unknown.';
  }
}

/**
 * Check if standings should be displayed based on season status
 */
export function shouldDisplayStandings(): boolean {
  const seasonInfo = getCurrentSeasonInfo();
  
  // Only show standings during regular season and playoffs
  return seasonInfo.status === 'regular' || seasonInfo.status === 'playoffs';
}

/**
 * Get the next season start date for display
 */
export function getNextSeasonStart(): Date {
  const seasonInfo = getCurrentSeasonInfo();
  
  if (!seasonInfo.hasStarted) {
    return seasonInfo.seasonStartDate;
  } else {
    // Return next year's season start
    return new Date(seasonInfo.year + 1, 8, 1); // Next September
  }
}

/**
 * Format a date for display (e.g., "September 2024")
 */
export function formatSeasonDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
}