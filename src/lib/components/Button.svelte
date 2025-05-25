<script>
  import TakeNote from '$lib/icons/TakeNote.svelte';

  export let type = "";
  export let text = "";
  export let addBtn = false;
  export let onClick = () => {};
</script>

{#if type === "TakeNote"}
  <button class="TakeNote" on:click={onClick}>
    {#if addBtn === true}
      <div class="add-svg">
        <TakeNote />
      </div>
    {/if}
    {text}
  </button>
{:else}
  <!-- svelte-ignore a11y_invalid_attribute -->
  <a 
    href="#" 
    class={type}
    on:click={onClick}  
  >
    <span 
      class="content"
      data-value={text}
    >
      <p>{text}</p>
    </span>
  </a>
{/if}

<style>
  /* TakeNote Button */
  .add-svg {
    transform: scale(0.8);
  }

  .TakeNote {
    width: 50px;
    height: 50px;
    background-color: var(--takeNote-btn-bg);
    border-radius: 12px;
    transition: all 150ms ease-in-out;
  }

  .TakeNote:active {
    transform: translateY(4%);
    border-bottom: 1px solid var(--primary);
  }

  /* Primary Button */
  .primary {
    font-family: "Graffiti Urban", sans-serif;
    background-color: var(--primary-btn-bg);
    border: 2px solid var(--primary-btn-border);
    margin-left: 0.2rem;
    padding: 0.8rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    color: var(--primary-btn-text);
    text-decoration: none;
    flex-grow: 1;
    min-width: 90px;
  }
  
  .primary .content {
    padding: 0;
  }
  
  .primary .content p {
    font-weight: normal;
    font-size: 1.2rem;
  }
  @keyframes bounce {
    0% {
      transform: scale(0.94);
    }
    50% {
      transform: scale(1.04);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes shine {
    0% {
      left: 0;
      top: 0;
    }
    35% {
      left: 100%;
      top: 0;
    }
    50% {
      left: 100%;
      top: 100%;
    }
    85% {
      left: 0;
      top: 100%;
    }
  }

  /* Secondary Button */
  .secondary {
    font-family: "Graffiti Urban", sans-serif;
    border: 2px solid var(--secondary-btn-border);
    padding: 0.8rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    color: var(--secondary-btn-text);
    text-decoration: none;
    flex-grow: 1;
    min-width: 90px;
  }
  
  .secondary .content {
    padding: 0;
  }
  
  .secondary .content p {
    font-weight: normal;
    font-size: 1.2rem;
  }

  /* Tertiary Button */
  a.tertiary {
    padding: 0.6rem 0.4rem;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    color: var(--primary);
    text-decoration: none;
  }

  a.tertiary::before {
    content: "";
    background-color: var(--primary);
    opacity: 0.75;
    position: absolute;
    left: 0;
    bottom: 8px;
    width: 100%;
    height: 8px;
    z-index: 0;
    transition: all 300ms ease-in-out;
  }

  a.tertiary:hover::before {
    bottom: 0;
    height: 100%;
  }

  a.tertiary:hover .content p {
    color: #590D22;
  }
  
  .tertiary .content p {
    font-weight: 500;
    transition: all 300ms ease-in-out;
  }

  /* Danger button */
  .danger {
    font-family: "Graffiti Urban", sans-serif;
    background-color: var(--danger-btn-bg);
    border: 2px solid var(--danger-btn-border);
    padding: 0.8rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    color: var(--danger-btn-text);
    text-decoration: none;
    flex-grow: 1;
    min-width: 90px;
  }
  
  .danger .content {
    padding: 0;
  }
  
  .danger .content p {
    font-weight: normal;
    font-size: 1.2rem;
  }

  .danger:hover,
  .danger:active,
  .danger:focus,
  .secondary:hover,
  .secondary:active,
  .secondary:focus,
  .primary:hover,
  .primary:active,
  .primary:focus {
    animation: bounce 300ms linear;
  }
</style>