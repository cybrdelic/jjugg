'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Command, Filter, X, Clock, Building, MapPin, DollarSign, Calendar, User, Briefcase } from 'lucide-react';
import { Application, ApplicationStage } from '@/types';

interface SearchSuggestion {
    id: string;
    type: 'company' | 'position' | 'location' | 'stage' | 'recent' | 'filter';
    text: string;
    subtext?: string;
    icon: React.ReactNode;
    value?: string;
}

interface EnhancedSearchProps {
    applications: Application[];
    onSearch: (query: string, filters?: any) => void;
    placeholder?: string;
    className?: string;
}

export default function EnhancedSearch({ applications, onSearch, placeholder = "Search applications...", className = "" }: EnhancedSearchProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Generate smart suggestions based on query and application data
    const suggestions = useMemo((): SearchSuggestion[] => {
        if (!query.trim()) {
            const recent = recentSearches.slice(0, 3).map((search, index) => ({
                id: `recent-${index}`,
                type: 'recent' as const,
                text: search,
                icon: <Clock size={16} />,
                value: search
            }));

            const quickFilters: SearchSuggestion[] = [
                {
                    id: 'filter-shortlisted',
                    type: 'filter',
                    text: 'Shortlisted applications',
                    subtext: 'Show only starred applications',
                    icon: <Filter size={16} />,
                    value: 'is:shortlisted'
                },
                {
                    id: 'filter-recent',
                    type: 'filter',
                    text: 'Applied this week',
                    subtext: 'Last 7 days',
                    icon: <Calendar size={16} />,
                    value: 'applied:7d'
                },
                {
                    id: 'filter-interview',
                    type: 'filter',
                    text: 'Interview stage',
                    subtext: 'Applications in interview',
                    icon: <User size={16} />,
                    value: 'stage:interview'
                }
            ];

            return [...recent, ...quickFilters];
        }

        const queryLower = query.toLowerCase();
        const results: SearchSuggestion[] = [];

        // Company suggestions
        const companies = [...new Set(applications.map(app => app.company.name))]
            .filter(name => name.toLowerCase().includes(queryLower))
            .slice(0, 3)
            .map(name => ({
                id: `company-${name}`,
                type: 'company' as const,
                text: name,
                subtext: `${applications.filter(app => app.company.name === name).length} applications`,
                icon: <Building size={16} />,
                value: `company:"${name}"`
            }));

        // Position suggestions
        const positions = [...new Set(applications.map(app => app.position))]
            .filter(position => position.toLowerCase().includes(queryLower))
            .slice(0, 3)
            .map(position => ({
                id: `position-${position}`,
                type: 'position' as const,
                text: position,
                subtext: `${applications.filter(app => app.position === position).length} applications`,
                icon: <Briefcase size={16} />,
                value: `position:"${position}"`
            }));

        // Location suggestions
        const locations = [...new Set(applications.map(app => app.location))]
            .filter(location => location.toLowerCase().includes(queryLower))
            .slice(0, 2)
            .map(location => ({
                id: `location-${location}`,
                type: 'location' as const,
                text: location,
                subtext: `${applications.filter(app => app.location === location).length} applications`,
                icon: <MapPin size={16} />,
                value: `location:"${location}"`
            }));

        // Stage suggestions
        const stages = ['applied', 'screening', 'interview', 'offer', 'rejected']
            .filter(stage => stage.toLowerCase().includes(queryLower))
            .map(stage => ({
                id: `stage-${stage}`,
                type: 'stage' as const,
                text: stage.charAt(0).toUpperCase() + stage.slice(1),
                subtext: `${applications.filter(app => app.stage === stage).length} applications`,
                icon: <Filter size={16} />,
                value: `stage:${stage}`
            }));

        // Combine all suggestions
        return [...companies, ...positions, ...locations, ...stages].slice(0, 8);
    }, [query, applications, recentSearches]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!showSuggestions) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, -1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0) {
                        handleSuggestionSelect(suggestions[selectedIndex]);
                    } else {
                        handleSearch(query);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setShowSuggestions(false);
                    setSelectedIndex(-1);
                    inputRef.current?.blur();
                    break;
            }
        };

        if (isFocused) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isFocused, showSuggestions, selectedIndex, suggestions, query]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearch = (searchQuery: string) => {
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery) {
            setRecentSearches(prev => {
                const updated = [trimmedQuery, ...prev.filter(s => s !== trimmedQuery)].slice(0, 5);
                localStorage.setItem('jjugg-recent-searches', JSON.stringify(updated));
                return updated;
            });
            onSearch(trimmedQuery);
        }
        setShowSuggestions(false);
        setSelectedIndex(-1);
    };

    const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
        if (suggestion.type === 'recent' || suggestion.value) {
            const searchValue = suggestion.value || suggestion.text;
            setQuery(searchValue);
            handleSearch(searchValue);
        }
    };

    const clearSearch = () => {
        setQuery('');
        onSearch('');
        inputRef.current?.focus();
    };

    // Load recent searches on mount
    useEffect(() => {
        const saved = localStorage.getItem('jjugg-recent-searches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse recent searches:', e);
            }
        }
    }, []);

    return (
        <div ref={searchRef} className={`enhanced-search ${className}`}>
            <div className={`search-input-container ${isFocused ? 'focused' : ''} ${query ? 'has-value' : ''}`}>
                <Search size={18} className="search-icon" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowSuggestions(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    className="search-input"
                />
                {query && (
                    <button onClick={clearSearch} className="clear-button">
                        <X size={16} />
                    </button>
                )}
                <div className="search-shortcut">
                    <Command size={10} />
                    <span>K</span>
                </div>
            </div>

            {showSuggestions && (isFocused || query) && (
                <div className="search-suggestions">
                    {suggestions.length > 0 ? (
                        <>
                            {!query && (
                                <div className="suggestions-header">
                                    <span>Recent searches & quick filters</span>
                                </div>
                            )}
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={suggestion.id}
                                    className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                                    onClick={() => handleSuggestionSelect(suggestion)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="suggestion-icon">{suggestion.icon}</div>
                                    <div className="suggestion-content">
                                        <div className="suggestion-text">{suggestion.text}</div>
                                        {suggestion.subtext && (
                                            <div className="suggestion-subtext">{suggestion.subtext}</div>
                                        )}
                                    </div>
                                    {suggestion.type === 'filter' && (
                                        <div className="suggestion-badge">Filter</div>
                                    )}
                                </div>
                            ))}
                        </>
                    ) : query ? (
                        <div className="no-suggestions">
                            <Search size={20} />
                            <span>Press Enter to search for "{query}"</span>
                        </div>
                    ) : null}
                </div>
            )}

            <style jsx>{`
        .enhanced-search {
          position: relative;
          width: 100%;
          max-width: 480px;
        }

        .search-input-container {
          position: relative;
          width: 100%;
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        :global(.dark) .search-input-container {
          background: #1f2937;
          border-color: #374151;
        }

        .search-input-container.focused {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          transition: color 0.2s ease;
          z-index: 2;
        }

        .search-input-container.focused .search-icon {
          color: #667eea;
        }

        .search-input {
          width: 100%;
          height: 52px;
          padding: 0 120px 0 52px;
          border: none;
          background: transparent;
          color: #1f2937;
          font-size: 16px;
          font-weight: 400;
          outline: none;
          transition: all 0.2s ease;
        }

        :global(.dark) .search-input {
          color: #f9fafb;
        }

        .search-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .clear-button {
          position: absolute;
          right: 80px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border: none;
          background: #f3f4f6;
          border-radius: 8px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :global(.dark) .clear-button {
          background: #4b5563;
          color: #9ca3af;
        }

        .clear-button:hover {
          background: #e5e7eb;
          color: #374151;
        }

        :global(.dark) .clear-button:hover {
          background: #6b7280;
          color: #f3f4f6;
        }

        .search-shortcut {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 8px;
          background: #f3f4f6;
          border-radius: 8px;
          color: #6b7280;
          font-size: 11px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        :global(.dark) .search-shortcut {
          background: #4b5563;
          color: #9ca3af;
        }

        .search-input-container.focused .search-shortcut {
          background: #667eea;
          color: white;
        }

        .search-suggestions {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 20px 64px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.08);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
          animation: suggestionsIn 0.2s ease;
        }

        :global(.dark) .search-suggestions {
          background: #1f2937;
          border-color: #374151;
          box-shadow: 0 20px 64px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        @keyframes suggestionsIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .suggestions-header {
          padding: 12px 16px 8px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #f3f4f6;
        }

        :global(.dark) .suggestions-header {
          color: #9ca3af;
          border-bottom-color: #374151;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.15s ease;
          border-bottom: 1px solid #f9fafb;
        }

        :global(.dark) .suggestion-item {
          border-bottom-color: #1f2937;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover,
        .suggestion-item.selected {
          background: #f8fafc;
        }

        :global(.dark) .suggestion-item:hover,
        :global(.dark) .suggestion-item.selected {
          background: #374151;
        }

        .suggestion-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        :global(.dark) .suggestion-icon {
          background: #4b5563;
          color: #9ca3af;
        }

        .suggestion-content {
          flex: 1;
          min-width: 0;
        }

        .suggestion-text {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 2px;
        }

        :global(.dark) .suggestion-text {
          color: #f9fafb;
        }

        .suggestion-subtext {
          font-size: 12px;
          color: #6b7280;
        }

        :global(.dark) .suggestion-subtext {
          color: #9ca3af;
        }

        .suggestion-badge {
          padding: 4px 8px;
          background: #ede9fe;
          color: #7c3aed;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        :global(.dark) .suggestion-badge {
          background: #581c87;
          color: #c4b5fd;
        }

        .no-suggestions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 32px 16px;
          color: #6b7280;
          text-align: center;
        }

        :global(.dark) .no-suggestions {
          color: #9ca3af;
        }

        .no-suggestions span {
          font-size: 14px;
        }
      `}</style>
        </div>
    );
}
