'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Filter, X, Check, ChevronDown,
  SlidersHorizontal, Calendar, MapPin, Building,
  DollarSign, Briefcase, Clock
} from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  options: FilterOption[];
}

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, string[]>) => void;
  filterGroups?: FilterGroup[];
  placeholder?: string;
  className?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilter,
  filterGroups = defaultFilterGroups,
  placeholder = 'Search applications...',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
        setActiveGroupId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Update active filter count
  useEffect(() => {
    let count = 0;
    Object.values(selectedFilters).forEach(values => {
      count += values.length;
    });
    setActiveFilterCount(count);
  }, [selectedFilters]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };
  
  // Handle filter selection
  const handleFilterToggle = (groupId: string, optionValue: string) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (!newFilters[groupId]) {
        newFilters[groupId] = [];
      }
      
      const index = newFilters[groupId].indexOf(optionValue);
      
      if (index > -1) {
        newFilters[groupId] = newFilters[groupId].filter(v => v !== optionValue);
        if (newFilters[groupId].length === 0) {
          delete newFilters[groupId];
        }
      } else {
        newFilters[groupId] = [...newFilters[groupId], optionValue];
      }
      
      onFilter(newFilters);
      return newFilters;
    });
  };
  
  // Clear search input
  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedFilters({});
    onFilter({});
  };
  
  // Check if filter option is selected
  const isFilterSelected = (groupId: string, optionValue: string): boolean => {
    return selectedFilters[groupId]?.includes(optionValue) || false;
  };
  
  // Get the active group
  const getActiveGroup = (): FilterGroup | undefined => {
    return filterGroups.find(group => group.id === activeGroupId);
  };
  
  return (
    <div className={`search-filter-container ${className}`}>
      <div className="search-input-container">
        <Search className="search-icon" size={18} />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
        {searchQuery && (
          <button className="clear-button" onClick={clearSearch}>
            <X size={16} />
          </button>
        )}
      </div>
      
      <div ref={filterRef} className="filter-container">
        <button 
          className={`filter-button ${isFilterOpen ? 'active' : ''} ${activeFilterCount > 0 ? 'has-filters' : ''}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter size={18} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="filter-count">{activeFilterCount}</span>
          )}
          <ChevronDown size={14} className="dropdown-arrow" />
        </button>
        
        {isFilterOpen && (
          <div className="filter-dropdown">
            <div className="filter-groups">
              {filterGroups.map(group => (
                <button 
                  key={group.id}
                  className={`filter-group-button ${activeGroupId === group.id ? 'active' : ''} ${selectedFilters[group.id]?.length ? 'has-selection' : ''}`}
                  onClick={() => setActiveGroupId(prev => prev === group.id ? null : group.id)}
                >
                  {group.icon}
                  <span>{group.label}</span>
                  {selectedFilters[group.id]?.length > 0 && (
                    <span className="option-count">{selectedFilters[group.id].length}</span>
                  )}
                  <ChevronDown size={14} className="group-arrow" />
                </button>
              ))}
            </div>
            
            {activeGroupId && getActiveGroup() && (
              <div className="filter-options">
                <div className="options-header">
                  <h4>{getActiveGroup()?.label}</h4>
                  {selectedFilters[activeGroupId]?.length > 0 && (
                    <button 
                      className="clear-group"
                      onClick={() => {
                        const newFilters = { ...selectedFilters };
                        delete newFilters[activeGroupId];
                        setSelectedFilters(newFilters);
                        onFilter(newFilters);
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="options-list">
                  {getActiveGroup()?.options.map(option => (
                    <button
                      key={option.id}
                      className={`option-button ${isFilterSelected(activeGroupId, option.value) ? 'selected' : ''}`}
                      onClick={() => handleFilterToggle(activeGroupId, option.value)}
                    >
                      <div className="checkbox">
                        {isFilterSelected(activeGroupId, option.value) && (
                          <Check size={12} />
                        )}
                      </div>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="filter-actions">
              <button 
                className="apply-filters"
                onClick={() => {
                  setIsFilterOpen(false);
                  setActiveGroupId(null);
                }}
              >
                Apply Filters
              </button>
              
              {activeFilterCount > 0 && (
                <button 
                  className="reset-filters"
                  onClick={resetFilters}
                >
                  Reset All
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <button className="advanced-filter-button">
        <SlidersHorizontal size={18} />
      </button>
      
      <style jsx>{`
        .search-filter-container {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          position: relative;
        }
        
        .search-input-container {
          position: relative;
          flex: 1;
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          transition: color 0.2s var(--easing-standard);
        }
        
        .search-input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 40px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          background: var(--glass-bg);
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.2s var(--easing-standard);
        }
        
        .search-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.1);
        }
        
        .search-input:focus + .search-icon {
          color: var(--accent-primary);
        }
        
        .clear-button {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--hover-bg);
          border: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          cursor: pointer;
          opacity: 0.7;
          transition: all 0.2s var(--easing-standard);
        }
        
        .clear-button:hover {
          opacity: 1;
          background: var(--active-bg);
          color: var(--text-primary);
        }
        
        .filter-container {
          position: relative;
        }
        
        .filter-button {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 14px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }
        
        .filter-button:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        .filter-button.active {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: rgba(var(--accent-primary-rgb), 0.05);
        }
        
        .filter-button.has-filters {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
        
        .filter-count {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          background: var(--accent-primary);
          color: white;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .dropdown-arrow {
          margin-left: 2px;
          transition: transform 0.2s var(--easing-standard);
        }
        
        .filter-button.active .dropdown-arrow {
          transform: rotateX(180deg);
        }
        
        .filter-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 360px;
          background: var(--glass-card-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          animation: fadeInDown 0.2s var(--easing-standard);
          display: flex;
          flex-direction: column;
        }
        
        .filter-groups {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 16px;
          border-bottom: 1px solid var(--border-divider);
        }
        
        .filter-group-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }
        
        .filter-group-button:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        .filter-group-button.active {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          background: rgba(var(--accent-primary-rgb), 0.05);
        }
        
        .filter-group-button.has-selection {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
        
        .option-count {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          background: var(--accent-primary);
          color: white;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .group-arrow {
          transition: transform 0.2s var(--easing-standard);
        }
        
        .filter-group-button.active .group-arrow {
          transform: rotateX(180deg);
        }
        
        .filter-options {
          padding: 16px;
        }
        
        .options-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .options-header h4 {
          margin: 0;
          font-size: 15px;
          color: var(--text-primary);
        }
        
        .clear-group {
          background: transparent;
          border: none;
          color: var(--accent-primary);
          font-size: 13px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: var(--border-radius);
          transition: all 0.2s var(--easing-standard);
        }
        
        .clear-group:hover {
          background: rgba(var(--accent-primary-rgb), 0.1);
        }
        
        .options-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .option-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: transparent;
          border: none;
          border-radius: var(--border-radius);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }
        
        .option-button:hover {
          background: var(--hover-bg);
        }
        
        .option-button.selected {
          background: rgba(var(--accent-primary-rgb), 0.1);
        }
        
        .checkbox {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1px solid var(--border-thin);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.2s var(--easing-standard);
          flex-shrink: 0;
        }
        
        .option-button:hover .checkbox {
          border-color: var(--accent-primary);
        }
        
        .option-button.selected .checkbox {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
        }
        
        .filter-actions {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          border-top: 1px solid var(--border-divider);
        }
        
        .apply-filters {
          padding: 8px 16px;
          background: var(--accent-primary);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }
        
        .apply-filters:hover {
          background: color-mix(in srgb, var(--accent-primary), black 10%);
          transform: translateY(-1px);
        }
        
        .reset-filters {
          padding: 8px 16px;
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }
        
        .reset-filters:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        .advanced-filter-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: var(--glass-bg);
          border: 1px solid var(--border-thin);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
        }
        
        .advanced-filter-button:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .filter-dropdown {
            width: 300px;
            right: -100px;
          }
          
          .filter-button span {
            display: none;
          }
          
          .advanced-filter-button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

// Default filter groups 
const defaultFilterGroups: FilterGroup[] = [
  {
    id: 'stages',
    label: 'Application Stage',
    icon: <Clock size={16} />,
    options: [
      { id: 'stage-1', label: 'Applied', value: 'applied' },
      { id: 'stage-2', label: 'Screening', value: 'screening' },
      { id: 'stage-3', label: 'Interview', value: 'interview' },
      { id: 'stage-4', label: 'Offer', value: 'offer' },
      { id: 'stage-5', label: 'Rejected', value: 'rejected' },
    ]
  },
  {
    id: 'companies',
    label: 'Companies',
    icon: <Building size={16} />,
    options: [
      { id: 'company-1', label: 'Google', value: 'Google' },
      { id: 'company-2', label: 'Microsoft', value: 'Microsoft' },
      { id: 'company-3', label: 'Apple', value: 'Apple' },
      { id: 'company-4', label: 'Amazon', value: 'Amazon' },
      { id: 'company-5', label: 'Facebook', value: 'Facebook' },
      { id: 'company-6', label: 'Netflix', value: 'Netflix' },
    ]
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: <MapPin size={16} />,
    options: [
      { id: 'location-1', label: 'Remote', value: 'remote' },
      { id: 'location-2', label: 'San Francisco', value: 'San Francisco' },
      { id: 'location-3', label: 'New York', value: 'New York' },
      { id: 'location-4', label: 'Seattle', value: 'Seattle' },
      { id: 'location-5', label: 'Austin', value: 'Austin' },
    ]
  },
  {
    id: 'date',
    label: 'Date Applied',
    icon: <Calendar size={16} />,
    options: [
      { id: 'date-1', label: 'Last 7 days', value: 'last7days' },
      { id: 'date-2', label: 'Last 30 days', value: 'last30days' },
      { id: 'date-3', label: 'Last 3 months', value: 'last3months' },
      { id: 'date-4', label: 'Last 6 months', value: 'last6months' },
      { id: 'date-5', label: 'Last year', value: 'lastyear' },
    ]
  },
  {
    id: 'salary',
    label: 'Salary Range',
    icon: <DollarSign size={16} />,
    options: [
      { id: 'salary-1', label: 'Under $50k', value: 'under50k' },
      { id: 'salary-2', label: '$50k - $100k', value: '50k-100k' },
      { id: 'salary-3', label: '$100k - $150k', value: '100k-150k' },
      { id: 'salary-4', label: '$150k - $200k', value: '150k-200k' },
      { id: 'salary-5', label: 'Over $200k', value: 'over200k' },
    ]
  },
  {
    id: 'industry',
    label: 'Industry',
    icon: <Briefcase size={16} />,
    options: [
      { id: 'industry-1', label: 'Technology', value: 'Technology' },
      { id: 'industry-2', label: 'Finance', value: 'Finance' },
      { id: 'industry-3', label: 'Healthcare', value: 'Healthcare' },
      { id: 'industry-4', label: 'E-commerce', value: 'E-commerce' },
      { id: 'industry-5', label: 'Entertainment', value: 'Entertainment' },
    ]
  },
];

export default SearchFilter;