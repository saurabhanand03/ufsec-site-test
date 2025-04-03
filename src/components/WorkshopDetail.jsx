import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialOceanic } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { db } from '../firebase/firebase';

const getEmbedUrl = (url) => {
    if (url.includes('youtu.be/')) {
        // Handle shortened YouTube URLs
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtube.com/watch?v=')) {
        // Handle standard YouTube URLs
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return url; // Return the original URL if it doesn't match either format
};

const WorkshopDetail = () => {
    const { id } = useParams();
    const history = useHistory();
    const [workshop, setWorkshop] = useState(null);

    useEffect(() => {
        const unsubscribe = db.collection('workshops')
            .doc(id)
            .onSnapshot(doc => {
                if (doc.exists) {
                    setWorkshop({ id: doc.id, ...doc.data() });
                }
            });
        return () => unsubscribe();
    }, [id]);

    if (!workshop) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
            {/* Back Button and Video */}
            <div className="relative w-full mb-8">
                {/* Back Button */}
                <button 
                    className="absolute top-0 left-0 text-blue-500 hover:underline" 
                    onClick={() => history.goBack()}
                >
                    &larr; Back
                </button>
                {/* Video */}
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

            {/* Title */}
            <h1 className="text-4xl font-bold text-center mb-8">{workshop.title}</h1>

            {/* Markdown Content */}
            <div className="prose prose-lg max-w-3xl text-lg">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                                <SyntaxHighlighter
                                    style={materialOceanic}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code className={`bg-gray-100 px-1 rounded ${className}`} {...props}>
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {workshop.instructionsMarkdown || ''}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default WorkshopDetail;