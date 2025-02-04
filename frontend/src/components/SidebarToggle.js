import React from 'react';
import './SidebarToggle.css';

const SidebarToggle = ({ isOpen, onClick }) => {
  return (
    <button 
      className={`sidebar-toggle ${isOpen ? 'open' : ''}`} 
      onClick={onClick}
      aria-label="Toggle menu"
    >
      <span className="toggle-icon"></span>
    </button>
  );
};

export default SidebarToggle; 