import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";

const COLORS = { ink: 0x082630, cream: "#f7e5b5", pale: "#d7f2eb", teal: 0x2ba7a0, red: 0xbd4b3d, green: 0x2e9875 };

export default class IndiaFloodScene extends Phaser.Scene {
  constructor() { super("india-flood"); this.introVisible = true; this.levelComplete = false; }

  preload() {
    this.load.image("farm", "./assets/farmflood.jpg");
    this.load.image("floodedFarmland", "./assets/floodedbg.jpg");
    this.load.image("farmer", "./assets/indian_farmer.png");
    this.load.image("straw", "./assets/straw.png");
    this.load.image("pipe", "./assets/pipe.png");
  }

  create() {
    this.width = this.scale.gameSize.width;
    this.height = this.scale.gameSize.height;
    this.createBackdrop();
    this.createIntroduction();
    this.input.keyboard.on("keydown-SPACE", () => {
      if (this.introVisible) this.startMission(1);
      else if (this.levelComplete) this.startLevel(2);
    });
  }

  createBackdrop() {
    this.background = this.add.image(this.width / 2, this.height / 2, "farm").setDisplaySize(this.width, this.height).setAlpha(0.64);
    this.add.rectangle(this.width / 2, this.height / 2, this.width, this.height, COLORS.ink, 0.55);
  }

  createIntroduction() {
    const panelWidth = Math.min(850, this.width - 72);
    const panelHeight = Math.min(540, this.height - 70);
    const panelX = this.width / 2;
    const panelY = this.height / 2;
    this.add.rectangle(panelX, panelY, panelWidth, panelHeight, COLORS.ink, 0.96).setStrokeStyle(3, COLORS.teal).setDepth(20);
    const left = panelX - panelWidth / 2 + 34;
    const top = panelY - panelHeight / 2 + 26;
    this.add.text(left, top, "FLOODGUARD INDIA", { fontFamily: "Georgia", fontSize: "30px", color: COLORS.cream, fontStyle: "bold" }).setDepth(21);
    this.add.text(left, top + 43, "Why does flooding happen?", { fontFamily: "Georgia", fontSize: "22px", color: COLORS.pale }).setDepth(21);
    const explanation = [
      "During India's monsoon, warm, moisture-filled air can bring intense rain in a short time.",
      "When the ground is already saturated, water cannot soak in quickly. Streams and rivers rise,",
      "and low-lying farms can flood when channels, drains, or embankments cannot carry the flow.",
      "Floodwater can flatten crops, wash away fertile soil, and leave fields covered in mud.",
      "The safest response is early warning, moving people and animals to higher ground,",
      "and protecting crops only when it is safe to do so. Never enter fast-moving floodwater.",
      "For example, Assam's Brahmaputra and its tributaries can overflow during heavy monsoon rain,",
      "flooding low-lying villages and farmland across the river islands and valley.",
    ].join("\n");
    this.add.text(left, top + 84, explanation, { fontFamily: "Georgia", fontSize: this.width < 700 ? "14px" : "17px", color: "#ffffff", lineSpacing: 8, wordWrap: { width: panelWidth - 68 } }).setDepth(21);
    const contextY = top + (this.width < 700 ? 255 : 295);
    this.add.rectangle(left, contextY, panelWidth - 68, 82, 0x10434b, 0.95).setOrigin(0, 0).setStrokeStyle(1, COLORS.teal).setDepth(21);
    this.add.text(left + 18, contextY + 13, "TODAY'S STORY  |  KOSI BASIN, BIHAR", { fontFamily: "Georgia", fontSize: "15px", color: COLORS.cream, fontStyle: "bold" }).setDepth(22);
    this.add.text(left + 18, contextY + 39, "Help a farmer protect three paddy plots after a heavy monsoon downpour.", { fontFamily: "Georgia", fontSize: "15px", color: COLORS.pale, wordWrap: { width: panelWidth - 104 } }).setDepth(22);
    const buttonY = panelY + panelHeight / 2 - 48;
    const button = this.add.rectangle(panelX, buttonY, 280, 48, COLORS.teal, 1).setStrokeStyle(2, 0xa8e6d6).setInteractive({ useHandCursor: true }).setDepth(21);
    this.add.text(panelX, buttonY, "BEGIN MISSION  →", { fontFamily: "Georgia", fontSize: "18px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5).setDepth(22);
    button.on("pointerdown", () => this.startMission(1));
  }

  startMission(level) {
    if (!this.introVisible) return;
    this.introVisible = false;
    this.children.list.filter((child) => child.depth >= 20).forEach((child) => child.destroy());
    this.startLevel(level);
  }

  startLevel(level) {
    this.level = level;
    this.levelComplete = false;
    this.background.setTexture(level === 2 ? "floodedFarmland" : "farm");
    this.children.list.filter((child) => child.depth >= 20 || (child.depth >= 2 && child.depth <= 13)).forEach((child) => child.destroy());
    this.saved = 0;
    this.createMissionUi();
    this.createControls();
    this.spawnTargets();
    this.spawnStraw();
  }

  createMissionUi() {
    this.add.rectangle(this.width / 2, 58, this.width - 40, 78, COLORS.ink, 0.94).setStrokeStyle(2, COLORS.teal).setDepth(10);
    this.add.text(34, 30, "FLOODGUARD INDIA", { fontFamily: "Georgia", fontSize: "26px", color: COLORS.cream, fontStyle: "bold" }).setDepth(11);
    const title = this.level === 2 ? "LEVEL 2  |  Flood recovery  |  Drain the flooded areas" : "LEVEL 1  |  Kosi basin, Bihar  |  Save the paddy harvest";
    this.add.text(36, 66, title, { fontFamily: "Georgia", fontSize: "16px", color: COLORS.pale }).setDepth(11);
    this.targetTotal = this.level === 2 ? 4 : 3;
    this.counter = this.add.text(this.width - 34, 38, `0 / ${this.targetTotal} ZONES`, { fontFamily: "Georgia", fontSize: "19px", color: "#ffffff", fontStyle: "bold" }).setOrigin(1, 0).setDepth(11);
    this.status = this.add.text(this.width - 34, 70, this.level === 2 ? "DRAIN THE BLUE ZONES" : "PROTECT THE RED ZONES", { fontFamily: "Georgia", fontSize: "13px", color: "#ffcf91" }).setOrigin(1, 0).setDepth(11);
    this.add.rectangle(this.width / 2, this.height - 35, this.width - 40, 46, COLORS.ink, 0.94).setStrokeStyle(2, COLORS.teal).setDepth(10);
    this.add.text(30, this.height - 50, "MOVE: ARROWS / WASD    PICK UP OR PLACE: SPACE", { fontFamily: "Georgia", fontSize: "15px", color: COLORS.pale }).setDepth(11);
  }

  createControls() {
    this.keys = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    const x = this.width - 110;
    const y = this.height - 90;
    [["▲", 0, -30, "up"], ["▼", 0, 30, "down"], ["◀", -34, 0, "left"], ["▶", 34, 0, "right"]].forEach(([label, dx, dy, direction]) => {
      const button = this.add.rectangle(x + dx, y + dy, 30, 26, 0x176d70, 0.98).setStrokeStyle(1, 0xa8e6d6).setInteractive({ useHandCursor: true }).setDepth(12);
      this.add.text(x + dx, y + dy, label, { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5).setDepth(13);
      button.on("pointerdown", () => this.move(direction));
    });
  }

  spawnTargets() {
    const playTop = 150;
    const playBottom = this.height - 80;
    const ratios = this.level === 2 ? [0.28, 0.48, 0.68, 0.86] : [0.38, 0.60, 0.80];
    this.targets = ratios.map((ratio, index) => {
      const spot = { x: this.width * ratio, y: playTop + (index % 2) * ((playBottom - playTop) * 0.44) + 65 };
      const zone = this.add.rectangle(spot.x, spot.y, 132, 72, this.level === 2 ? 0x267bb5 : COLORS.red, 0.86).setStrokeStyle(3, 0xffc46b).setDepth(2);
      const label = this.add.text(spot.x, spot.y, `${this.level === 2 ? "FLOODED AREA" : "PADDY PLOT"}\n${index + 1}`, { fontFamily: "Georgia", fontSize: "15px", color: "#fff4dc", fontStyle: "bold", align: "center" }).setOrigin(0.5).setDepth(3);
      this.tweens.add({ targets: zone, alpha: 0.55, duration: 650, yoyo: true, repeat: -1 });
      return { zone, label, x: spot.x, y: spot.y, covered: false };
    });
  }

  spawnStraw() {
    this.strawHome = { x: this.width * 0.18, y: this.height * 0.53 };
    const resourceKey = this.level === 2 ? "pipe" : "straw";
    this.straw = this.add.image(this.strawHome.x, this.strawHome.y, resourceKey).setScale(0.18).setDepth(4);
    this.add.text(this.strawHome.x, this.strawHome.y + 58, this.level === 2 ? "DRAINAGE PIPE" : "STRAW MAT", { fontFamily: "Georgia", fontSize: "15px", color: "#ffe2a3" }).setOrigin(0.5).setDepth(4);
    this.farmer = this.add.image(this.width * 0.10, this.height - 140, "farmer").setScale(0.18).setDepth(5);
    this.hasStraw = false;
  }

  update() {
    if (this.introVisible || !this.keys) return;
    if (this.keys.left.isDown) this.move("left"); else if (this.keys.right.isDown) this.move("right"); else if (this.keys.up.isDown) this.move("up"); else if (this.keys.down.isDown) this.move("down");
    if (Phaser.Input.Keyboard.JustDown(this.keys.space)) this.interact();
    if (Phaser.Input.Keyboard.JustDown(this.wasd.W)) this.move("up");
    if (Phaser.Input.Keyboard.JustDown(this.wasd.A)) this.move("left");
    if (Phaser.Input.Keyboard.JustDown(this.wasd.S)) this.move("down");
    if (Phaser.Input.Keyboard.JustDown(this.wasd.D)) this.move("right");
  }

  move(direction) {
    const step = 8;
    this.farmer.x = Phaser.Math.Clamp(this.farmer.x + (direction === "left" ? -step : direction === "right" ? step : 0), 42, this.width - 42);
    this.farmer.y = Phaser.Math.Clamp(this.farmer.y + (direction === "up" ? -step : direction === "down" ? step : 0), 150, this.height - 78);
    if (!this.hasStraw && Phaser.Math.Distance.Between(this.farmer.x, this.farmer.y, this.straw.x, this.straw.y) < 70) this.pickup();
    if (this.hasStraw) this.straw.setPosition(this.farmer.x + 28, this.farmer.y - 18);
    this.targets.forEach((target) => { if (this.hasStraw && !target.covered && Phaser.Math.Distance.Between(this.farmer.x, this.farmer.y, target.x, target.y) < 85) this.cover(target); });
  }

  pickup() { this.hasStraw = true; this.straw.setTint(0xffe09a); }

  interact() {
    if (!this.hasStraw) this.pickup();
    else this.targets.forEach((target) => { if (!target.covered && Phaser.Math.Distance.Between(this.farmer.x, this.farmer.y, target.x, target.y) < 95) this.cover(target); });
  }

  cover(target) {
    target.covered = true;
    this.saved += 1;
    target.zone.setFillStyle(COLORS.green, 0.9).setStrokeStyle(3, 0xb8f0c5);
    target.label.setText("SAFE").setFontSize(18);
    this.counter.setText(`${this.saved} / ${this.targetTotal} ZONES`);
    this.status.setText(this.saved === this.targetTotal ? (this.level === 2 ? "FLOODWATERS DRAINED" : "HARVEST SAVED") : (this.level === 2 ? "DRAIN THE BLUE ZONES" : "PROTECT THE RED ZONES"));
    this.status.setColor(this.saved === this.targetTotal ? "#b8f0c5" : "#ffcf91");
    this.hasStraw = false;
    this.straw.setPosition(this.strawHome.x, this.strawHome.y).clearTint();
    if (this.saved === this.targetTotal) this.showVictory();
  }

  showVictory() {
    this.levelComplete = true;
    this.add.rectangle(this.width / 2, this.height / 2, 560, 190, COLORS.ink, 0.97).setStrokeStyle(3, 0xf4d58d).setDepth(20);
    const heading = this.level === 1 ? "LEVEL 1 COMPLETE" : "INDIA FLOOD MISSION COMPLETE";
    const message = this.level === 1 ? "The paddy harvest is protected." : "The floodwaters have been drained and the crops can recover.";
    this.add.text(this.width / 2, this.height / 2 - 52, heading, { fontFamily: "Georgia", fontSize: this.level === 1 ? "30px" : "24px", color: COLORS.cream, fontStyle: "bold", align: "center" }).setOrigin(0.5).setDepth(21);
    this.add.text(this.width / 2, this.height / 2 - 12, message, { fontFamily: "Georgia", fontSize: "18px", color: "#ffffff" }).setOrigin(0.5).setDepth(21);
    if (this.level === 1) {
      const button = this.add.rectangle(this.width / 2, this.height / 2 + 45, 260, 42, COLORS.teal, 1).setStrokeStyle(2, 0xa8e6d6).setInteractive({ useHandCursor: true }).setDepth(21);
      this.add.text(this.width / 2, this.height / 2 + 45, "NEXT: FLOOD RECOVERY  →", { fontFamily: "Georgia", fontSize: "15px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5).setDepth(22);
      button.on("pointerdown", () => this.startLevel(2));
    } else {
      this.add.text(this.width / 2, this.height / 2 + 45, "Press SPACE to replay Level 2", { fontFamily: "Georgia", fontSize: "16px", color: COLORS.pale }).setOrigin(0.5).setDepth(21);
    }
  }
}
