<script>
    import { entriesStore } from "$lib/stores/entriesStore";
    import { deleteEntry, updateEntry } from "$lib/utils/entryHelpers";
    import EntryCard from "$lib/components/EntryCard.svelte";
    import EntryForm from "$lib/components/EntryForm.svelte";

    let showForm = false;
    let selectedEntry = null;

    function handleCloseForm() {
        selectedEntry = null;
        showForm = false;
    }

    function handleOpenForm() {
        selectedEntry = null;
        showForm = true;
    }

    function handleEdit(entry) {
        selectedEntry = entry;
        showForm = true;
    }

    function handleDelete(id) {
        deleteEntry(id);
    }
</script>

<main>
    <button on:click={() => handleOpenForm()} >
        + Add Chismis
    </button>

    {#if showForm}
        <div class="form-overlay" on:click={() => handleCloseForm()}>
            <div class="form-slide">
                <EntryForm {selectedEntry} on:save={() => handleCloseForm()} />
            </div>
        </div>
    {/if}

    <section>
        {#each $entriesStore as entry (entry.id)}
            <EntryCard  
                {entry}
                on:edit={e => handleEdit(e.detail)}
                on:delete={e => handleDelete(e.detail)}
            />
        {/each}
    </section>
</main>

<style>
    .form-overlay {

    }

    .form-slide {
        position: fixed;
        top: 0;
        right: 0;
        height: 100%;
        width: 100%;
        background: white;
        z-index: 30;
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