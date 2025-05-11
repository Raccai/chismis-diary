<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Topbar from '$lib/components/Topbar.svelte';
  import EntryForm from '$lib/components/Entries/EntryForm.svelte';
  import { uiStore } from '$lib/stores/uiStore.js';
  import { page } from '$app/stores';
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

	let { children } = $props();

  function handleFormSaveOrClose() {
    uiStore.hideEntryForm();
  }
</script>

<div class="app-container">
  <Topbar />

  <main class="content-area">
    {#key $page.url.pathname}
      <div
        in:fly={{ y: 30, duration: 300, delay: 300, easing: quintOut }}
        out:fly={{ y: 30, duration: 300, easing: quintOut }}
        class="page-wrapper"
      >
        {@render children()}
      </div>
    {/key}
  </main>

	<Navbar currentPath={$page.url.pathname} />
  
  {#if $uiStore.isFormVisible}
    <!-- svelte-ignore event_directive_deprecated -->
    <div
      class="form-overlay"
      role="button"
      tabindex="0"
      on:click={handleFormSaveOrClose}
      on:keydown={(e) => {
        if (e.key === 'Escape') {
          handleFormSaveOrClose();
        } else if (e.target === e.currentTarget) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFormSaveOrClose();
          }
        }
      }}
      in:fade={{ duration: 350, y: 0, easing: quintOut }}
      out:fade={{ duration: 700, y: 0, easing: quintOut }}
    >
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="form-slide"
        on:click|stopPropagation
        on:keydown|stopPropagation
        in:fly={{ x: '100%', duration: 350, easing: quintOut, delay:50 }}
        out:fly={{ x: '100%', duration: 700, easing: quintOut }}
      >
        <EntryForm selectedEntry={$uiStore.entryToEdit} on:save={handleFormSaveOrClose} />
      </div>
    </div>
  {/if}

</div>

<style>
  :global(body) { 
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f4f7f6; 
    color: #333;
    line-height: 1.6;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh; 
  } 

  .content-area {
    flex-grow: 1;
    max-width: 960px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    padding-bottom: calc(60px + 1rem);
    position: relative; 
    overflow-x: hidden; 
  }

  .page-wrapper {
    padding: 1.5rem; 
  }

  .form-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1050;
  }

  .form-slide {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: 100%;
    background: white;
    z-index: 1060;
    box-shadow: -4px 0 10px rgba(0,0,0,0.2);
    box-sizing: border-box;
    overflow-y: hidden; 
  }
</style>