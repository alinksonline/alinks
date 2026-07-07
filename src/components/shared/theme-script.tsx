import { THEME_STORAGE_KEY } from "@/core/theme/theme";

/** Runs before paint to avoid light/dark flash on load. */
export function ThemeScript() {
  const script = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var m=localStorage.getItem(k);var d=m==="dark"||(!m||m==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark");}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}