'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

/**
 * A Portal component that renders children into a DOM node that exists outside
 * the DOM hierarchy of the parent component.
 * 
 * This is useful for modals, tooltips, dropdowns, and other floating UI elements
 * to ensure proper stacking context and avoid CSS overflow issues.
 * 
 * The component now supports zIndex prop to control the stacking order of portals.
 */
export default function Portal({ children, zIndex = 1000 }: PortalProps & { zIndex?: number }) {
  const [mounted, setMounted] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create a dedicated portal root for each portal instance with specific z-index
    const root = document.createElement('div');
    root.style.position = 'fixed';
    root.style.top = '0';
    root.style.left = '0';
    root.style.width = '100%';
    root.style.height = '0';
    root.style.overflow = 'visible';
    root.style.pointerEvents = 'none'; // Let events pass through this container
    root.style.zIndex = zIndex.toString();
    
    // Add a class for debugging and styling
    root.className = `portal-root portal-z-${zIndex}`;
    
    document.body.appendChild(root);
    setPortalRoot(root);
    setMounted(true);
    
    return () => {
      document.body.removeChild(root);
      setMounted(false);
    };
  }, [zIndex]);

  return mounted && portalRoot ? createPortal(
    <div style={{ pointerEvents: 'auto' }}>{children}</div>, 
    portalRoot
  ) : null;
}