<script>
  import { entriesStore } from '$lib/stores/entriesStore.js';
  import { uiStore } from '$lib/stores/uiStore.js'; // For modals
  import { toasts } from '$lib/stores/toastStore.js';
  // Import your data utility functions
  import { exportData, importData, clearAllAppData } from '$lib/utils/dataUtils.js'; // We'll create/update this file

  let importFile = null;

  function handleExport() {
    exportData(); // This function will now handle toasts internally or we can add one here
    toasts.success("Data export started!");
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      importFile = file;
      console.log("File selected for import:", importFile.name);
    }
  }

  function handleImport() {
    if (!importFile) {
      toasts.error("No file selected for import.");
      return;
    }
    uiStore.showModal({
      title: 'Confirm Import',
      message: 'Importing data will <strong>overwrite all current entries and progress</strong>. This cannot be undone. Are you sure you want to proceed?',
      confirmText: 'Yes, Import',
      cancelText: 'Cancel',
      confirmClass: 'danger', // Make it look like a serious action
      onConfirm: () => {
        importData(
          importFile,
          (successMessage) => { // onComplete callback
            toasts.success(successMessage);
            importFile = null; // Reset file input
            const fileInput = document.getElementById('import-file-input');
            if(fileInput) fileInput.value = ""; // Clear the file input field
          },
          (errorMessage) => { // onError callback
            toasts.error(errorMessage);
          }
        );
      },
      onCancel: () => {
        toasts.info("Import cancelled.");
      }
    });
  }

  function handleClearData(e) {
    uiStore.showModalOnly({
      title: 'Confirm Clear Data',
      message: 'Are you sure you want to delete all your chismis entries and achievements progress? This action is permanent and cannot be undone!',
      confirmText: 'Yes, Delete All',
      cancelText: 'No, Keep My Data',
      confirmClass: 'danger', // Destructive action
      onConfirm: () => {
        clearAllAppData(); // This function will handle store resets and toasts
      },
      onCancel: () => {
        toasts.info("Phew! Data not cleared.");
      }
    });
  }
</script>

<div class="settings-page">
  <h1 class="page-title">App Settings</h1>

  <section class="settings-section data-management-section">
    <h2 class="section-title">Data Management</h2>

    <div class="setting-item">
      <p class="setting-description">Export all your chismis entries and app data to a JSON file. Keep it safe!</p>
      <button class="action-button export-button" on:click={handleExport}>
        <span class="btn-icon">📤</span> Export Data
      </button>
    </div>

    <div class="setting-item">
      <p class="setting-description">Import data from a previously exported JSON file. This will overwrite current data.</p>
      <div class="import-controls">
        <input
          type="file"
          id="import-file-input"
          accept=".json"
          on:change={handleFileSelect}
          class="file-input"
        />
        <button class="action-button import-button" on:click={handleImport} disabled={!importFile}>
          <span class="btn-icon">📥</span> Import Data
        </button>
      </div>
      {#if importFile}
        <p class="selected-file-info">Selected: {importFile.name}</p>
      {/if}
    </div>

    <div class="setting-item clear-data-item">
      <p class="setting-description">Permanently delete all your chismis entries, achievements, and settings from this device.</p>
      <button 
      type="button" 
        class="action-button clear-button" 
        on:click|stopPropagation|preventDefault={handleClearData}
      >
        <span class="btn-icon">🗑️</span> Clear All App Data
      </button>
    </div>
  </section>
</div>

<style>
  /* Using BWP theme variables */
  .settings-page {
    padding: 20px 20px 140px 20px; /* Vertical padding, horizontal comes from layout .content-area */
  }

  .page-title {
    font-family: 'Graffiti Urban', sans-serif; /* Your graffiti font */
    color: var(--bw-text-primary);
    font-size: 2.2rem;
    text-align: center;
    margin-bottom: 2rem;
  }

  .settings-section {
    background-color: var(--bw-bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--bw-border-secondary);
  }

  .section-title {
    font-size: 1.2rem;
    font-weight: normal;
    color: var(--bw-text-primary);
    margin-top: 0;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--bw-border-primary);
  }

  .setting-item {
    margin-bottom: 1.5rem;
  }
  .setting-item:last-child {
    margin-bottom: 0;
  }

  .setting-description {
    font-size: 0.9rem;
    color: var(--bw-text-secondary);
    margin-bottom: 0.75rem;
    line-height: 1.5;
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1.2rem;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
    border: 1px solid transparent;
  }
  .action-button:active {
    transform: scale(0.97);
  }
  .btn-icon {
    font-size: 1.1em;
  }

  .export-button, .import-button {
    background-color: var(--bw-button-secondary-bg);
    color: var(--bw-button-secondary-text);
    border-color: var(--bw-button-secondary-border);
  }
  .export-button:hover, .import-button:hover:not(:disabled) {
    background-color: var(--bw-button-secondary-hover-bg);
  }
  .import-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }


  .clear-button {
    background-color: #ef4444; /* Red for destructive */
    color: white;
    border-color: #ef4444;
  }
  .clear-button:hover {
    background-color: #dc2626;
    border-color: #dc2626;
  }

  .import-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }
  .file-input {
    font-size: 0.9rem;
    color: var(--bw-text-secondary);
    /* Basic styling, can be enhanced */
  }
  .file-input::file-selector-button {
    padding: 0.5rem 0.8rem;
    margin-right: 0.75rem;
    border-radius: 6px;
    background-color: var(--bw-bg-tertiary);
    color: var(--bw-text-primary);
    border: 1px solid var(--bw-border-primary);
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .file-input::file-selector-button:hover {
    background-color: #e0e0e0;
  }

  .selected-file-info {
    font-size: 0.8rem;
    color: var(--bw-text-tertiary);
    font-style: italic;
  }

  .clear-data-item {
      border-top: 2px dashed var(--bw-accent-pink-subtle-border);
      padding-top: 1.5rem;
      margin-top: 2rem;
  }
</style>