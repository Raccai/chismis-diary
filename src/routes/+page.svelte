<script>
  import { entriesStore } from "$lib/stores/entriesStore";
  import EntryCard from "$lib/components/EntryCard.svelte";
  import EntryForm from "$lib/components/EntryForm.svelte";

  let showForm = false;

  function handleSave() {
    showForm = false;
  }
</script>

<main>
  <button on:click={() => showForm = true}>
    + Add Chismis
  </button>

  {#if showForm}
    <div class="form-overlay" on:click={() => showForm = false}></div>
    <div class="form-slide">
      <EntryForm on:save={handleSave} />
    </div>
  {/if}

  <section>
    {#each $entriesStore as entry (entry.id)}
      <EntryCard {entry} />
    {/each}
  </section>
</main>

<style>
  .form-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 20;
  }

  .form-slide {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: 100%;
    max-width: 400px;
    background: white;
    z-index: 30;
    box-shadow: -4px 0 10px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out forwards;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0%);
    }
  }
</style>