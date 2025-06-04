import React, { useState, useEffect } from 'react';
import SleeperService, { PlayerNews } from '@/services/SleeperService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, Newspaper, RefreshCw } from 'lucide-react';

interface NewsFeedProps {
  limit?: number;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ limit = 10 }) => {
  const [news, setNews] = useState<PlayerNews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    fetchNews();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      refreshNews();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [limit]);
  
  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const latestNews = await SleeperService.getLatestNews(limit);
      setNews(latestNews);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshNews = async () => {
    setIsRefreshing(true);
    try {
      const latestNews = await SleeperService.getLatestNews(limit);
      setNews(latestNews);
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 24) {
      return diffHrs <= 0 
        ? 'Just now' 
        : `${diffHrs} ${diffHrs === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-sleeper-dark border-sleeper-dark">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-base">Latest News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="border-b border-sleeper-border pb-4 last:border-none">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-sleeper-dark border-sleeper-dark">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-base">Latest News</CardTitle>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={refreshNews}
          disabled={isRefreshing}
          className="h-8"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {news.length === 0 ? (
          <div className="text-center py-6 text-sleeper-gray">
            <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No recent news found.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {news.map((item) => (
              <div key={item.id} className="border-b border-sleeper-border pb-4 last:border-none last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-sm">{item.title}</h3>
                </div>
                
                <p className="text-xs text-sleeper-gray mb-2 line-clamp-3">
                  {item.description}
                </p>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-sleeper-gray">{formatDate(item.timestamp)}</span>
                    <Badge variant="outline" className="text-xs bg-sleeper-dark">
                      {item.source}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-3">
                    {item.injuryStatus && (
                      <Badge variant="outline" className="text-xs bg-red-900 text-red-100">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {item.injuryStatus}
                      </Badge>
                    )}
                    
                    <a 
                      href={item.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-sleeper-gray hover:text-primary"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Source
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsFeed;