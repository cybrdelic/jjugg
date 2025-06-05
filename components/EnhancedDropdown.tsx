'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { ChevronDown, Check, X, ChevronsUpDown, Search } from 'lucide-react';
import Portal from './Portal';

// Dropdown placement types
type DropdownPlacement = 
  | 'bottom-start' 
  | 'bottom-end' 
  | 'bottom-center' 
  | 'top-start' 
  | 'top-end' 
  | 'top-center';

// Position interface for dropdown positioning
interface Position {
  top: number;
  left: number;
  transformOrigin: string;
}

// Option type for selectable items in dropdown menus
export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  group?: string;
}

// Generic dropdown props
interface DropdownBaseProps {
  placement?: DropdownPlacement;
  width?: string | number;
  maxHeight?: string | number;
  className?: string;
  disabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  closeOnOutsideClick?: boolean;
  closeOnSelect?: boolean;
  animationDuration?: number;
  darkOverlay?: boolean;
  renderInPlace?: boolean;
}

// Trigger dropdown props
interface TriggerDropdownProps extends DropdownBaseProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  isOpen?: boolean;
}

// Select dropdown props
interface SelectDropdownProps extends DropdownBaseProps {
  options: DropdownOption[];
  value?: string | string[];
  placeholder?: string;
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  label?: string;
  error?: string;
  loading?: boolean;
  groupBy?: string;
  renderOption?: (option: DropdownOption, isSelected: boolean) => React.ReactNode;
  showCheckmarks?: boolean;
  noOptionsMessage?: string;
  size?: 'small' | 'medium' | 'large';
}

// Union type for all dropdown props
type DropdownProps = TriggerDropdownProps | SelectDropdownProps;

// Helper to determine if props are for a select dropdown
const isSelectDropdown = (props: DropdownProps): props is SelectDropdownProps => {
  return 'options' in props && 'onChange' in props;
};

/**
 * Enhanced dropdown component that can function as either:
 * 1. A custom dropdown with any content (triggered by a button)
 * 2. A select dropdown with options
 */
const EnhancedDropdown: React.FC<DropdownProps> = (props) => {
  // Handle different types of dropdowns
  if (isSelectDropdown(props)) {
    return <SelectDropdown {...props} />;
  } else {
    return <TriggerDropdown {...props} />;
  }
};

/**
 * Dropdown component with custom trigger element and content
 */
const TriggerDropdown: React.FC<TriggerDropdownProps> = ({
  trigger,
  children,
  placement = 'bottom-start',
  isOpen: controlledIsOpen,
  onOpen,
  onClose,
  closeOnOutsideClick = true,
  width = 'auto',
  maxHeight = '80vh',
  className = '',
  disabled = false,
  animationDuration = 200,
  darkOverlay = false,
  renderInPlace = false,
}) => {
  const [isOpenState, setIsOpenState] = useState(false);
  const [position, setPosition] = useState<Position>({ 
    top: 0, 
    left: 0, 
    transformOrigin: 'top left' 
  });
  
  // Use controlled or uncontrolled state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpenState;
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Calculate dropdown position based on trigger element
  const updatePosition = () => {
    if (!triggerRef.current || !dropdownRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    let transformOrigin = '';

    // Calculate space above and below
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    
    const placementBase = spaceBelow < dropdownRect.height && spaceAbove > spaceBelow 
      ? 'top' 
      : 'bottom';
    
    // Calculate horizontal position based on placement
    if (placement.endsWith('start') || placementBase === 'top' && placement.endsWith('start')) {
      left = triggerRect.left + window.scrollX;
      transformOrigin = 'top left';
    } else if (placement.endsWith('end') || placementBase === 'top' && placement.endsWith('end')) {
      left = triggerRect.right - dropdownRect.width + window.scrollX;
      transformOrigin = 'top right';
    } else { // center
      left = triggerRect.left + (triggerRect.width / 2) - (dropdownRect.width / 2) + window.scrollX;
      transformOrigin = 'top center';
    }
    
    // Calculate vertical position
    if (placementBase === 'bottom') {
      top = triggerRect.bottom + window.scrollY + 8; // Add 8px gap
      transformOrigin = transformOrigin.replace('top', 'top');
    } else { // top
      top = triggerRect.top - dropdownRect.height + window.scrollY - 8; // Add 8px gap
      transformOrigin = transformOrigin.replace('top', 'bottom');
    }
    
    // Make sure dropdown stays within viewport
    const viewportWidth = window.innerWidth;
    
    // Adjust horizontal position if needed
    if (left < 10) {
      left = 10;
    } else if (left + dropdownRect.width > viewportWidth - 10) {
      left = viewportWidth - dropdownRect.width - 10;
    }

    setPosition({ top, left, transformOrigin });
  };

  const toggle = () => {
    if (disabled) return;
    
    if (controlledIsOpen === undefined) {
      setIsOpenState(prev => !prev);
      if (!isOpenState) {
        onOpen?.();
      } else {
        onClose?.();
      }
    }
  };

  const close = () => {
    if (controlledIsOpen === undefined) {
      setIsOpenState(false);
    }
    if (isOpen) {
      onClose?.();
    }
  };

  // Handle outside clicks
  useEffect(() => {
    if (isOpen && closeOnOutsideClick) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && 
          !triggerRef.current.contains(event.target as Node)
        ) {
          close();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, closeOnOutsideClick]);

  // Update position when dropdown is opened or window is resized
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Delay position calculation to ensure DOM is updated
      setTimeout(updatePosition, 20);
      
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  // Clone the trigger element to add event handlers and ref
  const triggerElement = React.cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      toggle();
      if (trigger.props.onClick) {
        trigger.props.onClick(e);
      }
    },
    ref: triggerRef,
    disabled,
    "aria-expanded": isOpen,
    "aria-haspopup": true,
    "data-state": isOpen ? "open" : "closed"
  });

  // Create the dropdown content
  const dropdownContent = (
    <div 
      ref={dropdownRef}
      className={`enhanced-dropdown ${className} ${mounted ? 'visible' : ''}`} 
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        width: typeof width === 'number' ? `${width}px` : 
              (width === 'auto' && triggerRef.current) ? `${triggerRef.current.offsetWidth}px` : 
              triggerRef.current ? `${triggerRef.current.offsetWidth}px` : width,
        maxHeight,
        transformOrigin: position.transformOrigin,
        transitionDuration: `${animationDuration}ms`,
      }}
      onClick={e => e.stopPropagation()}
      role="menu"
      tabIndex={-1}
    >
      {children}
    </div>
  );

  return (
    <>
      {triggerElement}
      
      {isOpen && (
        <>
          {darkOverlay && <div className="dropdown-overlay" onClick={close} />}
          {renderInPlace ? dropdownContent : (
            <Portal zIndex={3000}>
              {/* Add key to ensure Portal content rerenders when position changes */}
              <div key={`dropdown-${position.top}-${position.left}`}>
                {dropdownContent}
              </div>
            </Portal>
          )}
        </>
      )}
      
      <style jsx>{`
        .dropdown-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(2px);
          z-index: 80;
          animation: fadeIn ${animationDuration}ms var(--easing-standard);
        }
        
        .enhanced-dropdown {
          position: fixed;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow-lg);
          opacity: 0;
          transform: scale(0.95);
          transition: opacity ${animationDuration}ms var(--easing-standard), 
                    transform ${animationDuration}ms var(--easing-standard);
          max-height: ${maxHeight};
          overflow-y: auto;
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb) transparent;
        }
        
        .enhanced-dropdown::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .enhanced-dropdown::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .enhanced-dropdown::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        
        .enhanced-dropdown::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover);
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .enhanced-dropdown.visible {
          opacity: 1;
          transform: scale(1);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

    </>
  );
};

/**
 * Select dropdown component with options
 */
const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  multiple = false,
  searchable = false,
  clearable = false,
  placement = 'bottom-start',
  width = 'auto',
  maxHeight = '300px',
  className = '',
  disabled = false,
  label,
  error,
  loading = false,
  onOpen,
  onClose,
  closeOnOutsideClick = true,
  closeOnSelect = !multiple,
  groupBy,
  renderOption,
  showCheckmarks = true,
  noOptionsMessage = 'No options available',
  animationDuration = 200,
  darkOverlay = false,
  renderInPlace = false,
  size = 'medium',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState<Position>({ 
    top: 0, 
    left: 0, 
    transformOrigin: 'top left' 
  });
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Convert value to array for easier handling
  const selectedValues = Array.isArray(value) 
    ? value 
    : value ? [value] : [];

  // Filter options based on search query
  const filteredOptions = options.filter(option => 
    !searchQuery || 
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group options if groupBy is provided
  const groupedOptions = groupBy
    ? filteredOptions.reduce((groups, option) => {
        const groupName = option.group || 'Other';
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(option);
        return groups;
      }, {} as Record<string, DropdownOption[]>)
    : { 'default': filteredOptions };
    
  // Calculate visible options (flattened if grouped)
  const visibleOptions = groupBy 
    ? Object.values(groupedOptions).flat() 
    : filteredOptions;

  // Calculate dropdown position based on trigger element
  const updatePosition = () => {
    if (!triggerRef.current || !dropdownRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    let transformOrigin = '';

    // Calculate space above and below
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    
    const placementBase = spaceBelow < dropdownRect.height && spaceAbove > spaceBelow 
      ? 'top' 
      : 'bottom';
    
    // Calculate horizontal position based on placement
    if (placement.endsWith('start') || placementBase === 'top' && placement.endsWith('start')) {
      left = triggerRect.left + window.scrollX;
      transformOrigin = 'top left';
    } else if (placement.endsWith('end') || placementBase === 'top' && placement.endsWith('end')) {
      left = triggerRect.right - dropdownRect.width + window.scrollX;
      transformOrigin = 'top right';
    } else { // center
      left = triggerRect.left + (triggerRect.width / 2) - (dropdownRect.width / 2) + window.scrollX;
      transformOrigin = 'top center';
    }
    
    // Calculate vertical position
    if (placementBase === 'bottom') {
      top = triggerRect.bottom + window.scrollY + 8; // Add 8px gap
      transformOrigin = transformOrigin.replace('top', 'top');
    } else { // top
      top = triggerRect.top - dropdownRect.height + window.scrollY - 8; // Add 8px gap
      transformOrigin = transformOrigin.replace('top', 'bottom');
    }
    
    // Make sure dropdown stays within viewport
    const viewportWidth = window.innerWidth;
    
    // Adjust horizontal position if needed
    if (left < 10) {
      left = 10;
    } else if (left + dropdownRect.width > viewportWidth - 10) {
      left = viewportWidth - dropdownRect.width - 10;
    }

    setPosition({ top, left, transformOrigin });
  };

  // Toggle dropdown open/closed
  const toggle = () => {
    if (disabled || loading) return;
    
    setIsOpen(prev => !prev);
    if (!isOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };

  // Close the dropdown
  const close = () => {
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(null);
    onClose?.();
  };

  // Handle option selection
  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    
    if (multiple) {
      const isSelected = selectedValues.includes(option.value);
      const newValues = isSelected
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value];
      
      onChange(newValues);
      
      // Focus search input after selection in multiple mode
      if (searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } else {
      onChange(option.value);
      if (closeOnSelect) {
        close();
      }
    }
  };

  // Clear all selections
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  // Get selected option(s) label for display
  const getSelectedLabels = () => {
    if (selectedValues.length === 0) return null;
    
    const selectedOptions = options.filter(o => selectedValues.includes(o.value));
    
    if (multiple) {
      return selectedOptions.length > 1 
        ? `${selectedOptions[0].label} + ${selectedOptions.length - 1} more`
        : selectedOptions[0]?.label;
    }
    
    return selectedOptions[0]?.label;
  };

  // Check if an option is selected
  const isSelected = (option: DropdownOption) => {
    return selectedValues.includes(option.value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          onOpen?.();
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex(prev => {
            const newIndex = prev === null ? 0 : (prev + 1) % visibleOptions.length;
            scrollOptionIntoView(newIndex);
            return newIndex;
          });
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          onOpen?.();
          setHighlightedIndex(visibleOptions.length - 1);
        } else {
          setHighlightedIndex(prev => {
            const newIndex = prev === null 
              ? visibleOptions.length - 1 
              : (prev - 1 + visibleOptions.length) % visibleOptions.length;
            scrollOptionIntoView(newIndex);
            return newIndex;
          });
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex !== null) {
          handleSelect(visibleOptions[highlightedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
          onOpen?.();
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        close();
        break;
        
      case ' ': // Space
        if (!searchable && !isOpen) {
          e.preventDefault();
          setIsOpen(true);
          onOpen?.();
        } else if (!searchable && isOpen && highlightedIndex !== null) {
          e.preventDefault();
          handleSelect(visibleOptions[highlightedIndex]);
        }
        break;
        
      case 'Tab':
        if (isOpen) {
          close();
        }
        break;
    }
  };

  // Scroll highlighted option into view
  const scrollOptionIntoView = (index: number) => {
    setTimeout(() => {
      if (optionRefs.current[index] && dropdownRef.current) {
        const option = optionRefs.current[index];
        const dropdown = dropdownRef.current;
        
        const optionTop = option!.offsetTop;
        const optionBottom = optionTop + option!.offsetHeight;
        
        const scrollTop = dropdown.scrollTop;
        const scrollBottom = scrollTop + dropdown.clientHeight;
        
        if (optionTop < scrollTop) {
          dropdown.scrollTop = optionTop;
        } else if (optionBottom > scrollBottom) {
          dropdown.scrollTop = optionBottom - dropdown.clientHeight;
        }
      }
    }, 0);
  };

  // Handle outside clicks
  useEffect(() => {
    if (isOpen && closeOnOutsideClick) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current && 
          !containerRef.current.contains(event.target as Node)
        ) {
          close();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, closeOnOutsideClick]);

  // Update position when dropdown is opened or window is resized
  useEffect(() => {
    if (isOpen) {
      // Delay position calculation to ensure DOM is updated
      setTimeout(updatePosition, 20);
      
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      // Focus search input if searchable
      if (searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    } else {
      setSearchQuery('');
      setHighlightedIndex(null);
    }
  }, [isOpen]);

  // Reset option refs when options change
  useEffect(() => {
    optionRefs.current = visibleOptions.map(() => null);
  }, [visibleOptions]);

  // Determine sizing
  const getSizing = () => {
    switch (size) {
      case 'small': return { 
        height: '32px', 
        padding: '6px 10px', 
        fontSize: '13px',
        iconSize: 16
      };
      case 'large': return { 
        height: '44px', 
        padding: '10px 16px', 
        fontSize: '15px',
        iconSize: 20
      };
      default: return { 
        height: '38px', 
        padding: '8px 12px', 
        fontSize: '14px', 
        iconSize: 18
      };
    }
  };
  
  const { height, padding, fontSize, iconSize } = getSizing();

  // Render the dropdown
  return (
    <div 
      className={`select-dropdown-container ${className}`}
      ref={containerRef}
      style={{ width: typeof width === 'string' ? width : `${width}px` }}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className="select-dropdown-label">
          {label}
        </label>
      )}
      
      <div 
        className={`select-dropdown-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${error ? 'error' : ''} ${loading ? 'loading' : ''} ${size}`}
        ref={triggerRef}
        onClick={toggle}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-invalid={!!error}
        aria-busy={loading}
        data-state={isOpen ? "open" : "closed"}
        style={{ height }}
      >
        <div className="select-dropdown-value">
          {selectedValues.length > 0 ? (
            <>
              {multiple && selectedValues.length > 0 && (
                <div className="selection-count">
                  {selectedValues.length}
                </div>
              )}
              <span>{getSelectedLabels() || placeholder}</span>
            </>
          ) : (
            <span className="placeholder">{placeholder}</span>
          )}
        </div>
        
        <div className="select-dropdown-indicators">
          {(clearable && selectedValues.length > 0) && (
            <button 
              className="clear-indicator"
              onClick={handleClear}
              aria-label="Clear selection"
              tabIndex={-1}
            >
              <X size={iconSize - 4} />
            </button>
          )}
          
          <div className="dropdown-indicator">
            <ChevronsUpDown size={iconSize - 2} />
          </div>
        </div>
      </div>
      
      {error && <div className="select-dropdown-error">{error}</div>}
      
      {isOpen && (
        <>
          {darkOverlay && <div className="dropdown-overlay" onClick={close} />}
          
          {renderInPlace ? (
            <div 
              className="select-dropdown-menu"
              ref={dropdownRef}
              style={{
                width: typeof width === 'number' ? `${width}px` :
                       triggerRef.current ? `${triggerRef.current.offsetWidth}px` : '100%',
                maxHeight,
              }}
            >
              {renderDropdownContent()}
            </div>
          ) : (
            <Portal zIndex={3000}>
              <div key={`select-dropdown-${position.top}-${position.left}`}>
                <div 
                  ref={dropdownRef}
                  className="select-dropdown-menu"
                  style={{ 
                    top: `${position.top}px`, 
                    left: `${position.left}px`,
                    width: typeof width === 'number' ? `${width}px` : 
                          (width === 'auto' && triggerRef.current) ? `${triggerRef.current.offsetWidth}px` : 
                          triggerRef.current ? `${triggerRef.current.offsetWidth}px` : width,
                    maxHeight,
                    transformOrigin: position.transformOrigin,
                    transitionDuration: `${animationDuration}ms`,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  {renderDropdownContent()}
                </div>
              </div>
            </Portal>
          )}
        </>
      )}
      
      <style jsx>{`
        .select-dropdown-container {
          position: relative;
          font-size: ${fontSize};
        }
        
        .select-dropdown-label {
          display: block;
          font-size: ${parseInt(fontSize as string) - 1}px;
          font-weight: 500;
          margin-bottom: 6px;
          color: var(--text-secondary);
        }
        
        .select-dropdown-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          cursor: pointer;
          transition: all 0.2s var(--easing-standard);
          user-select: none;
          box-shadow: var(--shadow-sm);
          position: relative;
          font-size: ${fontSize};
          padding: 0 ${padding.split(' ')[1]};
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
        }
        
        .select-dropdown-trigger:hover:not(.disabled) {
          border-color: var(--border-hover);
          background: var(--hover-bg);
        }
        
        .select-dropdown-trigger:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px var(--ring-color), var(--shadow-sm);
        }
        
        .select-dropdown-trigger.open {
          border-color: var(--accent-primary);
          background: var(--active-bg);
          box-shadow: 0 0 0 2px var(--ring-color), var(--shadow-sm);
        }
        
        .select-dropdown-trigger.disabled {
          background: var(--disabled-bg);
          color: var(--text-disabled);
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .select-dropdown-trigger.error {
          border-color: var(--accent-danger);
        }
        
        .select-dropdown-value {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        
        .placeholder {
          color: var(--text-placeholder);
        }
        
        .selection-count {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          padding: 0 6px;
          background-color: var(--accent-primary);
          color: white;
          font-size: 12px;
          font-weight: 500;
        }
        
        .select-dropdown-indicators {
          display: flex;
          align-items: center;
        }
        
        .clear-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 2px;
          margin-right: 4px;
          border-radius: 50%;
          transition: all 0.15s var(--easing-standard);
        }
        
        .clear-indicator:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
        
        .dropdown-indicator {
          display: flex;
          align-items: center;
          color: var(--text-tertiary);
          transition: transform 0.2s var(--easing-standard);
        }
        
        .open .dropdown-indicator {
          color: var(--text-secondary);
        }
        
        .select-dropdown-error {
          margin-top: 4px;
          color: var(--accent-danger);
          font-size: ${parseInt(fontSize as string) - 1}px;
        }
        
        .select-dropdown-menu {
          background: var(--glass-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-thin);
          box-shadow: var(--shadow-lg);
          overflow-y: auto;
          z-index: 100;
          animation: slideIn ${animationDuration}ms var(--easing-standard);
          max-height: ${maxHeight};
          position: ${renderInPlace ? 'absolute' : 'fixed'};
          ${renderInPlace ? 'top: calc(100% + 8px); left: 0;' : ''}
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb) transparent;
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
        }
        
        .select-dropdown-menu::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .select-dropdown-menu::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .select-dropdown-menu::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        
        .select-dropdown-menu::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover);
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        
        .dropdown-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(2px);
          z-index: 80;
          animation: fadeIn ${animationDuration}ms var(--easing-standard);
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      <style jsx global>{`
        .menu-search {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          position: relative;
          border-bottom: 1px solid var(--border-thin);
        }
        
        .menu-search-input {
          width: 100%;
          border: none;
          background: transparent;
          color: var(--text-primary);
          outline: none;
          padding-left: 28px;
          font-size: ${fontSize};
        }
        
        .menu-search-icon {
          position: absolute;
          left: 14px;
          color: var(--text-tertiary);
        }
        
        .option-list {
          padding: 6px 0;
        }
        
        .option-group {
          padding: 0;
        }
        
        .group-label {
          padding: 6px 12px;
          font-size: ${parseInt(fontSize as string) - 1}px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: var(--glass-bg);
          position: sticky;
          top: 0;
          z-index: 1;
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          border-bottom: 1px solid var(--border-divider);
        }
        
        .dropdown-option {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.15s var(--easing-standard);
          position: relative;
          user-select: none;
        }
        
        .dropdown-option:hover:not(.disabled) {
          background: var(--hover-bg);
        }
        
        .dropdown-option.selected {
          background: rgba(var(--accent-primary-rgb), 0.08);
          font-weight: 500;
        }
        
        .dropdown-option.highlighted {
          background: var(--hover-bg);
        }
        
        .dropdown-option.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .option-content {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        
        .option-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .option-description {
          font-size: ${parseInt(fontSize as string) - 2}px;
          color: var(--text-tertiary);
          margin-top: 2px;
        }
        
        .option-check {
          color: var(--accent-primary);
          margin-left: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.15s var(--easing-standard);
        }
        
        .dropdown-option.selected .option-check {
          opacity: 1;
        }
        
        .no-options {
          padding: 16px;
          text-align: center;
          color: var(--text-tertiary);
          font-style: italic;
        }
        
        .loading-indicator {
          display: flex;
          justify-content: center;
          padding: 16px;
          color: var(--text-tertiary);
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );

  // Render dropdown content (used in both render in place and portal cases)
  function renderDropdownContent() {
    return (
      <>
        {searchable && (
          <div className="menu-search">
            <Search className="menu-search-icon" size={16} />
            <input
              ref={searchInputRef}
              type="text"
              className="menu-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              autoComplete="off"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3" />
                <path
                  d="M12 2C6.47715 2 2 6.47715 2 12"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ) : filteredOptions.length === 0 ? (
          <div className="no-options">{noOptionsMessage}</div>
        ) : (
          <div className="option-list">
            {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
              groupOptions.length > 0 && (
                <div key={groupName} className="option-group">
                  {groupBy && groupName !== 'default' && (
                    <div className="group-label">{groupName}</div>
                  )}
                  
                  {groupOptions.map((option, idx) => {
                    const optionIndex = visibleOptions.findIndex(o => o.value === option.value);
                    const isOptionSelected = isSelected(option);
                    const isHighlighted = highlightedIndex === optionIndex;
                    
                    return (
                      <div
                        key={option.value}
                        ref={el => optionRefs.current[optionIndex] = el}
                        className={`dropdown-option ${isOptionSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${option.disabled ? 'disabled' : ''}`}
                        onClick={() => !option.disabled && handleSelect(option)}
                        role="option"
                        aria-selected={isOptionSelected}
                        data-highlighted={isHighlighted}
                        onMouseEnter={() => setHighlightedIndex(optionIndex)}
                        onMouseLeave={() => setHighlightedIndex(null)}
                      >
                        {renderOption ? (
                          renderOption(option, isOptionSelected)
                        ) : (
                          <>
                            <div className="option-content">
                              <div className="option-label">
                                {option.icon && <span className="option-icon">{option.icon}</span>}
                                <span>{option.label}</span>
                              </div>
                              {option.description && (
                                <div className="option-description">{option.description}</div>
                              )}
                            </div>
                            
                            {showCheckmarks && (
                              <div className="option-check">
                                <Check size={16} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ))}
          </div>
        )}
      </>
    );
  }
};

export default EnhancedDropdown;