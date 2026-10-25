export const THEME_STORAGE_KEY = "fomi-theme";

// Runs before first paint so a saved dark theme never flashes light.
const script = `(function () {
  var theme = "light";
  try {
    var saved = localStorage.getItem("${THEME_STORAGE_KEY}");
    if (saved === "dark" || saved === "light") theme = saved;
  } catch (e) {}
  document.documentElement.dataset.theme = theme;
})();`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
