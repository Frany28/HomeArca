const STORAGE_KEY = "arca-theme";

try {
  const storedTheme = localStorage.getItem(STORAGE_KEY);
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  const theme =
    storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : systemPrefersDark
        ? "dark"
        : "light";

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
} catch {
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "light";
}
