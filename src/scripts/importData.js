
// Data import script for Supabase
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';

// Supabase connection details
const SUPABASE_URL = "https://emowltjqevmwydjyahrj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb3dsdGpxZXZtd3lkanlhaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzA3MjgsImV4cCI6MjA2MzM0NjcyOH0.zkw7-qyS0By_fKdTLALIg6mO2TfQKIbQ1ZwacjNU7LQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// CSV data sources
const ROSTER_CSV = 'https://github.com/nflverse/nflverse-data/releases/download/players/players.csv';
const SCHEDULE_CSV = 'https://fixturedownload.com/download/nfl-2024_csv'; // change "2024" when new season drops

// Helper function to fetch and parse CSV
async function loadCsv(url) {
  console.log(`Downloading CSV from ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${url}`);
  const text = await res.text();
  return parse(text, { columns: true, skip_empty_lines: true });
}

// Process player data
async function processPlayers() {
  try {
    console.log('Processing player data...');
    const roster = await loadCsv(ROSTER_CSV);
    console.log(`📝 players.csv rows: ${roster.length}`);
    
    // Process in batches to avoid API limits
    const BATCH_SIZE = 100;
    for (let i = 0; i < roster.length; i += BATCH_SIZE) {
      const batch = roster.slice(i, i + BATCH_SIZE);
      const formattedBatch = batch.map(p => ({
        player_id: p.player_id,
        full_name: p.player_name,
        position: p.position,
        team: p.team,
        height: p.height,
        weight: p.weight ? parseInt(p.weight) : null,
        birth_date: p.birth_date || null,
        draft_year: p.draft_year ? parseInt(p.draft_year) : null,
        draft_round: p.draft_round ? parseInt(p.draft_round) : null,
        draft_pick: p.draft_pick ? parseInt(p.draft_pick) : null
      }));
      
      const { error } = await supabase
        .from('players')
        .upsert(formattedBatch, { 
          onConflict: 'player_id',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error('Error inserting player batch:', error);
      } else {
        console.log(`Processed players batch ${i + 1} to ${i + batch.length}`);
      }
    }
    
    console.log('✅ Player data import complete');
  } catch (error) {
    console.error('Failed to process players:', error);
  }
}

// Process game/schedule data
async function processGames() {
  try {
    console.log('Processing game schedule data...');
    const sched = await loadCsv(SCHEDULE_CSV);
    console.log(`📝 schedule.csv rows: ${sched.length}`);
    
    // Process in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < sched.length; i += BATCH_SIZE) {
      const batch = sched.slice(i, i + BATCH_SIZE);
      const formattedBatch = batch.map(g => {
        const gameId = `${g.Season}_${g.Week}_${g.HomeTeam}_${g.AwayTeam}`;
        return {
          game_id: gameId,
          season: parseInt(g.Season),
          week: parseInt(g.Week),
          gameday: g.Date,
          home_team: g.HomeTeam,
          away_team: g.AwayTeam
        };
      });
      
      const { error } = await supabase
        .from('games')
        .upsert(formattedBatch, { 
          onConflict: 'game_id',
          ignoreDuplicates: true
        });
      
      if (error) {
        console.error('Error inserting games batch:', error);
      } else {
        console.log(`Processed games batch ${i + 1} to ${i + batch.length}`);
      }
    }
    
    console.log('✅ Game schedule import complete');
  } catch (error) {
    console.error('Failed to process games:', error);
  }
}

// Main function
async function importData() {
  console.log('Starting data import...');
  
  try {
    // Import players first
    await processPlayers();
    
    // Then import games
    await processGames();
    
    console.log('✅ All data imported successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Run the import
importData();
