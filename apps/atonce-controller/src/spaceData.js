import { getBox } from "./login";

export function spaceData(spaceName, isPrivate) {
  let _val = {};
  let started = false;
  const subs = [];

  async function openSpace() {
    const box = await getBox();
    await box.openSpace(spaceName, { onSyncDone: updateSpaceData });
    updateSpaceData();
  }

  async function updateSpaceData() {
    const box = await getBox();
    const visibility = isPrivate ? "private" : "public";
    _val = await box.spaces[spaceName][visibility].all();
    notify();
  }

  async function set(key, value) {
    const box = await getBox();
    await box.spaces[spaceName].private.set(key, value);
    updateSpaceData();
  }

  function subscribe(cb) {
    subs.push(cb);
    cb(_val);
    if (!started) {
      openSpace();
    }

    return () => {
      const index = subs.findIndex((fn) => fn === cb);
      subs.splice(index, 1);
    };
  }

  function notify(v) {
    subs.forEach((fn) => fn(_val));
  }

  return { subscribe, set };
}
