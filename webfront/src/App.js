import logo from './logo.svg';
import './App.css';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PatternsInfo from './components/PatternsInfo';
import Navbar from './components/Navbar';
import React, { useState } from 'react';

function App() {
  const [totalAccountValue, setTotalAccountValue] = useState(10000); // Initiali
  return (
<Router>
<Navbar totalAccountValue={totalAccountValue} /> {/* Navbar shared across pages */}
      <Routes>
        <Route path="/" element={<Dashboard setTotalAccountValue={setTotalAccountValue} totalAccountValue={totalAccountValue} />} />
        <Route path="/patterns" element={<PatternsInfo />} />
      </Routes>
</Router>
  );
}

export default App;
