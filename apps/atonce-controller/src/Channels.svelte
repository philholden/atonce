<script>
  import { SPACE_NAME } from "./constants";
  import { channels } from "./stores";
  let key;
  let value;

  function onAdd(e) {
    e.preventDefault();
    channels.set(key, value);
  }
</script>

<style>
  form {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 16px;
  }
</style>

<br />
<h1>Channels</h1>

<h2>{SPACE_NAME}</h2>
{#if Object.entries($channels)}
  <ul>
    {#each Object.entries($channels) as [key, value], i}
      <li>
        {key}: {value}
        <button on:click={() => channels.remove(key)}>Remove</button>
      </li>
    {/each}
  </ul>
{/if}
<form on:submit={onAdd}>
  <input placeholder="key" bind:value={key} />
  <input placeholder="value" bind:value />
  <button>Set space data</button>
</form>
