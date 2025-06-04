import React from 'react';
import AdvancedPlayerComparison from '../components/Player/AdvancedPlayerComparison';
import Layout from '../components/Layout/Layout';

const PlayerComparisonPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Advanced Player Comparison</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Compare players side-by-side with detailed statistics, advanced metrics, career trends, and future projections.
        </p>
        <AdvancedPlayerComparison />
      </div>
    </Layout>
  );
};

export default PlayerComparisonPage;