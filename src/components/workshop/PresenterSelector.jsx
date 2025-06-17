import React, { useRef, useEffect } from 'react';

const capitalizePresenterName = (name) => {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const PresenterSelector = ({ presenters, onAdd, onRemove, allPresenters }) => {
    const [presenterInput, setPresenterInput] = React.useState('');
    const [presenterSuggestions, setPresenterSuggestions] = React.useState([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const suggestionsRef = useRef(null);

    const handlePresenterInputChange = (e) => {
        const inputValue = e.target.value;
        setPresenterInput(inputValue);
        
        // Filter suggestions based on input
        if (inputValue.trim()) {
            const filtered = allPresenters.filter(presenter => 
                presenter.toLowerCase().includes(inputValue.toLowerCase()) &&
                !presenters.includes(presenter)
            );
            setPresenterSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setPresenterSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        onAdd(suggestion);
        setPresenterInput('');
        setShowSuggestions(false);
    };

    const handleAddPresenter = () => {
        if (presenterInput.trim() && !presenters.includes(presenterInput.trim())) {
            // Apply auto-capitalization
            const capitalizedName = capitalizePresenterName(presenterInput.trim());
            onAdd(capitalizedName);
            setPresenterInput('');
            setShowSuggestions(false);
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div>
            <div className="relative">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={presenterInput}
                        onChange={handlePresenterInputChange}
                        placeholder="Add a presenter"
                        className="w-full p-2 border rounded"
                    />
                    <button
                        type="button"
                        onClick={handleAddPresenter}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add
                    </button>
                </div>
                
                {/* Suggestions dropdown */}
                {showSuggestions && (
                    <div 
                        ref={suggestionsRef}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto"
                    >
                        {presenterSuggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                {presenters.map((presenter) => (
                    <span
                        key={presenter}
                        className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded-full"
                    >
                        {presenter}
                        <button
                            type="button"
                            onClick={() => onRemove(presenter)}
                            className="ml-2 text-red-500 hover:text-red-700"
                        >
                            &times;
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default PresenterSelector;