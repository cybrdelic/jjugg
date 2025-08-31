import { useEffect } from 'react';

export function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(()=>{
    if(!active) return;
    const root = containerRef.current; if(!root) return;
    const selector = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
    const getList = () => Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(el=>!el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
    const first = getList()[0]; first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if(e.key==='Tab') {
        const list = getList(); if(!list.length) return;
        const firstEl = list[0]; const lastEl = list[list.length-1];
        if(e.shiftKey && document.activeElement===firstEl){ e.preventDefault(); lastEl.focus(); }
        else if(!e.shiftKey && document.activeElement===lastEl){ e.preventDefault(); firstEl.focus(); }
      }
    };
    root.addEventListener('keydown', onKey as any);
    return ()=> root.removeEventListener('keydown', onKey as any);
  },[active, containerRef]);
}
