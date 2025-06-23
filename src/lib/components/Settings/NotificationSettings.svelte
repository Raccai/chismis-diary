<script>
  import { settingsStore } from '$lib/stores/settingsStore.js';
  import { LocalNotifications } from '@capacitor/local-notifications';
  import { Capacitor } from '@capacitor/core';
  import { toasts } from '$lib/stores/toastStore.js';
  import { onMount } from 'svelte';

  // --- Local Reactive State reflecting the store ---
  let currentSettings = $settingsStore; // Subscribe to the store

  // Local UI state, derived from store, but changes are staged before saving
  let uiNotificationsEnabled = currentSettings.notificationsEnabled;
  let uiNotificationTime = currentSettings.notificationTime;

  let canSchedule = false; // Based on permissions
  let isNative = Capacitor.getPlatform() !== 'web';
  let isLoadingPermission = false;
  let isProcessing = false; // For disabling UI during async operations

  // Sync local UI state if the store changes from elsewhere (e.g., after initial load)
  $: {
    if (currentSettings) {
      uiNotificationsEnabled = currentSettings.notificationsEnabled;
      uiNotificationTime = currentSettings.notificationTime || '08:00';
    }
  }

  onMount(async () => {
    if (isNative) {
      isLoadingPermission = true;
      try {
        const permissions = await LocalNotifications.checkPermissions();
        canSchedule = permissions.display === 'granted';
        console.log('[NotifySettings] Initial permission status:', permissions.display, 'Can schedule:', canSchedule);
        // If permissions are granted, and the stored setting is enabled, ensure a notification is scheduled.
        // This handles the case where the app was closed and reopened.
        if (canSchedule && $settingsStore.notificationsEnabled) {
            console.log('[NotifySettings] Permissions granted and notifications enabled in store. Re-scheduling on mount.');
            await scheduleNotificationFromStore(); // Use current store values
        }
      } catch (e) {
        console.error("Error checking notification permissions on mount:", e);
        canSchedule = false;
      } finally {
        isLoadingPermission = false;
      }
    }
  });

  async function requestPermissionAndEnable() {
    if (!isNative || isLoadingPermission || isProcessing) return;
    isLoadingPermission = true;
    isProcessing = true;
    try {
      const perms = await LocalNotifications.requestPermissions();
      if (perms.display === 'granted') {
        canSchedule = true;
        uiNotificationsEnabled = true; // Update UI state
        // Update the store, then let the store change trigger scheduling via reactive block or specific call
        settingsStore.set({ notificationsEnabled: true, notificationTime: uiNotificationTime });
        await scheduleNotification(true, uiNotificationTime); // Explicitly schedule
        toasts.success("Reminders enabled!");
      } else {
        uiNotificationsEnabled = false; // Reflect denied state in UI
        settingsStore.set({ notificationsEnabled: false, notificationTime: uiNotificationTime }); // Persist
        toasts.error("Notification permission denied.");
        canSchedule = false;
      }
    } catch (e) {
      console.error("Permission request error:", e);
      toasts.error("Error requesting permissions.");
      uiNotificationsEnabled = $settingsStore.notificationsEnabled; // Revert UI to store state on error
    } finally {
      isLoadingPermission = false;
      isProcessing = false;
    }
  }

  async function scheduleNotification(enabled, time) {
    if (!isNative || !canSchedule || !enabled) {
      console.log(`[NotifySettings] Conditions not met for scheduling. Native: ${isNative}, CanSchedule: ${canSchedule}, Enabled: ${enabled}`);
      return;
    }
    
    console.log(`[NotifySettings] Scheduling notification for ${time}`);
    isProcessing = true;
    try {
      await LocalNotifications.cancel({ ids: [1] });
      const [hour, minute] = time.split(':').map(Number);
      if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
          toasts.error("Invalid reminder time.");
          isProcessing = false;
          return;
      }
      await LocalNotifications.schedule({
        notifications: [{
          id: 1, title: "May chismis ka ba, besh?",
          body: "Share naman! Log your daily chismis now.",
          schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
          smallIcon: 'res://ic_stat_notify', // MAKE SURE THIS ICON EXISTS
        }]
      });
      toasts.success(`Daily reminder set for ${time}!`);
    } catch (e) {
      console.error("Error scheduling notification:", e);
      toasts.error("Failed to set reminder.");
      // Optional: Revert UI if scheduling fails critically after toggle
      // uiNotificationsEnabled = false;
      // settingsStore.set({ notificationsEnabled: false, notificationTime: uiNotificationTime });
    } finally {
      isProcessing = false;
    }
  }
  
  // Helper to schedule based on current store values (e.g., on mount)
  async function scheduleNotificationFromStore() {
      await scheduleNotification($settingsStore.notificationsEnabled, $settingsStore.notificationTime);
  }


  async function cancelAllNotifications() {
    if (!isNative || !canSchedule) return;
    isProcessing = true;
    console.log("[NotifySettings] Cancelling notifications.");
    try {
      await LocalNotifications.cancel({ ids: [1] });
      toasts.info("Daily reminder cancelled.");
    } catch (e) {
      console.error("Error cancelling notifications:", e);
      toasts.error("Failed to cancel reminder.");
    } finally {
      isProcessing = false;
    }
  }

  // --- UI Event Handlers ---
  async function handleToggleChange(event) {
    if (isProcessing) return; // Prevent changes while an async op is running
    const newEnabledState = event.target.checked;
    uiNotificationsEnabled = newEnabledState; // Update local UI state immediately

    // Update the store first
    settingsStore.set({ 
        notificationsEnabled: newEnabledState, 
        notificationTime: uiNotificationTime // Keep current time
    });

    // Then attempt to schedule or cancel
    if (newEnabledState) {
      await scheduleNotification(newEnabledState, uiNotificationTime);
    } else {
      await cancelAllNotifications();
    }
  }

  async function handleTimeChange(event) {
    if (isProcessing) return;
    const newTime = event.target.value;
    uiNotificationTime = newTime; // Update local UI state immediately

    // Update the store first
    settingsStore.set({
        notificationsEnabled: uiNotificationsEnabled, // Keep current enabled state
        notificationTime: newTime
    });
    
    // Only re-schedule if notifications are currently enabled
    if (uiNotificationsEnabled && canSchedule && isNative) {
      await scheduleNotification(uiNotificationsEnabled, newTime);
    }
  }
</script>

<div class="setting-item">
  {#if !isNative}
    <p class="setting-description">Daily reminders are only available in the mobile app.</p>
  {:else if !canSchedule && !isLoadingPermission}
    <div class="permission-prompt">
      <p class="setting-description">Enable daily reminders to log your chismis.</p>
      <button class="permission-button" on:click={requestPermissionAndEnable} disabled={isLoadingPermission}>
        {#if isLoadingPermission}Checking...{:else}Enable Reminders{/if}
      </button>
    </div>
  {:else if isLoadingPermission}
    <p class="setting-description">Checking permissions...</p>
  {:else}
    <!-- Permissions granted -->
    <div class="setting-header">
      <p class="setting-description">Set a daily reminder para mag-log ng mga chismis mo.</p>
      <label class="toggle-switch">
        <!-- Use on:change for checkboxes when also using bind:checked or manual updates -->
        <input type="checkbox" bind:checked={uiNotificationsEnabled} on:change={handleToggleChange} disabled={isProcessing} />
        <span class="slider"></span>
      </label>
    </div>

    {#if uiNotificationsEnabled}
    <div class="time-picker-container" transition:fly={{y:10, duration:200, easing:quintOut}}>
      <label for="notif-time">Reminder Time:</label>
      <input id="notif-time" type="time" bind:value={uiNotificationTime} on:input={handleTimeChange} disabled={isProcessing} />
    </div>
    {/if}
  {/if}
</div>

<style>
  .setting-item {
    background-color: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--card-border);
    padding: 20px;
  }

  .setting-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .setting-description {
    margin: 0;
    color: var(--card-title-text);
    font-family: "Urbanist", sans-serif;
    font-size: 0.9rem;
    font-weight: normal;
  }

  .time-picker-container {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--card-border);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: "Urbanist", sans-serif;
    font-size: 0.9rem;
    font-weight: normal;
    color: var(--card-title-text);
  }

  input[type="time"] {
    background-color: var(--card-mini-bg);
    border: 1px solid var(--card-border);
    color: var(--card-title-text);
    padding: 0.3rem 0.5rem;
    border-radius: 6px;
  }

  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* --- Simple Toggle Switch CSS --- */
  .toggle-switch { 
    position: relative; 
    display: inline-block; 
    flex-shrink: 0;
    width: 50px; 
    height: 28px; 
  }

  .toggle-switch input { 
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
    border-radius: 28px; 
    border: 1px solid var(--card-border);
  }

  .slider.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .slider:before { 
    position: absolute; 
    content: ""; 
    height: 20px; 
    width: 20px; 
    left: 4px; 
    bottom: 3px; 
    background-color: var(--card-title-text); 
    transition: .4s; 
    border-radius: 50%; 
  }

  input:checked + .slider { 
    background-color: var(--accent-color); 
    background-color: var(--card-border); 
  }

  input:checked + .slider:before { 
    transform: translateX(22px); 
  }

  .permission-prompt { text-align: center; }
  .permission-button { 
    background-color: var(--accent-color); 
    color: white; 
    border: none; 
    padding: 0.7rem 1.2rem; 
    border-radius: 6px; 
    cursor: pointer;
    font-weight: bold;
    margin-top: 0.5rem;
  }
  .permission-button:disabled {
    background-color: grey;
  }
  .time-picker-container { transition: all 0.3s ease-in-out; }
</style>