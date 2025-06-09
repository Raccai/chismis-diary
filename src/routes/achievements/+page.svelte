<script>
  import { moodStore } from '$lib/stores/moodStore.js';
  import CharacterReveal from '$lib/components/Achievements/CharacterReveal.svelte';
</script>

<div class="achievements-page-bwp">
  <h1 class="page-title-bwp">Mood Crew</h1>
  <p class="page-subtitle-bwp">Unlock music by using moods and hitting milestones!</p>

  <div class="character-grid-bwp">
    {#each $moodStore as character (character.value)}
      <CharacterReveal moodCharacter={character} />
    {/each}
  </div>
</div>

<style>
  .achievements-page-bwp {
    padding: 1rem 0 calc(var(--navbar-height, 65px) + 1rem) 0;
  }
  .page-title-bwp {
    font-family: 'Graffiti Urban', sans-serif;
    color: var(--card-title-text);
    font-size: 2.2rem;
    text-align: center;
    margin-bottom: 0.5rem;
  }
  .page-subtitle-bwp {
    font-family: 'Urbanist', sans-serif;
    color: var(--card-title-text);
    text-align: center;
    margin-bottom: 2rem;
    font-size: 0.95rem;
  }
  .character-grid-bwp {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
    padding: 0 1rem;
    justify-items: center;
  }
</style>