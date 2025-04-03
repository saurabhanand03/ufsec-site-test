import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { db } from '../firebase/firebase';
import firebase from 'firebase/compat/app';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialOceanic } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
};

const UploadWorkshop = () => {
    const history = useHistory();
    const location = useLocation();
    const [formData, setFormData] = useState({
        title: '',
        videoLink: '',
        date: '',
        instructionsMarkdown: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const editorRef = useRef(null);
    const previewRef = useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        if (id) {
            setIsEditing(true);
            // Fetch workshop data for editing
            db.collection('workshops')
                .doc(id)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        setFormData({
                            title: data.title,
                            videoLink: data.videoLink,
                            date: data.date.toDate().toISOString().split('T')[0], // Convert Firestore Timestamp to date string
                            instructionsMarkdown: data.instructionsMarkdown,
                        });
                    }
                });
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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

            let workshopId;
            if (isEditing) {
                const params = new URLSearchParams(location.search);
                workshopId = params.get('id');
                await db.collection('workshops').doc(workshopId).update(workshopData);
            } else {
                const docRef = await db.collection('workshops').add(workshopData);
                workshopId = docRef.id;
            }

            // Redirect to the workshop details page
            history.push(`/workshops/${workshopId}`);
        } catch (error) {
            console.error('Error uploading workshop:', error);
        }
    };

    const handleEditorScroll = () => {
        if (editorRef.current && previewRef.current) {
            const editor = editorRef.current;
            const preview = previewRef.current;
            const scrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
            preview.scrollTop = scrollRatio * (preview.scrollHeight - preview.clientHeight);
        }
    };

    return (
        <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
            <form
                className="bg-white p-6 rounded shadow-md w-full max-w-4xl"
                onSubmit={handleSubmit}
            >
                <h1 className="text-2xl font-bold mb-4">
                    {isEditing ? 'Edit Workshop' : 'Upload Workshop'}
                </h1>
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
                <div className="mb-4">
                    <label className="block text-gray-700">Video Link</label>
                    <input
                        type="url"
                        name="videoLink"
                        value={formData.videoLink}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                {formData.videoLink && (
                    <div className="mb-4">
                        <iframe
                            className="rounded-lg shadow-lg"
                            width="800"
                            height="450"
                            src={getEmbedUrl(formData.videoLink)}
                            title="Video Preview"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
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
                <div className="flex space-x-4">
                    <div className="w-1/2">
                        <h2 className="text-lg font-bold mb-2">Markdown Editor</h2>
                        <textarea
                            ref={editorRef}
                            name="instructionsMarkdown"
                            value={formData.instructionsMarkdown}
                            onChange={handleChange}
                            onScroll={handleEditorScroll}
                            className="w-full h-64 p-2 border rounded"
                        ></textarea>
                    </div>
                    <div className="w-1/2">
                        <h2 className="text-lg font-bold mb-2">Preview</h2>
                        <div
                            ref={previewRef}
                            className="prose prose-lg p-4 border rounded bg-gray-50 h-64 overflow-auto break-words"
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <div className="relative">
                                                <button
                                                    className="absolute top-0 right-0 bg-gray-200 text-gray-600 px-2 py-1 rounded-bl"
                                                    onClick={() => handleCopyCode(String(children).replace(/\n$/, ''))}
                                                >
                                                    Copy
                                                </button>
                                                <SyntaxHighlighter
                                                    style={materialOceanic}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className={`bg-gray-100 px-1 rounded ${className}`} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {formData.instructionsMarkdown}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    {isEditing ? 'Save Changes' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default UploadWorkshop;