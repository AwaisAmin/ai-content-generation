"use client";

import { useCallback, useReducer } from "react";
import { DEFAULT_SETTINGS, adaptSettingsToType } from "@/config/generation";

function reducer(settings, action) {
  switch (action.type) {
    case "update":
      return { ...settings, [action.field]: action.value };
    case "setType":
      return adaptSettingsToType(settings, action.value);
    default:
      throw new Error(`Unknown prompt settings action: ${action.type}`);
  }
}

/**
 * Local form state for the prompt panel. Kept out of the workspace context
 * on purpose: typing a prompt shouldn't re-render the feed.
 */
export function usePromptSettings(initialType = DEFAULT_SETTINGS.type) {
  const [settings, dispatch] = useReducer(reducer, initialType, (type) =>
    adaptSettingsToType(DEFAULT_SETTINGS, type),
  );

  const update = useCallback(
    (field, value) => dispatch({ type: "update", field, value }),
    [],
  );
  const setType = useCallback(
    (value) => dispatch({ type: "setType", value }),
    [],
  );

  return { settings, update, setType };
}
