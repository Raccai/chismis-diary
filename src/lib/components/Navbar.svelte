<script>
  import { uiStore } from '$lib/stores/uiStore.js';
  import { page } from '$app/stores';
  import { quintOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import Button from '../components/Button.svelte';

  const navItems = [
    { href: '/entry', text: 'Entries', icon: '📓', matchPaths: ['/entry', '/'] },
    { type: 'add_button', text: 'Add', icon: '＋' },
    { type: 'menu_button', text: 'Menu', icon: '☰' }
  ];

  export const currentPath = '';

  function isActive(item) {
    if (!item.href) return false;
    if (item.matchPaths) {
      if (item.matchPaths.includes('/') && $page.url.pathname === '/') return true;
      return item.matchPaths.some(path => path !== '/' && ($page.url.pathname === path || $page.url.pathname.startsWith(path + '/')));
    }
    return $page.url.pathname === item.href;
  }

  const addButtonScale = tweened(1, { duration: 150, easing: quintOut });
  function animateAddButtonPop() {
    addButtonScale.set(0.9).then(() => {
      addButtonScale.set(1);
    });
  }

  let showAddSparkles = false;
  function triggerAddSparkles() {
    showAddSparkles = true;
    setTimeout(() => {
      showAddSparkles = false;
    }, 800);
  }

  function handleNavClick(item) {
    if (item.type === 'add_button') {
      uiStore.showEntryForm();
      animateAddButtonPop();
      triggerAddSparkles();
    } else if (item.type === 'menu_button') {
      if (uiStore && typeof uiStore.toggleSideMenu === 'function') {
        uiStore.toggleSideMenu();
      } else {
        console.error("uiStore.toggleSideMenu is not a function.");
      }
    }
  }
</script>

<nav class="bottom-nav-bwp">
  {#each navItems as item (item.text)}
    {#if item.type === 'add_button'}
      <Button 
        type="primary"
        text="+"
        onClick={() => handleNavClick(item)}
      />
    {:else if item.type === 'menu_button'}
      <button
        class="nav-item-bwp menu-button-bwp"
        on:click={() => handleNavClick(item)}
        aria-label={item.text}
      >
        <span class="icon">{item.icon}</span>
        <span class="text">{item.text}</span>
      </button>
    {:else}
      <a
        href={item.href}
        class="nav-item-bwp"
        class:active={isActive(item)}
        aria-label={item.text}
        on:click={() => handleNavClick(item)}
      >
        <span class="icon">{item.icon}</span>
        <span class="text">{item.text}</span>
      </a>
    {/if}
  {/each}
</nav>

<style>
  /* Base Bottom Nav Styling (using BWP theme variables) */
  .bottom-nav-bwp {
    background-color: var(--navbar-bg, #f7f8fa);
    border-top: 1px solid var(--separator-primary, #e0e0e0);
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--navbar-height, 65px);
    display: flex;
    align-items: center; /* For vertical centering of add button */
    padding: 0 0.25rem;
    box-sizing: border-box;
    z-index: 990;
  }

  .nav-item-bwp {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: var(--menu-inactive, var(--separator-primary));
    flex-grow: 1;
    flex-basis: 0;
    height: 100%;
    padding: 0.1rem 0;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s ease, opacity 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    position: relative;
  }

  .nav-item-bwp:not(.add-button-magical-pink):hover {
    opacity: 0.7;
  }

  .nav-item-bwp.active .icon,
  .nav-item-bwp.active .text {
    color: var(--menu-active, var(--menu-active));
  }
  .nav-item-bwp.active .text {
    font-weight: 500;
  }

  .nav-item-bwp .icon {
    font-size: 1.7rem;
    margin-bottom: 1px;
    line-height: 1;
  }

  .nav-item-bwp .text {
    font-size: 0.6rem;
    line-height: 1;
    color: var(--menu-inactive);
  }

  @keyframes sparkle-animation-pink {
    0% { transform: scale(0) translateY(5px) rotate(0deg); opacity: 0.5; }
    30% { opacity: 1; }
    50% { transform: scale(1.8) translateY(-8px) rotate(180deg); opacity: 0.8; }
    100% { transform: scale(0) translateY(-18px) rotate(360deg); opacity: 0; }
  }
</style>