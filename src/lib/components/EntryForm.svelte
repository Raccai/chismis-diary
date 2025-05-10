<script>
	import { entriesStore } from "$lib/stores/entriesStore.js";
    import { addEntry, updateEntry, deleteEntry } from "$lib/utils/entryHelpers.js";
    import { moodStore } from "$lib/stores/moodStore";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let text = "";
    let mood = "happy";

    function saveEntry() {
        if(text.trim()) {
            addEntry(text, mood);
            dispatch(text, mood);
            text = "";
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
<button on:click={() => saveEntry()}>Save Chismis</button>