<script>
    import { entriesStore } from "$lib/stores/entriesStore";
    import { deleteEntry } from "$lib/utils/entryHelpers"; 
    import EntryCard from "$lib/components/Entries/EntryCard.svelte";
    import { uiStore } from '$lib/stores/uiStore.js';
    import { quintOut } from "svelte/easing";
    import { fly } from "svelte/transition";

    function handleEdit(event) {
      const entryToEdit = event.detail;
      console.log("ROOT +page.svelte: handleEdit received, calling uiStore.showEntryForm with:", entryToEdit);
      if (entryToEdit && typeof entryToEdit.id !== 'undefined') {
        uiStore.showEntryForm(entryToEdit); // Use store to show form for editing
      } else {
        console.error("ROOT +page.svelte: handleEdit - Invalid event detail:", event.detail);
      }
    }

    function handleDelete(event) {
      const entryId = event.detail;
      console.log("ROOT +page.svelte: handleDelete received ID:", entryId);
      if (typeof entryId === 'string' || typeof entryId === 'number') {
        deleteEntry(entryId);
      } else {
        console.error("ROOT +page.svelte: handleDelete - Invalid event detail (ID):", event.detail);
      }
    }
</script>

<section
    in:fly={{ y: 30, duration: 300, delay: 300, easing: quintOut }}
    out:fly={{ y: 30, duration: 300, easing: quintOut }}  
>
  {#if $entriesStore.length === 0}
    <p>No chismis yet. Add some!</p>
  {:else}
    {#each $entriesStore as entry (entry.id)}
      <EntryCard
        {entry}
        on:edit={handleEdit}
        on:delete={handleDelete}
      />
    {/each}
  {/if}
</section>

<style>
  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0%);
    }
  }
</style>