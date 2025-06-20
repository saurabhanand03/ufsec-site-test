import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { db, auth } from '../firebase/firebase';
import firebase from 'firebase/compat/app';
import MarkdownEditor from './workshop/MarkdownEditor';
import PresenterSelector from './workshop/PresenterSelector';
import VideoPreview from './workshop/VideoPreview';
import { DEFAULT_MARKDOWN } from './workshop/MarkdownPlaceholders';

const PublishModal = ({ isOpen, onClose, onConfirm, workshopTitle }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
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
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Publish
                    </button>
                </div>
            </div>
        </div>
    );
};

const SuccessModal = ({ isOpen, onClose, workshopTitle }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex items-center justify-center mb-4">
                    <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Workshop Published!</h3>
                <p className="text-center mb-6">
                    <span className="font-semibold">{workshopTitle}</span> has been successfully published and is now visible to all users.
                </p>
                <div className="flex justify-center">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const UploadWorkshop = () => {
    const history = useHistory();
    const location = useLocation();
    const [allPresenters, setAllPresenters] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        videoLink: '',
        date: new Date().toISOString().split('T')[0],
        instructionsMarkdown: '',
        presenters: [],
        status: 'draft', // Default status is draft
    });
    const [isEditing, setIsEditing] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [workshopId, setWorkshopId] = useState(null);
    const [mediaType, setMediaType] = useState('video'); // 'video' or 'image'

    // Fetch all unique presenters from the database
    useEffect(() => {
        const fetchPresenters = async () => {
            try {
                const snapshot = await db.collection('workshops').get();
                const presentersSet = new Set();
                
                snapshot.docs.forEach(doc => {
                    const workshop = doc.data();
                    if (workshop.presenters && Array.isArray(workshop.presenters)) {
                        workshop.presenters.forEach(presenter => {
                            presentersSet.add(presenter);
                        });
                    }
                });
                
                setAllPresenters(Array.from(presentersSet));
            } catch (error) {
                console.error("Error fetching presenters:", error);
            }
        };
        
        fetchPresenters();
    }, []);

    // Check if user has permission to manage workshops
    useEffect(() => {
        const checkPermission = async () => {
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
                // Redirect if not logged in
                history.push('/workshops');
                return;
            }

            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            if (!userDoc.exists) {
                history.push('/workshops');
                return;
            }

            const role = userDoc.data().role;
            setUserRole(role);
            setCurrentUser(currentUser); // Store the current user
            
            // Redirect if not admin or workshop lead
            if (role !== 'admin' && role !== 'workshop-lead') {
                history.push('/workshops');
                return;
            }

            // Add current user's name as a presenter by default (only for new workshops)
            if (!isEditing) {
                // Use Firestore display name instead of Auth display name
                const firestoreDisplayName = userDoc.data().displayName || currentUser.email.split('@')[0];
                
                // Only add if not already in the presenters list
                setFormData(prevData => {
                    if (!prevData.presenters.includes(firestoreDisplayName)) {
                        return {
                            ...prevData,
                            presenters: [...prevData.presenters, firestoreDisplayName],
                            // Set default markdown for new workshops
                            instructionsMarkdown: DEFAULT_MARKDOWN
                        };
                    }
                    return prevData;
                });
            }
        };

        checkPermission();
    }, [history, isEditing]);

    // Load workshop data if editing an existing workshop
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        if (id) {
            setIsEditing(true);
            setWorkshopId(id);
            // Fetch workshop data for editing
            db.collection('workshops')
                .doc(id)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        setFormData({
                            title: data.title,
                            videoLink: data.videoLink || '',
                            thumbnailImage: data.thumbnailImage || '', // Add this line to load thumbnailImage
                            date: data.date.toDate().toISOString().split('T')[0],
                            instructionsMarkdown: data.instructionsMarkdown,
                            presenters: data.presenters || [],
                            status: data.status || 'draft', // Keep existing status or default to draft
                        });
                    }
                });
        }
    }, [location]);

    // Set the correct media type based on existing data
    useEffect(() => {
        if (formData.thumbnailImage && !formData.videoLink) {
            setMediaType('image');
        } else {
            setMediaType('video'); // Default to video otherwise
        }
    }, [formData.thumbnailImage, formData.videoLink]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleMarkdownChange = (value) => {
        setFormData({ ...formData, instructionsMarkdown: value });
    };

    const handleAddPresenter = (presenter) => {
        setFormData({
            ...formData,
            presenters: [...formData.presenters, presenter],
        });
    };

    const handleRemovePresenter = (presenter) => {
        setFormData({
            ...formData,
            presenters: formData.presenters.filter((p) => p !== presenter),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Parse the date as a date-only value (ignoring time)
            const localDate = new Date(`${formData.date}T00:00:00`);
            const utcDate = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);

            const workshopData = {
                ...formData,
                date: firebase.firestore.Timestamp.fromDate(utcDate), // Store as UTC midnight
            };
            
            // Add creator information
            if (currentUser) {
                workshopData.createdBy = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName || currentUser.email.split('@')[0]
                };
                
                // Add timestamp for creation/update
                if (!isEditing) {
                    workshopData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                } else {
                    workshopData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                }
            }

            let id;
            if (isEditing) {
                const params = new URLSearchParams(location.search);
                id = params.get('id');
                await db.collection('workshops').doc(id).update(workshopData);
            } else {
                const docRef = await db.collection('workshops').add(workshopData);
                id = docRef.id;
                setWorkshopId(id);
            }

            // Redirect to the workshop details page
            history.push(`/workshops/${id}`);
        } catch (error) {
            console.error('Error uploading workshop:', error);
        }
    };

    const handlePublishClick = () => {
        setShowPublishModal(true);
    };

    const handlePublishConfirm = async () => {
        try {
            const id = workshopId || new URLSearchParams(location.search).get('id');
            
            if (id) {
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
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Error publishing workshop:', error);
            setShowPublishModal(false);
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        
        // Redirect to the workshop details page after successful publish
        const id = workshopId || new URLSearchParams(location.search).get('id');
        if (id) {
            history.push(`/workshops/${id}`);
        }
    };

    return (
        <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
            <div className="relative w-full mb-8">
                {/* Back Button */}
                <button
                    className="absolute top-0 left-0 text-blue-500 hover:underline"
                    onClick={() => {
                        if (isEditing) {
                            const params = new URLSearchParams(location.search);
                            const id = params.get('id');
                            history.push(`/workshops/${id}`);
                        } else {
                            history.push('/workshops');
                        }
                    }}
                >
                    &larr; Back
                </button>
            </div>

            <form
                className="bg-white p-6 rounded shadow-md w-full max-w-6xl"
                onSubmit={handleSubmit}
            >
                <h1 className="text-2xl font-bold mb-4">
                    {isEditing ? 'Edit Workshop' : 'Create Workshop'}
                </h1>
                
                {/* Status indicator */}
                {isEditing && (
                    <div className="mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                            formData.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            Status: {formData.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                    </div>
                )}
                
                <div className="mb-4">
                    <label className="block text-gray-700">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                
                {/* Media Section - Video Link or Image URL */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Workshop Media</label>
                    
                    <div className="flex mb-3 bg-gray-100 rounded-md p-1 inline-flex">
                        <button
                            type="button"
                            onClick={() => setMediaType('video')}
                            className={`px-4 py-2 rounded ${
                                mediaType === 'video' 
                                    ? 'bg-white shadow-sm' 
                                    : 'bg-transparent text-gray-600'
                            }`}
                        >
                            YouTube Video
                        </button>
                        <button
                            type="button"
                            onClick={() => setMediaType('image')}
                            className={`px-4 py-2 rounded ${
                                mediaType === 'image' 
                                    ? 'bg-white shadow-sm' 
                                    : 'bg-transparent text-gray-600'
                            }`}
                        >
                            Image URL
                        </button>
                    </div>
                    
                    {mediaType === 'video' ? (
                        <>
                            <input
                                type="url"
                                name="videoLink"
                                value={formData.videoLink}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        videoLink: e.target.value,
                                        thumbnailImage: '' // Clear thumbnail image when adding a video link
                                    });
                                }}
                                className="w-full p-2 border rounded"
                                placeholder="YouTube video URL (e.g. https://youtu.be/example)"
                            />
                            {formData.videoLink && <VideoPreview videoLink={formData.videoLink} />}
                        </>
                    ) : (
                        <>
                            <input
                                type="url"
                                name="thumbnailImage"
                                value={formData.thumbnailImage}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        thumbnailImage: e.target.value,
                                        videoLink: '' // Clear video link when adding a thumbnail image
                                    });
                                }}
                                className="w-full p-2 border rounded"
                                placeholder="Image URL for workshop thumbnail"
                            />
                            {formData.thumbnailImage && (
                                <div className="mt-2 border border-gray-300 rounded overflow-hidden">
                                    <img 
                                        src={formData.thumbnailImage} 
                                        alt="Thumbnail preview" 
                                        className="max-h-60 object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/SECSquareLogo.png";
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                        {mediaType === 'video' ? 
                            "Enter a YouTube video URL to embed in the workshop" : 
                            "Provide an image URL to display as the workshop thumbnail"}
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-8">
                    <label className="block text-gray-700">Presenters</label>
                    <PresenterSelector
                        presenters={formData.presenters}
                        allPresenters={allPresenters}
                        onAdd={handleAddPresenter}
                        onRemove={handleRemovePresenter}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700">Instructions (Markdown)</label>
                    <MarkdownEditor
                        value={formData.instructionsMarkdown}
                        onChange={handleMarkdownChange}
                    />
                    <p className="text-gray-600 mb-4">Use Markdown to format your workshop instructions. The preview will show how it will appear to users.</p>
                </div>

                <div className="flex justify-between">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                    >
                        {isEditing ? 'Save Changes' : 'Save as Draft'}
                    </button>
                    {isEditing && formData.status === 'draft' && (userRole === 'admin' || userRole === 'workshop-lead') && (
                        <button
                            onClick={handlePublishClick}
                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                            type="button"
                        >
                            Publish Workshop
                        </button>
                    )}
                </div>

                {/* Publish Confirmation Modal */}
                <PublishModal
                    isOpen={showPublishModal}
                    onConfirm={handlePublishConfirm}
                    onClose={() => setShowPublishModal(false)}
                    workshopTitle={formData.title}
                />

                {/* Success Modal */}
                <SuccessModal
                    isOpen={showSuccessModal}
                    onClose={handleSuccessModalClose}
                    workshopTitle={formData.title}
                />
            </form>
        </div>
    );
};

export default UploadWorkshop;