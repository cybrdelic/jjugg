// components/NavItem.tsx
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SectionKey, NavItemType } from './types';
import NavItemComponent from './NavItemComponent';

interface NavItemProps {
  item: NavItemType;
  currentSection: SectionKey;
  onNavigate: (sectionKey: SectionKey) => void;
  isCollapsed?: boolean;
  onContextMenu?: (e: React.MouseEvent, item: NavItemType) => void;
}

export default function NavItem({ 
  item, 
  currentSection, 
  onNavigate, 
  isCollapsed = false,
  onContextMenu
}: NavItemProps) {
  const { currentTheme } = useTheme();
  const isActive = currentSection === item.key;
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Handle click animation
  useEffect(() => {
    if (isActive) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isActive]);
  
  const handleNavigate = () => {
    onNavigate(item.key);
    // Trigger animation on click
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu(e, item);
    }
  };

  return (
    <NavItemComponent
      icon={item.icon}
      label={item.label}
      isActive={isActive}
      onClick={handleNavigate}
      isCollapsed={isCollapsed}
      onContextMenu={handleContextMenu}
      badge={item.badge}
      isAnimating={isAnimating}
      animationLevel={currentTheme.animation === 'intense' ? 'playful' : currentTheme.animation}
    />
  );
}