import React, { useRef, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

const MarkdownEditor = ({ value, onChange }) => {
    const editorRef = useRef(null);
    const previewRef = useRef(null);

    // This function synchronizes scrolling between editor and preview
    const handleEditorScroll = () => {
        if (editorRef.current && previewRef.current) {
            const editor = editorRef.current;
            const preview = previewRef.current;
            const scrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
            preview.scrollTop = scrollRatio * (preview.scrollHeight - preview.clientHeight);
        }
    };

    // Handle editor resize to update preview size
    const handleEditorResize = () => {
        if (editorRef.current && previewRef.current) {
            previewRef.current.style.height = `${editorRef.current.offsetHeight}px`;
        }
    };

    // Set up resize observer to watch for editor size changes
    useEffect(() => {
        // Set initial heights
        if (editorRef.current) {
            editorRef.current.style.minHeight = '600px';
        }
        
        if (previewRef.current) {
            previewRef.current.style.minHeight = '600px';
        }
        
        const resizeObserver = new ResizeObserver(handleEditorResize);
        if (editorRef.current) {
            resizeObserver.observe(editorRef.current);
        }
        
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
                <div className="mb-2 flex justify-between items-center">
                    <h3 className="font-semibold">Editor</h3>
                    <span className="text-sm text-gray-500">Supports Markdown</span>
                </div>
                <textarea
                    ref={editorRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={handleEditorScroll}
                    placeholder="Write your workshop instructions here using Markdown..."
                    className="w-full p-4 border rounded font-mono text-sm resize-y"
                    style={{ minHeight: '600px' }}
                ></textarea>
            </div>
            
            <div className="w-full md:w-1/2">
                <h3 className="font-semibold mb-2">Preview</h3>
                <div
                    ref={previewRef}
                    className="p-4 border rounded bg-gray-50 overflow-auto"
                    style={{ minHeight: '600px' }}
                >
                    <MarkdownRenderer content={value} />
                </div>
            </div>
        </div>
    );
};

export default MarkdownEditor;