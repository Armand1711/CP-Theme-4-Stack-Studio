import type { ServiceKey } from "./content";

/*
 * Keeps the home hero's ticker and stack in step. Each announces which service it is showing (or that
 * the pointer has left, with `key: null`); the other follows. A window event keeps the two components
 * independent of each other and of where they sit in the tree.
 */

export type ServiceSignal = { key: ServiceKey | null; source: "ticker" | "stack" };

const EVENT = "stackstudio:service";

export const signalService = (detail: ServiceSignal) => window.dispatchEvent(new CustomEvent(EVENT, { detail }));

export const onServiceSignal = (fn: (s: ServiceSignal) => void) => {
  const handler = (e: Event) => fn((e as CustomEvent<ServiceSignal>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};
