import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import ClientScreens from './pages/ClientScreens/ClientScreens.js'; // Adjust path if necessary
import TechScreens from './pages/TechScreens/TechScreens.js'; // Updated import

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/client-dashboard/*" element={<ClientScreens />} />
        <Route path="/tech-dashboard/*" element={<TechScreens />} />
      </Routes>
    </Router>
  );
};

export default App;

