<script>
  import Auth from "./Auth.svelte";
  import User from "./User.svelte";
  import SongBooks from "./SongBooks.svelte";
  import Channels from "./Channels.svelte";
  import ChannelUrlInvite from "./ChannelUrlInvite.svelte";
</script>

<style>
  h1 {
    color: purple;
  }
</style>

{#if true}
  <SongBooks />
  <Channels />
  <User />
  <ChannelUrlInvite />
{:else}
  <Auth />
{/if}
