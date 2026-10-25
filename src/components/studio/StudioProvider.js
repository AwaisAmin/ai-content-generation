"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { fetchStudioProject, updateStudioVersion } from "@/lib/api";
import { buildVersionTree } from "@/lib/versionTree";

/*
 * State for the Studio: the project's version tree and which version is
 * selected. Edits (star, hero, note) are optimistic and roll back if the
 * API rejects them.
 */

const StudioContext = createContext(null);

const initialState = {
  status: "loading",
  project: null,
  error: null,
  selectedId: null,
  announcement: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, status: "loading", error: null };
    case "loaded":
      return {
        ...state,
        status: "success",
        project: action.project,
        selectedId: action.selectedId,
      };
    case "failed":
      return { ...state, status: "error", error: action.error };
    case "select":
      return { ...state, selectedId: action.id };
    case "patched":
      return {
        ...state,
        project: {
          ...state.project,
          versions: state.project.versions.map((version) =>
            version.id === action.id ? { ...version, ...action.changes } : version,
          ),
        },
      };
    case "announce":
      return { ...state, announcement: action.message };
    default:
      throw new Error(`Unknown studio action: ${action.type}`);
  }
}

/** Selection from the URL hash (#v4), else the most recently created version. */
function initialSelection(versions) {
  const fromHash = window.location.hash.slice(1);
  if (versions.some((version) => version.id === fromHash)) return fromHash;
  return versions.reduce((latest, version) =>
    version.createdAt > latest.createdAt ? version : latest,
  ).id;
}

async function loadProject(dispatch, signal) {
  try {
    const project = await fetchStudioProject({ signal });
    dispatch({ type: "loaded", project, selectedId: initialSelection(project.versions) });
  } catch (error) {
    if (error.name !== "AbortError") dispatch({ type: "failed", error: error.message });
  }
}

export function StudioProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const versions = state.project?.versions;

  useEffect(() => {
    const controller = new AbortController();
    loadProject(dispatch, controller.signal);
    return () => controller.abort();
  }, []);

  const retry = useCallback(() => {
    dispatch({ type: "loading" });
    loadProject(dispatch);
  }, []);

  const tree = useMemo(() => (versions ? buildVersionTree(versions) : null), [versions]);

  const select = useCallback((id) => {
    dispatch({ type: "select", id });
    // Shareable deep link without adding history entries.
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  /** Applies `changes` locally, persists them, and reverts on failure. */
  const patchVersion = useCallback(
    async (id, changes) => {
      const current = tree?.byId.get(id);
      if (!current) return;
      const previous = Object.fromEntries(Object.keys(changes).map((key) => [key, current[key]]));

      dispatch({ type: "patched", id, changes });
      try {
        await updateStudioVersion(id, changes);
      } catch (error) {
        dispatch({ type: "patched", id, changes: previous });
        dispatch({ type: "announce", message: `Couldn't save: ${error.message}` });
      }
    },
    [tree],
  );

  const value = useMemo(
    () => ({
      ...state,
      tree,
      selected: tree?.byId.get(state.selectedId) ?? null,
      retry,
      select,
      patchVersion,
    }),
    [state, tree, retry, select, patchVersion],
  );

  return <StudioContext value={value}>{children}</StudioContext>;
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used inside <StudioProvider>");
  return context;
}
