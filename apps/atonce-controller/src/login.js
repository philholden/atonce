import web3Modal from "./providers.js";
import Box from "3box";
import { writable } from "svelte/store";

export const user = writable(null);
export const auth = writable(false);
let _user = null;
let _auth = false;
let _resolve;
let _reject;

const _box = new Promise((resolve, reject) => {
  _reject = reject;
  _resolve = resolve;
});

export async function getBox() {
  if (_user) return _box;
  const box = await Box.create();
  const ethProvider = await web3Modal.connect();
  const addresses = await ethProvider.enable();
  await box.auth([], { address: addresses[0], provider: ethProvider });
  box.onSyncDone((res) => console.log("Sync Complete"));
  console.log("authed");
  _resolve(box);
  _auth = true;
  auth.set(true);
  getUser();
  updateUser({ addresses });
  return _box;
}

async function getUser() {
  const box = await _box;
  updateUser(
    await box.listAddressLinks(),
    await Box.getProfile(_user.addresses[0])
  );
}

function updateUser(...args) {
  if (_user === null && args) _user = {};
  _user = Object.assign(_user, ...args);
  user.set(_user);
}
