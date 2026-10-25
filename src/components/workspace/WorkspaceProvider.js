"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { fetchGenerations, fetchHistory } from "@/lib/api";

/*
 * Client-side state for one workspace screen: the history strip and the
 * results feed. The generation flow plugs into the same reducer next, so
 * every panel reads from a single source of truth.
 */

const WorkspaceContext = createContext(null);

export const FEED_PAGE_SIZE = 6;

const initialState = {
  history: { status: "loading", items: [], error: null },
  feed: {
    status: "loading",
    items: [],
    nextCursor: null,
    error: null,
    isLoadingMore: false,
    loadMoreError: null,
  },
  highlightedId: null,
};

const HIGHLIGHT_MS = 1800;

/** Resolves with the element once React has committed it (or null after ~1s). */
function waitForElement(id, attempts = 60) {
  return new Promise((resolve) => {
    (function check(remaining) {
      const element = document.getElementById(id);
      if (element || remaining === 0) resolve(element);
      else requestAnimationFrame(() => check(remaining - 1));
    })(attempts);
  });
}

function reducer(state, action) {
  switch (action.type) {
    case "history/loading":
      return { ...state, history: { ...state.history, status: "loading", error: null } };
    case "history/loaded":
      return { ...state, history: { status: "success", items: action.items, error: null } };
    case "history/failed":
      return { ...state, history: { ...state.history, status: "error", error: action.error } };

    case "feed/loading":
      return { ...state, feed: { ...initialState.feed } };
    case "feed/loaded":
      return {
        ...state,
        feed: {
          ...initialState.feed,
          status: "success",
          items: action.items,
          nextCursor: action.nextCursor,
        },
      };
    case "feed/failed":
      return { ...state, feed: { ...state.feed, status: "error", error: action.error } };
    case "feed/loadingMore":
      return { ...state, feed: { ...state.feed, isLoadingMore: true, loadMoreError: null } };
    case "feed/appended":
      return {
        ...state,
        feed: {
          ...state.feed,
          items: [...state.feed.items, ...action.items],
          nextCursor: action.nextCursor,
          isLoadingMore: false,
        },
      };
    case "feed/loadMoreFailed":
      return {
        ...state,
        feed: { ...state.feed, isLoadingMore: false, loadMoreError: action.error },
      };

    case "highlight/set":
      return { ...state, highlightedId: action.id };
    case "highlight/clear":
      return { ...state, highlightedId: null };

    default:
      throw new Error(`Unknown workspace action: ${action.type}`);
  }
}

async function loadHistory(dispatch, signal) {
  try {
    const items = await fetchHistory({ signal });
    dispatch({ type: "history/loaded", items });
  } catch (error) {
    if (error.name !== "AbortError") {
      dispatch({ type: "history/failed", error: error.message });
    }
  }
}

async function loadFeed(dispatch, feedType, signal) {
  try {
    const page = await fetchGenerations({ type: feedType, limit: FEED_PAGE_SIZE, signal });
    dispatch({ type: "feed/loaded", ...page });
  } catch (error) {
    if (error.name !== "AbortError") {
      dispatch({ type: "feed/failed", error: error.message });
    }
  }
}

/**
 * @param feedType  "image" | "video" to filter the feed, or undefined for all.
 */
export function WorkspaceProvider({ feedType, children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();
  const highlightTimer = useRef(null);

  // Latest feed for async work (e.g. paging until an item is found) that
  // must not capture a stale snapshot.
  const feedRef = useRef(state.feed);
  useEffect(() => {
    feedRef.current = state.feed;
  }, [state.feed]);

  useEffect(() => {
    const controller = new AbortController();
    loadHistory(dispatch, controller.signal);
    loadFeed(dispatch, feedType, controller.signal);
    return () => controller.abort();
  }, [feedType]);

  const retryHistory = useCallback(() => {
    dispatch({ type: "history/loading" });
    loadHistory(dispatch);
  }, []);

  const retryFeed = useCallback(() => {
    dispatch({ type: "feed/loading" });
    loadFeed(dispatch, feedType);
  }, [feedType]);

  /** Fetches the next page. Returns the new items, or null if nothing ran. */
  const loadMore = useCallback(async () => {
    const { nextCursor, isLoadingMore } = feedRef.current;
    if (!nextCursor || isLoadingMore) return null;

    // Mark synchronously so overlapping callers bail out early.
    feedRef.current = { ...feedRef.current, isLoadingMore: true };
    dispatch({ type: "feed/loadingMore" });
    try {
      const page = await fetchGenerations({
        type: feedType,
        cursor: nextCursor,
        limit: FEED_PAGE_SIZE,
      });
      // Keep the ref in step immediately: callers like ensureLoaded loop
      // again before React re-renders and the sync effect runs.
      feedRef.current = {
        ...feedRef.current,
        items: [...feedRef.current.items, ...page.items],
        nextCursor: page.nextCursor,
        isLoadingMore: false,
      };
      dispatch({ type: "feed/appended", ...page });
      return page.items;
    } catch (error) {
      feedRef.current = { ...feedRef.current, isLoadingMore: false };
      dispatch({ type: "feed/loadMoreFailed", error: error.message });
      return null;
    }
  }, [feedType]);

  /**
   * Pages through the feed until generation `id` is loaded.
   * Resolves true when it's on screen, false if it isn't in this feed.
   */
  const ensureLoaded = useCallback(
    async (id) => {
      const has = (items) => items.some((item) => item.id === id);
      if (has(feedRef.current.items)) return true;

      while (feedRef.current.nextCursor) {
        const items = await loadMore();
        if (!items) return false;
        if (has(items)) return true;
      }
      return false;
    },
    [loadMore],
  );

  /**
   * Scrolls the feed to a generation and briefly highlights it, loading
   * more pages first if needed. Generations hidden by this page's filter
   * (e.g. a video on /image) open on the unfiltered Home feed instead.
   */
  const focusGeneration = useCallback(
    async (id, type) => {
      if (feedType && type && type !== feedType) {
        router.push(`/#generation-${id}`);
        return;
      }
      if (!(await ensureLoaded(id))) return;

      window.history.replaceState(null, "", `#generation-${id}`);
      dispatch({ type: "highlight/set", id });
      const element = await waitForElement(`generation-${id}`);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });

      clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(
        () => dispatch({ type: "highlight/clear" }),
        HIGHLIGHT_MS,
      );
    },
    [feedType, ensureLoaded, router],
  );

  // Deep links (/#generation-gen-005) focus once the first page is in.
  const feedReady = state.feed.status === "success";
  useEffect(() => {
    if (!feedReady) return;
    const match = window.location.hash.match(/^#generation-(.+)$/);
    if (match) focusGeneration(match[1]);
  }, [feedReady, focusGeneration]);

  useEffect(() => () => clearTimeout(highlightTimer.current), []);

  const value = useMemo(
    () => ({
      feedType,
      history: state.history,
      feed: state.feed,
      highlightedId: state.highlightedId,
      retryHistory,
      retryFeed,
      loadMore,
      focusGeneration,
    }),
    [
      feedType,
      state.history,
      state.feed,
      state.highlightedId,
      retryHistory,
      retryFeed,
      loadMore,
      focusGeneration,
    ],
  );

  return <WorkspaceContext value={value}>{children}</WorkspaceContext>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  }
  return context;
}
