// this function if highly generalised can be paste to any store
// the lens is just a function to get data at a location
export const createAddSubscriptionLens = (state, subsMap) => (lens) => {
  return {
    subscribe: (cb, ignoreFirst) => {
      if (!subsMap.get(lens)) subsMap.set(lens, []);
      const subs = subsMap.get(lens);
      subs.push(cb);
      if (!ignoreFirst) cb(lens(state));

      function unsubscribe() {
        const index = subs.findIndex((fn) => fn === cb);
        subs.splice(index, 1);
      }
      return unsubscribe;
    },
    get: () => lens(state),
    notify: () => {
      const _val = lens(state);
      const subs = subsMap.get(lens);
      subs.forEach((fn) => fn(_val));
    },
  };
};
