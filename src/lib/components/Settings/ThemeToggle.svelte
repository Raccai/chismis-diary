<script>
  import { theme, toggleTheme } from '$lib/stores/themeStore.js';
  import { onMount } from 'svelte';

  let mounted = false;
  onMount(() => {
    mounted = true; // Ensure we only render based on theme after mount to avoid SSR/CSR mismatch
  });
</script>

{#if mounted}
  <div class="outline">
    <div class="main">
      <div class="toggle-cont">
        <div class="toggle-main"></div>
        <div class="toggle-top"></div>
      </div>
    </div>
  </div>
  <button on:click={toggleTheme} class="theme-toggle-button" aria-label="Toggle theme">
    {#if $theme === 'light'}
      <span>🌙</span> <!-- Moon for switching to dark -->
    {:else}
      <span>☀️</span> <!-- Sun for switching to light -->
    {/if}
  </button>
{/if}

<style>
  .theme-toggle-button {
    background: none;
    border: none;
    color: var(--text-secondary); /* Use themed text color */
    cursor: pointer;
    padding: 0.5rem;
    font-size: 1.5rem; /* Adjust size as needed */
    line-height: 1;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .theme-toggle-button:hover {
    background-color: var(--bg-interactive-hover); /* Themed hover */
    color: var(--text-primary);
  }
  .theme-toggle-button span {
    display: block;
    transition: transform 0.3s ease-out;
  }
  /* Optional: subtle rotation on toggle */
  /* .theme-toggle-button:active span {
    transform: rotate(180deg);
  } */
</style>