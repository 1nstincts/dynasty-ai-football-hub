import React from 'react';
import ScheduleGeneratorComponent from '../components/League/ScheduleGenerator';
import Layout from '../components/Layout/Layout';

const ScheduleGeneratorPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">League Schedule Generator</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Create, view, and manage your league's schedule with live game tracking and statistics.
        </p>
        <ScheduleGeneratorComponent />
      </div>
    </Layout>
  );
};

export default ScheduleGeneratorPage;