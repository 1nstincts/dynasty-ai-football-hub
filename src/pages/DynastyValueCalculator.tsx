import React from 'react';
import DynastyValueCalculatorComponent from '../components/Player/DynastyValueCalculator';
import Layout from '../components/Layout/Layout';

const DynastyValueCalculatorPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dynasty Value Calculator</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Calculate, compare, and track dynasty values for players and draft picks based on your league settings.
        </p>
        <DynastyValueCalculatorComponent />
      </div>
    </Layout>
  );
};

export default DynastyValueCalculatorPage;