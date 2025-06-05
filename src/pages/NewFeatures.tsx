import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Timer, 
  Clipboard, 
  FileText, 
  DollarSign, 
  Globe, 
  PieChart,
  BookOpen,
  Smartphone,
  ExternalLink,
  Calendar,
  BarChart2,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const NewFeatures: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'team-analysis',
      icon: Brain,
      title: 'AI-Powered Team Analysis',
      description: 'Get intelligent recommendations for your dynasty team with advanced AI analysis.',
      path: '/team-analysis',
      iconColor: 'text-blue-500'
    },
    {
      id: 'player-comparison',
      icon: BarChart2,
      title: 'Advanced Player Comparison',
      description: 'Compare players side-by-side with detailed stats and projections.',
      path: '/player-comparison',
      iconColor: 'text-green-500'
    },
    {
      id: 'dynasty-window',
      icon: Timer,
      title: 'Dynasty Window Calculator',
      description: 'Analyze your team\'s competitive window and optimize your dynasty strategy.',
      path: '/dynasty-window',
      iconColor: 'text-purple-500'
    },
    {
      id: 'draft-war-room',
      icon: Clipboard,
      title: 'Rookie Draft War Room',
      description: 'Prepare for your rookie drafts with advanced scouting and prospect rankings.',
      path: '/draft-war-room',
      iconColor: 'text-orange-500'
    },
    {
      id: 'rules-analysis',
      icon: FileText,
      title: 'League Rules Analysis',
      description: 'Evaluate how different scoring systems impact player values and strategies.',
      path: '/league-rules-analysis',
      iconColor: 'text-yellow-500'
    },
    {
      id: 'contract-management',
      icon: DollarSign,
      title: 'Contract/Salary Cap Management',
      description: 'Manage player contracts and salary caps for your dynasty leagues.',
      path: '/contract-management',
      iconColor: 'text-teal-500'
    },
    {
      id: 'social-hub',
      icon: Globe,
      title: 'Social Integration Hub',
      description: 'Connect with the fantasy football community, share insights, and get advice.',
      path: '/social',
      iconColor: 'text-blue-400'
    },
    {
      id: 'matchup-forecast',
      icon: PieChart,
      title: 'Matchup Probability Forecasting',
      description: 'Get detailed win probabilities and matchup analysis with simulation-based projections.',
      path: '/league', // This would typically go to a specific matchup
      iconColor: 'text-red-500'
    },
    {
      id: 'league-history',
      icon: BookOpen,
      title: 'Interactive League History Archive',
      description: 'Explore your league\'s history with interactive visualizations and detailed records.',
      path: '/league', // This would typically go to a specific league's history
      iconColor: 'text-indigo-500'
    },
    {
      id: 'mobile-app',
      icon: Smartphone,
      title: 'Mobile Companion App',
      description: 'Access your fantasy football data on the go with our mobile companion app.',
      path: '/mobile-app',
      iconColor: 'text-pink-500'
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Dynasty AI Football Hub - New Features</h1>
          <p className="text-sleeper-gray">Explore all the new dynasty fantasy football features we've implemented</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card 
            key={feature.id} 
            className="bg-sleeper-dark border-sleeper-dark hover:border-sleeper-accent transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-full bg-sleeper-darker ${feature.iconColor}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
              </div>
              <CardTitle className="mt-4">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => navigate(feature.path)}
              >
                <ExternalLink className="h-4 w-4" />
                Explore Feature
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Separator className="my-10" />
      
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to dominate your dynasty leagues?</h2>
        <p className="text-sleeper-gray mb-6 max-w-2xl mx-auto">
          Our comprehensive suite of dynasty fantasy football tools gives you the edge you need to build championship teams.
        </p>
        <Button 
          size="lg" 
          className="bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90"
          onClick={() => navigate('/')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NewFeatures;