<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import SideMenu from '$lib/components/SideMenu.svelte';
  import EntryForm from '$lib/components/Entries/EntryForm.svelte';
  import LoadingIndicator from '$lib/components/LoadingIndicator.svelte';
  import Navbar from '$lib/components/Navbar.svelte'; // Assuming this is your bottom tab bar
  import ToastContainer from '$lib/components/Notifications/ToastContainer.svelte';
  import Modal from '$lib/components/Notifications/Modal.svelte';
  import { uiStore } from '$lib/stores/uiStore.js';
  import { navigating, page } from '$app/stores';
  import { onDestroy } from 'svelte'; // Not strictly needed for this loader version anymore
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import "../app.css";
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    goto('/entry');
  });

  // --- Form and Global Key Logic ---
  function handleFormSaveOrClose() {
    uiStore.hideEntryForm();
  }

  function handleGlobalKeydown(event) {
    if (event.key === 'Escape') {
      if ($uiStore.isFormVisible) { // Use $ for store subscription
        uiStore.hideEntryForm();
      } else if ($uiStore.isSideMenuVisible) {
        uiStore.closeSideMenu();
      }
    }
  }

  // --- Loader Logic ---
  let isNavigationInProgress = false;
  let isCurrentlyNavigating = false; 

   $: {
    if ($navigating) {
      console.log('[Layout] NAVIGATING:',
        'FROM:', $navigating.from?.url.pathname, '->',
        'TO:', $navigating.to?.url.pathname,
        'Type:', $navigating.type
      );
    } else {
      // console.log('[Layout] NOT NAVIGATING ($navigating is null)');
    }
  }

  let previousNavigatingState = null;
  $: {
    const currentNavState = $navigating;

    if (currentNavState && !previousNavigatingState) {
      // Navigation has just started (went from null to an object)
      if (currentNavState.from && currentNavState.to && currentNavState.from.url.pathname !== currentNavState.to.url.pathname) {
        console.log('[Layout] Loader ON - Navigation Started (different path)');
        isCurrentlyNavigating = true;
      } else if (currentNavState.from && currentNavState.to) {
        // console.log('[Layout] Navigation started (same path or no from/to) - Loader OFF');
        // isCurrentlyNavigating = false; // Keep it off if it's not a path change we care about
      }
    } else if (!currentNavState && previousNavigatingState) {
      // Navigation has just ended (went from an object to null)
      console.log('[Layout] Loader OFF - Navigation Ended');
      isCurrentlyNavigating = false;
    }
    previousNavigatingState = currentNavState; // Store current state for next comparison
  }
</script>

<div class="app-container">
  <Topbar />

  <main class="content-area">
    <slot /> <!-- Standard slot for Svelte 4 / non-Runes Svelte 5 -->
    <ToastContainer />
    <Modal />
  </main>

  <!-- Pass the reactive pathname to Navbar -->
  <Navbar currentPath={$page.url.pathname} />

  {#if $uiStore.isFormVisible}
    <!-- Form Overlay and Slide -->
     <div
      class="form-overlay"
      role="button" tabindex="0"
      on:click={handleFormSaveOrClose}
      on:keydown={(e) => {
        if (e.key === 'Escape') { handleFormSaveOrClose(); }
        else if (e.target === e.currentTarget) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFormSaveOrClose(); }
        }
      }}
      in:fade={{ duration: 250 }} out:fade={{ duration: 200 }}
    >
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="form-slide"
        on:click|stopPropagation on:keydown|stopPropagation
        in:fly={{ x: '100%', duration: 300, easing: quintOut, delay: 50 }}
        out:fly={{ x: '100%', duration: 250, easing: quintOut }}
      >
        <EntryForm selectedEntry={$uiStore.entryToEdit} on:save={handleFormSaveOrClose} />
      </div>
    </div>
  {/if}
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .content-area {
    flex-grow: 1;
    width: 100%;
    box-sizing: border-box;
    position: relative; /* For potential absolute positioned elements within pages */
    overflow-x: hidden; /* Prevent horizontal scroll from page transitions */
  }

  /* Styles for form-overlay and form-slide remain the same */
  .form-overlay {
    position: fixed;
    inset: 0;
    background: var(--overlay-color); /* Slightly darker overlay */
    z-index: 1050;
  }

  .form-slide {
    position: fixed;
    top: 0; /* Will be covered by Topbar due to z-index, content pushed by padding */
    right: 0;
    height: 100%;
    width: 100%;
    max-width: 400px;
    background: #ffffff; /* Form background */
    z-index: 1060;
    box-shadow: -6px 0 16px var(--shadow-color); /* Softer shadow */
    box-sizing: border-box;
    overflow-y: hidden; /* Let internal wrapper scroll */
    display: flex; /* To use flex-direction */
    flex-direction: column; /* So content wrapper can have padding-top */
  }

  .form-slide {
    /* The EntryForm component should then have its own internal padding for its content */
    overflow-y: auto; /* Make the form-slide itself scrollable if content exceeds height */
  }
</style>