import React from 'react';
import { useHistory } from 'react-router-dom';

const getYoutubeThumbnail = (url) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
    } else if (url.includes('youtube.com')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : '';
};

const formatDate = (date) => {
    if (date && date.toDate) {
        // Convert Firestore Timestamp to JavaScript Date
        const jsDate = date.toDate();

        // Format the date with day of the week
        return jsDate.toLocaleDateString('en-US', {
            weekday: 'short', // e.g., "Wed"
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
    }
    return date;
};

const WorkshopTile = ({ id, title, date, videoLink, presenters = [], createdBy = null }) => {
    const history = useHistory();

    const handleClick = () => {
        history.push(`/workshops/${id}`);
    };

    return (
        <div 
            className="border rounded-lg shadow-md p-4 m-2 cursor-pointer hover:shadow-lg transition-shadow duration-300" 
            onClick={handleClick}
        >
            <div className="aspect-w-16 aspect-h-9">
                <img 
                    className="w-full h-full rounded-lg object-cover" 
                    src={getYoutubeThumbnail(videoLink)} 
                    alt={title} 
                />
            </div>
            <h3 className="text-lg font-semibold mt-2">{title}</h3>
            <p className="text-gray-600">{formatDate(date)}</p>
            
            {/* Creator info if available */}
            {createdBy && (
                <p className="text-gray-500 text-sm italic mt-1">
                    By: {createdBy.displayName || createdBy.email.split('@')[0]}
                </p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
                {presenters.length > 0 ? (
                    presenters.map((presenter) => (
                        <span
                            key={presenter}
                            className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering the tile click
                                    history.push(`/workshops?presenter=${presenter}`);
                                }}
                                className="text-blue-500 hover:underline"
                            >
                                {presenter}
                            </button>
                        </span>
                    ))
                ) : (
                    <span className="text-sm text-gray-500">No presenters listed</span>
                )}
            </div>
        </div>
    );
};

export default WorkshopTile;