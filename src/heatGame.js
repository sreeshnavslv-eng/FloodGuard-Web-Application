import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";
import HeatmapScene from "./heatmapScene.js";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  // Get game instance from the canvas
  const gameInstance = gameCanvas.__phaserGame;
  if (gameInstance) {
    gameInstance.scale.resize(sizes.width, sizes.height);
  }
  gameCanvas.width = sizes.width;
  gameCanvas.height = sizes.height;
});

const gameCanvas = document.getElementById("gameCanvas");
gameCanvas.width = sizes.width;
gameCanvas.height = sizes.height;
const speedDown = 300;

export default class heatGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "heat-GameScene" });
    this.wheatSprites = [];
    this.answerButtons = [];
    this.gameComplete = false;
  }

  preload() {
    this.load.image("hot_field", "./assets/hot_field.jpg");

    // Load all sprite sheets in preload
    this.load.spritesheet("wheat", "./assets/wheat.png", {
      frameWidth: 384,
      frameHeight: 1024,
    });

    this.load.spritesheet("wheat_sink", "./assets/wheat_sink.png", {
      frameWidth: 384,
      frameHeight: 1024,
    });

    this.load.spritesheet("wheat_burn", "./assets/wheat_burn.png", {
      frameWidth: 384,
      frameHeight: 1024,
    });
    this.load.spritesheet("wheat_dry", "./assets/wheat_dry.png", {
      frameWidth: 384,
      frameHeight: 1024,
    });

    this.load.image("mulch_icon", "./assets/mulching.png");
    this.load.image("dry_icon", "./assets/breathe.png");
    this.load.image("sink_icon", "./assets/over_watering.png");
    this.load.image("indian_farmer", "./assets/indian_farmer.png");
    this.load.image("burn_icon", "./assets/burning.png");

    // Load click sound
    this.load.audio("clickSound", "./assets/click.mp3");

    // Load wrong and right soundtrack sounds
    this.load.audio("wrongSound", "./assets/sound/wrong_soundtrack.mp3");
    this.load.audio("rightSound", "./assets/sound/right-soundtrack.mp3");

    // No background music loading
  }

  create() {
    // Initialize click sound
    this.clickSound = this.sound.add("clickSound", { volume: 0.3 });

    // Initialize wrong and right soundtrack sounds
    this.wrongSound = this.sound.add("wrongSound", { volume: 0.4 });
    this.rightSound = this.sound.add("rightSound", { volume: 0.4 });

    // No background music - only click sounds

    // Ensure main UI overlay is visible and on top
    const overlay = document.getElementById("uiOverlay");
    if (overlay) {
      overlay.style.display = "";
      overlay.style.visibility = "visible";
      overlay.style.opacity = "1";
      overlay.style.zIndex = "10";
    }
    const bg = this.add.image(0, 0, "hot_field").setOrigin(0, 0);
    bg.displayWidth = this.sys.game.config.width;
    bg.displayHeight = this.sys.game.config.height;

    // Create animations for all sprite types - using single frames to prevent duration errors
    this.anims.create({
      key: "wheat_anim",
      frames: [{ key: "wheat", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: "wheat_grow_anim",
      frames: [{ key: "wheat", frame: 0 }],
      frameRate: 1,
      repeat: 0,
    });

    this.anims.create({
      key: "wheat_sink_anim",
      frames: [{ key: "wheat_sink", frame: 0 }],
      frameRate: 1,
      repeat: 0,
    });

    this.anims.create({
      key: "wheat_burn_anim",
      frames: [{ key: "wheat_burn", frame: 0 }],
      frameRate: 1,
      repeat: 0,
    });
    this.anims.create({
      key: "wheat_dry_anim",
      frames: [{ key: "wheat_dry", frame: 0 }],
      frameRate: 1,
      repeat: 0,
    });

    // Create wheat sprites and store them
    const wheat1 = this.add.sprite(600, 400, "wheat").setScale(0.3);
    wheat1.anims.play("wheat_anim");
    this.wheatSprites.push(wheat1);

    const wheat2 = this.add.sprite(720, 450, "wheat").setScale(0.3);
    wheat2.anims.play("wheat_anim");
    this.wheatSprites.push(wheat2);

    const wheat3 = this.add.sprite(840, 400, "wheat").setScale(0.3);
    wheat3.anims.play("wheat_anim");
    this.wheatSprites.push(wheat3);

    const wheat11 = this.add.sprite(980, 450, "wheat").setScale(0.3);
    wheat11.anims.play("wheat_anim");
    this.wheatSprites.push(wheat11);

    const wheat12 = this.add.sprite(1200, 400, "wheat").setScale(0.3);
    wheat12.anims.play("wheat_anim");
    this.wheatSprites.push(wheat12);

    const wheat14 = this.add.sprite(600, 600, "wheat").setScale(0.3);
    wheat14.anims.play("wheat_anim");
    this.wheatSprites.push(wheat14);

    const wheat15 = this.add.sprite(840, 600, "wheat").setScale(0.3);
    wheat15.anims.play("wheat_anim");
    this.wheatSprites.push(wheat15);

    const wheat16 = this.add.sprite(980, 600, "wheat").setScale(0.3);
    wheat16.anims.play("wheat_anim");
    this.wheatSprites.push(wheat16);

    const wheat17 = this.add.sprite(1180, 600, "wheat").setScale(0.3);
    wheat17.anims.play("wheat_anim");
    this.wheatSprites.push(wheat17);

    const wheat4 = this.add.sprite(500, 530, "wheat").setScale(0.3);
    wheat4.anims.play("wheat_anim");
    this.wheatSprites.push(wheat4);

    const wheat5 = this.add.sprite(650, 515, "wheat").setScale(0.3);
    wheat5.anims.play("wheat_anim");
    this.wheatSprites.push(wheat5);
    const wheat6 = this.add.sprite(800, 525, "wheat").setScale(0.3);
    wheat6.anims.play("wheat_anim");
    this.wheatSprites.push(wheat6);

    const wheat7 = this.add.sprite(950, 505, "wheat").setScale(0.3);
    wheat7.anims.play("wheat_anim");
    this.wheatSprites.push(wheat7);

    const wheat8 = this.add.sprite(1100, 535, "wheat").setScale(0.3);
    wheat8.anims.play("wheat_anim");
    this.wheatSprites.push(wheat8);
    const wheat9 = this.add.sprite(1250, 510, "wheat").setScale(0.3);
    wheat9.anims.play("wheat_anim");
    this.wheatSprites.push(wheat9);

    const wheat10 = this.add.sprite(1400, 520, "wheat").setScale(0.3);
    wheat10.anims.play("wheat_anim");
    this.wheatSprites.push(wheat10);

    // Hook up DOM UI
    this.ui = {
      answersList: document.getElementById("answersList"),
      feedback: document.getElementById("feedback"),
      tryAgainBtn: document.getElementById("tryAgainBtn"),
      nextBtn: document.getElementById("nextBtn"),
      title: document.getElementById("questionTitle"),
      subtitle: document.getElementById("questionSubtitle"),
    };

    // Populate answers in DOM using images + captions
    const answers = [
      {
        label: "A",
        text: "Mulching soil with leaves, plastic",

        key: "grow",
        img: "mulch_icon",
      },
      {
        label: "B",
        text: "Bare soil to breathe",

        key: "dry",
        img: "dry_icon",
      },
      {
        label: "C",
        text: "Over-water soil",

        key: "sink",
        img: "sink_icon",
      },
      {
        label: "D",
        text: "Burn residue",

        key: "burn",
        img: "burn_icon",
      },
    ];

    this.ui.answersList.innerHTML = "";
    this.answerButtons = [];
    answers.forEach((ans) => {
      const li = document.createElement("li");
      li.className = "answer answer-card";
      li.setAttribute("role", "button");
      li.tabIndex = 0;

      const keyBadge = document.createElement("div");
      keyBadge.className = "key-badge";
      keyBadge.textContent = ans.label;

      const img = document.createElement("div");
      img.className = "option-img";
      // Pull the Phaser-loaded image into a data URL to use in CSS background
      const tex = this.textures.get(ans.img);
      const source = tex && tex.getSourceImage ? tex.getSourceImage() : null;
      if (source) {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = source.width;
          canvas.height = source.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(source, 0, 0);
          const dataUrl = canvas.toDataURL();
          img.style.backgroundImage = `url('${dataUrl}')`;
        } catch (e) {
          // ignore
        }
      }

      const caption = document.createElement("div");
      caption.className = "option-caption";
      caption.innerHTML = `<span class="caption-title">${ans.text}</span>`;

      li.appendChild(keyBadge);
      li.appendChild(img);
      li.appendChild(caption);

      const onActivate = () => {
        this.clickSound.play();
        this.handleAnswer(ans.key);
      };
      li.addEventListener("click", onActivate);
      li.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          onActivate();
        }
      });

      this.ui.answersList.appendChild(li);
      this.answerButtons.push(li);
    });

    // Wire control buttons
    this.ui.tryAgainBtn.addEventListener("click", () => {
      this.clickSound.play();
      this.resetGame();
    });
    this.ui.nextBtn.addEventListener("click", () => {
      this.clickSound.play();
      this.nextLevel();
    });

    // Ensure initial state
    this.setFeedback("");
    this.ui.tryAgainBtn.hidden = true;
    this.ui.nextBtn.hidden = true;
  }

  handleAnswer(answerKey) {
    if (this.gameComplete) return;

    // Disable answer buttons during animation
    this.answerButtons.forEach((btn) => (btn.disabled = true));

    if (answerKey === "grow") {
      // Correct answer - show growing wheat
      this.rightSound.play();
      this.showCorrectAnswer();
    } else {
      // Wrong answer - show corresponding negative effect
      this.wrongSound.play();
      this.showWrongAnswer(answerKey);
    }
  }

  showCorrectAnswer() {
    this.setFeedback(
      "Correct! Mulching helps retain soil moisture and keeps it cool.",
      true
    );

    // Keep same anim and set scale to 0.5 on correct answer
    this.wheatSprites.forEach((wheat) => {
      wheat.setTexture("wheat");
      wheat.anims.play("wheat_anim");
      wheat.setScale(0.4);
    });

    this.gameComplete = true;

    // Show next level button after a delay
    this.time.delayedCall(2000, () => {
      this.ui.nextBtn.hidden = false;
    });
  }

  showWrongAnswer(answerKey) {
    let feedbackMsg = "";
    let animKey = "";

    switch (answerKey) {
      case "dry":
        feedbackMsg =
          "Wrong! Leaving soil bare increases evaporation and heat stress.";
        animKey = "wheat_dry_anim";
        break;
      case "sink":
        feedbackMsg =
          "Wrong! Over-watering can lead to waterlogging and root problems.";
        animKey = "wheat_sink_anim";
        break;
      case "burn":
        feedbackMsg =
          "Wrong! Burning residue removes protective cover and nutrients.";
        animKey = "wheat_burn_anim";
        break;
    }

    this.setFeedback(feedbackMsg, false);

    // Change all wheat sprites to show the negative effect
    this.wheatSprites.forEach((wheat) => {
      if (answerKey === "sink") {
        wheat.setTexture("wheat_sink");
        wheat.anims.play("wheat_sink_anim");
      } else if (answerKey === "dry") {
        wheat.setTexture("wheat_dry");
        wheat.anims.play("wheat_dry_anim");
      } else if (answerKey === "burn") {
        wheat.setTexture("wheat_burn");
        wheat.anims.play("wheat_burn_anim");
      }
      wheat.setScale(0.3);
    });

    // Show try again button after a delay
    this.time.delayedCall(2000, () => {
      this.ui.tryAgainBtn.hidden = false;
    });
  }

  resetGame() {
    // Reset wheat sprites to normal
    this.wheatSprites.forEach((wheat) => {
      wheat.setTexture("wheat");
      wheat.anims.play("wheat_anim");
      wheat.setScale(0.3);
    });

    // Hide feedback and buttons
    this.setFeedback("");
    this.ui.tryAgainBtn.hidden = true;
    this.ui.nextBtn.hidden = true;

    // Re-enable answer buttons
    this.answerButtons.forEach((btn) => {
      btn.disabled = false;
    });

    this.gameComplete = false;
  }

  nextLevel() {
    // Hide the UI overlay
    const uiOverlay = document.getElementById("uiOverlay");
    if (uiOverlay) {
      uiOverlay.style.display = "none";
    }

    // Navigate to explore scene
    this.scene.start("exploreScene");
  }

  update() {}

  // Helpers
  setFeedback(message, isSuccess) {
    if (!this.ui || !this.ui.feedback) return;
    const el = this.ui.feedback;
    el.textContent = message || "";
    if (!message) {
      el.hidden = true;
      el.classList.remove("success", "error");
      return;
    }
    el.hidden = false;
    el.classList.toggle("success", !!isSuccess);
    el.classList.toggle("error", isSuccess === false);
  }
}
