import { useCallback, useEffect, useRef, useState } from 'react';

interface PaginatedApplicationsResult<T> {
  items: T[];
  total: number | null;
  hasMore: boolean;
  loadingInitial: boolean;
  loadingMore: boolean;
  prefetching: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  resetAndReload: () => Promise<void>;
  // Hinted prefetch trigger (optional external use)
  prefetchNext: () => Promise<void>;
}

export function usePaginatedApplications<T extends { id: any }>(opts?: { userId?: number; pageSize?: number; }) : PaginatedApplicationsResult<T> {
  const userId = opts?.userId ?? 1;
  const pageSizeRef = useRef(opts?.pageSize ?? 50);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflightRef = useRef<Promise<any> | null>(null);
  const [prefetching, setPrefetching] = useState(false);
  const prefetchCacheRef = useRef<{ offset: number; items: T[]; total: number | null } | null>(null);
  const prefetchInflightRef = useRef<Promise<any> | null>(null);
  const MAX_PREFETCH_AHEAD_PAGES = 1; // keep memory bounded

  const fetchPage = useCallback(async (nextOffset: number, replace: boolean) => {
    const limit = pageSizeRef.current;
    const params = new URLSearchParams({ userId: String(userId), limit: String(limit), offset: String(nextOffset) });
    console.log(`[usePaginatedApplications] Fetching: offset=${nextOffset}, limit=${limit}`);
    const res = await fetch(`/api/applications?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to load applications page (${res.status})`);
    const json = await res.json();
    const pageItems: T[] = json.items || json; // fallback if legacy shape
    console.log(`[usePaginatedApplications] Received: ${pageItems.length} items, total=${json.total}, hasMore=${json.hasMore}`);

    // Total handling strategy:
    // 1. If API supplies total, trust it.
    // 2. If no total: keep total=null while pages are "full" (pageItems.length === limit) so hasMore stays true.
    // 3. When we receive a short page (< limit), we know we've reached the end; set total to nextOffset + pageItems.length.
    setItems(prev => {
      const newItems = replace ? pageItems : [...prev, ...pageItems];
      console.log(`[usePaginatedApplications] Items updated: ${prev.length} -> ${newItems.length}`);
      return newItems;
    });
    setOffset(nextOffset + pageItems.length);
    if (typeof json.total === 'number') {
      setTotal(json.total);
    } else if (pageItems.length < limit) {
      // Infer final total from accumulated count
      setTotal(nextOffset + pageItems.length);
    } else if (replace) {
      // On initial load without total and full page, ensure total remains null (explicit) so hasMore=true
      setTotal(null);
    }
  }, [userId]);

  // Raw fetch that returns data without committing (used for prefetch)
  const fetchPageSilent = useCallback(async (nextOffset: number) => {
    const limit = pageSizeRef.current;
    const params = new URLSearchParams({ userId: String(userId), limit: String(limit), offset: String(nextOffset) });
    console.log(`[usePaginatedApplications] Prefetching (silent): offset=${nextOffset}, limit=${limit}`);
    const res = await fetch(`/api/applications?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to prefetch applications page (${res.status})`);
    const json = await res.json();
    const pageItems: T[] = json.items || json;
    let inferredTotal: number | null = null;
    if (typeof json.total === 'number') inferredTotal = json.total;
    else if (pageItems.length < limit) inferredTotal = nextOffset + pageItems.length; // last page
    return { items: pageItems, total: inferredTotal };
  }, [userId]);

  const loadInitial = useCallback(async () => {
    setLoadingInitial(true); setError(null);
    try { await fetchPage(0, true); } catch (e:any) { setError(e.message || 'Failed to load'); }
    finally { setLoadingInitial(false); }
  }, [fetchPage]);

  const commitPrefetchedIfAvailable = useCallback(() => {
    if (!prefetchCacheRef.current) return false;
    if (prefetchCacheRef.current.offset !== offset) return false; // stale (offset advanced meanwhile)
    const { items: cachedItems, total: cachedTotal } = prefetchCacheRef.current;
    setItems(prev => {
      const newItems = [...prev, ...cachedItems];
      console.log(`[usePaginatedApplications] Committing prefetched page: ${prev.length} -> ${newItems.length}`);
      return newItems;
    });
    setOffset(offset + cachedItems.length);
    if (cachedTotal !== null) setTotal(cachedTotal);
    prefetchCacheRef.current = null;
    return true;
  }, [offset]);

  const scheduleAutoPrefetch = useCallback(() => {
    // Heuristic: only prefetch if within limit and not already prefetched
    if (prefetchInflightRef.current || prefetchCacheRef.current) return;
    if (total !== null && items.length >= total) return; // nothing more
    const nextOffset = offset;
    const pagesLoaded = items.length / pageSizeRef.current;
    const pagesPrefetched = prefetchCacheRef.current ? 1 : 0;
    if (pagesPrefetched >= MAX_PREFETCH_AHEAD_PAGES) return;
    // Defer to idle to avoid blocking main work
    const idleCallback = (cb: () => void) => {
      if (typeof (window as any).requestIdleCallback === 'function') (window as any).requestIdleCallback(cb, { timeout: 500 });
      else setTimeout(cb, 150);
    };
    idleCallback(async () => {
      setPrefetching(true);
      try {
        const inflight = fetchPageSilent(nextOffset);
        prefetchInflightRef.current = inflight;
        const { items: pfItems, total: pfTotal } = await inflight;
        if (pfItems.length === 0) {
          if (pfTotal !== null) setTotal(pfTotal);
        } else {
          prefetchCacheRef.current = { offset: nextOffset, items: pfItems, total: pfTotal };
          console.log(`[usePaginatedApplications] Prefetched page cached at offset=${nextOffset} count=${pfItems.length}`);
        }
      } catch (e:any) {
        console.warn('[usePaginatedApplications] Prefetch failed:', e.message);
      } finally {
        setPrefetching(false);
        prefetchInflightRef.current = null;
      }
    });
  }, [fetchPageSilent, items.length, offset, total]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loadingInitial) return;
    if (total !== null && items.length >= total) return;
    setLoadingMore(true);
    try {
      const usedCache = commitPrefetchedIfAvailable();
      if (!usedCache) {
        await fetchPage(offset, false);
      }
    } catch (e:any) {
      setError(e.message || 'Failed to load more');
    } finally {
      setLoadingMore(false);
      // After any load attempt, try to prefetch next
      scheduleAutoPrefetch();
    }
  }, [loadingMore, loadingInitial, total, items.length, commitPrefetchedIfAvailable, fetchPage, offset, scheduleAutoPrefetch]);

  const prefetchNext = useCallback(async () => {
    if (prefetchInflightRef.current || prefetchCacheRef.current) return;
    if (total !== null && items.length >= total) return;
    setPrefetching(true);
    try {
      const inflight = fetchPageSilent(offset);
      prefetchInflightRef.current = inflight;
      const { items: pfItems, total: pfTotal } = await inflight;
      if (pfItems.length === 0) {
        if (pfTotal !== null) setTotal(pfTotal);
      } else {
        prefetchCacheRef.current = { offset, items: pfItems, total: pfTotal };
        console.log(`[usePaginatedApplications] Manual prefetch cached at offset=${offset} count=${pfItems.length}`);
      }
    } catch (e:any) {
      console.warn('[usePaginatedApplications] Manual prefetch failed:', e.message);
    } finally {
      setPrefetching(false);
      prefetchInflightRef.current = null;
    }
  }, [offset, total, items.length, fetchPageSilent]);

  const refresh = useCallback(async () => {
    return loadInitial();
  }, [loadInitial]);

  const resetAndReload = useCallback(async () => {
    setItems([]); setOffset(0); await loadInitial();
  }, [loadInitial]);

  useEffect(() => { loadInitial(); }, [loadInitial]);
  // After initial load completes, schedule a prefetch for smoother second page reveal
  useEffect(() => {
    if (!loadingInitial && items.length > 0) scheduleAutoPrefetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingInitial]);

  const hasMore = total == null || items.length < total;
  console.log('[usePaginatedApplications] hasMore calculation:', {
    total,
    itemsLength: items.length,
    hasMore,
    loadingInitial,
    loadingMore
  });

  return { items, total, hasMore, loadingInitial, loadingMore, prefetching, error, loadMore, refresh, resetAndReload, prefetchNext };
}
