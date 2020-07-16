<script>
  import URLON from "urlon";
  import { channels } from "./stores";
  let error;
  let channel;

  const { search } = window.location;

  try {
    console.log("HERE", search);
    channel = URLON.parse(search.slice(1));
    console.log(search, "SEARCH");
    if (!channel) error = "No channel on URL";
  } catch (err) {
    error = "Bad link";
  }

  function onClick() {
    channels.set(channel.name, JSON.stringify(channel));
  }
</script>

<h1>Channel Invitation</h1>
{#if error}
  <pre>{error}</pre>
{:else}
  You have been invited to join: {channel.displayName}
  <button on:click={onClick}>Add channel</button>
{/if}
