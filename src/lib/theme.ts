import { useEffect, useState } from "react";

export type ThemePref = "light" | "dark" | "system";
const KEY = "studora:theme";

/** Runs before paint (inlined in <head>) to avoid a flash of the wrong theme. */
export const themeBootScript = `(function(){try{var t=localStorage.getItem('${KEY}')||'light';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

function apply(pref: ThemePref) {
  const dark =
    pref === "dark" ||
    (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(
    () => (window.localStorage.getItem(KEY) as ThemePref | null) ?? "light",
  );
  useEffect(() => {
    apply(pref);
    window.localStorage.setItem(KEY, pref);
  }, [pref]);
  const resolved: "light" | "dark" =
    pref === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : pref;
  return { pref, setPref, resolved };
}
