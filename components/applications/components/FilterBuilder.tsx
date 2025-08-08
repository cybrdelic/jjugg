/**
 * Enhanced Filter Builder Component
 * Provides an intuitive interface for building complex filters
 */

'use client';
import React, { useState, useEffect } from 'react';
import { Plus, X, Search, Filter, ChevronDown } from 'lucide-react';

interface FilterRule {
    id: string;
    field: string;
    operator: string;
    value: string;
}

interface FilterBuilderProps {
    isVisible: boolean;
    onClose: () => void;
    onApplyFilters: (filters: Record<string, string>) => void;
    currentFilters: Record<string, string>;
    availableFields: Array<{
        key: string;
        label: string;
        type: 'text' | 'select' | 'date' | 'number';
        options?: string[];
    }>;
}

export function FilterBuilder({
    isVisible,
    onClose,
    onApplyFilters,
    currentFilters,
    availableFields
}: FilterBuilderProps) {
    const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Initialize filter rules from current filters
    useEffect(() => {
        if (isVisible && Object.keys(currentFilters).length > 0) {
            const rules = Object.entries(currentFilters)
                .filter(([key, value]) => value)
                .map(([key, value]) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    field: key,
                    operator: 'equals',
                    value: value
                }));
            setFilterRules(rules);
        }
    }, [isVisible, currentFilters]);

    const addFilterRule = () => {
        const newRule: FilterRule = {
            id: Math.random().toString(36).substr(2, 9),
            field: availableFields[0]?.key || '',
            operator: 'equals',
            value: ''
        };
        setFilterRules([...filterRules, newRule]);
    };

    const removeFilterRule = (ruleId: string) => {
        setFilterRules(filterRules.filter(rule => rule.id !== ruleId));
    };

    const updateFilterRule = (ruleId: string, field: keyof FilterRule, value: string) => {
        setFilterRules(filterRules.map(rule =>
            rule.id === ruleId ? { ...rule, [field]: value } : rule
        ));
    };

    const applyFilters = () => {
        const filters: Record<string, string> = {};
        filterRules.forEach(rule => {
            if (rule.field && rule.value) {
                filters[rule.field] = rule.value;
            }
        });
        onApplyFilters(filters);
        onClose();
    };

    const clearAllFilters = () => {
        setFilterRules([]);
        onApplyFilters({});
        onClose();
    };

    const filteredFields = availableFields.filter(field =>
        field.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isVisible) return null;

    return (
        <div className="filter-builder-overlay">
            <div className="filter-builder">
                <div className="filter-builder-header">
                    <div className="header-title">
                        <Filter size={18} />
                        <h3>Advanced Filters</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="filter-builder-body">
                    <div className="quick-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search fields..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-rules">
                        {filterRules.length === 0 ? (
                            <div className="empty-state">
                                <Filter size={32} className="empty-icon" />
                                <p>No filters applied</p>
                                <p className="empty-subtitle">Add a filter rule to get started</p>
                            </div>
                        ) : (
                            filterRules.map((rule) => (
                                <div key={rule.id} className="filter-rule">
                                    <select
                                        value={rule.field}
                                        onChange={(e) => updateFilterRule(rule.id, 'field', e.target.value)}
                                        className="field-select"
                                    >
                                        <option value="">Select field...</option>
                                        {filteredFields.map(field => (
                                            <option key={field.key} value={field.key}>
                                                {field.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={rule.operator}
                                        onChange={(e) => updateFilterRule(rule.id, 'operator', e.target.value)}
                                        className="operator-select"
                                    >
                                        <option value="equals">equals</option>
                                        <option value="contains">contains</option>
                                        <option value="starts-with">starts with</option>
                                        <option value="greater-than">greater than</option>
                                        <option value="less-than">less than</option>
                                    </select>

                                    <input
                                        type="text"
                                        value={rule.value}
                                        onChange={(e) => updateFilterRule(rule.id, 'value', e.target.value)}
                                        placeholder="Enter value..."
                                        className="value-input"
                                    />

                                    <button
                                        onClick={() => removeFilterRule(rule.id)}
                                        className="remove-rule-btn"
                                        title="Remove this filter rule"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={addFilterRule}
                        className="add-rule-btn"
                    >
                        <Plus size={16} />
                        Add Filter Rule
                    </button>
                </div>

                <div className="filter-builder-footer">
                    <div className="filter-count">
                        {filterRules.filter(rule => rule.field && rule.value).length} active filter{filterRules.filter(rule => rule.field && rule.value).length !== 1 ? 's' : ''}
                    </div>
                    <div className="footer-actions">
                        <button onClick={clearAllFilters} className="clear-btn">
                            Clear All
                        </button>
                        <button onClick={applyFilters} className="apply-btn">
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .filter-builder-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(4px);
        }

        .filter-builder {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.2s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .filter-builder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          border-bottom: 1px solid var(--border);
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .header-title h3 {
          margin: 0;
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: var(--space-1);
          border-radius: var(--radius-md);
          transition: all var(--duration-150) var(--ease-out);
        }

        .close-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .filter-builder-body {
          padding: var(--space-6);
          flex: 1;
          overflow-y: auto;
        }

        .quick-search {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
        }

        .search-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: var(--text-sm);
          color: var(--text-primary);
        }

        .search-input::placeholder {
          color: var(--text-tertiary);
        }

        .filter-rules {
          margin-bottom: var(--space-4);
          min-height: 200px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
          text-align: center;
          color: var(--text-secondary);
        }

        .empty-icon {
          opacity: 0.3;
          margin-bottom: var(--space-3);
        }

        .empty-subtitle {
          font-size: var(--text-sm);
          opacity: 0.7;
          margin-top: var(--space-1);
        }

        .filter-rule {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto;
          gap: var(--space-2);
          align-items: center;
          padding: var(--space-3);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-2);
          transition: all var(--duration-150) var(--ease-out);
        }

        .filter-rule:hover {
          border-color: var(--border-strong);
          box-shadow: var(--shadow-sm);
        }

        .field-select,
        .operator-select {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--background);
          color: var(--text-primary);
          font-size: var(--text-sm);
          cursor: pointer;
          min-width: 120px;
        }

        .value-input {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--background);
          color: var(--text-primary);
          font-size: var(--text-sm);
          flex: 1;
        }

        .value-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
        }

        .remove-rule-btn {
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: var(--space-1);
          border-radius: var(--radius-md);
          transition: all var(--duration-150) var(--ease-out);
        }

        .remove-rule-btn:hover {
          background: var(--error-bg);
          color: var(--error);
        }

        .add-rule-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: var(--surface);
          border: 1px dashed var(--border);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          width: 100%;
          transition: all var(--duration-150) var(--ease-out);
        }

        .add-rule-btn:hover {
          background: var(--primary-bg);
          border-color: var(--primary);
          color: var(--primary);
        }

        .filter-builder-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          border-top: 1px solid var(--border);
          background: var(--surface);
        }

        .filter-count {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-weight: var(--font-medium);
        }

        .footer-actions {
          display: flex;
          gap: var(--space-2);
        }

        .clear-btn,
        .apply-btn {
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all var(--duration-150) var(--ease-out);
        }

        .clear-btn {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }

        .clear-btn:hover {
          background: var(--error-bg);
          border-color: var(--error);
          color: var(--error);
        }

        .apply-btn {
          background: var(--primary);
          border: 1px solid var(--primary);
          color: white;
        }

        .apply-btn:hover {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        @media (max-width: 768px) {
          .filter-builder {
            width: 95%;
            margin: var(--space-4);
          }

          .filter-rule {
            grid-template-columns: 1fr;
            gap: var(--space-2);
          }

          .footer-actions {
            flex-direction: column;
          }
        }
      `}</style>
        </div>
    );
}
