<script>
  import { quintOut } from "svelte/easing";
  import { fly } from "svelte/transition";
</script>

<div 
  class="data-page-container"
  in:fly={{ y: 30, duration: 300, delay: 300, easing: quintOut }}
  out:fly={{ y: 30, duration: 300, easing: quintOut }}  
>
  <h1>Data & Statistics</h1>
  <p>This is where the chismis data analysis will be displayed.</p>
  <!-- Add charts, tables, etc. here -->
</div>

<style>
  .data-page-container {
    background-color: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  h1 {
    color: #2c3e50;
    margin-bottom: 1rem;
  }
</style>