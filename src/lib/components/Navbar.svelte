<script>
  import { uiStore } from '$lib/stores/uiStore.js';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import Button from '../components/Button.svelte';

  import DataInactive from '$lib/icons/Data-Inactive.svelte';
  import DataActive from '$lib/icons/Data-Active.svelte';
  import NotesInactive from '$lib/icons/Notes-Inactive.svelte';
  import NotesActive from '$lib/icons/Notes-Active.svelte';
  import RewardsInactive from '$lib/icons/Rewards-Inactive.svelte';
  import RewardsActive from '$lib/icons/Rewards-Active.svelte';
  import SettingsInactive from '$lib/icons/Settings-Inactive.svelte';
  import SettingsActive from '$lib/icons/Settings-Active.svelte';

  const navItems = [
    { href: '/entry', text: 'Entries', iconInactive: NotesInactive, iconActive: NotesActive, matchPaths: ['/entry', '/'] },
    { href: '/data', text: 'Data', iconInactive: DataInactive, iconActive: DataActive, matchPaths: ['/data'] },
    { type: 'add_button', text: 'Add'}, // Or a specific "add" icon component
    { href: '/achievements', text: 'Crew', iconInactive: RewardsInactive, iconActive: RewardsActive, matchPaths: ['/achievements'] },
    { href: '/settings', text: 'Settings', iconInactive: SettingsInactive, iconActive: SettingsActive, matchPaths: ['/settings'] },
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

<nav class="bottom-nav">
  <div class="main-nav">

    {#each navItems as item (item.text)}
      {#if item.type === 'add_button'}
        <Button
          type="TakeNote"
          addBtn={true}
          ariaLabel="Add New Entry"
          onClick={() => handleNavClick(item)}
          class="nav-add-button-override"
          showSparkles={showAddSparkles}
          scale={$addButtonScale}
        />
      {:else} <!-- Handles regular nav links -->
        {@const active = isActive(item)}
        {@const iconToRender = active ? item.iconActive : item.iconInactive}
        <a
          href={item.href}
          class="nav-item"
          class:active={active}
          aria-label={item.text}
          on:click={() => handleNavClick(item)}
        >
          <div class="icon-container-animated">
            {#key iconToRender}
              <div class="icon-wrapper"
                  in:fade="{{ duration: 150, delay: active ? 100 : 0 }}"
                  out:fade="{{ duration: 100 }}">
                <svelte:component this={iconToRender} />
              </div>
            {/key}
          </div>
          <div class="nav-label">{item.text}</div>
        </a>
      {/if}
    {/each}
  </div>
</nav>


<style>
  .bottom-nav{
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    align-items: center; /* For vertical centering of add button */
    padding: 0.5rem 0.5rem;
    box-sizing: border-box;
    z-index: 990;
    border-radius: 20px 20px 0 0;
  }

  .main-nav {
    position: relative;
    background-color: var(--navbar-bg);
    height: var(--navbar-height);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    border-radius: 24px;
    box-shadow: 0 2px 12px 4px rgba(17, 16, 15, 0.6);
  }

  .main-nav::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('/images/graffitiWall.png') no-repeat center/cover;
    opacity: 0.03;         
    pointer-events: none;  
    z-index: 0;            
  }

  .nav-item{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    flex-grow: 1;
    flex-basis: 0;
    height: 100%;
    padding: 0.2rem 0.1rem;
    background: none;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s ease; /* For hover on non-active items */
    -webkit-tap-highlight-color: transparent;
    position: relative;
  }

  .nav-label {
    font-size: 0.65rem;
    line-height: 1;
    margin-top: 0.4rem;
    text-align: center;
    color: var(--navbar-icon-label, #fff);
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
  }

  .nav-item.active .nav-label {
    font-weight: bold;
    color: var(--navbar-icon-label-active, #fff);
  }

  .nav-item:not(.active) .nav-label {
    opacity: 0.7;
  }

  .nav-item:not(.active):not(.nav-add-button-override):hover { /* Exclude add button from this hover */
    opacity: 0.7;
  }

  /* Icon container for sizing and transition origin */
  .icon-container-animated {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2px;
    position: relative; /* Essential for the #key block's children */
    /* Remove direct color transition here, as the SVGs handle their own appearance */
    /* transition: color 0.2s ease; */
  }

  .icon-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute; /* Ensures smooth overlay during transition */
    top: 0;
    left: 0;
    transform: scale(1.1);
  }
</style>