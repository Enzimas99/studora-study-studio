import { useSyncExternalStore } from "react";

export type ThemePref = "light" | "dark" | "system";
const KEY = "studora:theme";

/** Runs before paint (inlined in <head>) to avoid a flash of the wrong theme. */
export const themeBootScript = `(function(){try{var t=localStorage.getItem('${KEY}')||'light';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

const listeners = new Set<() => void>();

function read(): ThemePref {
  if (typeof window === "undefined") return "light";
  return (window.localStorage.getItem(KEY) as ThemePref | null) ?? "light";
}

function isDark(pref: ThemePref) {
  return (
    pref === "dark" ||
    (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

export function setTheme(pref: ThemePref) {
  window.localStorage.setItem(KEY, pref);
  document.documentElement.classList.toggle("dark", isDark(pref));
  listeners.forEach((l) => l());
}

export function useTheme() {
  const pref = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => "light" as ThemePref,
  );
  const resolved: "light" | "dark" =
    typeof window !== "undefined" && isDark(pref) ? "dark" : "light";
  return { pref, setTheme, resolved };
}
