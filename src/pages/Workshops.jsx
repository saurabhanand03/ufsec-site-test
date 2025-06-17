import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import WorkshopTile from '../components/WorkshopTile';
import { db, auth } from '../firebase/firebase';
import { ChevronDownIcon, ChevronUpIcon, XIcon } from '@heroicons/react/solid';

const Workshops = () => {
    const [workshops, setWorkshops] = useState([]);
    const [filteredWorkshops, setFilteredWorkshops] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState("newest");
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const history = useHistory();
    const location = useLocation(); // Hook to access the current URL

    useEffect(() => {
        const unsubscribe = db.collection('workshops').onSnapshot(snapshot => {
            const workshopsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                presenters: doc.data().presenters || [], // Ensure presenters is always an array
                status: doc.data().status || 'published', // Default to published for backward compatibility
            }));
            setWorkshops(workshopsData);
            setFilteredWorkshops(workshopsData);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                setUser(authUser);
                
                // Check user role
                const userDoc = await db.collection('users').doc(authUser.uid).get();
                if (userDoc.exists) {
                    setUserRole(userDoc.data().role);
                } else {
                    setUserRole('user');
                }
            } else {
                setUser(null);
                setUserRole(null);
            }
        });

        return () => {
            unsubscribeAuth();
        };
    }, []);

    // Helper function to check if user can manage workshops
    const canManageWorkshops = () => {
        return userRole === 'admin' || userRole === 'workshop-lead';
    };

    // Listen for changes in the query string and filter workshops accordingly
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const presenter = params.get('presenter');
        
        if (presenter) {
            // Filter by presenter and apply appropriate permission filters
            const filtered = workshops.filter((workshop) => 
                workshop.presenters.includes(presenter) && 
                (workshop.status === 'published' || canManageWorkshops())
            );
            setFilteredWorkshops(filtered);
            setSearchQuery(presenter); // Update the search bar with the presenter's name
        } else {
            // Apply filtering based on current state
            applyFilters(workshops, searchQuery);
        }
    }, [location.search, workshops, userRole, searchQuery]); 

    // Helper function to apply all filters
    const applyFilters = (workshopList, query) => {
        // First filter by search query
        let filtered = workshopList;
        
        if (query) {
            filtered = filtered.filter((workshop) =>
                workshop.title.toLowerCase().includes(query.toLowerCase()) ||
                workshop.presenters.some((presenter) =>
                    presenter.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
        
        // Filter drafts based on permissions
        if (!canManageWorkshops()) {
            filtered = filtered.filter((workshop) => workshop.status === 'published');
        }
        
        setFilteredWorkshops(filtered);
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        applyFilters(workshops, query);
    };

    const clearSearch = () => {
        setSearchQuery('');
        applyFilters(workshops, '');
    };

    const sortedWorkshops = [...filteredWorkshops].sort((a, b) => {
        const aTime = a.date?.seconds || 0;
        const bTime = b.date?.seconds || 0;
        return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });

    const toggleSortOrder = () => {
        setSortOrder((prevOrder) => (prevOrder === "newest" ? "oldest" : "newest"));
    };

    // Count drafts for the badge
    const draftCount = canManageWorkshops() ? 
        workshops.filter(w => w.status === 'draft').length : 0;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Workshops</h1>

            {/* Search Bar */}
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search workshops..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full p-3 border rounded shadow-sm pr-10"
                />
                {searchQuery && (
                    <button
                        onClick={clearSearch}
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Sort and Create Buttons */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                    <button 
                        onClick={toggleSortOrder} 
                        className="flex items-center bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                    >
                        {sortOrder === "newest" ? (
                            <>
                                <ChevronDownIcon className="h-5 w-5 mr-2" />
                                Newest First
                            </>
                        ) : (
                            <>
                                <ChevronUpIcon className="h-5 w-5 mr-2" />
                                Oldest First
                            </>
                        )}
                    </button>
                    
                    {/* Draft count indicator for admins/workshop leads */}
                    {canManageWorkshops() && draftCount > 0 && (
                        <div className="ml-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
                            <span className="font-medium">Drafts: {draftCount}</span>
                        </div>
                    )}
                </div>

                {canManageWorkshops() && (
                    <button
                        onClick={() => history.push('/upload')}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Create Workshop
                    </button>
                )}
            </div>

            {/* Workshops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedWorkshops.map((workshop) => (
                    <WorkshopTile 
                        key={workshop.id} 
                        id={workshop.id} 
                        title={workshop.title} 
                        date={workshop.date} 
                        videoLink={workshop.videoLink} 
                        presenters={workshop.presenters}
                        createdBy={workshop.createdBy}
                        status={workshop.status}
                    />
                ))}
            </div>
            
            {/* No workshops message */}
            {sortedWorkshops.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-xl">No workshops found</p>
                </div>
            )}
        </div>
    );
};

export default Workshops;