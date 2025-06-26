<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import SideMenu from '$lib/components/SideMenu.svelte';
  import EntryForm from '$lib/components/Entries/EntryForm.svelte';
  import LoadingIndicator from '$lib/components/LoadingIndicator.svelte';
  import Navbar from '$lib/components/Navbar.svelte'; 
  import ToastContainer from '$lib/components/Notifications/ToastContainer.svelte';
  import Modal from '$lib/components/Notifications/Modal.svelte';
  import SortModal from '$lib/components/Entries/SortModal.svelte';
  import MusicPlayerModal from '$lib/components/MusicPlayerModal.svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  import Onboarding from '$lib/components/Onboarding/Onboarding.svelte';
  
  import { filterSortStore } from '$lib/stores/filterSortStore';
  import { uiStore } from '$lib/stores/uiStore.js';
  import { navigating, page } from '$app/stores';
  import { onDestroy } from 'svelte'; 
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { userProgress } from '$lib/stores/userProgressStore.js';
  import { get } from 'svelte/store';
  import { browser } from '$app/environment';
  import { entriesStore } from '$lib/stores/entriesStore.js'
  import { theme, toggleTheme } from '$lib/stores/themeStore.js';
  import { authStore } from '$lib/stores/authStore.js';
  import LockScreen from '$lib/components/LockScreen.svelte'; 
  import "../app.css";
  
  import { StatusBar, Style } from '@capacitor/status-bar';
  import { Capacitor } from '@capacitor/core';
  import { NavigationBar } from '@capgo/capacitor-navigation-bar';
  import { App } from '@capacitor/app';
  
  $: isDark = $theme === 'dark';
  let initialProgressProcessed = false;
  let isAppLoading = true;
  
  onMount(async() => {
    // --- AUTH INITIALIZATION ---
    async function performInitialAuthCheck() {
      // 1. Initialize the store AND WAIT for it to finish loading.
      await authStore.initialize();
      // 2. NOW it's safe to get the fully loaded settings.
      const settings = get(authStore);
      // 3. If biometrics are enabled, try them first.
      if (settings.isBiometricsEnabled && settings.isLocked) {
        // We need to import promptBiometricAuth here if it's not already
        const { promptBiometricAuth } = await import('$lib/services/authService.js');
        const authenticated = await promptBiometricAuth();
        if (authenticated) {
          authStore.unlockApp();
        }
      }
    }
    performInitialAuthCheck();
    authStore.initialize();
    // Listener to re-lock the app when it becomes active again
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        authStore.lockApp();
      }
    });
    
    if ($page.url.pathname === '/') {
      goto('/entry', { replaceState: true });
    }

    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        console.log('[Layout] StatusBar overlay explicitly set to false.');
      } catch (e) {
        console.error("Error configuring StatusBar in Layout onMount:", e);
      }
    }

    setTimeout(() => {
      isAppLoading = false;
    }, 1000);

    // Process existing entries for achievements (deferred and run once)
    if (browser && !initialProgressProcessed) {
      setTimeout(() => {
        const allCurrentEntries = get(entriesStore);
        if (allCurrentEntries && allCurrentEntries.length > 0) {
          console.log("[Layout] Processing existing entries for achievements in background...");
          userProgress.processExistingEntries(allCurrentEntries);
          initialProgressProcessed = true;
          // localStorage.setItem('achievements_processed_v1', 'true'); 
        } else {
          console.log("[Layout] No existing entries to process for achievements.");
          initialProgressProcessed = true; // Still mark as "attempted"
        }
      }, 1000); // Increased delay slightly
    }

    return () => {
      // Cleanup global listener if it was added by this instance
      if (browser) {
        window.removeEventListener('keydown', handleGlobalKeydown);
        globalKeydownListenerAdded = false; // Reset flag if layout could remount
      }
    };
  });

  $: {
    if (browser && Capacitor.isNativePlatform()) {
      // Use an async IIFE to call the async StatusBar API
      (async () => {
        try {
          if (isDark) {
            await StatusBar.setBackgroundColor({ color: '#11100f' });
            await NavigationBar.setNavigationBarColor({ color: '#11100f' });
            console.log('[Layout] StatusBar style changed to Dark.');
          } else {
            await StatusBar.setBackgroundColor({ color: '#1d1c19' });
            await NavigationBar.setNavigationBarColor({ color: '#1d1c19' });
            console.log('[Layout] StatusBar style changed to Light.');
          }
        } catch (e) {
          console.error("Error updating StatusBar style:", e);
        }
      })();
    }
  }

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
  <LoadingScreen visible={isAppLoading} />

  {#if $authStore.isLocked}
    <LockScreen />
  {/if}

  <Onboarding visible={$uiStore.isOnboardingVisible} />

  <Topbar />

  {#if $uiStore.isSortModalVisible}
    <SortModal
      show={$uiStore.isSortModalVisible}
      currentSortKey={$filterSortStore.currentSortKey}
      on:sortChange={(event) => {
        filterSortStore.setSortKey(event.detail); // Updates the store
        uiStore.closeSortModal();
      }}
      on:close={() => uiStore.closeSortModal()}
    />
  {/if}

  
  <main class="content-area">
    <slot /> <!-- Standard slot for Svelte 4 / non-Runes Svelte 5 -->
    <Modal />
    <MusicPlayerModal />
    <ToastContainer />
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