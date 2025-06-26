<script>
  import { onMount } from 'svelte';
  import { uiStore } from '$lib/stores/uiStore.js'; 
  import { toasts } from '$lib/stores/toastStore.js';
  import Button from '$lib/components/Button.svelte';
  import { exportData, importData, clearAllAppData } from '$lib/utils/dataUtils.js'; 
  import NotificationSettings from '$lib/components/Settings/NotificationSettings.svelte';
  import PinSetup from '$lib/components/Settings/PinSetup.svelte';
  import { authStore } from '$lib/stores/authStore.js';
  import { Capacitor } from '@capacitor/core';

  // We load the plugin dynamically to prevent SSR crashes
  let NativeBiometric = null;

  onMount(() => {
    if (Capacitor.isNativePlatform()) {
      import('capacitor-native-biometric').then(module => {
        NativeBiometric = module.NativeBiometric;
      }).catch(err => console.error("Failed to load biometrics plugin", err));
    }
  });

  let importFile = null;
  let showPinSetup = false;

  async function handleBiometricsToggle() {
    if ($authStore.isBiometricsEnabled) {
      // Logic to DISABLE biometrics
      authStore.disableBiometrics();
      toasts.info("Biometrics disabled.");
    } else {
      // Logic to ENABLE biometrics
      if (!NativeBiometric) {
        toasts.error("Biometrics feature is not ready yet.");
        return;
      }
      try {
        const result = await NativeBiometric.isAvailable();
        if (!result.isAvailable) {
          toasts.error("Biometrics not available on this device.");
          return;
        }
        authStore.enableBiometrics();
        toasts.success("Biometrics enabled!");
      } catch(error) {
        toasts.error("Error checking for biometrics.");
      }
    }
  }

  function handleRemovePin() {
    uiStore.showModalOnly({
      title: 'Remove PIN?',
      message: 'This will remove your PIN and disable app lock. Are you sure?',
      confirmText: 'Yes, Remove PIN',
      confirmClass: 'danger',
      onConfirm: () => {
        authStore.removePin();
        toasts.success("PIN and app lock have been removed.");
      }
    });
  }

  async function enableBiometrics() {
    try {
      // First check if biometrics are even available on the device.
      const result = await NativeBiometric.isAvailable();
      if (!result.isAvailable) {
        toasts.error("Biometrics not available or not configured on this device.");
        return;
      }
      
      // If available, mark it as enabled in our store.
      authStore.enableBiometrics();
      toasts.success("Biometrics enabled!");

    } catch(error) {
      toasts.error("An error occurred while checking for biometrics.");
      console.error("Biometric check failed", error);
    }
  }

  async function handleExport() {
    await exportData(); 
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      importFile = file;
      console.log("Piniling file para i-import:", importFile.name);
    }
  }

  function handleImport() {
    if (!importFile) {
      toasts.error("Wala kang napiling file para i-import.");
      return;
    }
    uiStore.showModalOnly({
      title: 'Sigurado ka ba?',
      message: 'Ang pag-import ay <strong>papalit sa lahat ng kasalukuyang entries at progress mo</strong>. Hindi na ito mababalik. Tuloy ka ba?',
      confirmText: 'Oo, I-import',
      cancelText: 'Huwag na lang',
      confirmClass: 'danger',
      onConfirm: () => {
        importData(
          importFile,
          (successMessage) => {
            toasts.success(successMessage);
            importFile = null;
            const fileInput = document.getElementById('import-file-input');
            if(fileInput) fileInput.value = "";
          },
          (errorMessage) => {
            toasts.error(errorMessage);
          }
        );
      },
      onCancel: () => {
        toasts.info("Hindi na-import. Chill lang.");
      }
    });
  }

  function handleClearData(e) {
    uiStore.showModalOnly({
      title: 'Burahin Lahat?',
      message: 'Burahin lahat ng chismis entries at progress mo? Wala nang bawian \'to.',
      confirmText: 'Oo, burahin lahat',
      cancelText: 'Ay wag na lang',
      confirmClass: 'danger',
      onConfirm: () => {
        clearAllAppData();
      },
      onCancel: () => {
        toasts.info("Saved pa rin ang data mo!");
      }
    });
  }
</script>

{#if showPinSetup}
  <PinSetup on:close={() => showPinSetup = false} />
{/if}

<div class="settings-page">
  <h1 class="page-title">Mga Setting</h1>

  <section class="settings-section security-section">
    <h2 class="section-title">Seguridad</h2>
    
    <div class="setting-item">
      <p class="setting-description">
        {#if !$authStore.hasPinSetup}
          Mag-set up ng 4-digit PIN para i-lock ang app.
        {:else}
          Change your 4-digit PIN.
        {/if}
      </p>
      <Button 
        type="secondary"
        ariaLabel="Setup PIN"
        onClick={() => showPinSetup = true}
        text={$authStore.hasPinSetup ? 'Palitan ang PIN' : 'Mag-set up ng PIN'}
      />
    </div>

    {#if $authStore.hasPinSetup}
      <div class="setting-item">
        <p class="setting-description">
          {#if $authStore.isBiometricsEnabled}
            Disable biometrics (Face ID/Fingerprint).
          {:else}
            Use biometrics for faster app unlock.
          {/if}
        </p>
        <!-- This is now a toggle button -->
        <Button 
          type="secondary"
          ariaLabel="Toggle Biometrics"
          onClick={handleBiometricsToggle}
          text={$authStore.isBiometricsEnabled ? 'Huwag Payagan' : 'Payagan ang Biometrics'}
        />
      </div>

      <!-- New setting to remove the PIN completely -->
      <div class="setting-item">
        <p class="setting-description">
          Completely remove the PIN and disable the app lock feature.
        </p>
        <Button 
          type="danger"
          ariaLabel="Remove PIN"
          onClick={handleRemovePin}
          text="Tanggalin ang App Lock"
        />
      </div>
    {/if}
  </section>

  <section class="settings-section data-management-section">
    <h2 class="section-title">Mga Notipikasyon</h2>
    <NotificationSettings />

    <h2 class="section-title">Pamamahala ng Data</h2>
    <div class="setting-item">
      <p class="setting-description">
        I-export lahat ng chismis entries at app data mo sa JSON file. Para may backup ka!
      </p>
      <Button 
        type="secondary"
        addBtn={false}
        ariaLabel="Export Data"
        onClick={() => handleExport()}
        class="secondary"
        text="I-export ang Data"
      />
    </div>

    <div class="setting-item">
      <p class="setting-description">
        Mag-import ng data mula sa dating na-export mong JSON file. Pero mapapalitan lahat ng mga entries mo!
      </p>
      <div class="import-controls">
        <input
          type="file"
          id="import-file-input"
          accept=".json"
          on:change={handleFileSelect}
          class="file-input"
        />
        <Button 
          type="secondary"
          addBtn={false}
          ariaLabel="Import Data"
          onClick={() => handleImport()}
          class="secondary"
          text="I-import ang Data"
        />
      </div>
      {#if importFile}
        <p class="selected-file-info">Napiling file: {importFile.name}</p>
      {/if}
    </div>

    <div class="setting-item clear-data-item">
      <p class="setting-description">
        Burahin lahat ng chismis entries, achievements, at settings sa device na 'to. Permanenteng aksyon ‘to!
      </p>

      <Button 
        type="danger"
        addBtn={false}
        ariaLabel="Import Data"
        onClick={() => handleClearData()}
        class="danger"
        text="Burahin Lahat ng Data"
      />
    </div>
  </section>
</div>


<style>
  .settings-page {
    padding: 20px 20px 140px 20px; 
  }

  .page-title {
    font-family: 'Graffiti Urban', sans-serif; /* Your graffiti font */
    color: var(--card-title-text);
    font-weight: bold;
    font-size: 2.2rem;
    text-align: center;
    margin-bottom: 0.6rem;
    margin-top: 0.5rem;
    letter-spacing: -0.12rem;
  }

  .security-section {
    width: 100%;
    margin-bottom: 2rem;
  }
  .setting-item {
    width: 100%;
    box-sizing: border-box;
  }
  .enabled-text {
    font-size: 0.8rem;
    margin-top: 0.75rem;
    font-style: italic;
    color: var(--success-color, green);
  }

  .settings-section {
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }

  .section-title {
    font-family: "Urbanist", sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--card-title-text);
    margin-top: 0;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--card-border);
  }

  .setting-item {
    background-color: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--card-border);
    padding: 20px;
  }
  .setting-item:last-child {
    margin-bottom: 0;
  }

  .setting-description {
    font-family: "Urbanist", sans-serif;
    font-size: 0.9rem;
    color: var(--card-title-text);
    margin-bottom: 0.75rem;
    line-height: 1.5;
  }

  .import-controls {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
  }
  .file-input {
    font-size: 0.9rem;
    font-family: "Urbanist", sans-serif;
    color: var(--card-title-text);
    /* Basic styling, can be enhanced */
  }
  .file-input::file-selector-button {
    padding: 0.5rem 0.8rem;
    margin-right: 0.75rem;
    border-radius: 6px;
    background-color: var(--card-mini-bg);
    color: var(--card-title-text);
    border: 1px solid var(--card-border);
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .file-input::file-selector-button:active,
  .file-input::file-selector-button:focus {
    background-color: var(--card-bg);
    border: var(--card-border);
  }

  .selected-file-info {
    font-size: 0.8rem;
    margin-top: 1rem;
    font-family: "Urbanist", sans-serif;
    color: var(--card-title-text);
    font-style: italic;
  }

  .clear-data-item {
    border: 2px dashed var(--card-border);
    padding-top: 1.5rem;
  }
</style>