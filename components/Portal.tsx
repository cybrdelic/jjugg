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
 */
export default function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}