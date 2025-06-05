
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@/types/user';
import { 
  Search, 
  MessageCircle, 
  Heart, 
  Share, 
  Eye,
  X,
  SkipBack,
  Play,
  SkipForward,
  TrendingUp 
} from 'lucide-react';

interface SocialHubProps {
  activeTab?: string;
}

const SocialHub: React.FC<SocialHubProps> = ({ activeTab = 'feed' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock user data
  const mockUser: User = {
    id: '1',
    displayName: 'John Doe',
    avatarUrl: '',
    avatar: '',
    email: 'john@example.com'
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="trades">Trade Talk</TabsTrigger>
          <TabsTrigger value="leagues">My Leagues</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={mockUser.avatar || mockUser.avatarUrl} />
                      <AvatarFallback>{mockUser.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{mockUser.displayName || 'User'}</span>
                    <span className="text-sm text-gray-500">2h ago</span>
                  </div>
                  <p className="mb-3">Just completed a massive trade! Thoughts?</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      12
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      5
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="discussions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>League Discussions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded p-4">
                  <h3 className="font-medium mb-2">Dynasty Startup Strategy</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    What's your approach to dynasty startup drafts? Focus on youth or win-now?
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Started by {mockUser.displayName || 'User'}</span>
                    <span>8 replies</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trade Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Recent Trade Proposal</h3>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-1">Sending:</h4>
                      <p>• Christian McCaffrey</p>
                      <p>• 2024 2nd Round Pick</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Receiving:</h4>
                      <p>• Bijan Robinson</p>
                      <p>• CeeDee Lamb</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leagues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Leagues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Dynasty League</h3>
                      <p className="text-sm text-gray-500">12-team PPR</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">3rd Place</p>
                      <p className="text-sm text-gray-500">8-5 Record</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialHub;
