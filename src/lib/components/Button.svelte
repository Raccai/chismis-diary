<script>
  export let type = "";
  export let text = "";
  export let onClick = () => {};
</script>

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

<style>
  /* Primary Button */
  .primary {
    background: none;
    padding: 0.2rem;
    display: inline-block;
    text-decoration: none;
    border-radius: 8px;
    transition: all 100ms ease-in-out;
  }

  .primary .content {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.8rem;
    height: 100%;
    width: 100%;
    border-radius: 6px;
    overflow: hidden;
  }

  .primary:active,
  .primary:focus,
  .primary:hover {
    background: var(--tertiary);
    animation: bounce 300ms linear;
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

  .primary .content::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 2rem;
    height: 2rem;
    background-color: var(--main-bg);
    transform: translate(-50%, -50%);
    border-radius: 100%;
    animation: shine 3s linear infinite;
    filter: blur(8px);
    visibility: hidden;
  }

  .primary .content::after {
    content: attr(data-value);
    position: absolute;
    left: 2.4%;
    top: 2%;
    width: 96%;
    height: 96%;
    background-color: var(--primary);
    border-radius: inherit;
    color: var(--main-bg);
    font-weight: 500;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .primary:active .content::before,
  .primary:focus .content::before,
  .primary:hover .content::before {
    visibility: visible;
  }
  
  .primary:active .content::after,
  .primary:focus .content::after,
  .primary:hover .content::after {
    background-image: radial-gradient(
      circle at 50% 100%,
      var(--secondary),
      var(--primary)
    );
    animation: bounce 300ms linear;
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