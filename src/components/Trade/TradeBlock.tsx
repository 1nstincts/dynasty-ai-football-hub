
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Heart } from 'lucide-react';

interface PlayerOffer {
  id: string;
  name: string;
  position: string;
  team: string;
  owner: string;
}

const TradeBlock: React.FC = () => {
  // In a real app, we would fetch the trade block data from the store or API
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Mock data for demonstration
  const mockTradeOffers: PlayerOffer[] = [
    { id: '1', name: 'J. Downs', position: 'WR', team: 'IND', owner: 'NicholasPickolous' },
    { id: '2', name: 'M. Mims', position: 'WR', team: 'DEN', owner: 'NicholasPickolous' },
    { id: '3', name: 'J. Coker', position: 'WR', team: 'CAR', owner: 'NicholasPickolous' },
    { id: '4', name: 'D. Henry', position: 'RB', team: 'BAL', owner: 'Zayy5' },
    { id: '5', name: 'A. Kamara', position: 'RB', team: 'NO', owner: 'Zayy5' },
    { id: '6', name: 'C. McCaffrey', position: 'RB', team: 'SF', owner: 'Zayy5' },
    { id: '7', name: 'S. Barkley', position: 'RB', team: 'PHI', owner: 'Zayy5' },
    { id: '8', name: 'J. Allen', position: 'QB', team: 'BUF', owner: 'cstu790' },
    { id: '9', name: 'T. Hockenson', position: 'TE', team: 'MIN', owner: 'cstu790' },
    { id: '10', name: 'A. Brown', position: 'WR', team: 'PHI', owner: 'Zayy5' },
  ];

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const getPositionClass = (position: string) => {
    switch (position) {
      case 'QB': return 'position-qb';
      case 'RB': return 'position-rb';
      case 'WR': return 'position-wr';
      case 'TE': return 'position-te';
      case 'K': return 'position-k';
      case 'DEF': return 'position-def';
      default: return '';
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Trade Block</h2>
        <button className="bg-sleeper-accent text-sleeper-dark px-4 py-2 rounded font-semibold">
          + TRADE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTradeOffers.map(offer => (
          <div key={offer.id} className="trade-block">
            <div className="p-3 border-b border-border grid grid-cols-12">
              <div className="col-span-1">
                <span className={`player-position ${getPositionClass(offer.position)}`}>
                  {offer.position}
                </span>
              </div>
              <div className="col-span-2 text-xs flex items-center justify-center">
                <span className="bg-sleeper-dark px-1 rounded">{offer.team}</span>
              </div>
              <div className="col-span-8 text-center font-medium">
                {offer.name}
              </div>
              <div className="col-span-1 flex justify-end">
                <button 
                  onClick={() => toggleFavorite(offer.id)}
                  className={favorites.has(offer.id) ? 'text-red-500' : 'text-sleeper-gray hover:text-red-500'}
                >
                  <Heart className="h-4 w-4" fill={favorites.has(offer.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
            <div className="p-2 text-center text-xs text-sleeper-gray">
              {offer.owner}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeBlock;
