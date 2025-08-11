'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  cloneElement,
  isValidElement,
} from 'react';
import { createPortal } from 'react-dom';
import Portal from './Portal';

type BasePlacement = 'top' | 'right' | 'bottom' | 'left';
type TooltipPlacement = BasePlacement | 'auto';

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;

  placement?: TooltipPlacement;
  delay?: number;              // show delay
  hideDelay?: number;          // hide delay (hysteresis)
  offset?: number;             // px gap

  /** Width controls */
  width?: number | 'auto' | 'match-trigger';
  minWidth?: number;
  maxWidth?: number;

  /** Height & viewport */
  maxHeight?: number;
  capToViewport?: boolean;     // clamp to 100vh - padding*2
  withinViewportPadding?: number;

  /** Interaction */
  interactive?: boolean;       // allow clicks/hover in tooltip
  hoverLock?: boolean;         // keep open while pointer is over tooltip (prevents flicker)
  enableScrollOnOverflow?: boolean;

  /** Controlled/uncontrolled */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** Misc */
  className?: string;
  disabled?: boolean;
  id?: string;
  role?: string;
}

type Vec2 = { x: number; y: number };

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const useMounted = () => {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
};

export default function Tooltip({
  children,
  content,

  placement = 'top',
  delay = 120,
  hideDelay = 120,
  offset = 10,

  width = 'auto',
  minWidth = 360,
  maxWidth = 820,

  maxHeight,
  capToViewport = true,
  withinViewportPadding = 8,

  interactive = true,          // default true so we can cancel hide on tooltip hover
  hoverLock = true,            // prevent flicker when moving into tooltip
  enableScrollOnOverflow = true,

  open,
  defaultOpen = false,
  onOpenChange,

  className = '',
  disabled = false,
  id,
  role = 'tooltip',
}: TooltipProps) {
  const mounted = useMounted();

  // visibility (controlled/uncontrolled)
  const controlled = typeof open === 'boolean';
  const [uOpen, setUOpen] = useState(defaultOpen);
  const visible = !disabled && (controlled ? (open as boolean) : uOpen);
  const setOpen = useCallback(
    (v: boolean) => {
      if (!controlled) setUOpen(v);
      onOpenChange?.(v);
    },
    [controlled, onOpenChange]
  );

  // refs
  const triggerRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // timers
  const showT = useRef<number | null>(null);
  const hideT = useRef<number | null>(null);

  // state
  const [ready, setReady] = useState(false);         // set true after first measured paint; don't toggle again while open
  const [pos, setPos] = useState<Vec2>({ x: -9999, y: -9999 });
  const [side, setSide] = useState<BasePlacement>('top');
  const [arrow, setArrow] = useState<Vec2>({ x: 0, y: 0 });
  const [triggerW, setTriggerW] = useState<number>(0);

  // helpers
  const getAnchor = () => (triggerRef.current ?? wrapperRef.current);

  // ————— event binding (native) so your child handlers remain untouched —————
  const bindListeners = useCallback(() => {
    const el = getAnchor();
    if (!el) return () => { };

    const onEnter = () => {
      if (disabled) return;
      if (hideT.current) window.clearTimeout(hideT.current);
      if (showT.current) window.clearTimeout(showT.current);
      showT.current = window.setTimeout(() => {
        setReady(false);       // only right before first open
        setOpen(true);
      }, delay);
    };

    const onLeave = () => {
      if (showT.current) window.clearTimeout(showT.current);
      if (hideT.current) window.clearTimeout(hideT.current);
      // small hysteresis avoids micro-gaps between trigger and tooltip
      hideT.current = window.setTimeout(() => {
        setOpen(false);
        setReady(false);
      }, hideDelay);
    };

    const onFocus = () => !disabled && setOpen(true);
    const onBlur = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };

    el.addEventListener('pointerenter', onEnter, { passive: true });
    el.addEventListener('pointerleave', onLeave, { passive: true });
    el.addEventListener('focus', onFocus, true);
    el.addEventListener('blur', onBlur, true);
    el.addEventListener('keydown', onKey);

    return () => {
      el.removeEventListener('pointerenter', onEnter as any);
      el.removeEventListener('pointerleave', onLeave as any);
      el.removeEventListener('focus', onFocus, true);
      el.removeEventListener('blur', onBlur, true);
      el.removeEventListener('keydown', onKey);
    };
  }, [delay, hideDelay, disabled, setOpen]);

  useEffect(() => {
    const unbind = bindListeners();
    return () => {
      if (showT.current) window.clearTimeout(showT.current);
      if (hideT.current) window.clearTimeout(hideT.current);
      unbind?.();
    };
  }, [bindListeners]);

  // ————— positioning —————
  const pickPlacement = (
    preferred: TooltipPlacement,
    tr: DOMRect,
    vw: number,
    vh: number,
    pad: number
  ): BasePlacement => {
    if (preferred !== 'auto') return preferred;
    const space = {
      top: tr.top - pad,
      bottom: vh - tr.bottom - pad,
      left: tr.left - pad,
      right: vw - tr.right - pad,
    };
    let best: BasePlacement = 'top';
    let bestVal = space.top;
    (['right', 'bottom', 'left'] as BasePlacement[]).forEach((p) => {
      if (space[p] > bestVal) { best = p; bestVal = space[p]; }
    });
    return best;
  };

  const basePos = (p: BasePlacement, tr: DOMRect, tt: DOMRect, gap: number) => {
    let x = 0, y = 0;
    switch (p) {
      case 'top':
        x = tr.left + tr.width / 2 - tt.width / 2;
        y = tr.top - tt.height - gap; break;
      case 'bottom':
        x = tr.left + tr.width / 2 - tt.width / 2;
        y = tr.bottom + gap; break;
      case 'left':
        x = tr.left - tt.width - gap;
        y = tr.top + tr.height / 2 - tt.height / 2; break;
      case 'right':
        x = tr.right + gap;
        y = tr.top + tr.height / 2 - tt.height / 2; break;
    }
    return { x, y };
  };

  // rAF scheduler to avoid multiple sync reflows per frame
  const rafId = useRef<number | null>(null);
  const schedule = (fn: () => void) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      fn();
    });
  };

  const updatePosition = useCallback(() => {
    const t = tooltipRef.current;
    const a = getAnchor();
    if (!t || !a) return;

    const tr = a.getBoundingClientRect();
    setTriggerW(tr.width);

    const tt = t.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const chosen = pickPlacement(placement, tr, vw, vh, withinViewportPadding);
    let { x, y } = basePos(chosen, tr, tt, offset);

    const minX = withinViewportPadding;
    const maxX = vw - withinViewportPadding - tt.width;
    const minY = withinViewportPadding;
    const maxY = vh - withinViewportPadding - tt.height;

    let cx = clamp(x, minX, Math.max(minX, maxX));
    let cy = clamp(y, minY, Math.max(minY, maxY));

    const overPrimary =
      (chosen === 'top' && y < minY) ||
      (chosen === 'bottom' && y > maxY) ||
      (chosen === 'left' && x < minX) ||
      (chosen === 'right' && x > maxX);

    let finalSide: BasePlacement = chosen;
    if (overPrimary) {
      const flip: Record<BasePlacement, BasePlacement> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
      const altSide = flip[chosen];
      const alt = basePos(altSide, tr, tt, offset);
      const acx = clamp(alt.x, minX, Math.max(minX, maxX));
      const acy = clamp(alt.y, minY, Math.max(minY, maxY));
      const d0 = Math.hypot(cx - x, cy - y);
      const d1 = Math.hypot(acx - alt.x, acy - alt.y);
      if (d1 < d0) { cx = acx; cy = acy; finalSide = altSide; }
    }

    // Arrow (use finalSide; don't depend on stale state)
    const arrowSize = 8;
    const ttW = tt.width, ttH = tt.height;
    let ax = ttW / 2, ay = ttH / 2;

    if (finalSide === 'top' || finalSide === 'bottom') {
      const center = tr.left + tr.width / 2;
      ax = clamp(center - cx, arrowSize + 4, ttW - arrowSize - 4);
      ay = finalSide === 'top' ? ttH - 0.5 : 0.5;
    } else {
      const middle = tr.top + tr.height / 2;
      ay = clamp(middle - cy, arrowSize + 4, ttH - arrowSize - 4);
      ax = finalSide === 'left' ? ttW - 0.5 : 0.5;
    }

    setSide(finalSide);
    setPos({ x: Math.round(cx), y: Math.round(cy) });
    setArrow({ x: Math.round(ax), y: Math.round(ay) });
    // IMPORTANT: once we show, keep it visible; don't toggle visibility during updates
    setReady(true);
  }, [offset, placement, withinViewportPadding]);

  // open → measure/position (double rAF to avoid first-frame flash)
  useLayoutEffect(() => {
    if (!visible) return;
    const id = requestAnimationFrame(() => {
      updatePosition();
      const id2 = requestAnimationFrame(updatePosition);
      return () => cancelAnimationFrame(id2);
    });
    return () => cancelAnimationFrame(id);
  }, [visible, updatePosition]);

  // observe size/content + scroll parents; only schedule rAF updates (no visibility jitter)
  useEffect(() => {
    if (!visible) return;
    const a = getAnchor();
    const t = tooltipRef.current;
    const c = contentRef.current;
    if (!a || !t) return;

    const onScrollOrResize = () => schedule(updatePosition);

    // Resize observers
    const roT = new ResizeObserver(() => schedule(updatePosition));
    roT.observe(t);
    const roA = new ResizeObserver(() => schedule(updatePosition));
    roA.observe(a);
    if (c) {
      const roC = new ResizeObserver(() => schedule(updatePosition));
      roC.observe(c);
    }

    // Mutations (content changes)
    const mo = c ? new MutationObserver(() => schedule(updatePosition)) : null;
    if (c && mo) mo.observe(c, { childList: true, subtree: true, characterData: true });

    // Scroll parents + window
    const parents: (Element | Window)[] = [];
    let node: Element | null = a.parentElement;
    const re = /(auto|scroll|overlay)/;
    while (node && node !== document.body && node !== document.documentElement) {
      const s = getComputedStyle(node);
      if (re.test(`${s.overflow} ${s.overflowX} ${s.overflowY}`)) parents.push(node);
      node = node.parentElement;
    }
    parents.push(window);
    parents.forEach((p: any) => p.addEventListener?.('scroll', onScrollOrResize, { passive: true }));
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      roT.disconnect();
      roA.disconnect();
      mo?.disconnect();
      parents.forEach((p: any) => p.removeEventListener?.('scroll', onScrollOrResize));
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [visible, updatePosition]);

  // ————— trigger (don’t override your handlers) —————
  const childAcceptsRef =
    isValidElement(children) &&
    (typeof (children as any).type === 'string' || (children as any).ref != null);

  const trigger = childAcceptsRef
    ? cloneElement(children, {
      ref: (node: HTMLElement | null) => {
        triggerRef.current = node;
        const orig: any = (children as any).ref;
        if (typeof orig === 'function') orig(node);
        else if (orig && typeof orig === 'object') orig.current = node;
      },
      'aria-describedby': id,
    })
    : (
      <span
        ref={wrapperRef}
        aria-describedby={id}
        style={{ display: 'inline', lineHeight: 'inherit', verticalAlign: 'baseline' }}
      >
        {children}
      </span>
    );

  // ————— size resolution —————
  const viewportCap = `calc(100vh - ${withinViewportPadding * 2}px)`;
  const finalMaxHeight = capToViewport
    ? (typeof maxHeight === 'number' ? `min(${maxHeight}px, ${viewportCap})` : viewportCap)
    : (typeof maxHeight === 'number' ? `${maxHeight}px` : undefined);

  const resolvedMinW = Math.max(0, minWidth || 0);
  const resolvedMaxW = Math.max(resolvedMinW, maxWidth || resolvedMinW);
  const resolvedWidth =
    width === 'match-trigger'
      ? Math.max(triggerW || 0, resolvedMinW)
      : (typeof width === 'number' ? Math.max(width, resolvedMinW) : undefined);

  // we need pointer events ON while visible so the tooltip can receive hover to cancel hide
  const pointerEnabled = interactive || hoverLock || enableScrollOnOverflow;

  // ————— tooltip body —————
  const body = visible ? (
    <div
      ref={tooltipRef}
      id={id}
      role={role}
      data-placement={side}
      className={`tt-root ${className || ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        zIndex: 1000,
        willChange: 'transform, opacity',
        // keep visible after first paint; no visibility toggles during updates → no flicker
        opacity: ready ? 1 : 0,
        transition: 'opacity 120ms var(--easing-standard, cubic-bezier(.2,.8,.2,1))',
        pointerEvents: pointerEnabled ? 'auto' : 'none',
        filter: 'var(--tooltip-drop-shadow, drop-shadow(0 6px 18px rgba(0,0,0,.14)))',
      }}
      // hover-lock: entering the tooltip cancels the hide timer; leaving starts it
      onPointerEnter={hoverLock ? () => {
        if (hideT.current) window.clearTimeout(hideT.current);
      } : undefined}
      onPointerLeave={hoverLock ? () => {
        if (showT.current) window.clearTimeout(showT.current);
        hideT.current = window.setTimeout(() => {
          setOpen(false);
          setReady(false);
        }, hideDelay);
      } : undefined}
      onWheel={(e) => { if (enableScrollOnOverflow) e.stopPropagation(); }}
      onTouchMove={(e) => { if (enableScrollOnOverflow) e.stopPropagation(); }}
    >
      <div
        ref={contentRef}
        className="tt-content"
        style={{
          width: resolvedWidth,
          minWidth: resolvedMinW,
          maxWidth: resolvedMaxW,
          maxHeight: finalMaxHeight,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch' as any,
        }}
      >
        {content}
      </div>

      {/* Arrow */}
      <div
        className="tt-arrow"
        style={{
          ...(side === 'top' ? { bottom: -6, left: Math.max(arrow.x - 6, 6) } : {}),
          ...(side === 'bottom' ? { top: -6, left: Math.max(arrow.x - 6, 6) } : {}),
          ...(side === 'left' ? { right: -6, top: Math.max(arrow.y - 6, 6) } : {}),
          ...(side === 'right' ? { left: -6, top: Math.max(arrow.y - 6, 6) } : {}),
        }}
      />

      <style jsx>{`
        .tt-content {
          background: var(--tooltip-bg, var(--surface, rgba(18,18,20,0.92)));
          color: var(--tooltip-fg, var(--text-primary, #e5e7eb));
          border: 1px solid var(--tooltip-border, var(--border, rgba(255,255,255,0.10)));
          border-radius: var(--tooltip-radius, var(--radius, 12px));
          box-shadow: var(--tooltip-shadow, var(--shadow, 0 20px 60px rgba(0,0,0,.35)));
          backdrop-filter: blur(var(--tooltip-blur, 8px));
          -webkit-backdrop-filter: blur(var(--tooltip-blur, 8px));
          padding: var(--tooltip-pad-y, 10px) var(--tooltip-pad-x, 14px);
          font: inherit;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.35;
          white-space: normal;
          word-break: break-word;
          overflow-wrap: anywhere;
          scrollbar-width: thin;
        }
        .tt-content::-webkit-scrollbar { width: 8px; }
        .tt-content::-webkit-scrollbar-thumb {
          background: color-mix(in oklab, var(--tooltip-fg, #e5e7eb) 25%, transparent);
          border-radius: 8px;
        }

        .tt-arrow {
          position: absolute;
          width: 12px;
          height: 12px;
          transform: rotate(45deg);
          background: var(--tooltip-bg, var(--surface, rgba(18,18,20,0.92)));
          border: 1px solid var(--tooltip-border, var(--border, rgba(255,255,255,0.10)));
          border-left-color: transparent;
          border-top-color: transparent;
          border-right-color: var(--tooltip-border, var(--border, rgba(255,255,255,0.10)));
          border-bottom-color: var(--tooltip-border, var(--border, rgba(255,255,255,0.10)));
          filter: drop-shadow(0 2px 8px rgba(0,0,0,.15));
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .tt-root { transition: none !important; }
        }
      `}</style>
    </div>
  ) : null;

  const renderPortal = (node: React.ReactNode) => {
    if (!mounted || !node) return null;
    try { if (Portal) return <Portal>{node}</Portal>; } catch { }
    const target = typeof window !== 'undefined' ? document.body : null;
    return target ? createPortal(node, target) : null;
  };

  return (
    <>
      {trigger}
      {renderPortal(body)}
    </>
  );
}
