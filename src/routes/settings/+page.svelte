<script>
  import ThemeToggle from '../../lib/components/Settings/ThemeToggle.svelte';
</script>

<header class="settings-cont">
  <ThemeToggle />
</header>

<style>
  .settings-cont {
    background-color: var(--topbar-bg);
    color: var(--topbar-text);
    padding: 0.8rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>