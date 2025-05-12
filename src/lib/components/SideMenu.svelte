<script>
  import { uiStore } from '$lib/stores/uiStore.js';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  const menuLinks = [
    { href: '/data', text: 'Data & Stats', icon: '📊' },
    { href: '/achievements', text: 'Achievements', icon: '🏆' },
    { href: '/settings', text: 'Settings', icon: '⚙️' }
  ];

  export let isOpen = false;

  function handleMenuLinkClick() {
    uiStore.closeSideMenu();
    // SvelteKit navigation will proceed naturally
  }

  function handleOverlayClick(event) {
    // Only close if the click was directly on the overlay,
    // not on its children (like side-menu-content).
    if (event.target === event.currentTarget) {
      uiStore.closeSideMenu();
    }
  }

  function handleFooterCloseButtonClick() {
    uiStore.closeSideMenu();
  }
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
{#if isOpen}
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div
    class="side-menu-overlay"
    on:click={handleOverlayClick} 
    transition:fade={{ duration: 200 }}
    role="dialog" aria-modal="true" aria-labelledby="sidemenu-title"
    >

    <div
      class="side-menu-content"
      transition:fly={{ x: 300, duration: 300, easing: quintOut }}
      role="document"
      >

      <div class="menu-header">
        <h2 id="sidemenu-title" class="menu-title">Menu</h2>
      </div>
      <nav class="menu-navigation">
        <ul>
          {#each menuLinks as link (link.href)}
            <li>
              <a href={link.href} on:click={handleMenuLinkClick}>
                <span class="menu-icon">{link.icon}</span>
                <span class="menu-text">{link.text}</span>
              </a>
            </li>
          {/each}
        </ul>
      </nav>
      <div class="menu-footer">
        <button class="footer-close-button" on:click={handleFooterCloseButtonClick}>Close Menu</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .side-menu-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1900;
    display: flex;
    /* Align content to the left for slide-in from left */
    justify-content: flex-end;
    /* Or flex-end for slide-in from right, matching fly transition x value */
    /* justify-content: flex-end; */
  }

  .side-menu-content {
    background-color: #1f2937;
    color: #e2e8f0;
    width: 90%;
    max-width: 320px;
    height: 100%;
    box-shadow: 0px 0 15px rgba(0,0,0,0.25); /* Adjusted shadow for slide from left */
    /* If sliding from right: box-shadow: -4px 0 15px rgba(0,0,0,0.25); */
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    box-sizing: border-box;
  }

  .menu-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #374151; /* Darker gray separator */
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .menu-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: #cbd5e1;
    margin: 0;
  }
  .menu-navigation {
    flex-grow: 1; /* Takes up available space */
    overflow-y: auto; /* Scroll if many links */
  }

  .menu-navigation ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .menu-navigation li a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem 0.5rem; /* More vertical, less horizontal padding */
    color: #d1d5db; /* Lighter gray (gray-300) */
    text-decoration: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s, color 0.2s;
  }
  .menu-navigation li a:hover {
    background-color: #374151; /* Darker gray on hover */
    color: #ffffff;
  }
  .menu-icon {
    font-size: 1.2em;
    width: 24px; /* Align icons */
    text-align: center;
  }

  .menu-footer {
    margin-top: auto; /* Pushes footer to the bottom */
    padding-top: 1.5rem;
    border-top: 1px solid #374151; /* Separator */
    display: flex; /* For button centering/styling */
    justify-content: center;
  }

  .footer-close-button {
    background-color: #374151; /* Darker gray button */
    color: #e2e8f0;
    border: 1px solid #4b5563;
    padding: 0.6rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    width: 100%; /* Make button wider */
    max-width: 200px;
  }
  .footer-close-button:hover {
    background-color: #4b5563; /* Lighter gray on hover */
  }
</style>