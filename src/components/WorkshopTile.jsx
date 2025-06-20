import React from 'react';
import { useHistory } from 'react-router-dom';

// Modify the thumbnail section to handle missing video links
const getYoutubeThumbnail = (url) => {
    if (!url) return null;
    
    let videoId = '';
    if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
    } else if (url.includes('youtube.com')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;
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

// Update the component parameters to include thumbnailImage
const WorkshopTile = ({ id, title, date, videoLink, thumbnailImage, presenters = [], createdBy = null, status = 'published' }) => {
    const history = useHistory();

    const handleClick = () => {
        history.push(`/workshops/${id}`);
    };

    return (
        <div 
            className="border rounded-lg shadow-md p-4 m-2 cursor-pointer hover:shadow-lg transition-shadow duration-300 relative" 
            onClick={handleClick}
        >
            {/* Draft Badge */}
            {status === 'draft' && (
                <div className="absolute top-2 right-2 z-10 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                    DRAFT
                </div>
            )}
            
            <div className="aspect-w-16 aspect-h-9">
                {getYoutubeThumbnail(videoLink) ? (
                    <img 
                        className={`w-full h-full rounded-lg object-cover ${status === 'draft' ? 'opacity-70' : ''}`}
                        src={getYoutubeThumbnail(videoLink)} 
                        alt={title} 
                    />
                ) : thumbnailImage ? (
                    <img 
                        className={`w-full h-full rounded-lg object-cover ${status === 'draft' ? 'opacity-70' : ''}`}
                        src={thumbnailImage} 
                        alt={title} 
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/SECSquareLogo.png";
                        }}
                    />
                ) : (
                    <div className={`w-full h-full rounded-lg bg-gray-100 flex items-center justify-center ${status === 'draft' ? 'opacity-70' : ''}`}>
                        <img 
                            src="/SECSquareLogo.png" 
                            alt="SEC Logo" 
                            className="h-16 w-16 opacity-80"
                        />
                    </div>
                )}
            </div>
            <h3 className="text-lg font-semibold mt-2">{title}</h3>
            <p className="text-gray-600">{formatDate(date)}</p>
            
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