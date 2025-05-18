<script>
  import ThemeToggle from '../../lib/components/Settings/ThemeToggle.svelte';
</script>

<header class="top-bar-bwp">
  <div class="logo-container-bwp">
    <a href="/" class="logo-link-bwp">ChismisDiary</a>
    <!-- Or your actual app name: Note AI -->
  </div>
  <div class="top-bar-actions-bwp">
    <button class="pro-button-bwp">✨ PRO</button>
    <ThemeToggle />
  </div>
</header>

<style>
  .top-bar-bwp {
    background-color: var(--topbar-bg);
    color: var(--text-primary);
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

  .logo-link-bwp {
    font-size: 1.5rem; /* Or larger like "Note AI" */
    font-weight: 700; /* Bolder */
    color: var(--text-primary);
    text-decoration: none;
  }

  .top-bar-actions-bwp {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .pro-button-bwp {
    background-color: var(--icon-bg); /* Black background */
    color: var(--icon-text); /* White text */
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.4rem 0.8rem;
    border-radius: 16px; /* Pill shape */
    display: flex;
    align-items: center;
    gap: 0.3rem;
    transition: all 150ms ease-in-out;
  }
  .pro-button-bwp:hover {
    background-color: var(--icon-bg-hovered);
  }
</style>