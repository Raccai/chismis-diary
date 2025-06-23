import { browser } from '$app/environment';
import { createPersistentStore } from './persistentStore.js';

// --- Step 1: Calculate the initial theme value, just like before ---
let initialValue = 'light';

if (browser) {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    initialValue = storedTheme;
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      initialValue = 'dark';
    }
  }
}

// --- Step 2: Create the store using our new utility ---
// It will now handle saving to localStorage automatically.
export const theme = createPersistentStore('theme', initialValue);

// --- Step 3: Subscribe ONLY to handle side-effects (updating the body class) ---
if (browser) {
  theme.subscribe(currentTheme => {
    // This part is the side-effect we still need
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(currentTheme);

    // We no longer need to manually save to localStorage here,
    // because createPersistentStore does it for us.
  });
}

// --- Helper functions remain the same ---
export function toggleTheme() {
  theme.update(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
}

export function setTheme(newTheme) {
  if (newTheme === 'light' || newTheme === 'dark') {
    theme.set(newTheme);
  }
}