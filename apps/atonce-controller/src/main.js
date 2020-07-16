import App from "./App.svelte";
import URLON from "urlon";
window.URLON = URLON;

const app = new App({
  target: document.body,
  props: {
    name: "world",
  },
});

window.app = app;

export default app;
