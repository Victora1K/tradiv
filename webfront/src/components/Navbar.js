// File: Navbar.js

import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ totalAccountValue }) => {
  return (
    <nav style={navbarStyle}>
      <h2>Tradenerves </h2>
      <h3>Account Value: ${totalAccountValue.toFixed(2)}</h3>
      <div style={navLinksStyle}>
        <Link to="/" style={linkStyle}>Dashboard</Link>
        <Link to="/patterns" style={linkStyle}>Patterns</Link>
      </div>
    </nav>
  );
};

const navbarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 20px',
  backgroundColor: '#333',
  color: 'white',
};

const navLinksStyle = {
    display: 'flex',
    gap: '15px',
  };
  
  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
  };

export default Navbar;
