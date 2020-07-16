function writable(init) {
  let _val = init;
  const subs = [];

  const subscribe = (cb) => {
    subs.push(cb);
    cb(_val);

    return () => {
      const index = subs.findIndex((fn) => fn === cb);
      subs.splice(index, 1);
    };
  };

  const set = (v) => {
    _val = v;
    subs.forEach((fn) => fn(_val));
  };

  const update = (fn) => set(fn(_val));

  return { subscribe, set, update };
}
