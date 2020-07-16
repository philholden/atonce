<script>
  import { SPACE_NAME } from "./constants";
  import { songBooks } from "./stores";
  let key;
  let value;

  function onAdd(e) {
    e.preventDefault();
    songBooks.set(key, value);
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
<h1>Songs books</h1>

<h2>{SPACE_NAME}</h2>
{#if Object.entries($songBooks)}
  <ul>
    {#each Object.entries($songBooks) as [key, value], i}
      <li>{key}: {value}</li>
    {/each}
  </ul>
{/if}
<form on:submit={onAdd}>
  <input placeholder="key" bind:value={key} />
  <input placeholder="value" bind:value />
  <button>Set space data</button>
</form>
