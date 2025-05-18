<script>
</script>

<header class="top-bar-bwp">
  <div class="logo-container-bwp">
    <a href="/" class="logo-link-bwp">ChismisDiary</a>
    <!-- Or your actual app name: Note AI -->
  </div>
  <div class="top-bar-actions-bwp">
    <!-- Example: Pro Button like in reference -->
    <button class="pro-button-bwp">✨ PRO</button>
    <button class="profile-button-bwp" aria-label="Profile">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2.5a5.5 5.5 0 0 1 5.5 5.5c0 1.823-1.209 3.53-3.013 4.497L12 18.5l-2.487-5.003C7.71 11.53 6.5 9.823 6.5 8A5.5 5.5 0 0 1 12 2.5ZM12 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/></svg>
    </button>
    <!-- <ThemeToggle /> If you're keeping the light/dark toggle for this new B/W/Pink style -->
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
    border-bottom: 1px solid var(--separator-primary);
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

  .profile-button-bwp {
    background-color: var(--bw-bg-tertiary);
    color: var(--bw-text-secondary);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .profile-button-bwp:hover {
    background-color: #ddd;
  }
</style>