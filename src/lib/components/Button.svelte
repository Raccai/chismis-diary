<script>
  export let type = "";
  export let text = "";
  export let onClick = () => {};
</script>

{#if type === "primary"}
  <button on:click={onClick}>
    {text}
    <span class="wrap" aria-hidden="true">
      <span class="particle" style="--a: -45deg; --x: 53%; --y: 40%; --d: 1em; --f: .7; --t: .15">
      </span>
      <span class="particle" style="--a: 150deg; --x: 40%; --y: 55%; --d: 1.5em; --f: .8; --t: .08"></span>
      <span class="particle" style="--a: 10deg; --x: 70%; --y: 55%; --d: 2em; --f: .6; --t: .25"></span>
      <span class="particle" style="--a: -120deg; --x: 30%; --y: 30%; --d: 1em"></span>
      <span class="particle" style="--a: -175deg; --x: 25%; --y: 35%; --d: 1.5em; --f: .6; --t: .32"></span>
      <span class="particle" style="--a: -18deg; --x: 65%; --y: 40%; --d: 1.25em; --f: .5; --t: .4"></span>
      <span class="particle" style="--a: -160deg; --x: 35%; --y: 25%; --d: 2em; --f: .9; --t: .5"></span>
      <span class="particle" style="--a: 175deg; --x: 25%; --y: 40%; --d: 1.5em; --f: .95; --t: .6"></span>
      <span class="particle" style="--a: -10deg; --x: 65%; --y: 35%; --d: 1em; --f: .55; --t: .67"></span>
      <span class="particle" style="--a: -140deg; --x: 45%; --y: 30%; --d: 1.5em; --f: .85; --t: .75"></span>
      <span class="particle" style="--a: 90deg; --x: 50%; --y: 55%; --d: 0.8em; --f: .5; --t: .83"></span>
      <span class="particle" style="--a: 30deg; --x: 60%; --y: 60%; --d: 0.8em; --f: .75; --t: .92"></span>
    </span>
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
  @property --k {
    syntax: "<number>";
    initial-value: -1;
    inherits: true;
  }
  
  button {
    --m: 3;
    grid-area: 2/1/span 1/span 2;
    position: relative;
    padding: 0.6rem 1rem;
    border-radius: 1rem;
    background: radial-gradient(var(--primary), 67.5%, var(--secondary)) padding-box, radial-gradient(#a0c2ed, 35%, #a0c2ed00 70%) 50% 0/80% 50% repeat-y;
    color: #f2fdfe;
    font-weight: 500;
    font-size: 2rem;
  }

  button:active {
    translate: 0 2px;
  }

  @keyframes k {
    0%, 33.3% {
      --k: 1 ;
    }
  }
  .particle {
    --f: 1;
    --pos-k: max(0, var(--k));
    --neg-k: max(0, -1*var(--k));
    --low-c: min(1, 4*(1 - var(--pos-k)));
    --abs-d: max(var(--neg-k) - .5, .5 - var(--neg-k));
    --mov-f: var(--pos-k);
    display: grid;
    position: absolute;
    left: var(--x);
    top: var(--y);
    rotate: var(--a);
    animation: k calc(var(--m)*1s) linear calc(var(--m)*var(--t, 0)*1s) infinite;
  }

  @supports (scale: sqrt(4)) {
    .particle {
      --mov-f: sqrt(var(--pos-k)) ;
    }
  }

  .particle::before, .particle::after {
    grid-area: 1/1;
    width: 0.4rem;
    aspect-ratio: 1;
  }

  .particle::before {
    --sa: calc(min(1, 1 - 2*min(.5, var(--mov-f)))*45deg);
    border-radius: calc(1.25*min(.8, var(--mov-f))*50%) 50% 50%;
    transform-origin: 0 0;
    translate: calc(var(--mov-f)*var(--d));
    rotate: -45deg;
    scale: var(--f);
    transform: skew(var(--sa), var(--sa));
    opacity: var(--low-c);
    filter: Saturate(var(--low-c));
    background: radial-gradient(at 85% 85%, var(--secondary), var(--primary) 75%);
    content: "";
  }
  
  .particle::after {
    translate: -50% -50%;
    scale: calc(var(--f)*(1 - 2*var(--abs-d)));
    text-align: center;
    filter: blur(0.5px);
    content: "✦";
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