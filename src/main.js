import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";
import IndiaFloodScene from "./indiaFloodScene.js";

new Phaser.Game({
  type: Phaser.CANVAS,
  width: 1280,
  height: 720,
  canvas: document.getElementById("gameCanvas"),
  backgroundColor: "#081b24",
  pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { keyboard: true, mouse: true, touch: true },
  scene: [IndiaFloodScene],
});
