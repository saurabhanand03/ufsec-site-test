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
    const history = useHistory();
    const location = useLocation(); // Hook to access the current URL

    useEffect(() => {
        const unsubscribe = db.collection('workshops').onSnapshot(snapshot => {
            const workshopsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                presenters: doc.data().presenters || [], // Ensure presenters is always an array
            }));
            setWorkshops(workshopsData);
            setFilteredWorkshops(workshopsData);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user && user.email === 'asaurabh2003@gmail.com') {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => {
            unsubscribeAuth();
        };
    }, []);

    // Listen for changes in the query string and filter workshops accordingly
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const presenter = params.get('presenter');
        if (presenter) {
            const filtered = workshops.filter((workshop) =>
                workshop.presenters.includes(presenter)
            );
            setFilteredWorkshops(filtered);
            setSearchQuery(presenter); // Update the search bar with the presenter's name
        } else {
            setFilteredWorkshops(workshops); // Reset to show all workshops if no presenter is specified
            setSearchQuery(''); // Clear the search bar
        }
    }, [location.search, workshops]); // Trigger when the query string or workshops change

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter workshops based on the search query
        const filtered = workshops.filter((workshop) =>
            workshop.title.toLowerCase().includes(query) ||
            workshop.presenters.some((presenter) =>
                presenter.toLowerCase().includes(query)
            )
        );
        setFilteredWorkshops(filtered);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setFilteredWorkshops(workshops); // Reset to show all workshops
    };

    const sortedWorkshops = [...filteredWorkshops].sort((a, b) => {
        const aTime = a.date?.seconds || 0;
        const bTime = b.date?.seconds || 0;
        return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });

    const toggleSortOrder = () => {
        setSortOrder((prevOrder) => (prevOrder === "newest" ? "oldest" : "newest"));
    };

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

            {/* Sort and Upload Buttons */}
            <div className="mb-4 flex items-center justify-between">
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

                {user && (
                    <button
                        onClick={() => history.push('/upload')}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Upload Workshop
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
                        presenters={workshop.presenters} // Pass presenters as a prop
                    />
                ))}
            </div>
        </div>
    );
};

export default Workshops;