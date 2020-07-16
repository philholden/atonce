<script>
  import { SPACE_NAME } from "./constants";
  import { getBox } from "./login";
  import { writable } from "svelte/store";
  let publicSpaces = {};
  let privateSpaces = {};
  let spvalue;
  let spkey;
  let ssvalue;
  let sskey;
  let authed = false;
  const _privateSpaces = writable([]);
  const _publicSpaces = writable([]);

  async function openSpace() {
    const box = await getBox();
    authed = true;
    const opts = {
      onSyncDone: () => {
        console.log("sync done in space", SPACE_NAME);
      }
    };
    const links = await box.listAddressLinks();
    console.log(links);
    console.log(box.spaces[SPACE_NAME], "spacer", SPACE_NAME);
    //box.openSpace(name, opts).then(() => {});
    await box.openSpace(SPACE_NAME, opts);
    console.log(box.spaces[SPACE_NAME], "spacer");
    updateSpaceData();
  }

  openSpace();

  function setPrivateSpaces(x) {
    privateSpaces = x;
    //_privateSpaces.set(x);
  }

  async function updateSpaceData() {
    const box = await getBox();
    console.log("update never called", box.spaces[SPACE_NAME]);
    publicSpaces = box.spaces[SPACE_NAME].public
      .all()
      .then(x => (publicSpaces = x));
    box.spaces[SPACE_NAME].private.all().then(setPrivateSpaces);
  }

  async function setPrivateSpaceData(e) {
    const box = await getBox();
    e.preventDefault();
    box.spaces[SPACE_NAME].private.set(sskey, ssvalue).then(() => {
      sskey = "";
      ssvalue = "";
      updateSpaceData();
    });
  }

  async function setPublicSpaceData(e) {
    const box = await getBox();
    e.preventDefault();
    box.spaces[SPACE_NAME].private.set(spkey, spvalue).then(() => {
      spkey = "";
      spvalue = "";
      updateSpaceData();
    });
  }
</script>

<style>
  form {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 16px;
  }
</style>

authed {authed}
<br />
<h1>{SPACE_NAME}</h1>
<h2>Public data</h2>
{#if Object.entries(publicSpaces)}
  <ul>
    {#each Object.entries(publicSpaces) as [key, value], key}
      <li>{key}: {value}</li>
    {/each}
  </ul>
{/if}
<form on:submit={setPublicSpaceData}>
  <input placeholder="key" bind:value={spkey} />
  <input placeholder="value" bind:value={spvalue} />
  <button>Set space data</button>
</form>

<h2>Private data</h2>
{#if Object.entries(privateSpaces)}
  <ul>
    {#each Object.entries(privateSpaces) as [key, value], i}
      <li>{key}: {value}</li>
    {/each}
  </ul>
{/if}
<form on:submit={setPrivateSpaceData}>
  <input placeholder="key" bind:value={sskey} />
  <input placeholder="value" bind:value={ssvalue} />
  <button>Set space data</button>
</form>
