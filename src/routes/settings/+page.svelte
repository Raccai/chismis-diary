<script>
  import { entriesStore } from '$lib/stores/entriesStore.js';
  import { uiStore } from '$lib/stores/uiStore.js'; 
  import { toasts } from '$lib/stores/toastStore.js';
  import Button from '$lib/components/Button.svelte';
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
    uiStore.showModalOnly({
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
      <Button 
        type="secondary"
        addBtn={false}
        ariaLabel="Export Data"
        onClick={() => handleExport()}
        class="secondary"
        text="Export Data"
      />
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
        <Button 
          type="secondary"
          addBtn={false}
          ariaLabel="Import Data"
          onClick={() => handleImport()}
          class="secondary"
          text="Import Data"
        />
      </div>
      {#if importFile}
        <p class="selected-file-info">Selected: {importFile.name}</p>
      {/if}
    </div>

    <div class="setting-item clear-data-item">
      <p class="setting-description">Permanently delete all your chismis entries, achievements, and settings from this device.</p>

      <Button 
        type="danger"
        addBtn={false}
        ariaLabel="Import Data"
        onClick={() => handleClearData()}
        class="danger"
        text="Clear all app data"
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
    font-weight: normal;
    font-size: 2.2rem;
    text-align: center;
    margin-bottom: 1rem;
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
    font-size: 0.8rem;
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