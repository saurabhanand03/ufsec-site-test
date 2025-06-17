import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import CodeBlock from './CodeBlock';
import './MarkdownRenderer.css';

const MarkdownRenderer = ({ content, className = "" }) => {
  return (
    <div className={`prose max-w-none custom-markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            
            if (!inline && match) {
              return (
                <CodeBlock 
                  code={codeString}
                  language={match[1]}
                  className={className}
                />
              );
            }
            
            return (
              <code className={`bg-gray-100 px-1 rounded ${className}`} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;