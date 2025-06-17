import { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialOceanic } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiCopy, FiCheck, FiCode } from 'react-icons/fi';

const CodeBlock = ({ code, language }) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedChangesId, setCopiedChangesId] = useState(false);
  const codeRef = useRef(null);
  
  // Look for file title in the first line of code
  let fileTitle = null;
  let actualCode = code;
  
  // Different comment styles based on language
  let commentRegex;
  if (language === 'html' || language === 'xml') {
    commentRegex = /^(?:<!--)\s*filename:\s*(.*?)(?:\s*-->)?$/m;
  } else if (language === 'python' || language === 'ruby') {
    commentRegex = /^(?:#)\s*filename:\s*(.*?)$/m;
  } else {
    commentRegex = /^(?:\/\/|#|<!--)\s*filename:\s*(.*?)(?:\s*-->)?$/m;
  }
  
  const firstLineMatch = code.match(commentRegex);
  if (firstLineMatch) {
    fileTitle = firstLineMatch[1].trim();
    // Remove the filename comment from the code
    actualCode = code.replace(commentRegex, '');
    // Remove the first empty line if it exists after removing the comment
    actualCode = actualCode.replace(/^\n/, '');
  }
  
  // Process code for highlighting
  const { shouldHighlight, highlightMap } = processCodeForHighlights(actualCode, language);
  
  // Apply highlighting after rendering
  useEffect(() => {
    applyHighlighting();
    // Also apply highlighting after a short delay to catch any async renders
    const timeoutId = setTimeout(applyHighlighting, 100);
    return () => clearTimeout(timeoutId);
  });
  
  const applyHighlighting = () => {
    if (codeRef.current && shouldHighlight) {
      const codeElement = codeRef.current;
      // Find the code element and get all direct span children (which are the lines)
      const codeTag = codeElement.querySelector('code');
      if (codeTag) {
        const lineSpans = Array.from(codeTag.children).filter(child => child.tagName === 'SPAN');
        
        // Apply highlighting to the appropriate lines
        lineSpans.forEach((span, index) => {
          // Reset any previous styling first
          span.classList.remove('highlighted-line');
          span.style.backgroundColor = '';
          span.style.borderLeft = '';
          span.style.paddingLeft = '';
          span.style.margin = '';
          span.style.paddingRight = '';
          span.style.display = '';
          
          // Apply new styling based on highlight map
          if (highlightMap[index] === 'highlight') {
            span.classList.add('highlighted-line');
            span.style.backgroundColor = 'rgba(255, 255, 0, 0.15)';
            span.style.borderLeft = '3px solid rgba(255, 255, 0, 0.5)';
            span.style.paddingLeft = '13px';
            span.style.margin = '0 -16px';
            span.style.paddingRight = '16px';
            span.style.display = 'block';
          } else if (highlightMap[index] === 'marker') {
            span.style.display = 'none';
          }
        });
      }
    }
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(actualCode)
      .then(() => {
        setCopiedId(true);
        setTimeout(() => {
          setCopiedId(false);
        }, 3000);
      })
      .catch(err => {
        console.error('Copy failed:', err);
      });
  };
  
  const handleCopyChanges = () => {
    const changesOnly = extractHighlightedCode(actualCode, language);
    
    if (!changesOnly) {
      handleCopyCode();
      return;
    }
    
    navigator.clipboard.writeText(changesOnly)
      .then(() => {
        setCopiedChangesId(true);
        setTimeout(() => {
          setCopiedChangesId(false);
        }, 3000);
      })
      .catch(err => {
        console.error('Copy changes failed:', err);
      });
  };
  
  return (
    <div className="code-block-wrapper">
      {fileTitle && (
        <div className="code-file-title">{fileTitle}</div>
      )}
      
      {/* Copy entire code button */}
      <button
        className="code-copy-button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCopyCode();
        }}
        title={copiedId ? "Copied!" : "Copy code"}
        type="button"
      >
        {copiedId ? (
          <FiCheck size={16} />
        ) : (
          <FiCopy size={16} />
        )}
      </button>
      
      {/* Copy only highlighted changes button */}
      {shouldHighlight && (
        <button
          className="code-copy-changes-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCopyChanges();
          }}
          title={copiedChangesId ? "Changes copied!" : "Copy highlighted changes only"}
          type="button"
        >
          {copiedChangesId ? (
            <FiCheck size={16} />
          ) : (
            <FiCode size={16} />
          )}
        </button>
      )}
      
      <div 
        className="relative"
        ref={codeRef}
      >
        <SyntaxHighlighter
          language={language}
          style={materialOceanic}
          className={fileTitle ? "file-title-active" : ""}
          showLineNumbers={false}
          wrapLines={true}
          customStyle={{
            padding: '1rem',
            borderRadius: '0.375rem',
            margin: 0
          }}
        >
          {actualCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// Helper functions for highlight processing

// Extract highlighted code sections
const extractHighlightedCode = (code, language) => {
  if (!code) return '';
  
  let highlightStart, highlightEnd;
  
  if (language === 'html' || language === 'xml') {
    highlightStart = '<!-- [highlight]';
    highlightEnd = '<!-- [/highlight]';
  } else if (language === 'python' || language === 'ruby') {
    highlightStart = '# [highlight]';
    highlightEnd = '# [/highlight]';
  } else {
    highlightStart = '// [highlight]';
    highlightEnd = '// [/highlight]';
  }
  
  const lines = code.split('\n');
  let isHighlighted = false;
  let highlightedCode = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes(highlightStart)) {
      isHighlighted = true;
      continue; // Skip the marker line
    } 
    else if (line.includes(highlightEnd)) {
      isHighlighted = false;
      continue; // Skip the marker line
    }
    else if (isHighlighted) {
      highlightedCode.push(line);
    }
  }
  
  return highlightedCode.join('\n');
};

// Process code to determine which lines should be highlighted
const processCodeForHighlights = (code, language) => {
  if (!code) return { code, shouldHighlight: false, highlightMap: {} };
  
  let highlightStart, highlightEnd;
  
  if (language === 'html' || language === 'xml') {
    highlightStart = '<!-- [highlight]';
    highlightEnd = '<!-- [/highlight]';
  } else if (language === 'python' || language === 'ruby') {
    highlightStart = '# [highlight]';
    highlightEnd = '# [/highlight]';
  } else {
    highlightStart = '// [highlight]';
    highlightEnd = '// [/highlight]';
  }
  
  const shouldHighlight = code.includes(highlightStart);
  if (!shouldHighlight) return { code, shouldHighlight, highlightMap: {} };
  
  const lines = code.split('\n');
  const highlightMap = {};
  let isHighlighting = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(highlightStart)) {
      isHighlighting = true;
      highlightMap[i] = 'marker';
    } else if (lines[i].includes(highlightEnd)) {
      isHighlighting = false;
      highlightMap[i] = 'marker';
    } else if (isHighlighting) {
      highlightMap[i] = 'highlight';
    }
  }
  
  return { code, shouldHighlight, highlightMap };
};

export default CodeBlock;