<script>
  import { uiStore } from '$lib/stores/uiStore.js';

  export let currentPath = '';

  const navItems = [
    { href: '/entry', text: 'Entries', icon: '📝', matchPaths: ['/', '/entry'] }, 
    { type: 'add_button', text: 'Add', icon: '+' }, 
    { href: '/data', text: 'Data', icon: '📊', matchPaths: ['/data'] }    
  ];

  function isActive(item) {
    if (item.href && item.matchPaths) {
      return item.matchPaths.some(path => currentPath.startsWith(path));
    } else if (item.href) {
      return currentPath === item.href;
    }
    return false;
  }

  function handleAddItem() {
    uiStore.showEntryForm();
  }
</script>

<nav class="bottom-tab-bar">
  {#each navItems as item (item.text)}
    {#if item.type === 'add_button'}
      <button class="tab-item add-button" on:click={handleAddItem} aria-label="Add New Entry">
        <span class="icon add-icon">{item.icon}</span>
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
    height: 70px; 

    display: flex;
    justify-content: space-around; 
    align-items: center;
    padding: 0 0.5rem;
    box-sizing: border-box;
    z-index: 990; 
  }

  .tab-item {
    display: flex;
    flex-direction: column; 
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: #757575; 
    flex-grow: 1; 
    height: 100%;
    padding: 0.25rem 0;
    border-radius: 8px; 
    transition: color 0.2s ease, background-color 0.2s ease;
    background: none; 
    border: none; 
    cursor: pointer;
    font-family: inherit; 
  }

  .tab-item:hover {
    color: #38bdf8; 
  }

  .tab-item.active {
    color: #38bdf8;
    font-weight: 600; 
  }

  .icon {
    font-size: 1.5rem; /* Adjust icon size */
    margin-bottom: 0.1rem; /* Space between icon and text */
    line-height: 1;
  }

  .text {
    font-size: 0.7rem; /* Small text label */
    line-height: 1;
  }

  .add-button {
    background-color: #38bdf8;
    color: white;
    border-radius: 50%; /* Circular button */
    width: 50px;   /* Fixed size */
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 0;
    padding: 0; 
  }
  .add-button .icon {
    font-size: 1.8rem; 
    margin-bottom: 0.3rem;
    font-weight: bold;
  }
  .add-button:hover {
    background-color: #0ea5e9;
    color: white; 
  }
</style>