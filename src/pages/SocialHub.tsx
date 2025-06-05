import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '../store';
import { Container, Typography } from '@mui/material';
import SocialHub from '../components/Social/SocialHub';
import { Card } from '../components/ui/card';

interface SocialHubPageProps {
  initialTab?: 'feed' | 'articles' | 'podcasts' | 'videos' | 'forums';
}

const SocialHubPage: React.FC<SocialHubPageProps> = ({ initialTab = 'feed' }) => {
  const { tab } = useParams<{ tab?: string }>();
  const [isLoading, setIsLoading] = useState(true);

  // Validate and set the active tab
  const activeTab = tab && ['feed', 'articles', 'podcasts', 'videos', 'forums'].includes(tab)
    ? tab as 'feed' | 'articles' | 'podcasts' | 'videos' | 'forums'
    : initialTab;

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Container maxWidth="xl" className="py-8">
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8">
      <Typography variant="h4" component="h1" className="mb-6">
        Dynasty Community Hub
      </Typography>
      <Card className="p-6">
        <SocialHub initialTab={activeTab} />
      </Card>
    </Container>
  );
};

export default SocialHubPage;