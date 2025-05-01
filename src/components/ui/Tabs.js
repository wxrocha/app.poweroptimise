import React, { useState } from 'react';
import './Tabs.css'; // optional for basic styling

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(Object.keys(tabs)[0]);

  return (
    <div className="tabs">
      <div className="tab-buttons">
        {Object.keys(tabs).map((tabName) => (
          <button
            key={tabName}
            className={activeTab === tabName ? 'active' : ''}
            onClick={() => setActiveTab(tabName)}
          >
            {tabName}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs[activeTab]}
      </div>
    </div>
  );
};

export default Tabs;
