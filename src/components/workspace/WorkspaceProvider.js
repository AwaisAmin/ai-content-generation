"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { fetchHistory } from "@/lib/api";

/*
 * Client-side state for one workspace screen. Holds the history strip for
 * now; the results feed and generation flow plug into the same reducer in
 * later steps so every panel reads from a single source of truth.
 */

const WorkspaceContext = createContext(null);

const initialState = {
  history: { status: "loading", items: [], error: null },
};

function reducer(state, action) {
  switch (action.type) {
    case "history/loading":
      return { ...state, history: { ...state.history, status: "loading", error: null } };
    case "history/loaded":
      return { ...state, history: { status: "success", items: action.items, error: null } };
    case "history/failed":
      return { ...state, history: { ...state.history, status: "error", error: action.error } };
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

export function WorkspaceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const controller = new AbortController();
    loadHistory(dispatch, controller.signal);
    return () => controller.abort();
  }, []);

  const retryHistory = useCallback(() => {
    dispatch({ type: "history/loading" });
    loadHistory(dispatch);
  }, []);

  const value = useMemo(
    () => ({ history: state.history, retryHistory }),
    [state.history, retryHistory],
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
