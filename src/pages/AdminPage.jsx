import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { db, auth } from '../firebase/firebase';
import firebase from 'firebase/compat/app';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState('admin');
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const history = useHistory();

    useEffect(() => {
        // Check if user is authenticated and has sufficient permissions
        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Check if user has admin or workshop lead role
                const userDoc = await db.collection('users').doc(user.uid).get();
                
                if (userDoc.exists) {
                    const role = userDoc.data().role;
                    
                    if (role === 'admin' || role === 'workshop-lead') {
                        setCurrentUser(user);
                        setUserRole(role);
                        fetchUsers();
                    } else {
                        // Redirect to home if insufficient permissions
                        history.push('/');
                        setError('Access denied. You do not have sufficient permissions.');
                    }
                } else {
                    // Redirect to home if not in users collection
                    history.push('/');
                    setError('Access denied. User not found.');
                }
            } else {
                // Redirect to home if not logged in
                history.push('/');
                setError('Please log in to access this page.');
            }
        });

        return () => unsubscribeAuth();
    }, [history]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const snapshot = await db.collection('users').get();
            const usersData = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
            setIsLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUserEmail.trim()) return;

        // Only allow admins to add new users
        if (userRole !== 'admin') {
            alert('Only administrators can add new users');
            return;
        }

        try {
            // Check if user already exists
            const snapshot = await db.collection('users')
                .where('email', '==', newUserEmail.trim())
                .get();
            
            if (!snapshot.empty) {
                alert('This email is already registered');
                return;
            }

            // Generate a random UID for the new user
            const newUserId = `manual-${Date.now()}`;
            
            // Add new user to Firestore
            await db.collection('users').doc(newUserId).set({
                email: newUserEmail.trim(),
                displayName: newUserEmail.trim().split('@')[0], // Simple display name from email
                role: newUserRole, // Set role based on selection
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Refresh the users list
            fetchUsers();
            setNewUserEmail('');
        } catch (err) {
            console.error('Error adding new user:', err);
            setError('Failed to add new user');
        }
    };

    const handleRoleChange = async (uid, newRole) => {
        // Only allow admins to change roles
        if (userRole !== 'admin') {
            alert('Only administrators can change user roles');
            return;
        }

        try {
            await db.collection('users').doc(uid).update({
                role: newRole
            });
            
            // Refresh the users list
            fetchUsers();
        } catch (err) {
            console.error('Error updating user role:', err);
            setError('Failed to update user role');
        }
    };

    const handleDeleteUser = async (uid) => {
        // Only allow admins to delete users
        if (userRole !== 'admin') {
            alert('Only administrators can delete users');
            return;
        }

        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await db.collection('users').doc(uid).delete();
                // Refresh the users list
                fetchUsers();
            } catch (err) {
                console.error('Error deleting user:', err);
                setError('Failed to delete user');
            }
        }
    };

    // Add this function to handle editing display names
    const handleDisplayNameChange = async (uid, newDisplayName) => {
        // Only allow admins to change display names
        if (userRole !== 'admin') {
            alert('Only administrators can change user display names');
            return;
        }

        if (!newDisplayName.trim()) {
            alert('Display name cannot be empty');
            return;
        }

        try {
            await db.collection('users').doc(uid).update({
                displayName: newDisplayName.trim()
            });
            
            // Refresh the users list
            fetchUsers();
        } catch (err) {
            console.error('Error updating display name:', err);
            setError('Failed to update display name');
        }
    };

    // Separate users by role
    const adminUsers = users.filter(user => user.role === 'admin');
    const workshopLeadUsers = users.filter(user => user.role === 'workshop-lead');
    const regularUsers = users.filter(user => user.role !== 'admin' && user.role !== 'workshop-lead');

    if (error && !currentUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Helper function to render users table
    const renderUsersTable = (usersList, title) => {
        if (usersList.length === 0) return null;
        
        return (
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Display Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                {userRole === 'admin' && (
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usersList.map((user) => (
                                <tr key={user.uid}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {userRole === 'admin' ? (
                                            <input
                                                type="text"
                                                defaultValue={user.displayName || ''}
                                                onBlur={(e) => handleDisplayNameChange(user.uid, e.target.value)}
                                                className="border rounded p-1 text-sm w-full"
                                                placeholder="Enter display name"
                                            />
                                        ) : (
                                            <div className="font-medium text-gray-900">
                                                {user.displayName || 'N/A'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {userRole === 'admin' ? (
                                            <select
                                                value={user.role || 'user'}
                                                onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                                className="border rounded p-1 text-sm"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="workshop-lead">Workshop Lead</option>
                                                <option value="user">User</option>
                                            </select>
                                        ) : (
                                            <span className="px-2 py-1 text-sm rounded-full bg-gray-100">
                                                {user.role || 'User'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </td>
                                    {userRole === 'admin' && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteUser(user.uid)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            
            {userRole === 'workshop-lead' && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
                    <p className="text-yellow-700">
                        You have read-only access to this dashboard. To make changes, please contact an administrator.
                    </p>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center">
                    <p>Loading users...</p>
                </div>
            ) : (
                <>
                    {userRole === 'admin' && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
                            <form onSubmit={handleAddUser} className="flex gap-2">
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    placeholder="Enter email"
                                    required
                                    className="flex-grow p-2 border rounded"
                                />
                                <select
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value)}
                                    className="p-2 border rounded"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="workshop-lead">Workshop Lead</option>
                                    <option value="user">User</option>
                                </select>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Add User
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Admin Users Section */}
                    {renderUsersTable(adminUsers, "Administrators")}

                    {/* Workshop Lead Users Section */}
                    {renderUsersTable(workshopLeadUsers, "Workshop Leads")}

                    {/* Regular Users Section */}
                    {renderUsersTable(regularUsers, "Regular Users")}

                    {/* Display message if no users found */}
                    {users.length === 0 && (
                        <p className="text-gray-500">No users found.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminPage;