import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { db, auth } from '../firebase/firebase';
import MarkdownRenderer from './workshop/MarkdownRenderer';
import firebase from 'firebase/compat/app';

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

// Base modal component
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                {children}
            </div>
        </div>
    );
};

// Publish confirmation modal
const PublishModal = ({ isOpen, onClose, onConfirm, workshopTitle }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-xl font-bold mb-4">Publish Workshop</h3>
            <p className="mb-6">
                Are you sure you want to publish <span className="font-semibold">{workshopTitle}</span>? 
                This will make it visible to all users.
            </p>
            <div className="flex justify-end space-x-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Publish
                </button>
            </div>
        </Modal>
    );
};

// Unpublish confirmation modal
const UnpublishModal = ({ isOpen, onClose, onConfirm, workshopTitle }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-xl font-bold mb-4">Unpublish Workshop</h3>
            <p className="mb-6">
                Are you sure you want to unpublish <span className="font-semibold">{workshopTitle}</span>? 
                This will hide it from regular users and return it to draft status.
            </p>
            <div className="flex justify-end space-x-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Unpublish
                </button>
            </div>
        </Modal>
    );
};

// Delete confirmation modal
const DeleteModal = ({ isOpen, onClose, onConfirm, workshopTitle }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className="text-xl font-bold mb-4">Delete Workshop</h3>
            <p className="mb-6">
                Are you sure you want to delete <span className="font-semibold">{workshopTitle}</span>? 
                This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Delete
                </button>
            </div>
        </Modal>
    );
};

// Success modal
const SuccessModal = ({ isOpen, onClose, title, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex items-center justify-center mb-4">
                <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">{title}</h3>
            <p className="text-center mb-6">{message}</p>
            <div className="flex justify-center">
                <button 
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

const WorkshopDetail = () => {
    const { id } = useParams();
    const history = useHistory();
    const [workshop, setWorkshop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    
    // Modal states
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showUnpublishModal, setShowUnpublishModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
    
    // Helper function to check if user can edit workshops
    const canEditWorkshop = () => {
        return userRole === 'admin' || userRole === 'workshop-lead';
    };

    // Helper function to check if user can delete workshops (admin only)
    const canDeleteWorkshop = () => {
        return userRole === 'admin';
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
                setCurrentUser(user);
                // Check user role
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    setUserRole(userDoc.data().role);
                } else {
                    setUserRole('user');
                }
            } else {
                setUserRole(null);
                setCurrentUser(null);
            }
        });

        return () => {
            unsubscribe();
            unsubscribeAuth();
        };
    }, [id]);

    const handlePublishConfirm = async () => {
        if (!canEditWorkshop()) return;
        
        try {
            await db.collection('workshops').doc(id).update({
                status: 'published',
                publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
                publishedBy: {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName || currentUser.email.split('@')[0]
                }
            });
            setShowPublishModal(false);
            setSuccessMessage({
                title: 'Workshop Published',
                message: `${workshop?.title} has been successfully published and is now visible to all users.`
            });
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error publishing workshop:', error);
            setShowPublishModal(false);
        }
    };

    const handleUnpublishConfirm = async () => {
        if (!canEditWorkshop()) return;
        
        try {
            await db.collection('workshops').doc(id).update({
                status: 'draft',
                unpublishedAt: firebase.firestore.FieldValue.serverTimestamp(),
                unpublishedBy: {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName || currentUser.email.split('@')[0]
                }
            });
            setShowUnpublishModal(false);
            setSuccessMessage({
                title: 'Workshop Unpublished',
                message: `${workshop?.title} has been returned to draft status and is now only visible to admins and workshop leads.`
            });
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error unpublishing workshop:', error);
            setShowUnpublishModal(false);
        }
    };

    const handleDeleteConfirm = async () => {
        // Only allow admins to delete workshops
        if (!canDeleteWorkshop()) {
            alert('Only administrators can delete workshops');
            setShowDeleteModal(false);
            return;
        }
        
        try {
            await db.collection('workshops').doc(id).delete();
            setShowDeleteModal(false);
            setSuccessMessage({
                title: 'Workshop Deleted',
                message: `${workshop?.title} has been permanently deleted.`
            });
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error deleting workshop:', error);
            setShowDeleteModal(false);
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        
        // If workshop was deleted, redirect to workshops page
        if (successMessage.title === 'Workshop Deleted') {
            history.push('/workshops');
        }
    };

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

                {/* Admin Actions - Keep to the right without pushing video down */}
                {canEditWorkshop() && (
                    <div className="absolute top-0 right-0 flex space-x-3">
                        {workshop.status === 'draft' ? (
                            <button 
                                className="text-green-600 px-4 py-2 border border-green-500 rounded hover:bg-green-50"
                                onClick={() => setShowPublishModal(true)}
                            >
                                Publish Workshop
                            </button>
                        ) : (
                            <button 
                                className="text-gray-700 px-4 py-2 border border-gray-600 rounded hover:bg-gray-50"
                                onClick={() => setShowUnpublishModal(true)}
                            >
                                Unpublish
                            </button>
                        )}
                        
                        <button 
                            className="text-blue-600 px-4 py-2 border border-blue-500 rounded hover:bg-blue-50"
                            onClick={() => history.push(`/upload?id=${workshop.id}`)}
                        >
                            Edit Workshop
                        </button>
                        
                        {/* Only show delete button for admins */}
                        {canDeleteWorkshop() && (
                            <button 
                                className="text-red-600 px-4 py-2 border border-red-500 rounded hover:bg-red-50"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                )}

                {/* Video without any top margin */}
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

            {/* Draft Status Banner */}
            {workshop.status === 'draft' && (
                <div className="w-full max-w-3xl mb-4 bg-gray-100 border-l-4 border-gray-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-700">
                                This workshop is currently in draft mode and has not been published yet.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Workshop metadata section */}
            <div className="flex flex-col w-full max-w-3xl mb-6">
                {/* Date and Presenters - both centered */}
                <div className="flex flex-col items-center text-gray-600 mb-4 space-y-3">
                    {/* Date - centered */}
                    <span className="text-center">
                        {workshop.date?.toDate().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                    
                    {/* Presenter Bubbles - centered */}
                    <div className="flex flex-wrap gap-2 justify-center">
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
            </div>

            <MarkdownRenderer 
                content={workshop.instructionsMarkdown} 
                className="text-left w-full max-w-3xl break-words overflow-auto" 
            />
            
            {/* Modals */}
            <PublishModal 
                isOpen={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                onConfirm={handlePublishConfirm}
                workshopTitle={workshop?.title}
            />
            
            <UnpublishModal
                isOpen={showUnpublishModal}
                onClose={() => setShowUnpublishModal(false)}
                onConfirm={handleUnpublishConfirm}
                workshopTitle={workshop?.title}
            />
            
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                workshopTitle={workshop?.title}
            />
            
            <SuccessModal 
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
                title={successMessage.title}
                message={successMessage.message}
            />
        </div>
    );
};

export default WorkshopDetail;