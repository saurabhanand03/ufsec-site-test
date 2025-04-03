import React, { useState, useEffect } from 'react';
import WorkshopTile from '../components/WorkshopTile';
import { db } from '../firebase/firebase';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'; // Add this import

const Workshops = () => {
    const [workshops, setWorkshops] = useState([]);
    const [sortOrder, setSortOrder] = useState("newest");

    useEffect(() => {
        const unsubscribe = db.collection('workshops').onSnapshot(snapshot => {
            const workshopsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setWorkshops(workshopsData);
        });
        return () => unsubscribe();
    }, []);

    // Sort workshops based on Firestore Timestamp (assumes "date" field is a Timestamp)
    const sortedWorkshops = [...workshops].sort((a, b) => {
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
            <div className="mb-4 flex items-center">
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedWorkshops.map((workshop) => (
                    <WorkshopTile 
                        key={workshop.id} 
                        id={workshop.id} 
                        title={workshop.title} 
                        date={workshop.date} 
                        videoLink={workshop.videoLink} 
                    />
                ))}
            </div>
        </div>
    );
};

export default Workshops;