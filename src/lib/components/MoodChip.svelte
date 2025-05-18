<script>
  import { createEventDispatcher } from 'svelte';

  export let moodOption;
  export let isSelected = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('select', moodOption.value);
  }
</script>

<button
  type="button"
  class="mood-chip"
  class:selected={isSelected}
  on:click={handleClick}
  aria-pressed={isSelected}
  style="background: {moodOption.colorLight};"
>
  <span class="emoji">{moodOption.emoji}</span>
  <span 
    class="label" 
    style="color: {moodOption.colorDark};"
  >
    {moodOption.label}
  </span>
</button>

<style>
  .mood-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.4rem 0.8rem;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
    border-radius: 16px;
    background-color: #f9f9f9;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    white-space: nowrap;
  }
  .mood-chip:hover {
    background-color: #efefef;
    border-color: #bbb;
  }
  .mood-chip.selected {
    background-color: #e0f2fe;
    border-color: #38bdf8;
    color: #0c4a6e;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .mood-chip.selected:hover {
    background-color: #bae6fd;
  }
  .emoji {
    margin-right: 0.3rem;
    font-size: 1.1em;
  }
</style>