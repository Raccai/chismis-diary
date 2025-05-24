<script>
  import { theme, toggleTheme } from '$lib/stores/themeStore.js';
  import { onMount } from 'svelte';

  $: isDark = $theme === 'dark';

  let mounted = false;
  onMount(() => {
    mounted = true; // Ensure we only render based on theme after mount to avoid SSR/CSR mismatch
  });

  function toggleDark() {
    toggleTheme();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if mounted}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="toggle" class:dark-active={$theme === "dark"}>
    <input type="checkbox" class="check" checked={isDark} on:click={toggleDark}>
    <b class="b switch">
    </b>
    <b class="b track"></b>
  </div>
{/if}

<style>
  .toggle {
    position: relative;
    width: 50px;
    height: 30px;
    border-radius: 100px;
    background-color: var(--theme-light);
    overflow: hidden;
    box-shadow: inset 0 0 2px 1px rgba(0,0,0,.05);
    border: var(--theme-border-light);
  }

  .check {
    position: absolute;
    display: block;
    cursor: pointer;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 6;
  }

  .toggle.dark-active .switch {
    right: 2px;
    left: 22px;
    transition: .35s cubic-bezier(0.785, 0.135, 0.150, 0.860);
    transition-property: left, right;
    transition-delay: .05s, 0s;
    background: var(--theme-toggle-dark);
  }

  .toggle.dark-active .track {
    background: var(--theme-dark);
  }
  
  .toggle.dark-active {
    border: var(--theme-border-dark); 
  }
  
  .switch {
    position: absolute;
    left: 2px;
    top: 2px;
    bottom: 2px;
    right: 22px;
    background-color: var(--main-white);
    border-radius: 36px;
    z-index: 1;
    transition: .35s cubic-bezier(0.785, 0.135, 0.150, 0.860);
    transition-property: left, right;
    transition-delay: 0s, .05s;
    box-shadow: 0 1px 2px rgba(0,0,0,.2);
  }

  .track {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    transition: .35s cubic-bezier(0.785, 0.135, 0.150, 0.860);
    border-radius: 40px;
  }
</style>