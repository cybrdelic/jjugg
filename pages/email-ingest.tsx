import AppLayout from "@/components/AppLayout";
import GlassButton from "@/components/GlassButton";
import Pill from "@/components/Pill";
import Tooltip from "@/components/Tooltip";
import ActivityPanel from "@/components/email/ActivityPanel";
import ProtocolPanel from "@/components/email/ProtocolPanel";
import { useSnackBar } from "@/contexts/SnackBarContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// dynamic import of DOMPurify to avoid SSR/type issues
let dompurifySanitize: ((html: string) => string) | null = null;
if (typeof window !== "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod: any = require("dompurify");
    dompurifySanitize = mod.default?.sanitize || mod.sanitize || null;
  } catch {}
}

interface ParsedInfo {
  company?: string;
  role?: string;
  next_action?: string;
  action_date?: string;
  sentiment?: string;
  summary?: string;
  raw?: string;
}
interface EmailRow {
  id: number;
  date: string;
  subject: string;
  class: string;
  vendor: string;
  application_id: number | null;
  parse_status: string;
  parsed_at?: string;
  openai_model?: string;
  parsed_json?: ParsedInfo | null;
  company?: string;
  position?: string;
}
interface StatsRunMetrics {
  start?: string;
  end?: string | null;
  in_progress?: boolean;
  current?: string | null;
  duration_ms?: number | null;
  fetch?: { stored: number; skipped_non_relevant: number };
  parse?: { parsed: number; errors: number; pending_queue: number };
  openai?: { tokens: number; cost_usd: number };
  protocol?: { count: number; verbose: boolean };
  env?: {
    mailbox: string;
    batch_limit: number;
    max_initial_sync: number;
    include_alerts: boolean;
  };
}
interface Stats {
  success: boolean;
  counts?: { total: number; parsed: number; pending: number; error: number };
  lastParsedAt: string | null;
  lastEmailDate: string | null;
  lastUid: number | null;
  vendors: { vendor: string; count: number }[];
  classes: { class: string; count: number }[];
  cost?: { total_usd: number; avg_per_email_usd: number; total_tokens: number };
  run?: StatsRunMetrics;
}

export default function EmailIngestDashboard() {
  const snack = useSnackBar();
  const headerRef = useRef<HTMLElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRelative, setShowRelative] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return localStorage.getItem("ingest_showRelative") !== "0";
    } catch {
      return true;
    }
  });
  // Search & column visibility for emails table
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCols, setVisibleCols] = useState<string[]>(() => {
    if (typeof window === "undefined")
      return [
        "date",
        "subject",
        "class",
        "vendor",
        "status",
        "extract",
        "link",
      ];
    try {
      return JSON.parse(
        localStorage.getItem("ingest_visibleCols") ||
          '["date","subject","class","vendor","status","extract","link"]'
      );
    } catch {
      return [
        "date",
        "subject",
        "class",
        "vendor",
        "status",
        "extract",
        "link",
      ];
    }
  });
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [protocolLogs, setProtocolLogs] = useState<any[]>([]);
  // Batched SSE buffering to reduce re-render thrash
  const logBufferRef = useRef<any[]>([]);
  const logFlushTimerRef = useRef<any | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<
    "logs" | "protocol" | "stats" | "headers"
  >("logs");
  const [logFilter, setLogFilter] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [sseConnected, setSseConnected] = useState<boolean | null>(null);
  // Activity panel UX states (lightweight themed revamp)
  const [logsGrouped, setLogsGrouped] = useState(false); // toggle grouped-by-phase view
  const [phaseFilters, setPhaseFilters] = useState<Set<string>>(
    () => new Set()
  ); // empty => all
  const togglePhaseFilter = useCallback((p: string) => {
    setPhaseFilters((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }, []);
  const [headers, setHeaders] = useState<any[]>([]);
  const [headersLoading, setHeadersLoading] = useState(false);
  const [headerDecision, setHeaderDecision] = useState("");
  const loadHeaders = useCallback(async () => {
    setHeadersLoading(true);
    try {
      const params = new URLSearchParams();
      if (headerDecision) params.set("decision", headerDecision);
      params.set("limit", "120");
      const r = await fetch("/api/email/header-cache?" + params.toString());
      const d = await r.json();
      if (d.success) setHeaders(d.rows || []);
    } catch {
    } finally {
      setHeadersLoading(false);
    }
  }, [headerDecision]);
  useEffect(() => {
    if (activeRightTab === "headers") {
      loadHeaders();
    }
  }, [activeRightTab, loadHeaders]);
  const [showSkipped, setShowSkipped] = useState(false);
  const [skippedLoading, setSkippedLoading] = useState(false);
  const [skipped, setSkipped] = useState<
    {
      id: number;
      created_at: string;
      uid: number;
      subject: string;
      detail: string;
    }[]
  >([]);
  const [skippedError, setSkippedError] = useState<string | null>(null);
  const [skippedDetail, setSkippedDetail] = useState<{
    id: number;
    created_at: string;
    uid: number;
    subject: string;
    detail: string;
  } | null>(null);
  // Display count preference: authoritative run stats -> logs derived -> loaded list length
  const skippedCount = useMemo(() => {
    const runVal = stats?.run?.fetch?.skipped_non_relevant;
    if (runVal != null) return runVal;
    // derive from current logs (fetch skip events)
    const logVal = logs.reduce(
      (acc, l) =>
        acc + (l.phase === "fetch" && l.status === "skip_non_relevant" ? 1 : 0),
      0
    );
    if (logVal) return logVal;
    return skipped.length;
  }, [stats?.run?.fetch?.skipped_non_relevant, logs, skipped.length]);
  // Backfill feature removed (state cleaned up)
  const protocolPanelRef = useRef<HTMLDivElement | null>(null);
  const rightLogsRef = useRef<HTMLDivElement | null>(null);
  const live = running || !!stats?.run?.in_progress;
  // Run hover card (last sync) positioning
  const [runCardOpen, setRunCardOpen] = useState(false);
  const runCardRef = useRef<HTMLDivElement | null>(null);
  const runTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [runCardPos, setRunCardPos] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 520 });
  // (panel collapse removed)
  // Live IMAP (placeholder) search
  const [imapQuery, setImapQuery] = useState("");
  const [imapTyping, setImapTyping] = useState(false);
  const [imapResults, setImapResults] = useState<{ matches: any[] } | null>(
    null
  );
  const [imapState, setImapState] = useState<
    "idle" | "searching" | "success" | "error"
  >("idle");
  const [imapSearching, setImapSearching] = useState(false);
  const [imapError, setImapError] = useState<string | null>(null);
  const imapAbortRef = useRef<AbortController | null>(null);
  const [imapAll, setImapAll] = useState(false);
  // Cinematic polish helpers
  const prevLogIdsRef = useRef<Set<number>>(new Set());
  const recentNewLogIdsRef = useRef<Set<number>>(new Set());
  // Track newly arriving logs for highlight animation
  useEffect(() => {
    const currentIds = new Set<number>();
    logs.forEach((l) => {
      if (l?.id != null) currentIds.add(l.id);
    });
    // determine new ids
    const newOnes: number[] = [];
    currentIds.forEach((id) => {
      if (!prevLogIdsRef.current.has(id)) newOnes.push(id);
    });
    if (newOnes.length) {
      newOnes.forEach((id) => {
        recentNewLogIdsRef.current.add(id);
        setTimeout(() => {
          recentNewLogIdsRef.current.delete(id);
        }, 1900);
      });
    }
    prevLogIdsRef.current = currentIds;
  }, [logs]);
  // Debounced search
  useEffect(() => {
    if (!imapQuery) {
      setImapResults(null);
      setImapError(null);
      setImapState("idle");
      return;
    }
    setImapTyping(true);
    const t = setTimeout(
      () => {
        setImapTyping(false);
        if (imapAbortRef.current) imapAbortRef.current.abort();
        const ctrl = new AbortController();
        imapAbortRef.current = ctrl;
        setImapSearching(true);
        setImapError(null);
        setImapState("searching");
        const params = new URLSearchParams();
        params.set("q", imapQuery);
        if (imapAll) params.set("all", "1");
        fetch(`/api/email/search-imap?${params.toString()}`, {
          signal: ctrl.signal,
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.error) throw new Error(d.error);
            setImapResults(d.results || { matches: [] });
            setImapState("success");
          })
          .catch((e) => {
            if (e.name !== "AbortError") {
              setImapError(e.message || "search failed");
              setImapState("error");
            }
          })
          .finally(() => setImapSearching(false));
      },
      imapQuery.length < 3 ? 450 : 250
    );
    return () => clearTimeout(t);
  }, [imapQuery, imapAll]);
  const positionRunCard = useCallback(() => {
    if (!runCardOpen || !runCardRef.current || !runTriggerRef.current) return;
    const card = runCardRef.current;
    const trig = runTriggerRef.current;
    const rect = trig.getBoundingClientRect();
    const cardWidth = Math.min(
      520,
      Math.max(300, Math.min(window.innerWidth - 16, 520))
    );
    let left = rect.right - cardWidth; // align right edge with trigger right
    left = Math.max(8, Math.min(left, window.innerWidth - cardWidth - 8));
    const top = rect.bottom + 8;
    setRunCardPos({ top, left, width: cardWidth });
  }, [runCardOpen]);
  useEffect(() => {
    if (runCardOpen) {
      positionRunCard();
      const onResize = () => positionRunCard();
      window.addEventListener("resize", onResize);
      window.addEventListener("scroll", onResize, true);
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onResize, true);
      };
    }
  }, [runCardOpen, positionRunCard]);
  // Apply CSS vars to :root (no inline style to satisfy lint rule)
  useEffect(() => {
    if (!runCardOpen) return;
    const root = document.documentElement;
    root.style.setProperty("--rhc-top", runCardPos.top + "px");
    root.style.setProperty("--rhc-left", runCardPos.left + "px");
    root.style.setProperty("--rhc-width", runCardPos.width + "px");
  }, [runCardPos, runCardOpen]);
  useEffect(() => {
    if (!runCardOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!runCardRef.current || !runTriggerRef.current) return;
      if (
        runCardRef.current.contains(e.target as Node) ||
        runTriggerRef.current.contains(e.target as Node)
      )
        return;
      setRunCardOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [runCardOpen]);

  // Dynamic header measurement for responsive height calculations
  useEffect(() => {
    const headerEl = headerRef.current;
    const container = pageRef.current;
    if (!headerEl || !container) return;
    container.classList.add("layout-calcing");
    const apply = () => {
      const h = headerEl.getBoundingClientRect().height;
      container.style.setProperty("--hdr-h", h + "px");
    };
    apply();
    const ro = new ResizeObserver(() => apply());
    ro.observe(headerEl);
    const onResize = () => apply();
    window.addEventListener("resize", onResize);
    const id = setTimeout(() => {
      container.classList.remove("layout-calcing");
      apply();
    }, 30);
    return () => {
      clearTimeout(id);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Removed header measurement (no sticky layout now)

  useEffect(() => {
    const es = new EventSource("/api/email/stream?initial=200");
    let opened = false;
    es.onopen = () => {
      setSseConnected(true);
      opened = true;
    };
    es.addEventListener("init", (ev: any) => {
      try {
        const rows = JSON.parse(ev.data);
        setLogs(rows);
        setProtocolLogs(rows.filter((r: any) => r.phase === "imap_dbg"));
      } catch {}
    });
    es.addEventListener("append", (ev: any) => {
      try {
        const rows = JSON.parse(ev.data);
        if (!rows.length) return;
        logBufferRef.current.push(...rows);
        if (!logFlushTimerRef.current) {
          logFlushTimerRef.current = setTimeout(() => {
            const flushed = logBufferRef.current.splice(0);
            logFlushTimerRef.current = null;
            if (!flushed.length) return;
            setLogs((prev) => {
              const merged = [...prev, ...flushed];
              const seen = new Set<number>();
              return merged
                .filter((r) =>
                  seen.has(r.id) ? false : (seen.add(r.id), true)
                )
                .slice(-600);
            });
            setProtocolLogs((prev) => {
              const newProto = flushed.filter(
                (r: any) => r.phase === "imap_dbg"
              );
              if (!newProto.length) return prev;
              const merged = [...prev, ...newProto];
              const seen = new Set<number>();
              return merged
                .filter((r) =>
                  seen.has(r.id) ? false : (seen.add(r.id), true)
                )
                .slice(-600);
            });
          }, 250);
        }
      } catch {}
    });
    es.addEventListener("error", () => {
      if (opened) setSseConnected(false);
    });
    return () => {
      es.close();
      if (logFlushTimerRef.current) clearTimeout(logFlushTimerRef.current);
    };
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/email/stats");
      const data = await res.json();
      if (data && data.success && data.counts) setStats(data);
      else setStats(null);
    } catch {
      setStats(null);
    }
  }, []);
  const loadEmails = useCallback(async () => {
    if (statusFilter === "skipped") {
      setEmails([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = new URL(window.location.origin + "/api/email/recent");
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEmails(data.emails || []);
    } catch (e: any) {
      setError(e.message || "Failed to load emails");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);
  const [showRaw, setShowRaw] = useState(false);
  const [fullBodyOpen, setFullBodyOpen] = useState(false);
  const [drawerWide, setDrawerWide] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const openDetail = async (id: number) => {
    setDetailId(id);
    setShowRaw(false);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await fetch(`/api/email/detail?id=${id}`);
      const data = await res.json();
      if (data.success) setDetailData(data);
      else setDetailData({ error: data.error });
    } catch (e: any) {
      setDetailData({ error: e.message });
    } finally {
      setDetailLoading(false);
    }
  };
  const closeDetail = () => {
    setDetailId(null);
    setDetailData(null);
    setShowRaw(false);
    setFullBodyOpen(false);
    setPreviewExpanded(false);
  };

  // Preference persistence
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = localStorage.getItem("ingest_drawerWide");
    if (w === "1") setDrawerWide(true);
    const raw = localStorage.getItem("ingest_showRaw");
    if (raw === "1") setShowRaw(true);
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("ingest_drawerWide", drawerWide ? "1" : "0");
  }, [drawerWide]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("ingest_showRaw", showRaw ? "1" : "0");
  }, [showRaw]);

  // Keyboard shortcuts when detail open
  useEffect(() => {
    if (detailId == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement)?.tagName === "INPUT" ||
        (e.target as HTMLElement)?.tagName === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable
      )
        return;
      if (e.key === "Escape") {
        if (fullBodyOpen) {
          setFullBodyOpen(false);
          return;
        }
        closeDetail();
      } else if (e.key === "f" || e.key === "F") {
        if (!showRaw && detailData?.email?.raw_html) {
          setFullBodyOpen((o) => !o);
        }
      } else if (e.key === "r" || e.key === "R") {
        setShowRaw((r) => !r);
      } else if (e.key === "ArrowRight") {
        navigateDetail(1);
      } else if (e.key === "ArrowLeft") {
        navigateDetail(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailId, showRaw, fullBodyOpen, detailData]);

  const navigateDetail = (dir: number) => {
    if (detailId == null) return;
    const idx = emails.findIndex((e) => e.id === detailId);
    if (idx === -1) return;
    const next = emails[idx + dir];
    if (next) openDetail(next.id);
  };

  // Focus trap for drawer & fullscreen overlay
  const trapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (detailId == null) return;
    const root = trapRef.current;
    if (!root) return; // move focus to first
    const focusables = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        )
      ).filter(
        (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
      );
    const toFocus = focusables()[0];
    toFocus?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const list = focusables();
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    root.addEventListener("keydown", onKey as any);
    return () => root.removeEventListener("keydown", onKey as any);
  }, [detailId, drawerWide, showRaw, fullBodyOpen]);

  // Measure rendered preview height to decide show expand
  const renderedRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!detailId || showRaw) {
      setCanExpand(false);
      return;
    }
    const el = renderedRef.current;
    if (!el) {
      setCanExpand(false);
      return;
    }
    const run = () => {
      if (!el) return;
      setCanExpand(el.scrollHeight > 340);
    };
    run();
    const obs = new ResizeObserver(run);
    obs.observe(el);
    return () => obs.disconnect();
  }, [detailId, showRaw, detailData]);
  const triggerIngest = async () => {
    setRunning(true);
    setError(null);
    snack.showInfo("Ingestion cycle starting");
    try {
      const res = await fetch("/api/email/ingest", { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Ingest failed");
      snack.showSuccess("Ingestion started", "Cycle registered");
      await loadStats();
      await loadEmails();
    } catch (e: any) {
      setError(e.message || "Failed to run ingest");
      snack.showError("Ingest failed", e.message);
    } finally {
      setRunning(false);
    }
  };
  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/email/logs?limit=250");
      const data = await res.json();
      if (!data.error) {
        const rows = data.logs || [];
        setLogs(rows);
        setProtocolLogs(rows.filter((r: any) => r.phase === "imap_dbg"));
      }
    } catch {
    } finally {
      setLogsLoading(false);
    }
  }, []);
  useEffect(() => {
    loadStats();
    const ms = live ? 1500 : 10000;
    const id = setInterval(loadStats, ms);
    return () => clearInterval(id);
  }, [loadStats, live]);
  useEffect(() => {
    loadEmails();
  }, [loadEmails]);
  useEffect(() => {
    loadLogs();
    const ms = live ? 1200 : 6000;
    const id = setInterval(loadLogs, ms);
    return () => clearInterval(id);
  }, [loadLogs, live]);
  // Backfill polling removed
  // (Removed earlier plain toggleBackfill and deleteAll definitions below; using snackbar-enhanced versions later)
  const loadSkipped = useCallback(async () => {
    setSkippedLoading(true);
    setSkippedError(null);
    try {
      const res = await fetch("/api/email/skipped");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed");
      setSkipped(data.skipped || []);
    } catch (e: any) {
      setSkippedError(e.message);
    } finally {
      setSkippedLoading(false);
    }
  }, []);
  useEffect(() => {
    if (showSkipped || statusFilter === "skipped") {
      loadSkipped();
    }
  }, [showSkipped, statusFilter, loadSkipped]);
  // Removed manual header/table height calculations; layout now pure flex/grid auto-fit.
  // While viewing skipped, if the authoritative skipped count increases, refresh list
  const prevRunSkippedRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (statusFilter !== "skipped") return;
    const current = stats?.run?.fetch?.skipped_non_relevant;
    if (current != null) {
      if (prevRunSkippedRef.current == null)
        prevRunSkippedRef.current = current;
      else if (current > prevRunSkippedRef.current) {
        loadSkipped();
        prevRunSkippedRef.current = current;
      }
    }
  }, [statusFilter, stats?.run?.fetch?.skipped_non_relevant, loadSkipped]);

  const counts = stats?.counts || { total: 0, parsed: 0, pending: 0, error: 0 };
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("ingest_showRelative", showRelative ? "1" : "0");
  }, [showRelative]);
  // Persist visible column prefs
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("ingest_visibleCols", JSON.stringify(visibleCols));
  }, [visibleCols]);
  const toggleCol = (c: string) =>
    setVisibleCols((cols) =>
      cols.includes(c) ? cols.filter((x) => x !== c) : [...cols, c]
    );
  const allEmailCols = [
    "date",
    "subject",
    "class",
    "vendor",
    "status",
    "extract",
    "link",
  ];
  // Simple relative time for recent emails
  const relativeTime = (iso: string) => {
    try {
      const dt = new Date(iso);
      const diff = Date.now() - dt.getTime();
      const s = Math.floor(diff / 1000);
      if (s < 60) return s + "s";
      const m = Math.floor(s / 60);
      if (m < 60) return m + "m";
      const h = Math.floor(m / 60);
      if (h < 24) return h + "h";
      const d = Math.floor(h / 24);
      return d + "d";
    } catch {
      return iso;
    }
  };
  const formatTime = (iso: string) =>
    showRelative ? relativeTime(iso) : new Date(iso).toLocaleTimeString();
  const highlight = (text: string) => {
    if (!searchQuery || !text) return text;
    const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return text;
    const end = idx + searchQuery.length;
    return (
      <>
        {text.slice(0, idx)}
        <mark>{text.slice(idx, end)}</mark>
        {text.slice(end)}
      </>
    );
  };
  const deleteAll = async () => {
    if (
      !window.confirm(
        "Delete ALL stored emails and logs? This cannot be undone."
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch("/api/email/delete-all", { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Delete failed");
      snack.showWarning("All data deleted");
      await loadStats();
      await loadEmails();
      await loadLogs();
    } catch (e: any) {
      setError(e.message || "Failed to delete");
      snack.showError("Delete failed", e.message);
    } finally {
      setDeleting(false);
    }
  };
  // toggleBackfill removed
  // Search / filter emails client-side
  const filteredEmails = useMemo(
    () =>
      emails.filter((e) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const subject = (e.subject || "").toLowerCase();
          const vendor = (e.vendor || "").toLowerCase();
          const cls = (e.class || "").toLowerCase();
          if (!(subject.includes(q) || vendor.includes(q) || cls.includes(q)))
            return false;
        }
        return true;
      }),
    [emails, searchQuery]
  );
  // Inline row expansion tracking (store IDs)
  const [expandedVersion, setExpandedVersion] = useState(0); // dummy state to force rerender
  const expandedRowsRef = useRef<Set<number>>(new Set());
  const toggleRowExpand = (id: number) => {
    const setRef = expandedRowsRef.current;
    if (setRef.has(id)) setRef.delete(id);
    else setRef.add(id);
    setExpandedVersion((v) => v + 1);
  };
  const statsProgress = useMemo(() => {
    const denom = counts.pending + counts.parsed + counts.error;
    return denom ? Math.round((counts.parsed / denom) * 100) : 0;
  }, [counts]);
  // progress class previously used for progress bar (removed with overview cards)
  const phaseInfo = useMemo(() => {
    const latest = (ph: string, st?: string) => {
      for (let i = logs.length - 1; i >= 0; i--) {
        const l = logs[i];
        if (l.phase === ph && (!st || l.status === st)) return l;
      }
      return null;
    };
    const schema = latest("schema", "ensured");
    const imapConnectStart = latest("imap", "connect_start");
    const imapConnected = latest("imap", "connected");
    const mailboxOpen = latest("imap", "mailbox_open");
    const searchStart = latest("search", "start");
    const searchFound = latest("search", "found");
    const fetchStoredCount = logs.filter(
      (l) => l.phase === "fetch" && l.status === "stored"
    ).length;
    const fetchSkipCount = logs.filter(
      (l) => l.phase === "fetch" && l.status === "skip_non_relevant"
    ).length;
    const parseParsedCount = logs.filter(
      (l) => l.phase === "parse" && l.status === "parsed"
    ).length;
    const parseErrorCount = logs.filter(
      (l) => l.phase === "parse" && l.status === "error"
    ).length;
    const runStart = latest("run", "start");
    const runEnd = latest("run", "end");
    const lastStored = (() => {
      for (let i = logs.length - 1; i >= 0; i--) {
        const l = logs[i];
        if (l.phase === "fetch" && l.status === "stored") return l;
      }
      return null;
    })();
    return {
      schema,
      imapConnectStart,
      imapConnected,
      mailboxOpen,
      searchStart,
      searchFound,
      fetchStoredCount,
      fetchSkipCount,
      parseParsedCount,
      parseErrorCount,
      runStart,
      runEnd,
      lastStored,
    };
  }, [logs]);
  // (removed showFlow collapse control after user feedback)

  // Microinteraction helpers: track per-stage start timestamps & durations
  const stageStartRef = useRef<Record<string, number>>({});
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setNowTick(Date.now()), 500);
    return () => clearInterval(id);
  }, [live]);
  // (moved flowStages duration tracker below flowStages definition to satisfy linter)
  const stageElapsed = (key: string) => {
    const start = stageStartRef.current[key];
    if (!start) return null;
    const done = stageStartRef.current[key + "__done"];
    const end = done || nowTick;
    return ((end - start) / 1000).toFixed(1) + "s";
  };

  // Flow chart stages derived from logs
  const flowStages = useMemo(() => {
    type Stage = {
      key: string;
      label: string;
      state: "pending" | "active" | "done" | "error" | "blocked";
      detail?: string;
      meta?: Record<string, any>;
      desc: string;
    };
    const stages: Stage[] = [
      {
        key: "schema",
        label: "Ensure Schema",
        state: "pending",
        desc: "Verify & create required database tables / indexes. Done after first ensure.",
      },
      {
        key: "run",
        label: "Start Run",
        state: "pending",
        desc: "Registers a new ingestion cycle and records environment (mailbox, limits). Instantaneous.",
      },
      {
        key: "imap",
        label: "Connect IMAP",
        state: "pending",
        desc: "Open TCP + TLS to provider and authenticate using stored credentials.",
      },
      {
        key: "mailbox",
        label: "Open Mailbox",
        state: "pending",
        desc: "Select target mailbox/folder (e.g. INBOX). Must succeed before search.",
      },
      {
        key: "search",
        label: "Search Mailbox",
        state: "pending",
        desc: "IMAP SEARCH for candidate messages within time / relevance window.",
      },
      {
        key: "fetch",
        label: "Fetch Emails",
        state: "pending",
        desc: "Download headers + bodies for candidate UIDs; skip early if not relevant.",
      },
      {
        key: "parse",
        label: "Parse & Classify",
        state: "pending",
        desc: "LLM + heuristics extract structured fields; classify and summarize.",
      },
      {
        key: "end",
        label: "Finalize",
        state: "pending",
        desc: "Mark run complete, persist aggregates & cost metrics.",
      },
    ];
    const has = (ph: string, st?: string) =>
      logs.some((l) => l.phase === ph && (!st || l.status === st));
    const anyError = (ph: string) =>
      logs.some((l) => l.phase === ph && l.status === "error");
    const setState = (key: string, updater: (s: Stage) => void) => {
      const s = stages.find((x) => x.key === key);
      if (s) updater(s);
    };
    // schema
    if (has("schema", "ensured"))
      setState("schema", (s) => {
        s.state = "done";
        s.detail = "ready";
      });
    // run start
    if (has("run", "start"))
      setState("run", (s) => {
        s.state = anyError("run") ? "error" : "done";
        s.detail = "started";
      });
    // imap
    if (has("imap", "connect_start") && !has("imap", "connected"))
      setState("imap", (s) => {
        s.state = anyError("imap") ? "error" : "active";
        s.detail = "authenticating";
      });
    if (has("imap", "connected"))
      setState("imap", (s) => {
        s.state = anyError("imap") ? "error" : "done";
        s.detail = "connected";
      });
    // mailbox
    if (has("imap", "mailbox_open"))
      setState("mailbox", (s) => {
        s.state = "done";
        s.detail = "opened";
      });
    // search
    if (has("search", "start") && !has("search", "found"))
      setState("search", (s) => {
        s.state = "active";
        s.detail = "querying";
      });
    if (has("search", "found"))
      setState("search", (s) => {
        const found = logs.find(
          (l) => l.phase === "search" && l.status === "found"
        )?.detail;
        s.state = "done";
        s.detail = found || "found";
        s.meta = { found };
      });
    // fetch
    const fetchStored = logs.filter(
      (l) => l.phase === "fetch" && l.status === "stored"
    ).length;
    const fetchSkipped = logs.filter(
      (l) => l.phase === "fetch" && l.status === "skip_non_relevant"
    ).length;
    const fetchErrors = logs.filter(
      (l) => l.phase === "fetch" && l.status === "error"
    ).length;
    if (fetchStored || fetchSkipped || fetchErrors)
      setState("fetch", (s) => {
        s.state = fetchErrors ? "error" : "done";
        s.detail = `${fetchStored} stored · ${fetchSkipped} skipped`;
        s.meta = {
          stored: fetchStored,
          skipped: fetchSkipped,
          errors: fetchErrors,
        };
      });
    else if (has("search", "found"))
      setState("fetch", (s) => {
        s.state = "done";
        s.detail = "0 processed";
      });
    // parse
    const parseParsed = logs.filter(
      (l) => l.phase === "parse" && l.status === "parsed"
    ).length;
    const parseErrors = logs.filter(
      (l) => l.phase === "parse" && l.status === "error"
    ).length;
    if (parseParsed || parseErrors)
      setState("parse", (s) => {
        s.state = parseErrors ? "error" : "done";
        s.detail = `${parseParsed} parsed${
          parseErrors ? ` · ${parseErrors} errors` : ""
        }`;
        s.meta = { parsed: parseParsed, errors: parseErrors };
      });
    else if (has("fetch", "stored"))
      setState("parse", (s) => {
        s.state = "active";
        s.detail = "processing";
      });
    // end
    if (has("run", "end"))
      setState("end", (s) => {
        s.state = anyError("run") ? "error" : "done";
        s.detail = "complete";
      });
    return stages;
  }, [logs]);

  // Live progress derived from logs + stage completion (more responsive than stats polling)
  const liveProgress = useMemo(() => {
    const fetchProcessed = logs.reduce(
      (acc, l) =>
        acc +
        (l.phase === "fetch" &&
        (l.status === "stored" ||
          l.status === "skip_non_relevant" ||
          l.status === "error")
          ? 1
          : 0),
      0
    );
    const parsedCount = logs.reduce(
      (acc, l) =>
        acc +
        (l.phase === "parse" && (l.status === "parsed" || l.status === "error")
          ? 1
          : 0),
      0
    );
    if (fetchProcessed > 0) {
      const pct = Math.min(
        100,
        Math.round((parsedCount / Math.max(fetchProcessed, 1)) * 100)
      );
      if (pct > 0) return pct;
    }
    const doneStages = flowStages.filter(
      (s) => s.state === "done" || s.state === "error"
    ).length;
    const pct = Math.round((doneStages / flowStages.length) * 100);
    return Math.min(100, Math.max(0, pct));
  }, [logs, flowStages]);
  const progress = liveProgress >= statsProgress ? liveProgress : statsProgress;
  // reverted flow grid experiment

  // Track stage durations AFTER flowStages defined (handles stages jumping directly to done)
  useEffect(() => {
    flowStages.forEach((st) => {
      if (st.state !== "pending" && !stageStartRef.current[st.key]) {
        stageStartRef.current[st.key] = Date.now();
      }
      if (
        st.state !== "pending" &&
        st.state !== "active" &&
        stageStartRef.current[st.key] &&
        !stageStartRef.current[st.key + "__done"]
      ) {
        stageStartRef.current[st.key + "__done"] = Date.now();
      }
    });
  }, [flowStages]);

  // (auto-scroll effects moved below filteredLogs definitions to avoid use-before-declare)

  // Derived filtered logs for UI controls
  const filteredLogs = useMemo(() => {
    let base = logs;
    if (logFilter) {
      base = base.filter(
        (l) =>
          l.phase === logFilter ||
          l.status === logFilter ||
          (l.detail || "").includes(logFilter)
      );
    }
    if (phaseFilters.size) {
      base = base.filter((l) => phaseFilters.has(l.phase));
    }
    return base;
  }, [logs, logFilter, phaseFilters]);
  // Derive sorted phases with counts for filter chips
  const logPhases = useMemo(() => {
    const counts: Record<string, { count: number; errors: number }> = {};
    logs.forEach((l) => {
      const e = counts[l.phase] || (counts[l.phase] = { count: 0, errors: 0 });
      e.count++;
      if (l.status === "error") e.errors++;
    });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0])) as [
      string,
      { count: number; errors: number }
    ][];
  }, [logs]);
  const groupedLogs = useMemo(() => {
    if (!logsGrouped) return null;
    const groups: Record<string, any[]> = {};
    filteredLogs.forEach((l) => {
      (groups[l.phase] || (groups[l.phase] = [])).push(l);
    });
    return Object.entries(groups)
      .map(([phase, rows]) => ({ phase, rows: rows.slice(-200) }))
      .sort((a, b) => a.phase.localeCompare(b.phase));
  }, [filteredLogs, logsGrouped]);
  const filteredProtocol = useMemo(() => {
    return protocolLogs.filter(
      (p) =>
        !logFilter ||
        p.status === logFilter ||
        p.phase === logFilter ||
        (p.detail || "").includes(logFilter)
    );
  }, [protocolLogs, logFilter]);

  // Auto-scroll logs / protocol when new rows appended
  useEffect(() => {
    if (!autoScroll) return;
    if (activeRightTab === "logs" && rightLogsRef.current) {
      rightLogsRef.current.scrollTop = rightLogsRef.current.scrollHeight;
    }
  }, [filteredLogs.length, autoScroll, activeRightTab]);
  useEffect(() => {
    if (!autoScroll) return;
    if (activeRightTab === "protocol" && protocolPanelRef.current) {
      protocolPanelRef.current.scrollTop =
        protocolPanelRef.current.scrollHeight;
    }
  }, [filteredProtocol.length, autoScroll, activeRightTab]);

  // Sync progress CSS variable for bar (avoid inline style for lint)
  useEffect(() => {
    const el = document.querySelector(".flow-progress-bar");
    if (el) {
      (el as HTMLElement).style.setProperty("--p", String(progress / 100));
    }
  }, [progress, live]);

  // Removed dynamic table height measurement; flexbox handles sizing.

  return (
    <AppLayout currentSection="applications-section">
      <div className="ingest-page" ref={pageRef}>
        <header className="header" ref={headerRef}>
          <div className="title-block">
            <div className="title-left">
              <h1>Email Ingest</h1>
              <p className="subtitle">
                Live ingestion, parsing and classification monitor.
              </p>
            </div>
            <div
              className="toolbar-actions"
              role="group"
              aria-label="Ingest actions"
            >
              <div className="filter-bar" aria-label="Email table filters">
                <input
                  className="filter-input"
                  placeholder="Search subject / vendor / class"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="col-menu-wrapper">
                  <button
                    type="button"
                    className="meta-chip"
                    onClick={() => setColMenuOpen((o) => !o)}
                    aria-haspopup="dialog"
                    aria-controls="col-menu-pop"
                  >
                    Cols ▾
                  </button>
                  {colMenuOpen && (
                    <div
                      id="col-menu-pop"
                      className="col-menu"
                      role="group"
                      aria-label="Toggle visible columns"
                    >
                      {allEmailCols.map((c) => (
                        <label key={c}>
                          <input
                            type="checkbox"
                            checked={visibleCols.includes(c)}
                            onChange={() => toggleCol(c)}
                          />{" "}
                          {c}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="sync-row">
                <div
                  className={`last-sync ${
                    stats?.run?.in_progress ? "in-progress" : ""
                  }`}
                >
                  <span className="ls-label">Run</span>
                  <span
                    className={`ls-status ${
                      stats?.run?.in_progress ? "inprog" : "idle"
                    }`}
                  >
                    {stats?.run?.in_progress ? "Active" : "Idle"}
                  </span>
                  <span className="ls-value">
                    {stats?.run?.start
                      ? new Date(stats.run.start).toLocaleTimeString()
                      : "—"}
                  </span>
                  <button
                    ref={runTriggerRef}
                    className="ls-info"
                    onClick={() => setRunCardOpen((o) => !o)}
                  >
                    i
                  </button>
                </div>
              </div>
              {runCardOpen && (
                <div
                  className="run-hover-card"
                  ref={runCardRef}
                  role="dialog"
                  aria-label="Run details"
                >
                  <div className="rhc-head">
                    <span className="rhc-title">Current Run</span>
                    <button
                      className="ls-info"
                      onClick={() => setRunCardOpen(false)}
                    >
                      ×
                    </button>
                  </div>
                  {stats?.run ? (
                    <div className="rhc-body">
                      <div className="rhc-meta">
                        <div>
                          <label>Started</label>
                          <span>
                            {stats.run.start
                              ? new Date(stats.run.start).toLocaleString()
                              : "—"}
                          </span>
                        </div>
                        <div>
                          <label>Ended</label>
                          <span>
                            {stats.run.end
                              ? new Date(stats.run.end).toLocaleTimeString()
                              : stats.run.in_progress
                              ? "…"
                              : "—"}
                          </span>
                        </div>
                        <div>
                          <label>Duration</label>
                          <span>
                            {stats.run.duration_ms != null
                              ? (stats.run.duration_ms / 1000).toFixed(1) + "s"
                              : stats.run.in_progress
                              ? "…"
                              : "—"}
                          </span>
                        </div>
                        <div>
                          <label>Phase</label>
                          <span>
                            {stats.run.current ||
                              (stats.run.in_progress ? "—" : "complete")}
                          </span>
                        </div>
                      </div>
                      <div className="rhc-grid">
                        <div className="item">
                          <label>Fetched Stored</label>
                          <span>{stats.run.fetch?.stored ?? 0}</span>
                        </div>
                        <div className="item">
                          <label>Skipped</label>
                          <span>
                            {stats.run.fetch?.skipped_non_relevant ?? 0}
                          </span>
                        </div>
                        <div className="item">
                          <label>Parsed</label>
                          <span>{stats.run.parse?.parsed ?? 0}</span>
                        </div>
                        <div className="item">
                          <label>Parse Err</label>
                          <span>{stats.run.parse?.errors ?? 0}</span>
                        </div>
                        <div className="item">
                          <label>Pending</label>
                          <span>{stats.run.parse?.pending_queue ?? 0}</span>
                        </div>
                        <div className="item">
                          <label>Tokens</label>
                          <span>{stats.run.openai?.tokens ?? 0}</span>
                        </div>
                        <div className="item">
                          <label>Cost</label>
                          <span>
                            {stats.run.openai
                              ? `$${stats.run.openai.cost_usd.toFixed(6)}`
                              : "$0.000000"}
                          </span>
                        </div>
                      </div>
                      <div className="rhc-env">
                        <span className="chip">
                          Mailbox: {stats.run.env?.mailbox}
                        </span>
                        <span className="chip">
                          Batch: {stats.run.env?.batch_limit}
                        </span>
                        <span className="chip">
                          Window: {stats.run.env?.max_initial_sync}
                        </span>
                        <span className="chip">
                          Alerts: {stats.run.env?.include_alerts ? "yes" : "no"}
                        </span>
                      </div>
                      <div className="rhc-legend">
                        <span>
                          <strong>Stored</strong>: persisted after relevance
                          filter.
                        </span>
                        <span>
                          <strong>Skipped</strong>: non‑relevant filtered early.
                        </span>
                        <span>
                          <strong>Pending</strong>: stored awaiting parsing.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rhc-empty">No run data.</div>
                  )}
                </div>
              )}
              <div className={`imap-search-box state-${imapState}`}>
                <input
                  placeholder="Search IMAP (subject / logs)"
                  value={imapQuery}
                  onChange={(e) => setImapQuery(e.target.value)}
                  className={imapQuery ? "has-text" : ""}
                />
                {imapQuery && (
                  <button
                    className="clear-btn"
                    onClick={() => setImapQuery("")}
                  >
                    ×
                  </button>
                )}
                {(imapSearching || imapTyping) && <span className="loader" />}
                {imapState === "success" && !imapSearching && (
                  <span
                    className="status-dot ok"
                    title={`${imapResults?.matches.length || 0} matches`}
                  ></span>
                )}
                {imapState === "error" && !imapSearching && (
                  <span
                    className="status-dot err"
                    title={imapError || "error"}
                  ></span>
                )}
                <label className="all-toggle" title="Search all mailboxes">
                  <input
                    type="checkbox"
                    checked={imapAll}
                    onChange={(e) => setImapAll(e.target.checked)}
                  />{" "}
                  all
                </label>
              </div>
              <GlassButton disabled={running} onClick={triggerIngest}>
                {running ? "Running…" : "Run Cycle"}
              </GlassButton>
              <GlassButton onClick={loadStats} disabled={running}>
                Stats
              </GlassButton>
              <GlassButton onClick={loadLogs} disabled={running}>
                Logs
              </GlassButton>
              <div className="danger-wrap">
                <GlassButton onClick={deleteAll} disabled={running || deleting}>
                  {deleting ? "Deleting…" : "Delete All"}
                </GlassButton>
              </div>
              <div className="status-filter" aria-label="Status filter">
                {[
                  { key: "all", label: "All", count: counts.total },
                  { key: "pending", label: "Pending", count: counts.pending },
                  { key: "parsed", label: "Parsed", count: counts.parsed },
                  { key: "error", label: "Error", count: counts.error },
                  {
                    key: "skipped",
                    label: "Skipped",
                    count:
                      skippedLoading && statusFilter === "skipped"
                        ? undefined
                        : skippedCount,
                  },
                ].map((f) => (
                  <button
                    key={f.key}
                    className={
                      f.key === statusFilter ? "filter active" : "filter"
                    }
                    onClick={() => setStatusFilter(f.key)}
                    data-selected={f.key === statusFilter || undefined}
                    title={f.label + (f.count != null ? ` (${f.count})` : "")}
                  >
                    <span className="f-label">{f.label}</span>
                    <span className="f-count">
                      {f.count != null ? f.count : "…"}
                    </span>
                  </button>
                ))}
                <div className="meta-chips" aria-label="Ingestion meta">
                  {stats?.cost && (
                    <button
                      className="meta-chip cost"
                      onClick={loadStats}
                      title={`Total $${stats.cost.total_usd.toFixed(
                        4
                      )}\nAvg $${stats.cost.avg_per_email_usd.toFixed(
                        6
                      )} / email\nTokens ${stats.cost.total_tokens}`}
                    >
                      AI ${stats.cost.total_usd.toFixed(3)}
                    </button>
                  )}
                  <button
                    className="meta-chip progress"
                    onClick={() => setStatusFilter("parsed")}
                    title="Parsed / (parsed + pending + error)"
                  >
                    Prog {progress}%
                  </button>
                  <button
                    className="meta-chip last-parsed"
                    onClick={() => setStatusFilter("parsed")}
                    title={
                      stats?.lastParsedAt
                        ? new Date(stats.lastParsedAt).toLocaleString()
                        : "No parsed yet"
                    }
                  >
                    Last Parsed{" "}
                    {stats?.lastParsedAt
                      ? new Date(stats.lastParsedAt).toLocaleTimeString()
                      : "—"}
                  </button>
                  <button
                    className="meta-chip last-email"
                    onClick={() => setStatusFilter("all")}
                    title={
                      stats?.lastEmailDate
                        ? new Date(stats.lastEmailDate).toLocaleString()
                        : "No emails yet"
                    }
                  >
                    Last Email{" "}
                    {stats?.lastEmailDate
                      ? new Date(stats.lastEmailDate).toLocaleTimeString()
                      : "—"}
                  </button>
                  <button
                    className="meta-chip"
                    onClick={() => setShowRelative((r) => !r)}
                    title="Toggle relative vs absolute time in tables"
                  >
                    {showRelative ? "Rel Time" : "Abs Time"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {error && (
            <div className="error-box" role="alert">
              {error}
            </div>
          )}
        </header>
        <div className="main-grid">
          <div className="col left-col">
            <div
              className="overview-panel"
              aria-label="Ingestion flow overview"
            >
              <div className="flow-panel compact-left">
                <div className="flow-head">
                  <div className="fh-left">
                    <h2>Ingestion Flow</h2>
                    {/* collapse control removed */}
                    <Tooltip
                      placement="right"
                      width={320}
                      content={
                        <div className="flow-help-tt">
                          <strong>Pipeline Stages</strong>
                          <ol>
                            <li>
                              <b>Ensure Schema</b> – create DB tables if
                              missing.
                            </li>
                            <li>
                              <b>Start Run</b> – record environment & limits.
                            </li>
                            <li>
                              <b>Connect IMAP</b> – network + auth handshake.
                            </li>
                            <li>
                              <b>Open Mailbox</b> – select folder to operate on.
                            </li>
                            <li>
                              <b>Search Mailbox</b> – IMAP SEARCH to collect
                              candidate message UIDs.
                            </li>
                            <li>
                              <b>Fetch Emails</b> – download + relevance filter
                              (stored vs skipped).
                            </li>
                            <li>
                              <b>Parse & Classify</b> – extract structured
                              fields, summarize, classify.
                            </li>
                            <li>
                              <b>Finalize</b> – persist run stats & costs.
                            </li>
                          </ol>
                          <p>
                            Status colors: active (blue outline), done (muted),
                            error (red), pending (dim). Hover a stage for
                            metrics.
                          </p>
                        </div>
                      }
                    >
                      <button
                        className="flow-help"
                        aria-label="Explain ingestion flow"
                        type="button"
                      >
                        ?
                      </button>
                    </Tooltip>
                    {live && <span className="badge-live">LIVE</span>}
                  </div>
                  <div className="fh-right">
                    <span className="flow-run-state">
                      {stats?.run?.in_progress
                        ? "Running"
                        : stats?.run
                        ? "Idle"
                        : "—"}
                    </span>
                    <span className="flow-progress">{progress}%</span>
                  </div>
                </div>
                {live && (
                  <div
                    className="flow-progress-bar"
                    data-live
                    data-progress={progress}
                    data-pct={progress / 100}
                  >
                    <div className="fp-track">
                      <div className="fp-fill" />
                    </div>
                    <div className="fp-meta">
                      <span>{progress}%</span>
                      <span className="fp-pulse" />
                    </div>
                  </div>
                )}
                <div className="flow-chart" aria-label="Ingestion stages">
                  {flowStages.map((s) => {
                    const elapsed = stageElapsed(s.key);
                    const dynamicBits: string[] = [];
                    if (s.key === "fetch" && s.meta) {
                      dynamicBits.push(
                        `${s.meta.stored || 0} stored`,
                        `${s.meta.skipped || 0} skipped`
                      );
                      if (s.meta.errors)
                        dynamicBits.push(`${s.meta.errors} errors`);
                    }
                    if (s.key === "parse" && s.meta) {
                      dynamicBits.push(`${s.meta.parsed || 0} parsed`);
                      if (s.meta.errors)
                        dynamicBits.push(`${s.meta.errors} errors`);
                    }
                    if (s.key === "search" && s.meta?.found) {
                      dynamicBits.push(`${s.meta.found}`);
                    }
                    const metrics = dynamicBits.length
                      ? dynamicBits.join(" · ")
                      : s.detail || "";
                    return (
                      <Tooltip
                        key={s.key}
                        placement="right"
                        width={300}
                        content={
                          <div className="stage-tt">
                            <div className="tt-head">
                              <strong>{s.label}</strong>{" "}
                              <small>{s.state}</small>
                            </div>
                            <p>{s.desc}</p>
                            {metrics && (
                              <p className="tt-metrics">
                                <span className="m-label">{metrics}</span>
                                {elapsed && (
                                  <span className="m-elapsed">⏱ {elapsed}</span>
                                )}
                              </p>
                            )}
                            {s.state === "error" && (
                              <p className="tt-error">
                                Check logs panel for error events.
                              </p>
                            )}
                          </div>
                        }
                      >
                        <div
                          className={`flow-stage ${s.state} ${
                            logFilter === s.key ? "selected" : ""
                          }`}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setActiveRightTab("logs");
                            setLogFilter((l) => (l === s.key ? "" : s.key));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setActiveRightTab("logs");
                              setLogFilter((l) => (l === s.key ? "" : s.key));
                            }
                          }}
                        >
                          <div className="stage-top">
                            <span className="stage-label">{s.label}</span>
                            <span className="state-dot" />
                          </div>
                          {metrics && (
                            <div className="stage-detail">{metrics}</div>
                          )}
                          {elapsed && (
                            <div className="stage-time" aria-label="elapsed">
                              {elapsed}
                            </div>
                          )}
                          {s.state === "active" && (
                            <div className="stage-activity">
                              <span className="sa-dot" />
                              <span className="sa-bar" />
                            </div>
                          )}
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
                <div className="flow-legend small">
                  <span className="leg done">done</span>
                  <span className="leg active">active</span>
                  <span className="leg pending">pending</span>
                  <span className="leg blocked">blocked</span>
                  <span className="leg error">error</span>
                </div>
              </div>
              {/* Operations panel removed */}
            </div>
          </div>
          {/* removed extra closing div that prematurely closed main-grid */}
          <div className="col center-col" aria-label="Emails table">
            {imapQuery && (
              <div className="imap-inline-results">
                <div className="iir-head">
                  <div className="iir-left">
                    <h3>IMAP Search</h3>
                    <span className={`state ${imapState}`}>
                      {imapState === "searching"
                        ? "Searching…"
                        : imapState === "error"
                        ? "Error"
                        : `${imapResults?.matches.length || 0} matches`}
                    </span>
                  </div>
                  <button
                    className="mini-clear"
                    onClick={() => {
                      setImapQuery("");
                      setImapState("idle");
                    }}
                  >
                    Clear
                  </button>
                </div>
                {imapError && (
                  <div className="error-box small mb8">{imapError}</div>
                )}
                <div className="iir-body">
                  {imapSearching && (
                    <div className="loading small">Searching…</div>
                  )}
                  {!imapSearching &&
                    imapResults &&
                    !imapResults.matches.length && (
                      <div className="empty">No matches.</div>
                    )}
                  {!imapSearching &&
                    (imapResults?.matches?.length || 0) > 0 && (
                      <table className="imap-results-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>UID</th>
                            <th>Mailbox</th>
                            <th>Subject</th>
                            <th>Snippet</th>
                          </tr>
                        </thead>
                        <tbody>
                          {imapResults?.matches?.map((m) => (
                            <tr key={m.uid}>
                              <td className="mono ts" title={m.date}>
                                {m.date
                                  ? new Date(m.date).toLocaleString()
                                  : "—"}
                              </td>
                              <td className="mono">{m.uid}</td>
                              <td className="mailbox mono" title={m.mailbox}>
                                {m.mailbox || "—"}
                              </td>
                              <td className="subject" title={m.subject}>
                                {m.subject}
                              </td>
                              <td className="snippet" title={m.snippet}>
                                {m.snippet || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </div>
              </div>
            )}
            {statusFilter === "skipped" ? (
              <div className="emails-table-wrapper flex-fill">
                {skippedLoading && (
                  <div className="loading">Loading skipped…</div>
                )}
                {!skippedLoading && (
                  <table className="emails-table skipped-mode">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>UID</th>
                        <th>Subject</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skipped.map((s) => (
                        <tr
                          key={s.id}
                          className="skip-row clickable"
                          onClick={() => setSkippedDetail(s)}
                        >
                          <td className="mono ts" title={s.created_at}>
                            {new Date(s.created_at).toLocaleString()}
                          </td>
                          <td className="mono" title={`UID ${s.uid}`}>
                            {s.uid}
                          </td>
                          <td className="subject" title={s.subject}>
                            {s.subject || "(no subject)"}
                          </td>
                          <td className="reason" title={s.detail}>
                            {s.detail}
                          </td>
                        </tr>
                      ))}
                      {!skipped.length && !skippedLoading && (
                        <tr>
                          <td colSpan={4} className="empty">
                            No skipped emails.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="emails-table-wrapper flex-fill fade-scroll">
                <table className="emails-table dynamic-cols">
                  <thead>
                    <tr>
                      {visibleCols.includes("date") && <th>Date</th>}
                      {visibleCols.includes("subject") && <th>Subject</th>}
                      {visibleCols.includes("class") && <th>Class</th>}
                      {visibleCols.includes("vendor") && <th>Vendor</th>}
                      {visibleCols.includes("status") && <th>Status</th>}
                      {visibleCols.includes("extract") && <th>Extract</th>}
                      {visibleCols.includes("link") && <th>Link</th>}
                      <th className="ra-col" aria-label="Row actions"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmails.map((e) => {
                      const expanded = expandedRowsRef.current.has(e.id);
                      return (
                        <>
                          <tr
                            key={e.id}
                            className={`clickable row ${e.parse_status}${
                              expanded ? " expanded" : ""
                            }`}
                            onClick={() => openDetail(e.id)}
                          >
                            {visibleCols.includes("date") && (
                              <td className="mono ts" title={e.date}>
                                {relativeTime(e.date)}
                              </td>
                            )}
                            {visibleCols.includes("subject") && (
                              <td className="subject" title={e.subject}>
                                {e.subject || "(no subject)"}
                              </td>
                            )}
                            {visibleCols.includes("class") && (
                              <td className="class-cell">
                                {e.class && (
                                  <Pill
                                    label={e.class}
                                    color={
                                      e.class === "interview"
                                        ? "blue"
                                        : e.class === "offer"
                                        ? "purple"
                                        : e.class === "rejection"
                                        ? "red"
                                        : e.class === "applied"
                                        ? "green"
                                        : "gray"
                                    }
                                  />
                                )}
                              </td>
                            )}
                            {visibleCols.includes("vendor") && (
                              <td className="vendor" title={e.vendor}>
                                {e.vendor || "—"}
                              </td>
                            )}
                            {visibleCols.includes("status") && (
                              <td className="status">
                                <span className={`badge ${e.parse_status}`}>
                                  {e.parse_status}
                                </span>
                              </td>
                            )}
                            {visibleCols.includes("extract") && (
                              <td className="extract">
                                {e.parsed_json ? (
                                  <div
                                    className="extract-wrap"
                                    title={e.parsed_json.summary || ""}
                                  >
                                    <span className="company">
                                      {e.parsed_json.company || "—"}
                                    </span>
                                    <span className="role">
                                      {e.parsed_json.role || ""}
                                    </span>
                                    {e.parsed_json.next_action && (
                                      <span className="next">
                                        → {e.parsed_json.next_action}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="dim">—</span>
                                )}
                              </td>
                            )}
                            {visibleCols.includes("link") && (
                              <td className="link">
                                {e.company
                                  ? `${e.company}${
                                      e.position ? " — " + e.position : ""
                                    }`
                                  : "—"}
                              </td>
                            )}
                            <td
                              className="row-actions"
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              <div className="hover-actions">
                                <button
                                  className="ha-btn"
                                  title="Open"
                                  onClick={() => openDetail(e.id)}
                                >
                                  🔍
                                </button>
                                <button
                                  className="ha-btn"
                                  title="Fullscreen"
                                  onClick={() => {
                                    openDetail(e.id);
                                    setFullBodyOpen(true);
                                  }}
                                >
                                  ⤢
                                </button>
                                <button
                                  className="ha-btn"
                                  title="Inline expand"
                                  onClick={() => toggleRowExpand(e.id)}
                                >
                                  {expanded ? "▾" : "▸"}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expanded && (
                            <tr
                              key={e.id + ":exp"}
                              className="inline-expansion"
                            >
                              <td
                                colSpan={
                                  visibleCols.filter((c) => true).length + 1
                                }
                                className="inline-cell"
                              >
                                <div
                                  className="inline-summary"
                                  title={e.parsed_json?.summary || ""}
                                >
                                  {e.parsed_json?.summary || "No summary."}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                    {!loading && !filteredEmails.length && (
                      <tr>
                        <td
                          colSpan={visibleCols.filter((c) => true).length + 1}
                          className="empty"
                        >
                          {emails.length ? "No matches." : "No emails."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {loading && (
                  <div className="skeleton-list" aria-hidden="true">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="skeleton-row" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="col right-col" aria-label="Side panels">
            <div className="right-tabs">
              {/* Historical backfill panel removed */}
              <div className="tab-buttons">
                {["logs", "protocol", "stats", "headers"].map((t) => (
                  <button
                    key={t}
                    className={t === activeRightTab ? "tab active" : "tab"}
                    onClick={() => setActiveRightTab(t as any)}
                  >
                    {t}
                  </button>
                ))}
                <div
                  className={`sse-ind ${
                    sseConnected
                      ? "ok"
                      : sseConnected === false
                      ? "down"
                      : "pending"
                  }`}
                  title={
                    sseConnected
                      ? "SSE connected"
                      : sseConnected === false
                      ? "SSE disconnected (fallback polling)"
                      : "Connecting…"
                  }
                />
              </div>
              <div className="log-controls">
                <input
                  placeholder="filter"
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                />
                <label className="auto-scroll">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                  />{" "}
                  auto-scroll
                </label>
              </div>
              {activeRightTab === "logs" && (
                <ActivityPanel
                  logs={logs}
                  logsLoading={logsLoading}
                  live={live}
                  phaseFilters={phaseFilters}
                  logsGrouped={logsGrouped}
                  logPhases={logPhases}
                  groupedLogs={groupedLogs}
                  filteredLogs={filteredLogs}
                  recentNewLogIdsRef={recentNewLogIdsRef}
                  togglePhaseFilter={togglePhaseFilter}
                  setPhaseFilters={setPhaseFilters}
                  setLogsGrouped={setLogsGrouped}
                />
              )}
              {activeRightTab === "protocol" && (
                <ProtocolPanel
                  protocol={protocolLogs}
                  filteredProtocol={filteredProtocol}
                  stats={stats}
                />
              )}
              {activeRightTab === "stats" && (
                <div className="stats-tab">
                  <h2>Stats JSON</h2>
                  <pre className="stats-pre">
                    {JSON.stringify({ ...stats, logs: undefined }, null, 2)}
                  </pre>
                </div>
              )}
              {activeRightTab === "headers" && (
                <div className="headers-tab">
                  <div className="headers-head">
                    <h2>Header Cache</h2>
                    <div className="hc-filters">
                      <select
                        aria-label="header decision filter"
                        value={headerDecision}
                        onChange={(e) => setHeaderDecision(e.target.value)}
                      >
                        <option value="">all decisions</option>
                        <option value="relevant">relevant</option>
                        <option value="ambiguous">ambiguous</option>
                        <option value="skip">skip</option>
                      </select>
                      <button
                        className="hc-refresh"
                        onClick={loadHeaders}
                        disabled={headersLoading}
                      >
                        {headersLoading ? "…" : "refresh"}
                      </button>
                    </div>
                  </div>
                  <div className="headers-wrapper">
                    <table className="headers-table">
                      <thead>
                        <tr>
                          <th>UID</th>
                          <th>Decision</th>
                          <th>Score</th>
                          <th>Subject</th>
                          <th>From</th>
                          <th>Reason</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {headers.map((h) => (
                          <tr key={h.uid} className={`hrow ${h.decision}`}>
                            <td className="mono">{h.uid}</td>
                            <td className="dec">{h.decision || "—"}</td>
                            <td className="mono score">
                              {h.score != null ? h.score.toFixed(3) : "—"}
                            </td>
                            <td className="subject" title={h.subject}>
                              {h.subject || "(no subject)"}
                            </td>
                            <td className="from" title={h.from_email}>
                              {(h.from_email || "").slice(0, 40)}
                            </td>
                            <td className="reason" title={h.reason}>
                              {(h.reason || "").slice(0, 80)}
                            </td>
                            <td className="actions">
                              <button
                                className="mini-link"
                                disabled
                                aria-disabled="true"
                                title="Not implemented yet"
                              >
                                promote
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!headers.length && !headersLoading && (
                          <tr>
                            <td colSpan={7} className="empty">
                              No header rows.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* end right panel */}
        </div>
        {/* main-grid */}
      </div>
      {/* ingest-page */}
      {detailId !== null && (
        <div
          className={`detail-drawer${drawerWide ? " wide" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Email detail"
          ref={trapRef}
        >
          <div className="detail-header">
            <h3>Email Detail #{detailId}</h3>
            <div className="header-actions">
              <button
                type="button"
                className="nav-btn prev"
                onClick={() => navigateDetail(-1)}
                disabled={emails.findIndex((e) => e.id === detailId) <= 0}
                aria-label="Previous email"
              >
                ◀
              </button>
              <button
                type="button"
                className="nav-btn next"
                onClick={() => navigateDetail(1)}
                disabled={
                  emails.findIndex((e) => e.id === detailId) ===
                  emails.length - 1
                }
                aria-label="Next email"
              >
                ▶
              </button>
              <button
                type="button"
                className="drawer-toggle"
                aria-label={drawerWide ? "Collapse width" : "Expand width"}
                title={drawerWide ? "Collapse width" : "Expand width"}
                onClick={() => setDrawerWide((w) => !w)}
              >
                {drawerWide ? "⟨⟩" : "⤢"}
              </button>
              <button
                type="button"
                className="copy-btn"
                onClick={() => {
                  if (detailData?.email?.subject) {
                    navigator.clipboard
                      .writeText(detailData.email.subject)
                      .then(() => snack.showSuccess("Subject copied"));
                  }
                }}
                title="Copy subject"
              >
                ⧉
              </button>
              <button onClick={closeDetail} className="close-btn">
                ×
              </button>
            </div>
          </div>
          {detailLoading && <div className="detail-loading">Loading…</div>}
          {!detailLoading && detailData && !detailData.error && (
            <div className="detail-body">
              {detailData.email.parse_status === "error" && (
                <div className="parse-error-banner">
                  <strong>Parse Error:</strong> Email failed to parse. Try
                  reprocessing or adjusting classification rules.
                  <div className="pe-actions">
                    <button
                      className="mini"
                      onClick={() => openDetail(detailId)}
                    >
                      Retry Load
                    </button>
                  </div>
                </div>
              )}
              <div className="detail-top-meta">
                <div className="meta-left">
                  <h4 className="subject-line" title={detailData.email.subject}>
                    {detailData.email.subject || "(no subject)"}
                  </h4>
                  <div className="chip-row">
                    {detailData.email.class && (
                      <span className="chip class-chip" title="Classification">
                        {detailData.email.class}
                      </span>
                    )}
                    {detailData.email.vendor && (
                      <span className="chip vendor-chip" title="Source Vendor">
                        {detailData.email.vendor}
                      </span>
                    )}
                    <span
                      className={`chip status-chip status-${(
                        detailData.email.parse_status || ""
                      ).toLowerCase()}`}
                    >
                      {detailData.email.parse_status}
                    </span>
                    {detailData.email.openai_model && (
                      <span className="chip model-chip" title="Model">
                        {detailData.email.openai_model}
                      </span>
                    )}
                  </div>
                  <div className="meta-grid compact">
                    <div>
                      <label>Date</label>
                      <span>
                        {detailData.email.date
                          ? new Date(detailData.email.date).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <label>Length</label>
                      <span>
                        {(
                          detailData.email.raw_html || ""
                        ).length.toLocaleString()}{" "}
                        chars
                      </span>
                    </div>
                    <div>
                      <label>Tokens</label>
                      <span>{detailData.email.openai_total_tokens ?? "—"}</span>
                    </div>
                    <div>
                      <label>Cost</label>
                      <span>
                        {detailData.email.openai_cost_usd != null
                          ? "$" + detailData.email.openai_cost_usd.toFixed(4)
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
                {detailData.email.parsed_json && (
                  <div className="parsed-summary">
                    <h5 className="subhead">Extracted</h5>
                    <div className="kv-grid">
                      <div>
                        <em>Company</em>
                        <span>
                          {detailData.email.parsed_json.company || "—"}
                        </span>
                      </div>
                      <div>
                        <em>Role</em>
                        <span>{detailData.email.parsed_json.role || "—"}</span>
                      </div>
                      <div>
                        <em>Next Action</em>
                        <span>
                          {detailData.email.parsed_json.next_action || "—"}
                        </span>
                      </div>
                      <div>
                        <em>Action Date</em>
                        <span>
                          {detailData.email.parsed_json.action_date || "—"}
                        </span>
                      </div>
                      <div>
                        <em>Sentiment</em>
                        <span>
                          {detailData.email.parsed_json.sentiment || "—"}
                        </span>
                      </div>
                    </div>
                    {detailData.email.parsed_json.summary && (
                      <div
                        className="summary-box"
                        title={detailData.email.parsed_json.summary}
                      >
                        {detailData.email.parsed_json.summary}
                        <button
                          type="button"
                          className="mini copy-inline"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              detailData.email.parsed_json.summary
                            );
                            snack.showSuccess("Summary copied");
                          }}
                          title="Copy summary"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="viewer-toolbar">
                <button
                  className={showRaw ? "" : "active"}
                  onClick={() => setShowRaw(false)}
                >
                  Rendered
                </button>
                <button
                  className={showRaw ? "active" : ""}
                  onClick={() => setShowRaw(true)}
                >
                  Raw HTML
                </button>
                {detailData.email.raw_html && (
                  <button
                    type="button"
                    className="mini"
                    onClick={() => {
                      try {
                        const blob = new Blob([detailData.email.raw_html], {
                          type: "text/html",
                        });
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = `email-${detailId}.html`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
                        snack.showInfo("HTML downloaded");
                      } catch (e: any) {
                        snack.showError("Download failed", e.message);
                      }
                    }}
                  >
                    Download
                  </button>
                )}
                <button
                  onClick={() => setShowRaw((r) => !r)}
                  className="toggle-btn"
                >
                  {showRaw ? "👁 Rendered" : "</>"}{" "}
                </button>
                <button
                  type="button"
                  className="fs-btn"
                  disabled={!detailData.email.raw_html || showRaw}
                  onClick={() => setFullBodyOpen(true)}
                  title={
                    showRaw
                      ? "Switch to Rendered first"
                      : "Open full screen preview"
                  }
                >
                  Fullscreen
                </button>
              </div>
              <details className="kbd-help">
                <summary>Shortcuts</summary>
                <div className="kbd-grid">
                  <div>
                    <kbd>Esc</kbd> close / exit fullscreen
                  </div>
                  <div>
                    <kbd>F</kbd> fullscreen
                  </div>
                  <div>
                    <kbd>R</kbd> raw toggle
                  </div>
                  <div>
                    <kbd>←</kbd>
                    <kbd>→</kbd> navigate
                  </div>
                </div>
              </details>
              <div className="email-body-view">
                {detailData.email.raw_html ? (
                  showRaw ? (
                    <pre className="raw-pre code-pre">
                      {(detailData.email.raw_html || "").slice(0, 10000)}
                    </pre>
                  ) : (
                    <div
                      className={`rendered-html ${
                        !previewExpanded && canExpand ? "collapsed" : ""
                      }`}
                      ref={renderedRef}
                      dangerouslySetInnerHTML={{
                        __html: dompurifySanitize
                          ? dompurifySanitize(detailData.email.raw_html)
                          : detailData.email.raw_html,
                      }}
                    />
                  )
                ) : (
                  <div className="dim">No HTML body stored.</div>
                )}
                {!showRaw && canExpand && (
                  <div className="preview-controls">
                    {!previewExpanded && (
                      <button
                        className="mini"
                        onClick={() => setPreviewExpanded(true)}
                      >
                        Expand
                      </button>
                    )}
                    {previewExpanded && (
                      <button
                        className="mini"
                        onClick={() => {
                          renderedRef.current?.scrollTo({ top: 0 });
                          setPreviewExpanded(false);
                        }}
                      >
                        Collapse
                      </button>
                    )}
                  </div>
                )}
              </div>
              <details className="collapsible advanced">
                <summary>Advanced & Raw Data</summary>
                <div className="advanced-grid">
                  <div>
                    <h5>Headers</h5>
                    <pre className="raw-pre small-pre">
                      {detailData.email.raw_headers || "—"}
                    </pre>
                  </div>
                  {detailData.email.parsed_json && (
                    <div>
                      <h5>Parsed JSON</h5>
                      <pre className="json-pre small-pre">
                        {JSON.stringify(detailData.email.parsed_json, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
              <div className="section">
                <h4>OpenAI Calls</h4>
                {!detailData.calls?.length && (
                  <div className="dim">No calls.</div>
                )}
                {!!detailData.calls?.length && (
                  <table className="calls-table">
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th>Tokens</th>
                        <th>Cost</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailData.calls.map((c: any) => (
                        <tr key={c.id}>
                          <td>{c.model}</td>
                          <td className="mono">{c.total_tokens}</td>
                          <td className="mono">
                            {c.cost_usd?.toFixed
                              ? c.cost_usd.toFixed(4)
                              : c.cost_usd}
                          </td>
                          <td className="mono ts" title={c.created_at}>
                            {c.created_at
                              ? new Date(c.created_at).toLocaleTimeString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
          {!detailLoading && detailData?.error && (
            <div className="error-box">{detailData.error}</div>
          )}
        </div>
      )}
      {fullBodyOpen && detailData?.email?.raw_html && (
        <div
          className="email-fullscreen"
          onClick={() => setFullBodyOpen(false)}
        >
          <div
            className="email-fullscreen-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="efs-head">
              <div className="efs-title" title={detailData.email.subject}>
                {detailData.email.subject || "(no subject)"}
              </div>
              <div className="efs-actions">
                <button
                  className="efs-close"
                  onClick={() => setFullBodyOpen(false)}
                  aria-label="Close full screen"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="efs-body">
              {!showRaw && (
                <div
                  className="rendered-html"
                  dangerouslySetInnerHTML={{
                    __html: dompurifySanitize
                      ? dompurifySanitize(detailData.email.raw_html)
                      : detailData.email.raw_html,
                  }}
                />
              )}
              {showRaw && (
                <pre className="raw-pre code-pre full">
                  {detailData.email.raw_html || ""}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
      {/* old floating search results removed; now inline */}
      {showSkipped && (
        <div className="modal-backdrop" onClick={() => setShowSkipped(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Skipped Non‑Relevant Emails</h3>
              <button
                className="close-btn"
                onClick={() => setShowSkipped(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {skippedLoading && <div className="dim">Loading…</div>}
              {skippedError && (
                <div className="error-box mb8">{skippedError}</div>
              )}
              {!skippedLoading && !skipped.length && !skippedError && (
                <div className="dim">None this run.</div>
              )}
              {!!skipped.length && (
                <table className="skipped-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>UID</th>
                      <th>Subject</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skipped.map((s) => (
                      <tr
                        key={s.id}
                        className="skip-row clickable"
                        onClick={() => {
                          setSkippedDetail(s);
                          setShowSkipped(false);
                        }}
                      >
                        <td className="mono ts" title={s.created_at}>
                          {new Date(s.created_at).toLocaleTimeString()}
                        </td>
                        <td className="mono" title={`UID ${s.uid}`}>
                          {s.uid || "—"}
                        </td>
                        <td className="subject" title={s.subject}>
                          {s.subject || "(no subject)"}
                        </td>
                        <td className="reason" title={s.detail}>
                          {s.detail}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="note">
                Skipped items are not stored in the main email table; only
                lightweight classification metadata is retained.
              </div>
            </div>
          </div>
        </div>
      )}
      {skippedDetail && (
        <div className={`detail-drawer skipped${drawerWide ? " wide" : ""}`}>
          <div className="detail-header">
            <h3>Skipped Email (UID {skippedDetail?.uid || "—"})</h3>
            <div className="header-actions">
              <button
                type="button"
                className="drawer-toggle"
                aria-label={drawerWide ? "Collapse width" : "Expand width"}
                title={drawerWide ? "Collapse width" : "Expand width"}
                onClick={() => setDrawerWide((w) => !w)}
              >
                {drawerWide ? "⟨⟩" : "⤢"}
              </button>
              <button
                onClick={() => setSkippedDetail(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
          </div>
          <div className="detail-body">
            <div className="section">
              <h4>Summary</h4>
              <div className="kv-grid small">
                <div>
                  <em>Log ID</em>
                  <span>{skippedDetail?.id}</span>
                </div>
                <div>
                  <em>UID</em>
                  <span>{skippedDetail?.uid || "—"}</span>
                </div>
                <div>
                  <em>Time</em>
                  <span>
                    {skippedDetail?.created_at
                      ? new Date(skippedDetail.created_at).toLocaleString()
                      : "—"}
                  </span>
                </div>
                <div className="full">
                  <em>Subject</em>
                  <span>{skippedDetail?.subject || "(no subject)"}</span>
                </div>
              </div>
            </div>
            <div className="section">
              <h4>Why Skipped?</h4>
              <div className="explain">
                This email was filtered out during fetch because its
                classification logic judged it non-relevant to the application
                lifecycle (alerts, digests, low-signal, or downgraded patterns).
                Only its subject and the heuristic reason were retained in logs
                to reduce storage and parsing costs.
              </div>
            </div>
            <div className="section">
              <h4>Options</h4>
              <div className="explain">
                Full body content was never persisted. To inspect or reprocess
                skipped items in the future you could enable an optional
                quarantine storage setting (not yet implemented) or add a
                one‑off re-fetch by UID feature.
              </div>
              <div className="actions-line">
                <button
                  className="reprocess-btn"
                  disabled
                  aria-disabled="true"
                  title="Not implemented yet"
                >
                  Reprocess (soon)
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => {
                    setSkippedDetail(null);
                    setShowSkipped(true);
                  }}
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        /* ================= EMAIL INGEST PAGE STYLES ================= */
        /* Sections:
    1) Global animations & transitions
    2) Layout (grid & columns)
    3) Core panels
    4) Table (emails)
    5) Flow panel & stages
    6) Right side tabs (logs, protocol, stats, headers)
    7) Microinteractions / progress bar
    8) Utilities & responsive
    NOTE: Older experimental styles removed for clarity. */
        /* === 1) Global animations & transitions === */
        :root {
          --easing-spring: cubic-bezier(0.4, 0.14, 0.3, 1);
        }
        .ingest-page {
          animation: fadeSlide 0.55s var(--easing-spring);
        }
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        /* Subtle depth layers */
        .flow-panel,
        .ops-panel,
        .backfill-panel,
        .logs-panel,
        .protocol-panel,
        .headers-tab,
        .stats-tab,
        .emails-table-wrapper {
          transition: box-shadow 0.5s var(--easing-spring),
            transform 0.5s var(--easing-spring);
        }
        /* Revamped Activity (logs) panel */
        /* Activity panel themed revamp (lightweight) */
        .logs-panel {
          --chip-bg: rgba(255, 255, 255, 0.04);
          --chip-border: rgba(255, 255, 255, 0.08);
          max-height: 340px;
        }
        .logs-panel .activity-toolbar {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin: -4px 0 2px;
        }
        .logs-panel .phase-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          flex: 1 1 auto;
        }
        .logs-panel .phase-chips .chip {
          background: var(--chip-bg);
          border: 1px solid var(--chip-border);
          color: #b7c4d1;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 24px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          line-height: 1.1;
          transition: background 0.25s, border-color 0.25s, color 0.25s;
        }
        .logs-panel .phase-chips .chip .cnt {
          background: #1f2933;
          padding: 1px 6px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          color: #d1dae3;
        }
        .logs-panel .phase-chips .chip .err {
          background: #7f1d1d;
          color: #fecaca;
          padding: 1px 5px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
        }
        .logs-panel .phase-chips .chip.on {
          background: #2563eb22;
          border-color: #2563eb55;
          color: #e2eeff;
          box-shadow: 0 0 0 1px #2563eb44;
        }
        .logs-panel .phase-chips .chip:hover {
          background: rgba(255, 255, 255, 0.07);
        }
        .logs-panel .phase-chips .chip.clear {
          background: #2a3542;
          border-color: #354350;
          color: #d8e2ec;
        }
        .logs-panel .phase-chips .chip.clear:hover {
          background: #374556;
        }
        .logs-panel .view-toggles {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logs-panel .view-toggles .vt {
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
          color: #94a3b8;
        }
        .logs-panel .groups {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: calc(100% - 74px);
          overflow: auto;
          padding-right: 2px;
        }
        .logs-panel .groups details {
          border: 1px solid var(--border);
          border-radius: 10px;
          background: linear-gradient(
            145deg,
            var(--surface),
            var(--surface-alt)
          );
          padding: 4px 6px;
        }
        .logs-panel .groups details[open] {
          background: linear-gradient(
            145deg,
            var(--surface-alt),
            var(--surface)
          );
        }
        .logs-panel .groups summary {
          list-style: none;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          cursor: pointer;
          font-weight: 600;
          color: #e2e8f0;
        }
        .logs-panel .groups summary::-webkit-details-marker {
          display: none;
        }
        .logs-panel .groups summary .phase {
          text-transform: capitalize;
        }
        .logs-panel .groups summary .count {
          background: #1e293b;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #cbd5e1;
        }
        .logs-panel .g-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 4px;
        }
        .logs-panel .flat-logs {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: calc(100% - 74px);
          overflow: auto;
          padding-right: 2px;
        }
        .logs-panel .log-row {
          display: grid;
          grid-template-columns: 70px 74px 70px 1fr;
          gap: 8px;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 8px;
          background: var(--surface-alt);
          border: 1px solid var(--border-subtle);
          line-height: 1.2;
          position: relative;
        }
        .logs-panel .groups .log-row {
          grid-template-columns: 70px 70px 1fr;
          background: var(--surface-alt);
        }
        .logs-panel .log-row.new {
          animation: flash 2s ease 1;
        }
        @keyframes flash {
          0% {
            box-shadow: 0 0 0 0 #2563eb;
          }
          40% {
            box-shadow: 0 0 0 2px #2563eb;
          }
          100% {
            box-shadow: 0 0 0 0 transparent;
          }
        }
        .logs-panel .log-time {
          font-family: monospace;
          color: #64748b;
          font-size: 10px;
        }
        .logs-panel .log-phase {
          text-transform: capitalize;
          font-weight: 600;
          color: #e2e8f0;
        }
        .logs-panel .log-status {
          text-transform: uppercase;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .logs-panel .log-status {
          color: #9ca3af;
        }
        .logs-panel .log-row.fetch .log-status.stored,
        .logs-panel .log-row.parse .log-status.parsed {
          color: #34d399;
        }
        .logs-panel .log-row .log-status.error {
          color: #f87171;
        }
        .logs-panel .log-detail {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #cbd5e1;
        }
        .flow-panel:hover,
        .ops-panel:hover,
        .backfill-panel:hover,
        .logs-panel:hover,
        .protocol-panel:hover,
        .headers-tab:hover,
        .stats-tab:hover,
        .emails-table-wrapper:hover {
          box-shadow: 0 4px 22px -6px rgba(0, 0, 0, 0.55),
            0 2px 6px -2px rgba(0, 0, 0, 0.4);
        }
        /* (Removed older pulseGlow stage animation & hover sheen in favor of newer microinteraction styles further below) */
        /* Log row arrival highlight */
        @keyframes logFlash {
          0% {
            background: rgba(255, 255, 255, 0.12);
          }
          40% {
            background: rgba(255, 255, 255, 0.04);
          }
          100% {
            background: transparent;
          }
        }
        .log-row.new {
          animation: logFlash 1.6s ease-out;
          position: relative;
        }
        .log-row.new:before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--primary);
          border-radius: 2px;
          box-shadow: 0 0 6px -1px var(--primary);
        }
        /* Table row hover accent refinement */
        table.emails-table tbody tr.clickable:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        table.emails-table tbody tr.clickable:hover::before {
          width: 4px;
        }
        /* Buttons subtle interactive lift */
        .filter,
        .tab,
        .bf-btn,
        .hc-refresh,
        .imap-search-box,
        .ls-info {
          transition: background 0.35s var(--easing-spring),
            box-shadow 0.35s var(--easing-spring),
            transform 0.35s var(--easing-spring);
        }
        .filter:hover,
        .tab:hover,
        .bf-btn:hover,
        .hc-refresh:hover,
        .imap-search-box:focus-within,
        .ls-info:hover {
          box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.5);
          transform: translateY(-2px);
        }
        .filter:active,
        .tab:active,
        .bf-btn:active,
        .hc-refresh:active,
        .ls-info:active {
          transform: translateY(0);
          box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.4);
        }
        /* Run hover card enhanced */
        .run-hover-card {
          animation: fadeCard 0.25s var(--easing-spring);
          transform-origin: top right;
        }
        @keyframes fadeCard {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        /* Subtle separations */
        .logs-panel,
        .protocol-panel {
          backdrop-filter: blur(3px);
        }
        /* Accessibility focus outline upgrade */
        .flow-stage:focus {
          box-shadow: 0 0 0 2px var(--primary),
            0 0 0 4px rgba(255, 255, 255, 0.1);
        }
        /* Remove heavy gradients if any remain in added styles (kept minimal) */

        .ingest-page {
          padding: 20px 26px 10px;
          max-width: 1700px;
          margin: 0 auto;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        :global(body) {
          overscroll-behavior: contain;
        }
        /* Dynamic layout: subtract global navbar + header for scroll areas */
        .ingest-page {
          --nav-h: var(--app-nav-h, 56px);
        }
        .header {
          position: sticky;
          top: var(--nav-h);
          z-index: 20;
          background: rgba(15, 20, 26, 0.85);
          backdrop-filter: blur(6px);
          padding-bottom: 10px;
          margin-bottom: 0;
        }
        .main-grid {
          flex: 1 1 auto;
          min-height: 0;
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr) 420px;
          gap: 16px;
          height: calc(100vh - var(--nav-h) - var(--hdr-h, 0px));
        }
        .layout-calcing .main-grid {
          visibility: hidden;
        }
        @media (max-width: 1500px) {
          .main-grid {
            grid-template-columns: 280px minmax(0, 1fr) 380px;
          }
        }
        @media (max-width: 1250px) {
          .main-grid {
            grid-template-columns: 280px minmax(0, 1fr);
          }
          .right-col {
            grid-column: 1 / -1;
            order: 3;
          }
        }
        @media (max-width: 900px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
          .left-col,
          .right-col {
            order: unset;
          }
        }
        .left-col,
        .right-col,
        .center-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 0;
        }
        .center-col {
          overflow: hidden;
        }
        .left-col,
        .right-col {
          overflow: auto;
          scrollbar-gutter: stable;
        }
        .emails-table-wrapper {
          flex: 1 1 auto;
          min-height: 0;
          overflow: auto;
          position: relative;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          scrollbar-gutter: stable;
        }
        .emails-table-wrapper.tight {
          max-height: none;
        }
        .flex-fill {
          flex: 1 1 auto;
          min-height: 0;
        }
        .emails-table-wrapper {
          padding: 4px 6px 8px;
        }
        .emails-table {
          width: max-content;
          min-width: 100%;
          table-layout: fixed;
          border-collapse: separate;
          border-spacing: 0;
        }
        .emails-table-wrapper::-webkit-scrollbar {
          height: 10px;
        }
        .emails-table-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
        }
        .emails-table colgroup col {
        }
        .emails-table th,
        .emails-table td {
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
          line-height: 1.15;
        }
        .emails-table td,
        .emails-table th {
          padding: 3px 6px;
        }
        .emails-table tbody tr {
          position: relative;
          height: 34px;
        }
        /* New dynamic table enhancements */
        .emails-table.dynamic-cols th,
        .emails-table.dynamic-cols td {
          white-space: nowrap;
        }
        .row-actions {
          width: 40px;
          position: relative;
        }
        .hover-actions {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.25s;
        }
        tr.row:hover .hover-actions {
          opacity: 1;
        }
        .ha-btn {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 2px 4px;
          font-size: 11px;
          cursor: pointer;
          line-height: 1;
        }
        .ha-btn:hover {
          background: var(--surface-hover, rgba(255, 255, 255, 0.05));
        }
        .inline-expansion .inline-cell {
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid var(--border);
          padding: 8px 10px;
        }
        .inline-summary {
          font-size: 12px;
          line-height: 1.35;
          max-height: 120px;
          overflow: auto;
        }
        .emails-table.dynamic-cols tbody tr.row {
          border-left: 3px solid transparent;
        }
        .emails-table.dynamic-cols tbody tr.row.parsed {
          border-left-color: #1f5d41;
        }
        .emails-table.dynamic-cols tbody tr.row.pending {
          border-left-color: #b07a1a;
        }
        .emails-table.dynamic-cols tbody tr.row.error {
          border-left-color: #7a2d37;
        }
        mark {
          background: #433518;
          color: #ffce73;
          padding: 0 2px;
          border-radius: 3px;
        }
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-input {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 10px;
          border-radius: 10px;
          font-size: 12px;
          color: var(--text-primary);
          min-width: 220px;
        }
        .col-menu-wrapper {
          position: relative;
        }
        .col-menu {
          position: absolute;
          top: 110%;
          right: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 10px 12px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 60;
          font-size: 12px;
          box-shadow: 0 6px 18px -6px rgba(0, 0, 0, 0.55);
        }
        .col-menu label {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .skeleton-list {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          padding: 6px 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          pointer-events: none;
        }
        .skeleton-row {
          height: 30px;
          border-radius: 8px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.04),
            rgba(255, 255, 255, 0.12),
            rgba(255, 255, 255, 0.04)
          );
          background-size: 200% 100%;
          animation: skShimmer 1.1s linear infinite;
        }
        @keyframes skShimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .fade-scroll {
          position: relative;
        }
        .fade-scroll:before,
        .fade-scroll:after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          height: 18px;
          pointer-events: none;
          z-index: 5;
        }
        .fade-scroll:before {
          top: 0;
          background: linear-gradient(
            to bottom,
            rgba(10, 14, 20, 0.9),
            rgba(10, 14, 20, 0)
          );
        }
        .fade-scroll:after {
          bottom: 0;
          background: linear-gradient(
            to top,
            rgba(10, 14, 20, 0.9),
            rgba(10, 14, 20, 0)
          );
        }
        .emails-table tbody tr > * {
          max-height: 28px;
        }
        .emails-table td.mono.ts {
          white-space: nowrap;
        }
        .emails-table td.vendor {
          max-width: 140px;
        }
        .emails-table td.status {
          width: 110px;
        }
        .emails-table td.extract {
          max-width: 260px;
        }
        .emails-table td.link {
          max-width: 220px;
        }
        .emails-table td.extract .extract-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .emails-table td.extract .extract-wrap span {
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }
        .emails-table td.extract .extract-wrap .next {
          max-width: 140px;
        }
        .emails-table td.extract {
          white-space: nowrap;
        }
        /* Force single-line subject / vendor / link */
        .emails-table .subject,
        .emails-table .vendor,
        .emails-table .link {
          white-space: nowrap;
        }
        /* Clip pill height */
        .emails-table td > :global(span.pill),
        .emails-table td > :global(div.pill) {
          line-height: 1;
        }
        .emails-table .badge {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          display: inline-block;
          vertical-align: middle;
        }
        .emails-table .vendor,
        .emails-table .subject,
        .emails-table .link {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .emails-table .subject {
          max-width: 420px;
        }
        @media (max-width: 1600px) {
          .emails-table .subject {
            max-width: 340px;
          }
        }
        @media (max-width: 1400px) {
          .emails-table .subject {
            max-width: 300px;
          }
        }
        @media (max-width: 1200px) {
          .emails-table .subject {
            max-width: 260px;
          }
        }
        .emails-table td.subject {
          white-space: nowrap;
        }
        .emails-table td .extract-wrap {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
        }
        .emails-table td .company,
        .emails-table td .role,
        .emails-table td .next {
          white-space: nowrap;
        }
        /* Prevent row highlight / new indicator from bleeding outside rounded wrapper */
        .emails-table-wrapper > table {
          border-radius: 12px;
          background: transparent;
        }
        .emails-table-wrapper::-webkit-scrollbar {
          width: 10px;
        }
        .emails-table-wrapper::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
        }
        /* Sticky thead */
        .emails-table thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: var(--surface);
        }
        /* Column sizing */
        .emails-table .col-date {
          width: 150px;
        }
        .emails-table .col-subject {
          width: 420px;
        }
        .emails-table .col-class {
          width: 110px;
        }
        .emails-table .col-vendor {
          width: 140px;
        }
        .emails-table .col-status {
          width: 110px;
        }
        .emails-table .col-extract {
          width: 260px;
        }
        .emails-table .col-link {
          width: 180px;
        }
        @media (max-width: 1600px) {
          .emails-table .col-subject {
            width: 340px;
          }
          .emails-table .col-extract {
            width: 220px;
          }
        }
        @media (max-width: 1400px) {
          .emails-table .col-subject {
            width: 300px;
          }
          .emails-table .col-extract {
            width: 200px;
          }
        }
        @media (max-width: 1200px) {
          .emails-table .col-subject {
            width: 260px;
          }
        }
        /* 4) Truncation helpers */
        .emails-table td,
        .emails-table th {
          white-space: nowrap;
        }
        .emails-table td.subject {
          max-width: var(--subject-max, 420px);
        }
        .emails-table td .extract-wrap {
          max-width: 100%;
        }
        .emails-table td .company,
        .emails-table td .role,
        .emails-table td .next {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        /* Keep panels from growing horizontally */
        .flow-panel,
        .ops-panel,
        .backfill-panel,
        .headers-tab,
        .protocol-panel,
        .logs-panel,
        .stats-tab {
          min-width: 0;
        }
        .flow-panel,
        .ops-panel,
        .backfill-panel,
        .logs-panel,
        .protocol-panel,
        .headers-tab,
        .stats-tab {
          padding: 10px 12px 12px;
        }
        .flow-panel .flow-head,
        .ops-header,
        .logs-header,
        .protocol-header {
          margin-bottom: 4px;
        }
        .flow-chart {
          margin-top: 4px;
        }
        /* Sub-scrollbars subtle */
        .left-col::-webkit-scrollbar,
        .right-col::-webkit-scrollbar {
          width: 8px;
        }
        .left-col::-webkit-scrollbar-thumb,
        .right-col::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 6px;
        }
        .header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 14px;
        }
        .title-block {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .sync-row {
          margin-top: 4px;
        }
        .last-sync {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          background: var(--surface);
          padding: 6px 10px 6px 12px;
          border: 1px solid var(--border);
          border-radius: 999px;
          position: relative;
        }
        .ls-label {
          text-transform: uppercase;
          letter-spacing: 0.6px;
          font-size: 10px;
          opacity: 0.75;
        }
        .ls-value {
          font-variant-numeric: tabular-nums;
          font-weight: 600;
        }
        .ls-status {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2px 6px;
          border-radius: 6px;
          background: var(--surface);
          border: 1px solid var(--border);
        }
        .ls-status.inprog {
          background: rgba(0, 160, 255, 0.15);
          color: #4ec9ff;
        }
        .ls-status.idle {
          background: #253a2f;
          color: #2fc27d;
        }
        .ls-info {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          cursor: pointer;
          padding: 0;
        }
        .ls-info:hover,
        .last-sync:focus-within .ls-info {
          background: var(--surface-hover, rgba(255, 255, 255, 0.04));
        }
        .run-hover-card {
          position: fixed;
          top: var(--rhc-top);
          left: var(--rhc-left);
          width: var(--rhc-width);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 16px 18px 18px;
          z-index: 160;
          box-shadow: 0 8px 28px -6px rgba(0, 0, 0, 0.55),
            0 2px 8px rgba(0, 0, 0, 0.45);
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .rhc-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .rhc-title {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          font-weight: 600;
        }
        .rhc-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .rhc-meta {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
          font-size: 11px;
        }
        .rhc-meta label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-tertiary);
          margin-bottom: 2px;
        }
        .rhc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 8px;
          font-size: 11px;
        }
        .rhc-grid .item {
          background: var(--surface);
          padding: 6px 8px;
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .rhc-grid .item label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-tertiary);
        }
        .rhc-env {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .rhc-env .chip {
          background: var(--surface);
          padding: 4px 8px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 10px;
        }
        .rhc-legend {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 10px;
          color: var(--text-secondary);
        }
        .rhc-empty {
          font-size: 12px;
          color: var(--text-secondary);
        }
        h1 {
          margin: 0;
          font-size: 1.9rem;
        }
        .subtitle {
          color: var(--text-secondary);
          margin: 2px 0 0;
          font-size: 13.5px;
        }
        .actions-row {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .status-filter {
          display: flex;
          gap: 6px;
        }
        .filter {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 10px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          gap: 6px;
          align-items: center;
          line-height: 1;
        }
        .filter .f-label {
          font-weight: 500;
        }
        .filter .f-count {
          background: var(--border);
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 11px;
          font-variant-numeric: tabular-nums;
        }
        .filter.active {
          background: var(--primary);
          color: var(--text-inverse);
          border-color: var(--primary);
        }
        .filter.active .f-count {
          background: rgba(255, 255, 255, 0.2);
        }
        .meta-chips {
          display: flex;
          gap: 6px;
          margin-left: 12px;
          flex-wrap: wrap;
        }
        .meta-chip {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 11px;
          cursor: pointer;
          font-variant-numeric: tabular-nums;
        }
        .meta-chip.progress {
          font-weight: 600;
        }
        .meta-chip.cost {
          color: var(--accent);
        }
        .meta-chip:last-email,
        .meta-chip:last-parsed {
        }
        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .toolbar-actions > * {
          flex: 0 0 auto;
        }
        .toolbar-actions .imap-search-box {
          flex: 1 1 320px;
          min-width: 280px;
        }
        @media (max-width: 900px) {
          .toolbar-actions .imap-search-box {
            flex: 1 0 100%;
            order: 1;
          }
          .toolbar-actions .status-filter {
            order: 4;
          }
        }
        /* old responsive grid removed in favor of unified table-only scroll layout below */
        .flow-panel.compact-left {
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 14px 16px 16px;
          background: var(--surface);
        }
        .flow-panel.compact-left .flow-head h2 {
          font-size: 16px;
        }
        .flow-panel.compact-left .flow-chart {
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        }
        .flow-panel.compact-left .flow-legend.small {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        /* stats-grid & stat styles removed after toolbar consolidation */
        .mono {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
        }
        /* progress bar removed */
        .error-box {
          background: rgba(255, 0, 0, 0.08);
          border: 1px solid rgba(255, 0, 0, 0.3);
          color: #c00;
          padding: 10px 14px;
          border-radius: 8px;
        }
        /* (Removed duplicate .emails-table-wrapper border styling to reduce redundancy) */
        table.emails-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 13px;
        }
        table.emails-table thead th {
          position: sticky;
          top: 0;
          background: var(--surface);
          text-align: left;
          padding: 10px 12px;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          border-bottom: 1px solid var(--border);
        }
        table.emails-table tbody td {
          padding: 8px 12px;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        tbody tr.pending {
          background: rgba(255, 200, 0, 0.04);
        }
        tbody tr.error {
          background: rgba(255, 0, 0, 0.04);
        }
        tbody tr.parsed {
          background: rgba(0, 160, 80, 0.04);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid var(--border);
        }
        .badge.parsed {
          background: rgba(0, 160, 80, 0.15);
          color: var(--success);
          border-color: rgba(0, 160, 80, 0.4);
        }
        .badge.pending {
          background: rgba(255, 180, 0, 0.15);
          color: #b26a00;
          border-color: rgba(255, 180, 0, 0.4);
        }
        .badge.error {
          background: rgba(220, 0, 0, 0.15);
          color: #c00;
          border-color: rgba(220, 0, 0, 0.4);
        }
        /* Flattened badge variants */
        .badge.parsed {
          background: rgba(0, 180, 120, 0.14);
        }
        .badge.pending {
          background: rgba(255, 190, 40, 0.18);
        }
        .badge.error {
          background: rgba(255, 60, 60, 0.18);
        }
        .subject {
          max-width: 380px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .extract-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .extract-wrap .company {
          font-weight: 600;
        }
        .extract-wrap .role {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .extract-wrap .next {
          font-size: 11px;
          color: var(--primary);
        }
        .vendor {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .empty {
          text-align: center;
          padding: 28px 0;
          color: var(--text-tertiary);
        }
        .loading {
          padding: 40px;
          text-align: center;
        }
        @media (max-width: 900px) {
          .subject {
            max-width: 200px;
          }
        }
        @media (max-width: 640px) {
          table.emails-table thead {
            display: none;
          }
          table.emails-table tbody td {
            display: block;
            padding: 6px 10px;
          }
          table.emails-table tbody tr {
            display: block;
            margin: 0 0 12px;
            border: 1px solid var(--border);
            border-radius: 12px;
          }
        }
        .logs-panel {
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface);
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1 1 auto;
          min-height: 0;
          overflow: auto;
        }
        .logs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          position: sticky;
          top: 0;
          background: var(--surface);
          padding-bottom: 4px;
        }
        .logs-header h2 {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .logs-meta {
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .log-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .log-controls input {
          flex: 1;
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 6px 8px;
          font-size: 12px;
          border-radius: 8px;
        }
        .auto-scroll {
          font-size: 11px;
          display: flex;
          gap: 4px;
          align-items: center;
          color: var(--text-secondary);
        }
        .right-tabs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1 1 auto;
          min-height: 0;
        }
        .tab-buttons {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .tab {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
        }
        .tab.active {
          background: var(--primary);
          color: var(--text-inverse);
          border-color: var(--primary);
        }
        .sse-ind {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #555;
          margin-left: auto;
        }
        .sse-ind.pending {
          background: #666;
          animation: pulse 1.4s infinite;
        }
        .sse-ind.ok {
          background: #12b886;
          box-shadow: 0 0 6px #12b886;
        }
        .sse-ind.down {
          background: #c92a2a;
          box-shadow: 0 0 6px #c92a2a;
        }
        .ops-panel {
          margin-top: 18px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface);
          padding: 12px 14px 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ops-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }
        .ops-title {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .ops-meta {
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .ops-rows {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .op-row {
          display: grid;
          grid-template-columns: 16px 90px 1fr;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          line-height: 1.2;
        }
        .op-row .label {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #333;
        }
        .dot.ok {
          background: #12b886;
          box-shadow: 0 0 4px #12b886;
        }
        .dot.pending {
          background: #444;
        }
        .dot.running {
          background: #ffb400;
          box-shadow: 0 0 4px #ffb400;
          animation: pulse 1.2s infinite;
        }
        .dot.error {
          background: #c92a2a;
          box-shadow: 0 0 4px #c92a2a;
        }
        .ops-footer {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 10px;
          color: var(--text-tertiary);
          border-top: 1px solid var(--border);
          padding-top: 6px;
        }
        .ops-footer .mini {
          font-variant-numeric: tabular-nums;
        }
        .ops-footer .subject {
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .protocol-panel {
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface);
          padding: 14px 14px 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1 1 auto;
          min-height: 0;
          overflow: auto;
        }
        .protocol-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .protocol-header h2 {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .protocol-body {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          line-height: 1.35;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .proto-row {
          display: grid;
          grid-template-columns: 70px 42px 1fr;
          gap: 6px;
          padding: 2px 4px;
          border-radius: 4px;
        }
        .proto-row:nth-child(odd) {
          background: rgba(255, 255, 255, 0.03);
        }
        .proto-row .lvl {
          text-transform: uppercase;
          font-weight: 600;
          font-size: 10px;
          color: #5fb3ff;
        }
        .proto-empty {
          font-size: 12px;
          padding: 6px 2px;
        }
        .stats-tab {
          border: 1px solid var(--border);
          background: var(--surface);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1 1 auto;
          min-height: 0;
          overflow: auto;
        }
        .stats-tab h2 {
          margin: 0 0 2px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stats-pre {
          font-size: 11px;
          background: var(--surface);
          padding: 10px 12px;
          border-radius: 10px;
          max-height: 520px;
          overflow: auto;
        }
        .danger-wrap :global(button) {
          background: rgba(255, 0, 0, 0.15);
          border-color: rgba(255, 0, 0, 0.4);
          color: #ff4d4d;
        }
        .danger-wrap :global(button:hover) {
          background: rgba(255, 0, 0, 0.25);
        }
        tr.clickable {
          cursor: pointer;
        }
        tr.clickable:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .detail-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 520px;
          max-width: 100%;
          height: 100%;
          background: var(--surface);
          border-left: 1px solid var(--border);
          box-shadow: -2px 0 8px rgba(0, 0, 0, 0.4);
          padding: 20px 20px 40px;
          overflow: auto;
          z-index: 400;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: width 0.28s ease;
        }
        .detail-drawer.wide {
          width: min(1000px, 70vw);
        }
        @media (min-width: 1800px) {
          .detail-drawer.wide {
            width: 1100px;
          }
        }
        @media (max-width: 900px) {
          .detail-drawer,
          .detail-drawer.wide {
            width: 100%;
          }
        }
        .detail-header .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .drawer-toggle {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          line-height: 1;
        }
        .copy-btn,
        .copy-inline {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 11px;
          cursor: pointer;
          line-height: 1;
        }
        .copy-btn:hover,
        .copy-inline:hover {
          background: var(--surface-hover, rgba(255, 255, 255, 0.06));
          color: var(--text-primary);
        }
        .drawer-toggle:hover {
          background: var(--surface-hover, rgba(255, 255, 255, 0.05));
          color: var(--text-primary);
        }
        .fs-btn {
          margin-left: auto;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 11px;
          cursor: pointer;
        }
        .fs-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .email-fullscreen {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(3px);
          display: flex;
          flex-direction: column;
          padding: 32px 40px;
        }
        .email-fullscreen-inner {
          background: #0f141b;
          border: 1px solid var(--border);
          border-radius: 18px;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04),
            0 4px 22px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }
        .efs-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
        }
        .efs-title {
          font-size: 15px;
          font-weight: 600;
          line-height: 1.2;
          max-width: 70ch;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .efs-actions {
          display: flex;
          gap: 10px;
        }
        .efs-close {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 18px;
          line-height: 1;
          border-radius: 10px;
          width: 38px;
          height: 34px;
          cursor: pointer;
        }
        .efs-close:hover {
          background: var(--surface-hover, rgba(255, 255, 255, 0.06));
          color: var(--text-primary);
        }
        .efs-body {
          flex: 1;
          overflow: auto;
          padding: 22px 26px;
        }
        .efs-body .rendered-html {
          max-width: 100%;
          padding: 0;
        }
        .code-pre.full {
          max-height: none;
        }
        /* Enhanced detail styling */
        .chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 4px 0 10px;
        }
        .chip {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 11px;
          line-height: 1.1;
          font-weight: 500;
        }
        .chip.status-chip {
          font-weight: 600;
          letter-spacing: 0.4px;
        }
        .status-parsed {
          background: rgba(0, 180, 120, 0.15);
          border-color: #1f5d41;
          color: #4ae3b7;
        }
        .status-pending {
          background: rgba(255, 180, 40, 0.15);
          border-color: #b07a1a;
          color: #ffce73;
        }
        .status-error {
          background: rgba(200, 40, 50, 0.18);
          border-color: #7a2d37;
          color: #ff8a94;
        }
        .subject-line {
          margin: 0;
          font-size: 15px;
          line-height: 1.25;
          font-weight: 600;
        }
        .meta-grid.compact {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 6px;
          margin-top: 4px;
          font-size: 11px;
        }
        .meta-grid.compact label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          opacity: 0.55;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .parsed-summary {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 10px 12px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 260px;
          flex: 1;
        }
        .parsed-summary .subhead {
          margin: 0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          opacity: 0.7;
        }
        .kv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
          font-size: 11px;
        }
        .kv-grid.small {
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }
        .kv-grid div {
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: var(--surface-alt, rgba(255, 255, 255, 0.03));
          padding: 6px 8px;
          border: 1px solid var(--border);
          border-radius: 8px;
          min-width: 0;
        }
        .kv-grid div.full {
          grid-column: 1/-1;
        }
        .kv-grid em {
          font-style: normal;
          font-size: 10px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          opacity: 0.55;
        }
        .summary-box {
          font-size: 12px;
          line-height: 1.4;
          background: var(--surface-alt, rgba(255, 255, 255, 0.04));
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid var(--border);
          max-height: 140px;
          overflow: auto;
        }
        .email-body-view {
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          background: #0f141b;
        }
        .email-body-view .rendered-html {
          padding: 14px 16px;
          max-height: 480px;
          overflow: auto;
          font-size: 14px;
          line-height: 1.4;
          background: #0f141b;
        }
        .viewer-toolbar {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .viewer-toolbar button {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          cursor: pointer;
        }
        .viewer-toolbar button.active {
          background: var(--primary);
          border-color: var(--primary);
          color: var(--text-inverse);
        }
        .advanced-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 10px;
        }
        @media (max-width: 1100px) {
          .advanced-grid {
            grid-template-columns: 1fr;
          }
        }
        .collapsible.advanced {
          border: 1px solid var(--border);
          padding: 10px 12px;
          border-radius: 12px;
          background: var(--surface);
        }
        .collapsible.advanced summary {
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }
        .small-pre {
          max-height: 220px;
        }
        .calls-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 11px;
        }
        .calls-table thead th {
          position: sticky;
          top: 0;
          background: var(--surface);
          padding: 6px 8px;
          text-align: left;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          border-bottom: 1px solid var(--border);
        }
        .calls-table tbody td {
          padding: 6px 8px;
          border-bottom: 1px solid var(--border);
        }
        .calls-table tbody tr:last-child td {
          border-bottom: none;
        }
        .calls-table tbody tr:nth-child(odd) {
          background: rgba(255, 255, 255, 0.02);
        }
        .parse-error-banner {
          background: rgba(200, 40, 50, 0.18);
          border: 1px solid #7a2d37;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .parse-error-banner .pe-actions {
          display: flex;
          gap: 8px;
        }
        .mini {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          cursor: pointer;
        }
        .mini:hover {
          background: var(--surface-hover, rgba(255, 255, 255, 0.06));
        }
        .rendered-html.collapsed {
          max-height: 340px;
          overflow: hidden;
          position: relative;
        }
        .rendered-html.collapsed:after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 80px;
          background: linear-gradient(
            to bottom,
            rgba(15, 20, 27, 0),
            #0f141b 65%
          );
        }
        .preview-controls {
          display: flex;
          justify-content: flex-end;
          padding: 4px 8px;
          gap: 8px;
        }
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .detail-header h3 {
          margin: 0;
          font-size: 16px;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 20px;
          cursor: pointer;
        }
        .detail-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .section h4 {
          margin: 0 0 6px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--text-tertiary);
        }
        .meta-pre,
        .json-pre,
        .raw-pre {
          background: var(--surface);
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 11px;
          max-height: 260px;
          overflow: auto;
          line-height: 1.35;
        }
        .call-row {
          background: var(--surface);
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 11px;
          margin-bottom: 6px;
        }
        .call-meta {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
        }
        .detail-loading {
          font-size: 12px;
        }
        .info-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          width: 14px;
          height: 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 50%;
          cursor: help;
          margin-left: 4px;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .env-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 11px;
        }
        .env-chip {
          background: var(--surface);
          padding: 4px 8px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .legend {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 11px;
          color: var(--text-secondary);
        }
        .legend-item {
          line-height: 1.3;
        }
        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          background: rgba(0, 160, 255, 0.12);
          color: #4ec9ff;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(0, 160, 255, 0.4);
        }
        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ec9ff;
          box-shadow: 0 0 6px #4ec9ff;
          animation: pulse 1.2s infinite;
        }
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.25;
          }
          100% {
            opacity: 1;
          }
        }
        .log-row {
          display: grid;
          grid-template-columns: 76px 60px 60px 1fr;
          gap: 8px;
          font-size: 11px;
          line-height: 1.3;
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid transparent;
        }
        .log-row:nth-child(odd) {
          background: rgba(255, 255, 255, 0.015);
        }
        .log-row.run {
          border-color: rgba(0, 128, 255, 0.2);
        }
        .log-row.search {
          border-color: rgba(128, 0, 255, 0.2);
        }
        .log-row.fetch {
          border-color: rgba(0, 200, 140, 0.25);
        }
        .log-row.parse {
          border-color: rgba(255, 160, 0, 0.3);
        }
        .log-phase {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .log-status {
          font-weight: 500;
        }
        .logs-empty {
          font-size: 12px;
          padding: 8px 4px;
        }
        /* 5) Flow panel & stages */
        .flow-panel {
          border: 1px solid var(--border);
          background: var(--surface);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .flow-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .flow-head h2 {
          margin: 0;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .fh-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .badge-live {
          background: rgba(0, 160, 255, 0.18);
          color: #4ec9ff;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .fh-right {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .flow-progress {
          background: var(--surface);
          padding: 4px 10px;
          border-radius: 8px;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .flow-chart {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));
          gap: 6px;
        }
        .flow-stage {
          position: relative;
          padding: 4px 7px 5px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 7px;
          display: flex;
          flex-direction: column;
          gap: 1px;
          cursor: pointer;
          outline: none;
          transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
          min-height: 44px;
        }
        .flow-stage:hover {
          border-color: #3c4b63;
        }
        .flow-stage.selected {
          box-shadow: 0 0 0 2px var(--primary);
        }
        .flow-stage .stage-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .flow-stage .stage-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          opacity: 0.8;
        }
        .state-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #555;
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          transition: background 0.3s, box-shadow 0.3s;
        }
        .flow-stage.done .state-dot {
          background: #12b886;
          box-shadow: 0 0 4px #12b886;
        }
        .flow-stage.active .state-dot {
          background: #ffb400;
          box-shadow: 0 0 6px #ffb400;
          animation: pulse 1.2s infinite;
        }
        .flow-stage.pending .state-dot {
          background: #444;
        }
        .flow-stage.blocked .state-dot {
          background: #333;
          opacity: 0.5;
        }
        .flow-stage.error .state-dot {
          background: #c92a2a;
          box-shadow: 0 0 6px #c92a2a;
        }
        .flow-stage .stage-detail {
          font-size: 10px;
          line-height: 1.2;
          opacity: 0.7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .flow-stage.done {
          background: rgba(0, 160, 100, 0.1);
          border-color: #1f5d41;
        }
        .flow-stage.active {
          background: rgba(255, 180, 40, 0.14);
          border-color: #b07a1a;
        }
        .flow-stage.pending {
          background: #2b2f38;
          border-style: dashed;
          opacity: 0.68;
        }
        .flow-stage.blocked {
          background: #2b2f38;
          border: 1px solid #444b57;
          opacity: 0.38;
        }
        .flow-stage.error {
          background: rgba(160, 40, 50, 0.16);
          border-color: #7a2d37;
        }
        .flow-legend {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .flow-legend .leg {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          background: #253043;
          opacity: 0.7;
          border: 1px solid #334154;
        }
        .flow-legend .done {
          background: #1f5d41;
          border-color: #2e7b57;
        }
        .flow-legend .active {
          background: #2c4d7a;
          border-color: #3d6aa7;
        }
        .flow-legend .pending {
          background: #3a3f4a;
          border-color: #4a515e;
        }
        .flow-legend .blocked {
          background: #2e333d;
          border-color: #474f5c;
        }
        .flow-legend .error {
          background: #7a2d37;
          border-color: #a3414d;
        }
        .backfill-panel {
          border: 1px solid var(--border);
          background: var(--surface);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bf-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .bf-head h2 {
          margin: 0;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .bf-btn {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 11px;
          cursor: pointer;
        }
        .bf-btn:hover {
          background: #1f2d3d;
        }
        .bf-error {
          font-size: 11px;
          color: #ff6b6b;
          background: rgba(255, 0, 0, 0.12);
          padding: 6px 8px;
          border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: 8px;
        }
        .bf-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 11px;
        }
        .bf-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        .bf-row.split {
          align-items: center;
        }
        .bf-badges {
          display: flex;
          gap: 6px;
        }
        .bf-badges em {
          background: var(--surface);
          padding: 2px 6px;
          border-radius: 6px;
          font-style: normal;
          font-size: 10px;
        }
        .small-txt {
          font-size: 11px;
        }
        .headers-tab {
          border: 1px solid var(--border);
          background: var(--surface);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1 1 auto;
          min-height: 0;
          overflow: hidden;
        }
        .headers-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .headers-head h2 {
          margin: 0;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .hc-filters {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .hc-filters select {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
        }
        .hc-refresh {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          cursor: pointer;
        }
        .headers-wrapper {
          overflow: auto;
          flex: 1 1 auto;
          min-height: 0;
        }
        .headers-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 12px;
        }
        .headers-table thead th {
          position: sticky;
          top: 0;
          background: var(--surface);
          text-align: left;
          padding: 6px 8px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
        }
        .headers-table tbody td {
          padding: 6px 8px;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }
        .headers-table tbody tr:last-child td {
          border-bottom: none;
        }
        .hrow.skip {
          background: rgba(255, 255, 255, 0.02);
        }
        .hrow.relevant {
          background: rgba(0, 200, 120, 0.06);
        }
        .hrow.ambiguous {
          background: rgba(255, 180, 0, 0.06);
        }
        .headers-table .score {
          min-width: 60px;
        }
        /* Skipped modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 60px 20px;
          z-index: 500;
        }
        .modal {
          width: 100%;
          max-width: 920px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 20px 22px 26px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: calc(100vh - 120px);
          overflow: hidden;
        }
        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-head h3 {
          margin: 0;
          font-size: 15px;
        }
        .modal-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow: auto;
        }
        .skipped-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 12px;
        }
        .skipped-table thead th {
          position: sticky;
          top: 0;
          background: var(--surface);
          padding: 8px 10px;
          text-align: left;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          border-bottom: 1px solid var(--border);
        }
        .skipped-table tbody td {
          padding: 6px 10px;
          border-bottom: 1px solid #1f2c3d;
          vertical-align: top;
        }
        .skipped-table tbody tr:last-child td {
          border-bottom: none;
        }
        .skip-row:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        .reason {
          max-width: 320px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .note {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .mb8 {
          margin-bottom: 8px;
        }
        .skipped-table {
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface);
        }
        .skip-row.clickable {
          cursor: pointer;
        }
        .skip-row.clickable:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .detail-drawer.skipped {
          z-index: 520;
        }
        .detail-drawer.skipped .explain {
          font-size: 12px;
          line-height: 1.45;
          color: var(--text-secondary);
          background: var(--surface);
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .reprocess-btn,
        .secondary-btn {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          cursor: not-allowed;
        }
        .secondary-btn {
          cursor: pointer;
          background: var(--surface);
        }
        .secondary-btn:hover {
          background: var(--surface-hover, rgba(255, 255, 255, 0.05));
        }
        /* === Brand Alignment Overrides (Applications styling) === */
        /* Unify border radii with theme scale and neutralize legacy gradients */
        .stat,
        .logs-panel,
        .protocol-panel,
        .stats-tab,
        .ops-panel,
        .flow-panel,
        .backfill-panel,
        .headers-tab,
        .modal,
        .emails-table-wrapper,
        .detail-drawer,
        .run-hover-card {
          border-radius: var(--radius-lg);
        }
        .modal {
          border-radius: var(--radius-xl);
        }
        .emails-table-wrapper {
          border-radius: var(--radius-xl);
        }
        .detail-drawer {
          border-radius: 0;
        } /* drawer stays flush */
        /* Natural scroll: remove fixed viewport heights */
        /* STANDARD PATTERN: single internal scroll region (table) with full-height frame below global nav */
        /* Allow natural document scroll so table rows aren't clipped */
        .ingest-page {
        }
        /* duplicate older grid definitions removed */
        /* Pills & chips already use full radius where needed */
        .filter,
        .tab,
        .ls-status,
        .badge,
        .bf-btn,
        .hc-refresh,
        .hc-filters select {
          border-radius: var(--radius-md);
        }
        .imap-search-box {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 4px 8px;
          border-radius: 12px;
          gap: 6px;
          min-width: 260px;
        }
        .imap-search-box input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 12px;
        }
        .imap-search-box input::placeholder {
          color: var(--text-tertiary);
        }
        .imap-search-box .clear-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          padding: 0 2px;
        }
        .imap-search-box .loader {
          width: 10px;
          height: 10px;
          border: 2px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .imap-search-box .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .imap-search-box .status-dot.ok {
          background: var(--success);
          box-shadow: 0 0 4px var(--success);
        }
        .imap-search-box .status-dot.err {
          background: var(--error);
          box-shadow: 0 0 4px var(--error);
        }
        .imap-search-box .all-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: var(--text-tertiary);
          padding-left: 4px;
          border-left: 1px solid var(--border);
          margin-left: 4px;
        }
        .imap-search-box .all-toggle input {
          margin: 0;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .imap-inline-results {
          border: 1px solid var(--border);
          background: var(--surface);
          border-radius: 16px;
          padding: 14px 16px;
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 0 0 auto;
        }
        /* -------------------- Visual Refinements -------------------- */
        /* Panel unification with subtle layered background */
        .flow-panel,
        .ops-panel,
        .backfill-panel,
        .logs-panel,
        .protocol-panel,
        .headers-tab,
        .stats-tab {
          background: var(--surface);
          backdrop-filter: blur(2px);
          position: relative;
        }
        .flow-panel::before,
        .ops-panel::before,
        .backfill-panel::before,
        .logs-panel::before,
        .protocol-panel::before,
        .headers-tab::before,
        .stats-tab::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.02),
            0 6px 18px -8px rgba(0, 0, 0, 0.65);
        }
        /* Panel header accent dots */
        .logs-header h2:before,
        .protocol-header h2:before,
        .ops-header .ops-title:before,
        .bf-head h2:before,
        .headers-head h2:before,
        .stats-tab h2:before,
        .flow-panel .flow-head h2:before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--primary, #3d7fff);
          box-shadow: 0 0 6px -1px var(--primary, #3d7fff);
          margin-right: 6px;
          display: inline-block;
        }
        .protocol-header h2:before {
          background: #5fb3ff;
          box-shadow: 0 0 6px -1px #5fb3ff;
        }
        .logs-header h2:before {
          background: #ffa94d;
          box-shadow: 0 0 6px -1px #ffa94d;
        }
        .ops-header .ops-title:before {
          background: #51cf66;
          box-shadow: 0 0 6px -1px #51cf66;
        }
        .bf-head h2:before {
          background: #9775fa;
          box-shadow: 0 0 6px -1px #9775fa;
        }
        .headers-head h2:before {
          background: #adb5bd;
          box-shadow: 0 0 6px -1px #adb5bd;
        }
        .stats-tab h2:before {
          background: #15aabf;
          box-shadow: 0 0 6px -1px #15aabf;
        }
        .flow-panel .flow-head h2:before {
          background: #4dabf7;
          box-shadow: 0 0 6px -1px #4dabf7;
        }
        .logs-header h2,
        .protocol-header h2,
        .ops-header .ops-title,
        .bf-head h2,
        .headers-head h2,
        .stats-tab h2,
        .flow-panel .flow-head h2 {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        /* Meta chips richer background */
        .meta-chip {
          background: #1e2631;
          border: 1px solid #2d3644;
          color: var(--text-secondary);
        }
        .meta-chip.progress {
          background: #1d3024;
          color: #5ad19a;
        }
        .meta-chip.cost {
          background: #291d3a;
          color: #c09bff;
        }
        .meta-chip.last-email,
        .meta-chip.last-parsed {
          background: #242c36;
        }
        .meta-chip:hover {
          filter: brightness(1.12);
        }
        /* (Removed duplicate legacy flow-stage & table hover styles; unified earlier) */
        /* Flow microinteractions (theme-aware + light mode support) */
        :global(html) {
          --accent: var(--primary, #3d7fff);
          --accent-rgb: 61 127 255;
        }
        :global(html.light) {
          --accent: var(--primary, #2f6fd5);
          --accent-rgb: 47 111 213;
        }
        .flow-progress-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0 6px;
        }
        .fp-track {
          flex: 1;
          height: 6px;
          background: rgba(var(--accent-rgb) / 0.18);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
        .fp-track:before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            rgba(var(--accent-rgb) / 0.25),
            transparent 60%
          );
          background-size: 200% 100%;
          animation: fpTrackMotion 8s linear infinite;
          mix-blend-mode: screen;
        }
        @keyframes fpTrackMotion {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .fp-fill {
          position: absolute;
          inset: 0;
          width: 100%;
          background: linear-gradient(
            90deg,
            var(--accent),
            rgba(var(--accent-rgb) / 0.6)
          );
          border-radius: inherit;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 0 0 rgba(var(--accent-rgb) / 0.55);
        }
        .flow-progress-bar[data-live] .fp-fill {
          animation: fpPulseBar 2.6s ease-in-out infinite;
        }
        @keyframes fpPulseBar {
          0% {
            filter: brightness(1);
            box-shadow: 0 0 0 0 rgba(var(--accent-rgb) / 0.55);
          }
          50% {
            filter: brightness(1.3);
            box-shadow: 0 0 12px -2px rgba(var(--accent-rgb) / 0.9);
          }
          100% {
            filter: brightness(1);
            box-shadow: 0 0 0 0 rgba(var(--accent-rgb) / 0.55);
          }
        }
        /* Progress fill via --p set in effect */
        .flow-progress-bar .fp-fill {
          transform: scaleX(var(--p, 0));
        }
        .fp-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-secondary);
        }
        .fp-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 0 0 var(--accent);
          animation: fpDot 1.7s ease-in-out infinite;
        }
        @keyframes fpDot {
          0% {
            transform: scale(0.85);
            box-shadow: 0 0 0 0 rgba(var(--accent-rgb) / 0.6);
          }
          65% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(var(--accent-rgb) / 0);
          }
          100% {
            transform: scale(0.85);
            box-shadow: 0 0 0 0 rgba(var(--accent-rgb) / 0);
          }
        }
        .flow-stage .stage-time {
          font-size: 9px;
          font-variant-numeric: tabular-nums;
          opacity: 0.55;
          transition: opacity 0.3s;
        }
        .flow-stage .stage-activity {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }
        .flow-stage .stage-activity .sa-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 4px -1px var(--accent);
          animation: saBlink 1.15s ease-in-out infinite;
        }
        .flow-stage .stage-activity .sa-bar {
          flex: 1;
          height: 3px;
          background: linear-gradient(90deg, var(--accent), transparent);
          border-radius: 2px;
          position: relative;
          overflow: hidden;
        }
        .flow-stage .stage-activity .sa-bar:before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.28),
            rgba(255, 255, 255, 0)
          );
          animation: saSweep 1.25s linear infinite;
        }
        @keyframes saBlink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.25;
          }
        }
        @keyframes saSweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .flow-stage.active {
          outline: 1px solid rgba(var(--accent-rgb) / 0.55);
          background: linear-gradient(
            180deg,
            rgba(var(--accent-rgb) / 0.18),
            rgba(var(--accent-rgb) / 0.05)
          );
          position: relative;
        }
        .flow-stage.active:before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 6px;
          background: linear-gradient(
            120deg,
            rgba(var(--accent-rgb) / 0.4),
            transparent 40%,
            transparent 60%,
            rgba(var(--accent-rgb) / 0.4)
          );
          background-size: 180% 100%;
          animation: stageSheen 6s linear infinite;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        @keyframes stageSheen {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .flow-stage.active .stage-label {
          text-shadow: 0 0 6px rgba(var(--accent-rgb) / 0.6);
        }
        .flow-stage.done {
          transition: filter 0.6s ease, opacity 0.6s ease;
        }
        .flow-stage.done:not(.selected) {
          opacity: 0.82;
        }
        .flow-stage.error {
          animation: stageErrorPulse 1.35s ease-in-out infinite alternate;
        }
        @keyframes stageErrorPulse {
          from {
            box-shadow: 0 0 0 0 rgba(255 60 60/0.15);
          }
          to {
            box-shadow: 0 0 8px -2px rgba(255 80 80/0.55);
          }
        }
        .flow-stage.done:hover .stage-time {
          opacity: 0.9;
        }
        @media (prefers-reduced-motion: reduce) {
          .fp-fill,
          .flow-stage.active:before,
          .fp-track:before,
          .flow-stage.error,
          .fp-pulse,
          .sa-dot,
          .sa-bar:before {
            animation: none !important;
            transition: none !important;
          }
        }
        /* Run info button refinement */
        .ls-info {
          background: #1b232e;
          border: 1px solid #2a3340;
        }
        .ls-info:hover {
          border-color: #3d4a5c;
        }
        /* Logs / protocol row subtle separators */
        .log-row {
          background: rgba(255, 255, 255, 0.015);
        }
        .proto-row {
          background: rgba(255, 255, 255, 0.01);
        }
        /* Header cache table row coloring softened */
        .hrow.relevant {
          background: rgba(0, 180, 120, 0.05);
        }
        .hrow.ambiguous {
          background: rgba(255, 180, 0, 0.06);
        }
        .hrow.skip {
          background: rgba(255, 255, 255, 0.015);
        }
        /* Modal adjustments */
        .modal {
          box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.5),
            0 2px 8px rgba(0, 0, 0, 0.4);
        }
        /* Danger button keep tone but align radius */
        .danger-wrap :global(button) {
          border-radius: var(--radius-md);
        }
        /* Ensure consistent focus outline could be added later */
        /* End branding overrides */
      `}</style>
    </AppLayout>
  );
}
