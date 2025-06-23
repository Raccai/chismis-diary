<script>
  import { onMount } from 'svelte';

  export let editor;

  let editorState = null;

  let buttonStates = {};

  function updateButtonStates() {
    if (!editor || !editor.view || !editor.state) return;

    const newStates = {};
    for (const btn of buttons) {
      try {
        newStates[btn.check] = btn.type === 'mark'
          ? editor.isActive(btn.check)
          : editor.isActive(btn.check, {});
      } catch {
        newStates[btn.check] = false;
      }
    }
    buttonStates = newStates;
  }

  function isMarkActive(type) {
    try {
      return editor?.isActive?.(type) ?? false;
    } catch {
      return false;
    }
  }

  onMount(() => {
    if (editor) {
      updateButtonStates();

      editor.on('selectionUpdate', () => {
        updateButtonStates();
      });
    }
  });

  function isButtonActive(button) {
    try {
      return button.type === 'mark'
        ? editor.isActive(button.check)
        : editor.isActive(button.check, {});
    } catch {
      return false;
    }
  }

  const buttons = [
    { command: 'toggleBold', check: 'bold', type: 'mark', icon: 'B' },
    { command: 'toggleItalic', check: 'italic', type: 'mark', icon: 'I' },
    { command: 'toggleStrike', check: 'strike', type: 'mark', icon: 'S' },
    { command: 'toggleBulletList', check: 'bulletList', type: 'node', icon: '•' },
    { command: 'toggleOrderedList', check: 'orderedList', type: 'node', icon: '1.' },
  ];
</script>

<div class="toolbar">
  {#if editor}
    {#each buttons as btn}
      <button
        type="button"
        class="toolbar-button"
        on:click={() => editor.chain().focus()[btn.command]().run()}
        title={btn.check}
        class:active={buttonStates[btn.check]}
        aria-pressed={buttonStates[btn.check]}
      >
        {btn.icon}
      </button>
    {/each}
  {/if}
</div>

<style>
  .toolbar {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    background-color: var(--card-bg);
    border-top: 1px solid var(--card-border);
    border-bottom: 1px solid var(--card-border);
    order: 2;
  }
  
  .toolbar-button {
    background-color: transparent;
    border: 1px solid var(--card-border);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0.4rem 0.6rem;
    min-width: 2.2rem; /* Give a bit more space */
    height: 2.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .toolbar-button:hover {
    background-color: var(--card-border);
    border-color: var(--text-primary);
  }
  

  .toolbar-button.active {
    background-color: var(--card-title-text);
    color: var(--card-bg);
    border-color: var(--card-title-text);
  }

</style>