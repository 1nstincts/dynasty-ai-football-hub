import React from 'react';
import { useParams } from 'react-router-dom';
import PlayerProfile from '@/components/Player/PlayerProfile';
import { Card } from '@/components/ui/card';

const PlayerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container mx-auto">
      <Card className="bg-sleeper-dark border-sleeper-dark">
        <PlayerProfile playerId={id} />
      </Card>
    </div>
  );
};

export default PlayerProfilePage;