import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebase/firebase';
import firebase from 'firebase/compat/app';

const Tabs = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef(null);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        // Check authentication state
        const unsubscribeAuth = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                // Check if user exists in database
                const userDoc = await db.collection('users').doc(authUser.uid).get();
                
                if (userDoc.exists) {
                    // User exists in database
                    const userData = userDoc.data();
                    setUser(authUser);
                    setUserRole(userData.role);
                } else {
                    // Create new user in database
                    const newUser = {
                        uid: authUser.uid,
                        email: authUser.email,
                        displayName: authUser.displayName || authUser.email.split('@')[0],
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        role: 'user' // Default role
                    };
                    
                    await db.collection('users').doc(authUser.uid).set(newUser);
                    setUser(authUser);
                    setUserRole('user');
                }
            } else {
                setUser(null);
                setUserRole(null);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const handleLogin = async () => {
        try {
            await auth.signInWithPopup(googleProvider);
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            setUser(null);
            setUserRole(null);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setIsModalOpen(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    // Helper function to determine if user has dashboard access
    const hasDashboardAccess = () => {
        return userRole === 'admin' || userRole === 'workshop-lead';
    };

    // Helper function to get role display text with appropriate styling
    const getRoleDisplay = () => {
        if (userRole === 'admin') {
            return <p className="text-green-500 font-bold mt-1">Admin Access</p>;
        } else if (userRole === 'workshop-lead') {
            return <p className="text-blue-500 font-bold mt-1">Workshop Lead</p>;
        }
        return null;
    };

    return (
        <div className="flex justify-between items-center p-4 bg-gray-200 relative">
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
                {hasDashboardAccess() && (
                    <Link to="/admin" onClick={() => handleTabClick('admin')} className={`tab ${activeTab === 'admin' ? 'active' : ''}`}>
                        Admin Dashboard
                    </Link>
                )}
            </div>

            {/* Logo and Modal */}
            <div className="relative">
                {/* Logo Button */}
                <img
                    src="/SECSquareLogo.png"
                    alt="SEC Logo"
                    className="h-10 w-10 cursor-pointer"
                    onClick={toggleModal}
                />

                {/* Modal */}
                {isModalOpen && (
                    <div
                        ref={modalRef}
                        className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded shadow-lg p-4 z-50"
                    >
                        {user ? (
                            <div className="text-center">
                                <p className="font-medium">{user.email}</p>
                                {getRoleDisplay()}
                                <button
                                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-700">You are not logged in.</p>
                                <button
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    onClick={handleLogin}
                                >
                                    Login with Google
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tabs;