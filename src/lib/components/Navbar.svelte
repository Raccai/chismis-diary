<script>
  import { uiStore } from '$lib/stores/uiStore.js';
  import { page } from '$app/stores'; 

  const navItems = [
    // Assuming your main entries list is at '/' or '/entry'
    { href: '/entry', text: 'Entries', icon: '📝', matchPaths: ['/entry'] },
    { type: 'add_button', text: 'Add', icon: '+' },
    // Replace 'Data' link with a menu button
    { type: 'menu_button', text: 'Menu', icon: '☰' } // Hamburger icon for menu
  ];

  function isActive(item) {
    if (item.href && item.matchPaths) {
      // Check if any of the matchPaths is a prefix of the current path
      return item.matchPaths.some(path => $page.url.pathname === path || ($page.url.pathname.startsWith(path) && path !== '/'));
    } else if (item.href) {
      return $page.url.pathname === item.href;
    }
    return false;
  }

  function handleAddItem() {
    uiStore.showEntryForm();
  }

  function openSideMenu() { 
    uiStore.toggleSideMenu();
  }
</script>

<nav class="bottom-tab-bar">
  {#each navItems as item (item.text)}
    {#if item.type === 'add_button'}
      <button class="tab-item add-button" on:click={handleAddItem} aria-label="Add New Entry">
        <span class="icon add-icon">{item.icon}</span>
      </button>
    {:else if item.type === 'menu_button'}
      <button class="tab-item menu-button" on:click={openSideMenu} aria-label="Open Menu">
        <span class="icon">{item.icon}</span>
        <span class="text">{item.text}</span>
      </button>
    {:else}
      <a
        href={item.href}
        class="tab-item"
        class:active={isActive(item)}
        aria-label={item.text}
      >
        <span class="icon">{item.icon}</span>
        <span class="text">{item.text}</span>
      </a>
    {/if}
  {/each}
</nav>

<style>
  .bottom-tab-bar {
    background-color: #ffffff;
    border-top: 1px solid #e0e0e0;
    box-shadow: 0 -2px 5px rgba(0,0,0,0.05);
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px; /* Standard mobile tab bar height */
    display: flex;
    justify-content: space-around;
    align-items: stretch; /* Make items fill height */
    padding: 0 0.25rem; /* Slight horizontal padding */
    box-sizing: border-box;
    z-index: 990;
  }

  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: #757575; /* Default icon/text color */
    flex-grow: 1;
    height: 100%;
    padding: 0.2rem 0;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: color 0.2s ease;
    -webkit-tap-highlight-color: transparent; /* Remove tap highlight on mobile */
  }

  .tab-item:hover:not(.add-button) { /* Don't change color of add button on hover like this */
    color: #38bdf8;
  }

  .tab-item.active {
    color: #38bdf8; /* Active color */
  }
  /* The active class might not apply to the menu button in the same way
     as a navigation link. The menu button is an action, not a destination.
     You might choose to style it differently or not have an 'active' state.
  */

  .icon {
    font-size: 1.4rem; /* Slightly smaller icons */
    margin-bottom: 2px;
    line-height: 1;
  }

  .text {
    font-size: 0.65rem; /* Smaller text label */
    line-height: 1;
  }

  /* Add button styling */
  .add-button {
    background-color: #38bdf8;
    color: white;
    border-radius: 50%;
    width: 48px;   /* Slightly smaller */
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 0; /* Don't grow, keep its size */
    padding: 0;
    margin: 0 0.5rem; /* Add some margin around it */
    /* Optional: elevate it slightly */
    position: relative;
    /* top: -10px; */ /* If you want it to stick out a bit */
    box-shadow: 0 2px 6px rgba(0,100,200,0.3);
  }
  .add-button .icon {
    font-size: 1.6rem;
    font-weight:normal;
    margin-bottom: 0;
  }
  .add-button:hover {
    background-color: #0ea5e9;
    color: white;
  }
</style>