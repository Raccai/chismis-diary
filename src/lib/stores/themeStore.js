import { writable } from 'svelte/store';
import { browser } from '$app/environment'; // To check if running in browser environment

// --- Determine the initial theme ---
let initialValue = 'light'; // Default theme

if (browser) { // This code only runs in the browser
  // 1. Check localStorage for a saved theme preference
  const storedTheme = localStorage.getItem('theme');

  if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
    initialValue = storedTheme;
    console.log('ThemeStore: Loaded theme from localStorage:', initialValue);
  } else {
    // 2. If no stored theme, check system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      initialValue = 'dark';
      console.log('ThemeStore: Using system preference for dark theme.');
    } else {
      console.log('ThemeStore: Using default light theme (no preference found).');
    }
  }
} else {
  // For SSR or environments without `browser`, default to 'light'
  // This value won't persist to the client directly for the first paint without the app.html script
  console.log('ThemeStore: Initializing outside browser, defaulting to light.');
}

// --- Create the writable store ---
export const theme = writable(initialValue);

// --- Subscribe to theme changes to update body class and localStorage (only in browser) ---
if (browser) {
  theme.subscribe(currentTheme => {
    console.log(`ThemeStore: Theme is now '${currentTheme}'. Updating body class and localStorage.`);

    // Remove any existing theme classes to prevent conflicts
    document.body.classList.remove('light', 'dark');

    // Add the current theme class to the body
    document.body.classList.add(currentTheme);

    // Save the current theme to localStorage
    try {
      localStorage.setItem('theme', currentTheme);
    } catch (e) {
      console.error('ThemeStore: Failed to save theme to localStorage.', e);
    }
  });
}

// --- Helper function to toggle the theme ---
export function toggleTheme() {
  theme.update(currentTheme => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    console.log(`ThemeStore: Toggling theme from '${currentTheme}' to '${newTheme}'.`);
    return newTheme;
  });
}

// --- Function to set a specific theme ---
export function setTheme(newTheme) {
  if (newTheme === 'light' || newTheme === 'dark') {
    theme.set(newTheme);
    console.log(`ThemeStore: Setting theme explicitly to '${newTheme}'.`);
  } else {
    console.warn(`ThemeStore: Invalid theme value '${newTheme}' passed to setTheme.`);
  }
}