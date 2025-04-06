import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialOceanic } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { db, auth } from '../firebase/firebase';

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
    const [user, setUser] = useState(null);

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

        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user && user.email === 'asaurabh2003@gmail.com') {
                setUser(user);
            } else {
                setUser(null);
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
                    onClick={() => history.push('/workshops')} // Navigate to the All Workshops page
                >
                    &larr; Back
                </button>

                {user && (
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

            {/* Presenter Bubbles */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
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

            <div className="prose prose-lg text-left w-full max-w-3xl break-words overflow-auto">
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