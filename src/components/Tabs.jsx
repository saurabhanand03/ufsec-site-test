import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Tabs = () => {
    const [activeTab, setActiveTab] = useState('home');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="flex justify-between items-center p-4 bg-gray-200">
            {/* Navigation Links */}
            <div className="flex space-x-4">
                <Link to="/" onClick={() => handleTabClick('home')} className={`tab ${activeTab === 'home' ? 'active' : ''}`}>
                    Home
                </Link>
                <Link to="/workshops" onClick={() => handleTabClick('workshops')} className={`tab ${activeTab === 'workshops' ? 'active' : ''}`}>
                    Workshops
                </Link>
                <Link to="/exec-board" onClick={() => handleTabClick('exec-board')} className={`tab ${activeTab === 'exec-board' ? 'active' : ''}`}>
                    Exec Board
                </Link>
                <Link to="/dev-team" onClick={() => handleTabClick('dev-team')} className={`tab ${activeTab === 'dev-team' ? 'active' : ''}`}>
                    Dev Team
                </Link>
            </div>

            {/* Logo */}
            <div>
                <img 
                    src="/SECSquareLogo.png" 
                    alt="SEC Logo" 
                    className="h-10 w-10"
                />
            </div>
        </div>
    );
};

export default Tabs;