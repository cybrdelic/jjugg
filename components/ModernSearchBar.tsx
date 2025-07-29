'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Filter, Command, Clock, Building, MapPin, Briefcase, Calendar, Star } from 'lucide-react';
import { Application } from '@/types';

interface SearchSuggestion {
    id: string;
    type: 'company' | 'position' | 'location' | 'stage' | 'recent' | 'filter';
    text: string;
    subtext?: string;
    icon: React.ReactNode;
    value?: string;
}

interface ModernSearchBarProps {
    applications: Application[];
    onSearch: (query: string, filters?: any) => void;
    placeholder?: string;
    className?: string;
}

export default function ModernSearchBar({
    applications,
    onSearch,
    placeholder = "Search applications...",
    className = ""
}: ModernSearchBarProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Generate smart suggestions
    const suggestions = useMemo((): SearchSuggestion[] => {
        if (!query.trim()) {
            const recent = recentSearches.slice(0, 2).map((search, index) => ({
                id: `recent-${index}`,
                type: 'recent' as const,
                text: search,
                icon: <Clock size={14} />,
                value: search
            }));

            const quickFilters: SearchSuggestion[] = [
                {
                    id: 'filter-interview',
                    type: 'filter',
                    text: 'Interview stage',
                    subtext: 'Show applications in interview',
                    icon: <Star size={14} />,
                    value: 'stage:interview'
                },
                {
                    id: 'filter-recent',
                    type: 'filter',
                    text: 'Applied this week',
                    subtext: 'Last 7 days',
                    icon: <Calendar size={14} />,
                    value: 'applied:7d'
                }
            ];

            return [...recent, ...quickFilters];
        }

        const queryLower = query.toLowerCase();
        const results: SearchSuggestion[] = [];

        // Company suggestions
        const companies = [...new Set(applications.map(app => app.company.name))]
            .filter(name => name.toLowerCase().includes(queryLower))
            .slice(0, 2)
            .map(name => ({
                id: `company-${name}`,
                type: 'company' as const,
                text: name,
                subtext: `${applications.filter(app => app.company.name === name).length} apps`,
                icon: <Building size={14} />,
                value: `company:"${name}"`
            }));

        // Position suggestions
        const positions = [...new Set(applications.map(app => app.position))]
            .filter(position => position.toLowerCase().includes(queryLower))
            .slice(0, 2)
            .map(position => ({
                id: `position-${position}`,
                type: 'position' as const,
                text: position,
                subtext: `${applications.filter(app => app.position === position).length} apps`,
                icon: <Briefcase size={14} />,
                value: `position:"${position}"`
            }));

        return [...companies, ...positions].slice(0, 4);
    }, [query, applications, recentSearches]);

    // Keyboard navigation
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

    // Global keyboard shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setShowSuggestions(true);
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // Load recent searches
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
        const searchValue = suggestion.value || suggestion.text;
        setQuery(searchValue);
        handleSearch(searchValue);
    };

    const clearSearch = () => {
        setQuery('');
        onSearch('');
        inputRef.current?.focus();
    };

    return (
        <div ref={searchRef} className={`modern-search-bar ${className}`}>
            <div className={`search-container ${isFocused ? 'focused' : ''}`}>
                <Search size={16} className="search-icon" />
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
                    onBlur={() => {
                        setTimeout(() => setIsFocused(false), 150);
                    }}
                    className="search-input"
                />
                {query && (
                    <button onClick={clearSearch} className="clear-btn">
                        <X size={14} />
                    </button>
                )}
                <div className="search-shortcut">
                    <Command size={10} />
                    <span>K</span>
                </div>
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                    {!query && (
                        <div className="suggestions-header">
                            <span>Recent & Quick filters</span>
                        </div>
                    )}
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion.id}
                            className={`suggestion ${index === selectedIndex ? 'selected' : ''}`}
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
                                <div className="filter-badge">Filter</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .modern-search-bar {
                    position: relative;
                    width: 100%;
                    max-width: 400px;
                }

                .search-container {
                    display: flex;
                    align-items: center;
                    height: var(--search-height, 42px);
                    background: var(--glass-bg);
                    backdrop-filter: blur(var(--blur-amount));
                    -webkit-backdrop-filter: blur(var(--blur-amount));
                    border: 1px solid var(--border-thin);
                    border-radius: var(--input-border-radius, 8px);
                    transition: all var(--transition-normal) var(--easing-standard);
                    padding: 0 12px;
                    gap: 10px;
                    width: 100%;
                    box-sizing: border-box;
                    font-weight: var(--font-weight-secondary, 400);
                    letter-spacing: var(--letter-spacing, -0.01em);
                }

                .search-container:hover {
                    border-color: var(--border-hover);
                    background: var(--glass-hover-bg);
                }

                .search-container.focused {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.15);
                    background: var(--glass-card-bg);
                }

                .search-icon {
                    color: var(--text-tertiary);
                    transition: color 0.2s ease;
                    flex-shrink: 0;
                }

                .search-container.focused .search-icon {
                    color: var(--primary);
                }

                .search-input {
                    flex: 1;
                    height: 100%;
                    border: none;
                    background: transparent;
                    color: var(--text-primary);
                    font-size: 14px;
                    outline: none;
                    min-width: 0;
                    font-family: var(--font-family, inherit);
                    font-weight: var(--font-weight-secondary, 400);
                    letter-spacing: var(--letter-spacing, -0.01em);
                    text-transform: var(--text-transform, none);
                }

                .search-input::placeholder {
                    color: var(--text-tertiary);
                }

                .clear-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 20px;
                    height: 20px;
                    border: none;
                    background: var(--glass-button-bg);
                    border-radius: var(--button-border-radius, 4px);
                    color: var(--text-tertiary);
                    cursor: pointer;
                    transition: all var(--transition-normal) ease;
                    flex-shrink: 0;
                    backdrop-filter: blur(var(--blur-amount));
                    -webkit-backdrop-filter: blur(var(--blur-amount));
                }

                .clear-btn:hover {
                    background: var(--active-bg);
                    color: var(--text-secondary);
                }

                .search-shortcut {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2px;
                    padding: 3px 6px;
                    background: var(--hover-bg);
                    border-radius: 4px;
                    color: var(--text-tertiary);
                    font-size: 10px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                    height: 18px;
                    min-width: 24px;
                }

                .search-container.focused .search-shortcut {
                    background: var(--primary);
                    color: white;
                }

                .suggestions-dropdown {
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 0;
                    right: 0;
                    background: var(--glass-card-bg);
                    border: 1px solid var(--border-thin);
                    border-radius: 8px;
                    box-shadow: var(--shadow-lg);
                    max-height: 320px;
                    overflow-y: auto;
                    z-index: 1000;
                    backdrop-filter: blur(var(--blur-amount));
                    -webkit-backdrop-filter: blur(var(--blur-amount));
                    animation: slideIn 0.15s ease-out;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-4px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .suggestions-header {
                    padding: 10px 14px 8px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid var(--border-divider);
                    background: var(--glass-bg);
                }

                .suggestion {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                    border-bottom: 1px solid var(--border-divider);
                }

                .suggestion:last-child {
                    border-bottom: none;
                }

                .suggestion:hover,
                .suggestion.selected {
                    background: var(--hover-bg);
                }

                .suggestion-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 26px;
                    height: 26px;
                    background: var(--glass-bg);
                    border-radius: 6px;
                    color: var(--text-tertiary);
                    flex-shrink: 0;
                }

                .suggestion-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .suggestion-text {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-primary);
                    margin-bottom: 2px;
                    line-height: 1.3;
                }

                .suggestion-subtext {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    line-height: 1.2;
                }

                .filter-badge {
                    padding: 3px 7px;
                    background: var(--primary);
                    color: white;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    flex-shrink: 0;
                    line-height: 1;
                }

                @media (max-width: 768px) {
                    .modern-search-bar {
                        max-width: none;
                    }

                    .search-container {
                        height: 44px;
                        gap: 12px;
                        padding: 0 14px;
                    }

                    .search-input {
                        font-size: 16px;
                    }

                    .search-shortcut {
                        display: none;
                    }

                    .clear-btn {
                        width: 22px;
                        height: 22px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .search-container,
                    .suggestion,
                    .clear-btn,
                    .suggestions-dropdown {
                        transition: none;
                    }

                    .suggestions-dropdown {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
}
