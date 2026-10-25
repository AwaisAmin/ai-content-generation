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
import { MAX_CONCURRENT_GENERATIONS } from "@/config/generation";
import { createStudioVersion, fetchStudioProject, updateStudioVersion } from "@/lib/api";
import { buildVersionTree } from "@/lib/versionTree";

/*
 * State for the Studio: the project's version tree, the selected version
 * and branches being generated. Edits (star, hero, note) are optimistic
 * and roll back if the API rejects them.
 */

const StudioContext = createContext(null);

const initialState = {
  status: "loading",
  project: null,
  error: null,
  selectedId: null,
  // Branches in flight / failed: { id, input, status, error, startedAt }
  jobs: [],
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

    case "job/started":
      return { ...state, jobs: [...state.jobs, action.job] };
    case "job/failed":
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.id ? { ...job, status: "failed", error: action.error } : job,
        ),
        announcement: `Couldn't create the branch: ${action.error}`,
      };
    case "job/removed":
      return { ...state, jobs: state.jobs.filter((job) => job.id !== action.id) };
    case "job/completed": {
      const { version } = action;
      // Follow the new version only if the user is still on its parent.
      const follow = state.selectedId === version.parentId;
      return {
        ...state,
        jobs: state.jobs.filter((job) => job.id !== action.id),
        project: { ...state.project, versions: [...state.project.versions, version] },
        selectedId: follow ? version.id : state.selectedId,
        announcement: `${version.id} is ready${follow ? " and selected" : ""}.`,
      };
    }
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

  // Pending branches join the tree as placeholder rows under their parent.
  const { jobs } = state;
  const tree = useMemo(() => {
    if (!versions) return null;
    const placeholders = jobs.map((job) => ({
      id: job.id,
      parentId: job.input.parentId,
      operation: job.input.operation,
      createdAt: job.startedAt,
      pending: job.status,
      outputs: [],
    }));
    return buildVersionTree([...versions, ...placeholders]);
  }, [versions, jobs]);

  const runningCount = jobs.filter((job) => job.status === "running").length;
  const canBranch = runningCount < MAX_CONCURRENT_GENERATIONS;

  const jobControllers = useRef(new Map());
  useEffect(() => {
    const controllers = jobControllers.current;
    return () => controllers.forEach((controller) => controller.abort());
  }, []);

  /** Generates a new version from `input.parentId` (vary / refine / remix). */
  const branch = useCallback(async (input) => {
    const id = `pending-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const controller = new AbortController();
    jobControllers.current.set(id, controller);
    dispatch({
      type: "job/started",
      job: { id, input, status: "running", error: null, startedAt: new Date().toISOString() },
    });

    try {
      const version = await createStudioVersion(input, { signal: controller.signal });
      dispatch({ type: "job/completed", id, version });
    } catch (error) {
      dispatch(
        error.name === "AbortError"
          ? { type: "job/removed", id }
          : { type: "job/failed", id, error: error.message },
      );
    } finally {
      jobControllers.current.delete(id);
    }
  }, []);

  const cancelJob = useCallback((id) => jobControllers.current.get(id)?.abort(), []);
  const dismissJob = useCallback((id) => dispatch({ type: "job/removed", id }), []);
  const retryJob = useCallback(
    (job) => {
      dispatch({ type: "job/removed", id: job.id });
      branch(job.input);
    },
    [branch],
  );

  const select = useCallback((id) => dispatch({ type: "select", id }), []);

  // Mirror the selection in the URL hash (shareable deep link, no history
  // entries) — including when a finished branch is selected automatically.
  useEffect(() => {
    if (state.selectedId) window.history.replaceState(null, "", `#${state.selectedId}`);
  }, [state.selectedId]);

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
      runningCount,
      canBranch,
      branch,
      cancelJob,
      dismissJob,
      retryJob,
    }),
    [state, tree, retry, select, patchVersion, runningCount, canBranch, branch, cancelJob, dismissJob, retryJob],
  );

  return <StudioContext value={value}>{children}</StudioContext>;
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used inside <StudioProvider>");
  return context;
}
