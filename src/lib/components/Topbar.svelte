<script>
  import TakeNoteTopbar from '$lib/icons/TakeNoteTopbar.svelte';
  import ThemeToggle from '../../lib/components/Settings/ThemeToggle.svelte';
  import { theme } from '$lib/stores/themeStore.js';
  import { uiStore } from '$lib/stores/uiStore';
  import SortIcon from '$lib/icons/SortIcon.svelte';
  import { page } from '$app/stores';

  function handleSortClick() {
    uiStore.toggleSortModal();
  }

  $: showSortButton = $page.url.pathname === '/entry' || $page.url.pathname === '/';
</script>

<header class="top-bar-bwp">
  <div class="logo-container-bwp">
    <a href="/entry" class="logo">
      <TakeNoteTopbar />
    </a>
    <span>
      CD
    </span>
  </div>

  <div class="top-bar-actions-bwp">
    {#if showSortButton}
      <button class="top-bar-action-button sort-button-topbar" on:click={handleSortClick} aria-label="Sort entries">
        <div class="sort-icon">
          <SortIcon />
        </div>
      </button>
    {/if}
    <ThemeToggle />
  </div>
</header>

<style>
  .top-bar-bwp {
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

  .logo-container-bwp {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo-container-bwp span {
    font-size: 2.4rem;
    letter-spacing: 0.16rem;
    margin-left: -0.2rem;
  }

  .logo-container-bwp .logo {
    transform: scale(0.8);
  }

  .top-bar-actions-bwp {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .sort-button-topbar {
    border: 2px solid var(--main-white);
    padding: 4px 6px;
    border-radius: 8px;
  }

  .sort-icon {
    transform: scale(0.8);
  }
</style>