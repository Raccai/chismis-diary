<!-- src/lib/components/TiptapEditor.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Placeholder from '@tiptap/extension-placeholder';

  export let value = '';
  export let editor = null;

  let element;

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: 'Anong latest, besh? Ikwento mo na lahat dito...',
        }),
      ],
      content: value,
      onUpdate: () => {
        value = editor.getHTML();
      },
    });
  });

  onDestroy(() => {
    editor?.destroy();
  });

  $: if (editor && value !== editor.getHTML()) {
    editor.commands.setContent(value, false);
  }
</script>

<div bind:this={element} class="editor-container"></div>

<style>
  .editor-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    padding: 1rem 1.25rem;
    font-size: 1.1rem;
    line-height: 1.7;
    background-color: transparent;
    color: var(--text-primary);
    overflow-y: auto;
    outline: none;
  }
  .editor-container > :global(.ProseMirror) {
    flex-grow: 1;
  }

  /* --- THIS IS THE DEFINITIVE FIX FOR LISTS --- */
  .editor-container > :global(.ProseMirror ul),
  .editor-container > :global(.ProseMirror ol) {
    padding-left: 2rem; /* The indentation */
  }

  .editor-container > :global(.ProseMirror li p) {
    margin: 0;
  }

  .editor-container :first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: var(--entry-form-placeholder);
    pointer-events: none;
    height: 0;
  }
</style>