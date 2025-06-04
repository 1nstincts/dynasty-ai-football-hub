
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DataImportButton: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  
  // This function will be called when we implement an API endpoint for data import
  // For now, it just shows a toast explaining that server-side import is needed
  const handleDataImport = async () => {
    setIsLoading(true);
    
    try {
      toast({
        title: "Data Import Information",
        description: "The data import script needs to be run on the server. Please use the Node.js script in src/scripts/importData.js.",
        duration: 5000,
      });
      
      // Count existing records to show the user
      const { data: playerCount, error: playerError } = await supabase
        .from('players')
        .select('player_id', { count: 'exact', head: true });
        
      const { data: gameCount, error: gameError } = await supabase
        .from('games')
        .select('game_id', { count: 'exact', head: true });
      
      if (!playerError && !gameError) {
        toast({
          title: "Current Database Status",
          description: `Players: ${playerCount?.length || 0}, Games: ${gameCount?.length || 0} records in database`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error checking data:', error);
      toast({
        title: "Error",
        description: "Failed to check database status",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleDataImport} 
      disabled={isLoading}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {isLoading ? "Checking..." : "Check Database Status"}
    </Button>
  );
};

export default DataImportButton;
