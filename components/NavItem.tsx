// components/NavItem.tsx
import { useTheme } from '@/contexts/ThemeContext';
import { SectionKey, NavItemType } from './types';
import NavItemComponent from './NavItemComponent';
import { useEffect, useState } from 'react';

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
  const [mounted, setMounted] = useState(false);
  const isActive = currentSection === item.key;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigate = () => {
    onNavigate(item.key);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu(e, item);
    }
  };

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <NavItemComponent
        icon={item.icon}
        label={item.label}
        isActive={isActive}
        onClick={handleNavigate}
        isCollapsed={isCollapsed}
        onContextMenu={handleContextMenu}
        badge={item.badge}
        isAnimating={false}
        animationLevel="minimal"
      />
    );
  }

  return (
    <NavItemComponent
      icon={item.icon}
      label={item.label}
      isActive={isActive}
      onClick={handleNavigate}
      isCollapsed={isCollapsed}
      onContextMenu={handleContextMenu}
      badge={item.badge}
      isAnimating={false}
      animationLevel="minimal"
    />
  );
}
