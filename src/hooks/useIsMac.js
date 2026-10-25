"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () =>
  /mac|iphone|ipad/i.test(navigator.userAgentData?.platform ?? navigator.platform);
const getServerSnapshot = () => false;

/** Whether shortcuts should be shown with ⌘ rather than Ctrl. */
export function useIsMac() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
