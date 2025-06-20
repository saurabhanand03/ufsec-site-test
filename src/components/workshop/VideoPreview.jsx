import React from 'react';

const getEmbedUrl = (url) => {
    if (!url) return null;
    
    if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtube.com/watch?v=')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
};

const VideoPreview = ({ videoLink }) => {
    if (!videoLink) return (
        <div className="mb-4 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500 text-center">No video link provided.<br />Preview will appear here when you add a YouTube video link.</p>
        </div>
    );
    
    const embedUrl = getEmbedUrl(videoLink);
    if (!embedUrl) return null;
    
    return (
        <div className="mb-4">
            <iframe
                className="rounded-lg shadow-lg w-full"
                height="450"
                src={embedUrl}
                title="Video Preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default VideoPreview;