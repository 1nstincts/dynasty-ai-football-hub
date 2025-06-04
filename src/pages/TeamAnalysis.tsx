import React from 'react';
import AITeamAnalysis from '../components/Team/AITeamAnalysis';
import Layout from '../components/Layout/Layout';

const TeamAnalysisPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">AI Team Analysis</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Get AI-powered insights, recommendations, and analysis for your fantasy football team.
        </p>
        <AITeamAnalysis />
      </div>
    </Layout>
  );
};

export default TeamAnalysisPage;