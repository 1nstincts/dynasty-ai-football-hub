import React from 'react';
import PointsProjectionCalculator from '../components/Player/PointsProjectionCalculator';
import Layout from '../components/Layout/Layout';

const ProjectionsCalculatorPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Fantasy Points Projection Calculator</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Create custom fantasy point projections based on your league's scoring settings and expected player performance.
        </p>
        <PointsProjectionCalculator />
      </div>
    </Layout>
  );
};

export default ProjectionsCalculatorPage;
