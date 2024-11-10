import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import AddClientsPage from './AddClients/AddClientsPage'
import AddSitesPage from './AddSites/AddSitesPage';
import AddBuildingPage from  './AddBuildings/AddBuildingPage';
import AddFloorPage from './AddFloors/AddFloorPage';
import FloorPlanningPage from './FloorPlanning/SensorConfigPage';
import FloorSensors from './FloorSensors/FloorSensorsPage';
import UsageView from './EnergyDashboard/UsageView';
import MainDashboard from './EnergyDashboard/MainDashboard';
import TrendAnalysis from './EnergyDashboard/TrendAnalysis';
import SensorConfigPage from './FloorPlanning/SensorConfigPage';




const TechScreens = () => {
  return (
     <>
      <Routes>
        <Route path="/" element={<AddClientsPage />} />
        <Route path="sites" element={<AddSitesPage />} />
        <Route path="buildings" element={<AddBuildingPage />} />
        <Route path="floor" element={<AddFloorPage />} />
        <Route path="sensorconfig" element={<SensorConfigPage />} />
        <Route path="sensors" element={<FloorSensors />} />
        <Route path="energy-dashboard" element={<MainDashboard />} />
        <Route path="view-more" element={<UsageView />} />
        <Route path="trend-analysis" element={<TrendAnalysis />} />

      </Routes>
      <Outlet /> {/* This will render the nested routes */}
      </>
  );
};

export default TechScreens;
