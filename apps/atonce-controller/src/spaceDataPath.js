import { getBox } from "./login";

export function spaceDataPath(spaceName, path, isPrivate) {
  let _val = {};
  let started = false;
  const subs = [];
  const visibility = isPrivate ? "private" : "public";

  async function openSpace() {
    const box = await getBox();
    await box.openSpace(spaceName, { onSyncDone: updateSpaceData });
    updateSpaceData();
  }

  async function updateSpaceData() {
    const box = await getBox();
    const all = await box.spaces[spaceName][visibility].all();
    const entries = Object.entries(all).filter(([_key, val]) => {
      const [first] = _key.split("/");
      return first === path;
    });
    _val = {};
    for (let [key, val] of entries) _val[key.replace(`${path}/`, "")] = val;
    notify();
  }

  async function set(_key, value) {
    const box = await getBox();
    await box.spaces[spaceName][visibility].set(`${path}/${_key}`, value);
    //_val[key] = value;
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

  async function remove(_key) {
    const box = await getBox();
    await box.spaces[spaceName][visibility].remove(`${path}/${_key}`);
    console.log("remove", `${path}/${_key}`, spaceName, visibility);
    updateSpaceData();
  }

  return { subscribe, set, remove };
}
