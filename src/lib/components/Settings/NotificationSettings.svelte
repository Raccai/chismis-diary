<script>
  import { settingsStore } from '$lib/stores/settingsStore.js';
  import { toasts } from '$lib/stores/toastStore.js';
  import { onMount } from 'svelte';
  import { Capacitor } from '@capacitor/core';

  let isMobile = Capacitor.isNativePlatform();
  let isWeb = !isMobile;
  let permissionsGranted = false;
  
  let LocalNotifications = null;

  onMount(async () => {
    if (isMobile) {
      try {
        const lnModule = await import('@capacitor/local-notifications');
        LocalNotifications = lnModule.LocalNotifications;
        
        const result = await LocalNotifications.checkPermissions();
        permissionsGranted = result.display === 'granted';
      } catch(e) {
        console.error("Failed to load Local Notifications plugin", e);
      }
    }
  });

  $: if ($settingsStore.notifications.enabled && isMobile && LocalNotifications) {
    scheduleDailyNotification($settingsStore.notifications.time);
  } else if (isMobile && LocalNotifications) {
    cancelAllNotifications();
  }

  // --- THIS IS THE CORRECTED FUNCTION ---
  async function handleToggleChange(event) {
    const isEnabled = event.target.checked;
    
    // This logic now runs ONLY when the toggle is switched ON
    if (isEnabled && isMobile) {
      // The safety check is moved here. It only runs when we need the plugin.
      if (!LocalNotifications) {
        toasts.error("Loading... please try again in a moment.");
        event.target.checked = false; // Prevent the visual state change
        return;
      }

      if (!permissionsGranted) {
        const result = await LocalNotifications.requestPermissions();
        permissionsGranted = result.display === 'granted';

        if (!permissionsGranted) {
          toasts.error("Kailangan ng permission para sa notipikasyon.");
          // IMPORTANT: Revert the checkbox visually if permission is denied
          event.target.checked = false;
          return; // Stop the function
        }
      }
    }
    
    // This part of the function is now ALWAYS reached, whether you
    // are toggling ON or OFF, solving the bug.
    settingsStore.update(currentSettings => {
      currentSettings.notifications.enabled = isEnabled;
      return currentSettings;
    });
  }
  
  async function scheduleDailyNotification(time) {
    if (!LocalNotifications || !permissionsGranted) return;

    try {
      await cancelAllNotifications();
      const [hour, minute] = time.split(':').map(Number);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 99,
            title: "May Chismis ka ba Ngayon?",
            body: "Huy, wag kalimutan i-log ang chismis of the day mo!",
            schedule: { on: { hour, minute }, repeats: true },
            // --- THIS IS THE CORRECTED ICON PATH ---
            smallIcon: 'res://mipmap/ic_notification',
            sound: 'default'
          }
        ]
      });
      
      toasts.success(`Okay! Paalalahanan ka namin araw-araw ng ${time}.`);

    } catch (error) {
      console.error("Error scheduling notification:", error);
      toasts.error("Oops, may error sa pag-set ng notipikasyon.");
    }
  }

  async function cancelAllNotifications() {
    // Added a safety guard here too for robustness
    if (!LocalNotifications) return;
    try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
            await LocalNotifications.cancel(pending);
        }
    } catch(error) {
        console.error("Error cancelling notifications:", error);
    }
  }
</script>

<div class="notification-settings">
  <div class="setting-item-toggle">
    <label for="notification-toggle" class="toggle-label">Araw-araw na Paalala</label>
    <label class="switch">
      <input 
        id="notification-toggle" 
        type="checkbox" 
        checked={$settingsStore.notifications.enabled}
        on:change={handleToggleChange}
        disabled={isWeb}
      />
      <span class="slider round"></span>
    </label>
  </div>

  {#if $settingsStore.notifications.enabled}
    <div class="time-picker-wrapper">
      <label for="notification-time" class="time-label">Oras ng Notipikasyon:</label>
      <input 
        type="time" 
        id="notification-time" 
        class="time-input"
        bind:value={$settingsStore.notifications.time}
        disabled={isWeb}
      >
    </div>
  {/if}

  {#if isWeb}
    <p class="web-notice">
      Available lang ang mga notipikasyon sa mobile app (Android/iOS).
    </p>
  {/if}
</div>


<style>
  .notification-settings {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    background-color: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--card-border);
  }
  .setting-item-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .toggle-label {
    font-family: "Urbanist", sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--card-title-text);
  }
  .time-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    padding-top: 15px;
    border-top: 1px solid var(--card-border);
  }
  .time-label {
    font-family: "Urbanist", sans-serif;
    font-size: 0.9rem;
    color: var(--card-title-text);
  }
  .time-input {
    background-color: var(--card-mini-bg);
    border: 1px solid var(--card-border);
    color: var(--card-title-text);
    padding: 8px;
    border-radius: 6px;
    font-family: "Urbanist", sans-serif;
    font-size: 1rem;
  }

  /* Basic Toggle Switch CSS */
  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 28px;
  }
  .switch input { 
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--card-bg);
    transition: .4s;
    border: 2px solid var(--card-title-text);
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 2px;
    background-color: var(--card-title-text);
    transition: .4s;
  }
  input:checked + .slider {
    background-color: var(--card-title-text);
  }
  input:checked + .slider:before {
    background-color: var(--card-bg); /* Swapped to show contrast */
    transform: translateX(22px);
  }
  .slider.round {
    border-radius: 34px;
  }
  .slider.round:before {
    border-radius: 50%;
  }

  /* --- NEW STYLES FOR DISABLED STATE --- */

  input[type="checkbox"]:disabled + .slider {
    background-color: var(--card-mini-bg);
    border-color: var(--card-border);
    cursor: not-allowed;
  }

  input[type="checkbox"]:disabled + .slider:before {
    background-color: var(--card-border);
  }

  .time-input:disabled {
    background-color: var(--card-mini-bg);
    color: var(--card-border);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .web-notice {
    font-family: "Urbanist", sans-serif;
    font-size: 0.8rem;
    font-style: italic;
    text-align: center;
    color: var(--card-title-text);
    margin-top: 10px;
    padding-top: 15px;
    border-top: 1px dashed var(--card-border);
  }
</style>