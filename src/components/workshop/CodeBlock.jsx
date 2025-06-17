import { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialOceanic } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiCopy, FiCheck, FiCode } from 'react-icons/fi';

const CodeBlock = ({ code, language }) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSectionIds, setCopiedSectionIds] = useState(new Set());
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
  const { shouldHighlight, highlightMap, highlightedSections } = processCodeForHighlights(actualCode, language);
  
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
          if (highlightMap[index]?.type === 'highlight') {
            span.classList.add('highlighted-line');
            span.style.paddingLeft = '13px';
            span.style.margin = '0 -16px';
            span.style.paddingRight = '16px';
            span.style.display = 'block';
            
            // Apply different styles based on highlight type
            const highlightType = highlightMap[index].highlightType;
            if (highlightType === 'add') {
              span.style.backgroundColor = 'rgba(0, 255, 0, 0.15)';
              span.style.borderLeft = '3px solid rgba(0, 255, 0, 0.5)';
            } else if (highlightType === 'modify') {
              span.style.backgroundColor = 'rgba(255, 255, 0, 0.15)';
              span.style.borderLeft = '3px solid rgba(255, 255, 0, 0.5)';
            } else if (highlightType === 'remove') {
              span.style.backgroundColor = 'rgba(255, 0, 0, 0.15)';
              span.style.borderLeft = '3px solid rgba(255, 0, 0, 0.5)';
            } else {
              // Default highlighting
              span.style.backgroundColor = 'rgba(255, 255, 0, 0.15)';
              span.style.borderLeft = '3px solid rgba(255, 255, 0, 0.5)';
            }
          } else if (highlightMap[index]?.type === 'marker') {
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
  
  const handleCopySection = (sectionCode, sectionIndex) => {
    navigator.clipboard.writeText(sectionCode)
      .then(() => {
        setCopiedSectionIds(prev => new Set([...prev, sectionIndex]));
        setTimeout(() => {
          setCopiedSectionIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(sectionIndex);
            return newSet;
          });
        }, 3000);
      })
      .catch(err => {
        console.error('Copy section failed:', err);
      });
  };
  
  const calculateLinePosition = (lineIndex) => {
    // Approximate line height calculation
    const lineHeight = 24; // Adjust based on your font size
    const padding = 16; // Top padding of the code block
    return padding + (lineIndex * lineHeight);
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
        title={copiedId ? "Copied!" : "Copy all"}
        type="button"
      >
        {copiedId ? (
          <FiCheck size={16} />
        ) : (
          <FiCopy size={16} />
        )}
      </button>
      
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
        
        {/* Render copy buttons for each highlighted section */}
        {highlightedSections.map((section, index) => {
          // Don't show copy button for remove sections
          if (section.highlightType === 'remove') return null;
          
          // Calculate position - use startLine instead of endLine
          const buttonTop = calculateLinePosition(section.startLine);
          const shouldOffset = index === 0 && section.startLine === 0 && !fileTitle;
          
          // Set section-specific tooltip text based on highlight type
          const tooltipText = section.highlightType === 'add' 
            ? (copiedSectionIds.has(index) ? "Added section copied!" : "Copy added section")
            : (copiedSectionIds.has(index) ? "Modified section copied!" : "Copy modified section");
          
          return (
            <button
              key={`copy-section-${index}`}
              className="code-section-copy-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCopySection(section.code, index);
              }}
              title={tooltipText}
              type="button"
              style={{
                position: 'absolute',
                top: shouldOffset ? buttonTop + 30 : buttonTop,
                right: '8px',
                zIndex: 20
              }}
            >
              {copiedSectionIds.has(index) ? (
                <FiCheck size={14} />
              ) : (
                <FiCode size={14} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Helper functions for highlight processing

// Process code to determine which lines should be highlighted and extract sections
const processCodeForHighlights = (code, language) => {
  if (!code) return { code, shouldHighlight: false, highlightMap: {}, highlightedSections: [] };
  
  const markers = getLanguageMarkers(language);
  if (!markers) return { code, shouldHighlight: false, highlightMap: {}, highlightedSections: [] };
  
  const { highlight, add, modify, remove } = markers;
  
  // Check if any highlighting is needed
  const hasHighlights = [
    highlight.start, add.start, modify.start, remove.start
  ].some(marker => code.includes(marker));
  
  if (!hasHighlights) return { code, shouldHighlight: false, highlightMap: {}, highlightedSections: [] };
  
  // Process the code line by line
  const lines = code.split('\n');
  const highlightMap = {};
  const highlightedSections = [];
  let currentHighlightType = null;
  let currentSectionStart = null;
  let currentSectionLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for highlight start markers
    if (line.includes(highlight.start)) {
      currentHighlightType = 'default';
      currentSectionStart = i;
      currentSectionLines = [];
      highlightMap[i] = { type: 'marker' };
      continue;
    } else if (line.includes(add.start)) {
      currentHighlightType = 'add';
      currentSectionStart = i;
      currentSectionLines = [];
      highlightMap[i] = { type: 'marker' };
      continue;
    } else if (line.includes(modify.start)) {
      currentHighlightType = 'modify';
      currentSectionStart = i;
      currentSectionLines = [];
      highlightMap[i] = { type: 'marker' };
      continue;
    } else if (line.includes(remove.start)) {
      currentHighlightType = 'remove';
      currentSectionStart = i;
      currentSectionLines = [];
      highlightMap[i] = { type: 'marker' };
      continue;
    }
    
    // Check for highlight end markers
    if (line.includes(highlight.end) || 
        line.includes(add.end) || 
        line.includes(modify.end) || 
        line.includes(remove.end)) {
      
      // Finalize the current section
      if (currentHighlightType && currentSectionStart !== null) {
        highlightedSections.push({
          startLine: currentSectionStart,
          endLine: i,
          highlightType: currentHighlightType,
          code: currentSectionLines.join('\n')
        });
      }
      
      currentHighlightType = null;
      currentSectionStart = null;
      currentSectionLines = [];
      highlightMap[i] = { type: 'marker' };
      continue;
    }
    
    // If we're inside a highlight section
    if (currentHighlightType) {
      highlightMap[i] = { 
        type: 'highlight', 
        highlightType: currentHighlightType 
      };
      currentSectionLines.push(line);
    }
  }
  
  return { code, shouldHighlight: true, highlightMap, highlightedSections };
};

// Helper to get language-specific markers
const getLanguageMarkers = (language) => {
  if (['html', 'xml'].includes(language)) {
    return {
      highlight: { start: '<!-- [highlight]', end: '<!-- [/highlight]' },
      add: { start: '<!-- [add]', end: '<!-- [/add]' },
      modify: { start: '<!-- [modify]', end: '<!-- [/modify]' },
      remove: { start: '<!-- [remove]', end: '<!-- [/remove]' }
    };
  } else if (['python', 'ruby'].includes(language)) {
    return {
      highlight: { start: '# [highlight]', end: '# [/highlight]' },
      add: { start: '# [add]', end: '# [/add]' },
      modify: { start: '# [modify]', end: '# [/modify]' },
      remove: { start: '# [remove]', end: '# [/remove]' }
    };
  } else {
    return {
      highlight: { start: '// [highlight]', end: '// [/highlight]' },
      add: { start: '// [add]', end: '// [/add]' },
      modify: { start: '// [modify]', end: '// [/modify]' },
      remove: { start: '// [remove]', end: '// [/remove]' }
    };
  }
};

export default CodeBlock;