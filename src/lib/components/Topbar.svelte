<script>
  import TakeNoteTopbar from '$lib/icons/TakeNoteTopbar.svelte';
  import ThemeToggle from '../../lib/components/Settings/ThemeToggle.svelte';
  import { musicPlayer } from '$lib/stores/musicPlayerStore.js';
  import { theme } from '$lib/stores/themeStore.js';
  import { uiStore } from '$lib/stores/uiStore';
  import SortIcon from '$lib/icons/SortIcon.svelte';
  import { page } from '$app/stores';
  import MusicIcon from '$lib/icons/MusicIcon.svelte';

  function handleSortClick() {
    uiStore.toggleSortModal();
  }

  function handleMusicClick() { 
    musicPlayer.togglePlayerModal(); 
  } 

  $: showSortButton = $page.url.pathname === '/entry' || $page.url.pathname === '/';
</script>

<header class="top-bar">
  <div class="logo-container">
    <a href="/entry" class="logo">
      <TakeNoteTopbar />
    </a>
    <span>
      CD
    </span>
  </div>

  <div class="top-bar-actions">
    {#if showSortButton}
      <button class="top-bar-action-button sort-button-topbar" on:click={handleSortClick} aria-label="Sort entries">
        <div class="sort-icon">
          <SortIcon />
        </div>
      </button>
    {/if}

    <button class="top-bar-action-button music-button-topbar" on:click={handleMusicClick} aria-label="Open music player">
      <div class="music-icon">
        <MusicIcon />
      </div>
    </button>

    <ThemeToggle />
  </div>
</header>

<style>
  .top-bar {
    background-color: var(--topbar-bg);
    color: var(--topbar-text);
    height: 60px; /* Consistent height */
    padding: 0 1rem; /* Consistent padding */
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  .logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo-container span {
    font-size: 2.4rem;
    letter-spacing: 0.16rem;
    margin-left: -0.2rem;
  }

  .logo-container .logo {
    transform: scale(0.8);
  }

  .top-bar-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }

  .sort-button-topbar {
    border: 2px solid var(--main-white);
    padding: 4px 6px;
    border-radius: 8px;
  }

  .sort-icon {
    transform: scale(0.8);
  }

  .music-button-topbar {
    color: var(--main-white); 
  }

  .music-button-topbar :global(svg) { 
    border: 3px solid var(--main-white);
    padding: 6px 8px;
    border-radius: 12px;
  }

  .music-icon {
    transform: scale(0.72);
  }
</style>