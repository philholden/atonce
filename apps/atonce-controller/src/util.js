export function getCryptoId() {
  return Array.from(window.crypto.getRandomValues(new Uint32Array(4)))
    .map((x) => x.toString(36))
    .join("");
}
