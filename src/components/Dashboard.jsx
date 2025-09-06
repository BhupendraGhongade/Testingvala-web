import React from 'react';
import Hero from './Hero';
import Metrics from './Metrics';
import TestRunsTable from './TestRunsTable';

const Dashboard = () => {
  return (
    <>
      <Hero />
      <Metrics />
      <TestRunsTable />
    </>
  );
};

export default Dashboard;
