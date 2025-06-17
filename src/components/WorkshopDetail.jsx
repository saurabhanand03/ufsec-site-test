import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { db, auth } from '../firebase/firebase';
import MarkdownRenderer from './workshop/MarkdownRenderer';

const getEmbedUrl = (url) => {
    if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtube.com/watch?v=')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
};

const WorkshopDetail = () => {
    const { id } = useParams();
    const history = useHistory();
    const [workshop, setWorkshop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    
    // Helper function to check if user can edit workshops
    const canEditWorkshop = () => {
        return userRole === 'admin' || userRole === 'workshop-lead';
    };

    useEffect(() => {
        const unsubscribe = db.collection('workshops')
            .doc(id)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    setWorkshop({ id: doc.id, ...doc.data() });
                } else {
                    console.error('Workshop not found');
                }
                setLoading(false);
            });

        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Check user role
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    setUserRole(userDoc.data().role);
                } else {
                    setUserRole('user');
                }
            } else {
                setUserRole(null);
            }
        });

        return () => {
            unsubscribe();
            unsubscribeAuth();
        };
    }, [id]);

    if (loading) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    if (!workshop) {
        return <div className="text-center mt-8 text-red-500">Workshop not found.</div>;
    }

    return (
        <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
            <div className="relative w-full mb-8">
                <button 
                    className="absolute top-0 left-0 text-blue-500 hover:underline" 
                    onClick={() => history.push('/workshops')}
                >
                    &larr; Back
                </button>

                {canEditWorkshop() && (
                    <button 
                        className="absolute top-0 right-0 text-blue-500 hover:underline" 
                        onClick={() => history.push(`/upload?id=${workshop.id}`)}
                    >
                        Edit Workshop
                    </button>
                )}

                <div className="flex justify-center">
                    <iframe
                        className="rounded-lg shadow-lg"
                        width="800"
                        height="450"
                        src={getEmbedUrl(workshop.videoLink)}
                        title={workshop.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>

            <h1 className="text-4xl font-bold text-center mb-4">{workshop.title}</h1>

            {/* Workshop metadata section */}
            <div className="flex flex-col w-full max-w-3xl mb-6">
                {/* Date and Creator Info */}
                <div className="flex flex-wrap items-center justify-between text-gray-600 mb-4">
                    <span>
                        {workshop.date?.toDate().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                    
                    {workshop.createdBy && (
                        <span className="italic">
                            Created by: {workshop.createdBy.displayName || workshop.createdBy.email}
                        </span>
                    )}
                </div>

                {/* Presenter Bubbles */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {workshop.presenters.map((presenter) => (
                        <span
                            key={presenter}
                            className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                            <button
                                onClick={() => history.push(`/workshops?presenter=${encodeURIComponent(presenter)}`)}
                                className="text-blue-500 hover:underline"
                            >
                                {presenter}
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <MarkdownRenderer 
                content={workshop.instructionsMarkdown} 
                className="text-left w-full max-w-3xl break-words overflow-auto" 
            />
        </div>
    );
};

export default WorkshopDetail;