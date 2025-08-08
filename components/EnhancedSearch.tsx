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
  size?: 'normal' | 'compact';
  // New: allow parent to control current value and quick filters so we can render chips
  value?: string;
  quickFilters?: { stage?: string; dateRange?: string; salary?: 'with' | 'without' | 'all' };
  // New: allow parent to pass column filters so we can show chips and clear them
  columnFilters?: Record<string, string>;
}

export default function EnhancedSearch({ applications, onSearch, placeholder = "Search applications...", className = "", size = 'normal', value, quickFilters, columnFilters }: EnhancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local query with parent value
  useEffect(() => {
    if (typeof value === 'string' && value !== query) {
      setQuery(value);
    }
  }, [value]);

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

  // Parse multiple tokens into filters and return leftover free text
  const parseQueryToFilterUpdates = (q: string): { quick?: any; cols?: Record<string, string>; leftover: string } | null => {
    const text = q.trim();
    if (!text) return null;

    const tokenRegex = /(stage|applied|salary|company|position|location):("[^"]+"|[^\s]+)\b/gi;
    let match: RegExpExecArray | null;
    const quick: any = {};
    const cols: Record<string, string> = {};
    const ranges: Array<{ start: number; end: number }> = [];

    while ((match = tokenRegex.exec(text)) !== null) {
      const key = match[1].toLowerCase();
      let rawVal = match[2];
      if (rawVal.startsWith('"') && rawVal.endsWith('"')) {
        rawVal = rawVal.slice(1, -1);
      }

      switch (key) {
        case 'stage': {
          const v = rawVal.toLowerCase();
          if (['applied', 'screening', 'interview', 'offer', 'rejected'].includes(v)) quick.stage = v;
          break;
        }
        case 'applied': {
          const v = rawVal.toLowerCase();
          if (['7d', '30d', '90d', 'all'].includes(v)) quick.dateRange = v;
          break;
        }
        case 'salary': {
          const v = rawVal.toLowerCase();
          if (['with', 'without'].includes(v)) quick.salary = v;
          break;
        }
        case 'company': cols.company = rawVal; break;
        case 'position': cols.position = rawVal; break;
        case 'location': cols.location = rawVal; break;
      }

      // Track matched range to compute leftover
      ranges.push({ start: match.index, end: match.index + match[0].length });
    }

    if (ranges.length === 0 && Object.keys(cols).length === 0 && Object.keys(quick).length === 0) {
      return null;
    }

    // Remove matched ranges to find leftover free text
    let leftover = text;
    // Remove from end to start to avoid shifting indices
    ranges.sort((a, b) => b.start - a.start).forEach(r => {
      leftover = leftover.slice(0, r.start).trimEnd() + ' ' + leftover.slice(r.end).trimStart();
    });
    leftover = leftover.trim();

    return { quick, cols, leftover };
  };

  // Parse token queries into filters for the grid
  const parseQueryToFilters = (q: string) => {
    const mStage = q.match(/^stage:(applied|screening|interview|offer|rejected)$/i);
    if (mStage) {
      return { quickFilters: { ...(quickFilters || {}), stage: mStage[1].toLowerCase() } };
    }
    const mApplied = q.match(/^applied:(7d|30d|90d|all)$/i);
    if (mApplied) {
      return { quickFilters: { ...(quickFilters || {}), dateRange: mApplied[1].toLowerCase() } };
    }
    const mSalary = q.match(/^salary:(with|without)$/i);
    if (mSalary) {
      return { quickFilters: { ...(quickFilters || {}), salary: mSalary[1].toLowerCase() } };
    }
    return null;
  };

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
        // Enter is handled on the input to avoid duplicates
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

  // Ensure suggestions show while typing when focused
  useEffect(() => {
    if (isFocused) setShowSuggestions(true);
  }, [query, isFocused]);

  const handleSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();

    // First, try to parse multiple tokens and apply filters + leftover text
    const updates = parseQueryToFilterUpdates(trimmedQuery);
    if (updates) {
      const payload: any = {};
      if (Object.keys(updates.quick || {}).length) {
        payload.quickFilters = { ...(quickFilters || {}), ...updates.quick };
      }
      if (Object.keys(updates.cols || {}).length) {
        payload.columnFilters = { ...(columnFilters || {}), ...updates.cols };
      }

      onSearch(updates.leftover || '', payload);

      // Save query to recents only if there's a free-text leftover
      if (updates.leftover) {
        setRecentSearches(prev => {
          const updated = [updates.leftover, ...prev.filter(s => s !== updates.leftover)].slice(0, 5);
          localStorage.setItem('jjugg-recent-searches', JSON.stringify(updated));
          return updated;
        });
      }

      // Keep suggestions visible for rapid multi-add and refocus input
      setQuery('');
      setShowSuggestions(true);
      setSelectedIndex(-1);
      inputRef.current?.focus();
      return;
    }

    if (trimmedQuery) {
      const parsed = parseQueryToFilters(trimmedQuery);
      if (parsed) {
        onSearch('', parsed);
        setShowSuggestions(true);
        setSelectedIndex(-1);
        inputRef.current?.focus();
        setQuery('');
        return;
      }
      setRecentSearches(prev => {
        const updated = [trimmedQuery, ...prev.filter(s => s !== trimmedQuery)].slice(0, 5);
        localStorage.setItem('jjugg-recent-searches', JSON.stringify(updated));
        return updated;
      });
      onSearch(trimmedQuery);
    } else {
      // If empty enter, clear current search
      onSearch('');
    }
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (!suggestion) return;

    // Column-filter suggestions
    if (suggestion.type === 'company' || suggestion.type === 'position' || suggestion.type === 'location') {
      const key = suggestion.type === 'company' ? 'company' : suggestion.type;
      onSearch(query, { columnFilters: { ...(columnFilters || {}), [key]: suggestion.text } });
      setQuery('');
      setShowSuggestions(true);
      setSelectedIndex(-1);
      inputRef.current?.focus();
      return;
    }

    const searchValue = suggestion.value || suggestion.text;
    const updates = parseQueryToFilterUpdates(searchValue);
    if (updates) {
      const payload: any = {};
      if (Object.keys(updates.quick || {}).length) payload.quickFilters = { ...(quickFilters || {}), ...updates.quick };
      if (Object.keys(updates.cols || {}).length) payload.columnFilters = { ...(columnFilters || {}), ...updates.cols };
      onSearch('', payload);
      setQuery('');
      setShowSuggestions(true);
      setSelectedIndex(-1);
      inputRef.current?.focus();
      return;
    }

    // Fallback to text search
    setQuery(searchValue);
    handleSearch(searchValue);
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

  // Build filter chips from quickFilters prop
  const filterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; kind: 'quick' | 'column' }> = [];
    // Quick filters
    if (quickFilters?.stage && quickFilters.stage !== 'all') {
      chips.push({ key: 'stage', label: `Stage: ${quickFilters.stage.charAt(0).toUpperCase() + quickFilters.stage.slice(1)}`, kind: 'quick' });
    }
    if (quickFilters?.dateRange && quickFilters.dateRange !== 'all') {
      const label = quickFilters.dateRange === '7d'
        ? 'Applied: Last 7 days'
        : quickFilters.dateRange === '30d'
          ? 'Applied: Last 30 days'
          : quickFilters.dateRange === '90d'
            ? 'Applied: Last 90 days'
            : 'Applied: Custom';
      chips.push({ key: 'dateRange', label, kind: 'quick' });
    }
    if (quickFilters?.salary && quickFilters.salary !== 'all') {
      chips.push({ key: 'salary', label: quickFilters.salary === 'with' ? 'Salary: With value' : 'Salary: Without value', kind: 'quick' });
    }

    // Column filters
    const col = columnFilters || {};
    if (col.company) chips.push({ key: 'company', label: `Company: ${col.company}`, kind: 'column' });
    if (col.position) chips.push({ key: 'position', label: `Position: ${col.position}`, kind: 'column' });
    if (col.location) chips.push({ key: 'location', label: `Location: ${col.location}`, kind: 'column' });
    if (col.stage) chips.push({ key: 'stageColumn', label: `Stage: ${col.stage}`, kind: 'column' });

    return chips;
  }, [quickFilters, columnFilters]);

  const handleRemoveChip = (key: string) => {
    // Determine whether this is a quick or column chip by checking presence
    if (key === 'stage' || key === 'dateRange' || key === 'salary') {
      const resetVal = key === 'salary' ? 'all' : 'all';
      onSearch(query, { quickFilters: { [key]: resetVal } });
      return;
    }

    // Column chips
    const updatedCols = { ...(columnFilters || {}) } as Record<string, string>;
    if (key === 'stageColumn') {
      delete updatedCols['stage'];
    } else {
      delete updatedCols[key];
    }
    onSearch(query, { columnFilters: updatedCols });
  };

  const handleClearAllChips = () => {
    onSearch(query, { quickFilters: { stage: 'all', dateRange: 'all', salary: 'all' }, columnFilters: {} });
  };

  return (
    <div ref={searchRef} className={`enhanced-search ${size} ${className}`}>
      <div className={`search-input-container ${size} ${isFocused ? 'focused' : ''} ${query ? 'has-value' : ''}`}>
        <div className="content-grid">
          <div className="left-icon" aria-hidden>
            <Search size={18} className="search-icon" />
          </div>

          {/* Chips + Input */}
          <div className="center-content">
            {filterChips.length > 0 && (
              <div className="active-filters" aria-label="Active filters">
                {filterChips.map(chip => (
                  <div key={chip.key} className="filter-chip">
                    <span className="chip-text">{chip.label}</span>
                    <button
                      type="button"
                      className="chip-remove"
                      aria-label={`Remove ${chip.label}`}
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveChip(chip.key); }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {/* Always show Clear filters when any chip exists */}
                <button type="button" className="chip-clear-all" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleClearAllChips(); }}>
                  Clear filters
                </button>
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!showSuggestions) setShowSuggestions(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSuggestionSelect(suggestions[selectedIndex]);
                  } else {
                    handleSearch(query);
                  }
                } else if (e.key === 'Tab' && showSuggestions && selectedIndex >= 0 && suggestions[selectedIndex]) {
                  e.preventDefault();
                  handleSuggestionSelect(suggestions[selectedIndex]);
                } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'backspace') {
                  e.preventDefault();
                  if (filterChips.length > 0) handleClearAllChips();
                } else if (e.key === 'Backspace' && query === '' && filterChips.length > 0) {
                  e.preventDefault();
                  const last = filterChips[filterChips.length - 1];
                  handleRemoveChip(last.key);
                } else if (e.key === 'Escape') {
                  if (query) {
                    setQuery('');
                  } else if (filterChips.length > 0) {
                    handleClearAllChips();
                  } else {
                    setShowSuggestions(false);
                    setSelectedIndex(-1);
                  }
                }
              }}
              className="search-input"
            />
          </div>

          {query ? (
            <button onMouseDown={(e) => { e.preventDefault(); clearSearch(); }} className="clear-button" aria-label="Clear search">
              <X size={16} />
            </button>
          ) : (
            <div />
          )}

          <div className="search-shortcut" title="Cmd/Ctrl + K">
            <Command size={10} />
            <span>K</span>
          </div>
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
                  onMouseDown={(e) => { e.preventDefault(); handleSuggestionSelect(suggestion); }}
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
        .enhanced-search { position: relative; width: 100%; max-width: 680px; }
        .enhanced-search.compact { max-width: none; }

        .search-input-container {
          width: 100%;
          background: var(--glass-card-bg, var(--card));
          border: 2px solid var(--border-thin);
          border-radius: 14px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .search-input-container.compact { border-radius: 10px; border-width: 1px; }
        .search-input-container.focused { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(var(--accent-primary-rgb), 0.08); }

        .content-grid {
          display: grid;
          grid-template-columns: 44px 1fr auto auto;
          align-items: center;
          gap: 8px;
          padding: 8px 10px 8px 0;
        }

        .left-icon { display: flex; align-items: center; justify-content: center; height: 100%; }
        .search-icon { color: var(--text-tertiary); }

        .center-content { display: flex; flex-direction: column; gap: 6px; min-height: 44px; padding: 4px 0; }

        .active-filters { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

        .filter-chip {
          display: inline-flex; align-items: center; gap: 6px;
          height: 26px; padding: 0 8px 0 10px;
          background: var(--glass-accent-bg, rgba(var(--accent-primary-rgb, 99,102,241), 0.12));
          color: var(--glass-accent-text, var(--text-primary));
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 12px;
          white-space: nowrap;
        }
        .chip-text { opacity: 0.95; }
        .chip-remove { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 999px; color: var(--text-secondary); border: none; background: transparent; cursor: pointer; }
        .chip-remove:hover { background: var(--glass-hover-bg, var(--hover-bg)); color: var(--text-primary); }
        .chip-clear-all { height: 26px; padding: 0 10px; border-radius: 999px; border: none; background: var(--glass-button-bg, var(--surface)); color: var(--text-secondary); font-size: 12px; cursor: pointer; }
        .chip-clear-all:hover { background: var(--glass-hover-bg, var(--hover-bg)); color: var(--text-primary); }

        .search-input { width: 100%; height: 40px; border: none; background: transparent; color: var(--text-primary); font-size: 15px; outline: none; }
        .search-input::placeholder { color: var(--text-tertiary); }

        .clear-button { width: 32px; height: 32px; border: none; background: var(--glass-button-bg, var(--surface)); border-radius: 8px; color: var(--text-secondary); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
        .clear-button:hover { background: var(--glass-hover-bg, var(--hover-bg)); color: var(--text-primary); }

        .search-shortcut { display: inline-flex; align-items: center; gap: 4px; padding: 6px 8px; background: var(--glass-button-bg, var(--surface)); border-radius: 8px; color: var(--text-secondary); font-size: 11px; font-weight: 600; }
        .search-input-container.focused .search-shortcut { background: var(--primary); color: white; }

        .search-suggestions {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: var(--glass-bg, var(--surface)); border: 1px solid var(--border); border-radius: 12px;
          box-shadow: var(--shadow-lg); padding: 8px; z-index: 3000; animation: suggestionsIn 160ms ease-out;
        }
        @keyframes suggestionsIn { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .suggestions-header { padding: 12px 16px 8px; font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-divider); }
        .suggestion-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; transition: all 0.15s ease; border-bottom: 1px solid var(--border-divider); }
        .suggestion-item:last-child { border-bottom: none; }
        .suggestion-item:hover, .suggestion-item.selected { background: var(--glass-hover-bg, var(--hover-bg)); }
        .suggestion-icon { flex-shrink: 0; width: 32px; height: 32px; background: var(--glass-button-bg, var(--surface)); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); }
        .suggestion-content { flex: 1; min-width: 0; }
        .suggestion-text { font-size: 14px; font-weight: 500; color: var(--text-primary); margin-bottom: 2px; }
        .suggestion-subtext { font-size: 12px; color: var(--text-secondary); }
        .suggestion-badge { padding: 4px 8px; background: var(--glass-accent-bg, var(--accent-purple)); color: var(--glass-accent-text, white); border-radius: 6px; font-size: 11px; font-weight: 600; }
        .no-suggestions { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 16px; color: var(--text-secondary); text-align: center; }
        .no-suggestions span { font-size: 14px; }
      `}</style>
    </div>
  );
}
