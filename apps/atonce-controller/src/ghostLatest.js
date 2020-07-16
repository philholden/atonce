import { getBox } from "./login";
import { clone } from "./clone";

// https://docs.3box.io/build/web-apps/messaging/ghost-threads

// The ghost latest uses keyFrames and deltas
// we find the latest keyFrames and then Object.assign() the following intraFrames

// if firstModerator did is past we open in without needing auth

export function ghostLatest({
  threadName, spaceName, firstModerator, limit=30}) {
  let _val = init;
  let _thread;
  let _posts = [];

  // This could be IPFS hash of joining page instead
  // This could be a counter for shorter urls

  const subs = [];

  async function joinThread() {
    _thread = await box.openThread(spaceName, threadName, {
      firstModerator,
      ghost: true,
      ghostBacklogLimit: limit,
    })
    await registerThreadEvents()
  }

  async function createThread() {
    const box = await getBox();
    const space = await box.openSpace(spaceName);
    _thread = await space.joinThread(threadName, {
      ghost: true,
      ghostBacklogLimit: limit,
    });
    await registerThreadEvents()
  }

  async function registerThreadEvents() {
    _posts = await _thread.getPosts(limit);
    thread.onUpdate(() => {
      _posts = await thread.getPosts(limit);
    })
    _thread;
  }

  function subscribe(cb) {
    subs.push(cb);
    cb(_val);
    if (firstModerator) {joinThread()} else {createThread()}
    return () => {
      const index = subs.findIndex((fn) => fn === cb);
      subs.splice(index, 1);
    };
  }

  function getThread() {
    return _thread;
  }

  function getMessage(post) {
    try {
      return JSON.parse(post.message) 
    } catch {
      return null
    }
  }

  function notify() {
    let _reverse = [..._posts].reverse();
    let _keyFound = false;
    let _next = [];
    let _json = []

    for (let post of _reverse) {
      _next.push(post);
      const message = getMessage(post);
      _json.push(message)
      if ((message.f = "k")) {
        _keyFound = true;
        break;
      }
    }
    _next.reverse()
    _json.reverse()
    if (!keyFound) {
      _val = null;
    } else {
      let [head, ...tail] = _json;
      _val = Object.assign(clone(head), ...tail);
    }
    _posts = _next;
    subs.forEach((fn) => fn(_val));
  }

  function set(v) {
    _val = v;
    _thread.post(JSON.stringify(v));
    notify();
  }

  function update(fn) {
    set(fn(_val));
  }

  return { subscribe, set, update };
}

// hourly global events feed


// const postsFormat = [
//   {
//     type: "chat",
//     author: "did:3:bafyreicyctnyurpontgqwixclpwt6quzjydfytlty6nel5rlo3izvuitju",
//     message: "hello",
//     timestamp: 1594891655,
//     postId: "bafyreihoqj4aapc5r2d62ahqniln2hnwnx6kvpmwweemwkesnb5iy5l2sq"
//   }
// ]
