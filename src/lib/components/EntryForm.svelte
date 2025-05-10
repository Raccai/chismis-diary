<script>
	import { entriesStore } from "$lib/stores/entriesStore.js";
    import { addEntry, updateEntry, deleteEntry } from "$lib/utils/entryHelpers.js";
    import { moodStore } from "$lib/stores/moodStore";
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher();
    export let selectedEntry = null;

    let text = "";
    let mood = "happy";

    onMount(() => {
        if (selectedEntry) {
            text = selectedEntry.text;
            mood = selectedEntry.mood;
        }
    });

    function saveEntry() {
        if(text.trim()) {
            if (selectedEntry) {
                updateEntry(selectedEntry.id, text, mood);
            } else {
                addEntry(text, mood);
            }
            dispatch("save");
        }
    }
</script>

<textarea bind:value={text} placeholder="Ano ang chismis ngayon besh?"></textarea>
<select bind:value={mood}>
    {#each $moodStore as moodOption}
        <option value={moodOption.value}>
            {moodOption.emoji} {moodOption.label}
        </option>
    {/each}
</select>
<button on:click={() => saveEntry()}>
    {selectedEntry ? "Update" : "Save"} Chismis
</button>