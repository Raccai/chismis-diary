<script>
  import TakeNoteTopbar from '$lib/icons/TakeNoteTopbar.svelte';
  import ThemeToggle from '../../lib/components/Settings/ThemeToggle.svelte';
  import { theme } from '$lib/stores/themeStore.js';
</script>

<header class="top-bar-bwp">
  <div class="logo-container-bwp">
    <div class="logo">
      <TakeNoteTopbar />
    </div>
    <span>
      CD
    </span>
  </div>

  <div class="top-bar-actions-bwp">
    <!-- <button class="pro-button-bwp">✨ PRO</button> -->
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
    font-size: 3rem;
    letter-spacing: 0.16rem;
  }

  .logo-container-bwp .logo {
    transform: scale(0.9);
  }

  .top-bar-actions-bwp {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  /* .pro-button-bwp {
    background-color: var(--icon-bg);
    color: var(--icon-text); 
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.4rem 0.8rem;
    border-radius: 16px; 
    display: flex;
    align-items: center;
    gap: 0.3rem;
    transition: all 150ms ease-in-out;
  }
  .pro-button-bwp:hover {
    background-color: var(--icon-bg-hovered);
  } */
</style>