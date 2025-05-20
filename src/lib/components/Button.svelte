<script>
  import TakeNote from '$lib/icons/TakeNote.svelte';

  export let type = "";
  export let text = "";
  export let icon = null;
  export let addBtn = false;
  export let onClick = () => {};
</script>

{#if type === "primary"}
  <button class="primary" on:click={onClick}>
    {#if addBtn === true}
      <div class="add-svg">
        <TakeNote />
      </div>
    {/if}
    {text}
  </button>
{:else}
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
  /* Primary Button */
  .add-svg {
    transform: scale(0.8);
  }

  .primary {
    width: 50px;
    height: 50px;
    background-color: var(--add-btn-bg);
    border-radius: 12px;
    transition: all 150ms ease-in-out;
  }

  .primary:active {
    transform: translateY(4%);
    border-bottom: 1px solid var(--primary);
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
    border: 2px solid var(--primary);
    padding: 0.8rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    color: var(--primary);
    text-decoration: none;
  }
  
  .secondary .content {
    padding: 0;
  }
  
  .secondary .content p {
    font-weight: 500;
  }

  .secondary:hover,
  .secondary:active,
  .secondary:focus {
    animation: bounce 300ms linear;
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

  /* Delete button */
  .delete {
    background-color: var(--delete);
    text-decoration: none;
    font-weight: 500;
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
  }
  
  .delete:hover,
  .delete:active,
  .delete:focus {
    animation: bounce 300ms linear;
  }
</style>