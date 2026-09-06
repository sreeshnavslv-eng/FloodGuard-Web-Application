import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const dialogPhases = {
  introduction: [
    "Hello Farmer! 🌱\nDroughts cause severe crop damage each year",
    "Let's Solve the Drought Issues !",
    "Here’s a map showing drought conditions in USA region \n As you can see, many areas are marked in red — a clear sign of severe drought.",
    "Let's play a mini-game to recover soil and reduce drought.",
  ],
};

// --- INTRO SCENE ---
// --- INTRO SCENE ---
// --- INTRO SCENE ---
// --- INTRO SCENE ---
// --- INTRO SCENE ---
export class DroughtScene extends Phaser.Scene {
  constructor() {
    super("droughtScene");
  }

  preload() {
    this.load.image("dbg", "./assets/droughtbg.jpeg");
    this.load.image("map", "./assets/map.jpeg");
    this.load.image("Sam", "./assets/sam2.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    // Load click sound
    this.load.audio("clickSound", "./assets/click.mp3");

    // Load wrong and right soundtrack sounds
    this.load.audio("wrongSound", "./assets/sound/wrong_soundtrack.mp3");
    this.load.audio("rightSound", "./assets/sound/right-soundtrack.mp3");

    // No background music loading
  }

  create() {
    const { width, height } = sizes;
    this.dialogIndex = 0;
    this.playButtonCreated = false;
    this.currentMapDialog = false;
    this.dialogActive = true; // NEW: Track if dialog is active

    // Initialize audio
    this.clickSound = this.sound.add("clickSound", { volume: 0.3 });
    this.wrongSound = this.sound.add("wrongSound", { volume: 0.4 });
    this.rightSound = this.sound.add("rightSound", { volume: 0.4 });

    // No background music - only click sounds

    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    // Add spacebar input for dialog continuation
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.createPixelatedBackground();
    this.createMainBackground(centerX, centerY);
    this.createParticleEffects();
    this.createTitle();
    this.createBackButton();
    this.createSamSprite();
    this.createDialogBox();
    this.addDecorativeElements();

    // Fade in entrance
    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.typewriteDialog(dialogPhases.introduction[0]);
    });

    // Remove the drop interactions since they're not needed in intro
    // this.correctDrop = this.add.image(width / 2 - 100, height / 2, "drop")...
    // this.wrongDrop = this.add.image(width / 2 + 100, height / 2, "drop")...
  }

  update() {
    // Check for spacebar press to advance dialog (only when dialog is active)
    if (this.dialogActive && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.clickSound.play();
      if (this.dialogContainer && this.dialogContainer.alpha > 0) {
        if (this.isTyping) {
          this.completeTypewriter();
        } else if (this.clickText && this.clickText.visible) {
          this.advanceDialog();
        }
      }
    }

    // Allow Spacebar to start game when button is visible
    if (
      this.playButtonCreated &&
      Phaser.Input.Keyboard.JustDown(this.spaceKey)
    ) {
      this.clickSound.play();
      this.startGameTransition();
    }
  }

  createMainBackground(centerX, centerY) {
    this.bg = this.add.image(centerX, centerY, "dbg").setOrigin(0.5);
    this.bg.displayWidth = this.sys.game.config.width;
    this.bg.displayHeight = this.sys.game.config.height;
    this.bg.setDepth(0);
    this.bg.setAlpha(0.7);

    this.tweens.add({
      targets: this.bg,
      alpha: 0.8,
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  createPixelatedBackground() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;
    const pixelContainer = this.add.container(0, 0).setDepth(0.5);

    for (let x = 0; x < width; x += 40) {
      for (let y = 0; y < height; y += 40) {
        if (Math.random() > 0.92) {
          const pixel = this.add.rectangle(
            x + Math.random() * 40,
            y + Math.random() * 40,
            8,
            8,
            0x88cc88,
            0.2
          );
          pixelContainer.add(pixel);
        }
      }
    }
  }

  createParticleEffects() {
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * this.sys.game.config.width;
      const y = Math.random() * this.sys.game.config.height;
      const particle = this.add.circle(x, y, 2, 0xffff88, 0.3).setDepth(1);

      this.tweens.add({
        targets: particle,
        y: y - 50 - Math.random() * 100,
        x: x + (Math.random() - 0.5) * 100,
        alpha: 0,
        duration: 3000 + Math.random() * 2000,
        repeat: -1,
        delay: Math.random() * 2000,
        ease: "Sine.inOut",
      });
    }
  }

  createTitle() {
    const width = this.sys.game.config.width;

    const titleBg = this.add.rectangle(
      width / 2,
      40,
      width - 60,
      60,
      0xeab72a,
      0.9
    );
    titleBg.setStrokeStyle(4, 0xc19213);
    titleBg.setDepth(15);

    this.titleText = this.add
      .text(width / 2, 40, "DROUGHT DEFENDER", {
        fontSize: "24px",
        fontFamily: "'Press Start 2P', Courier New",
        color: "#ffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(15);

    const subtitle = this.add
      .text(width / 2, 62, "A Learning Adventure", {
        fontSize: "10px",
        fontFamily: "Courier New",
        color: "#ffffffff",
        fontStyle: "italic",
      })
      .setOrigin(0.5)
      .setDepth(15);

    this.tweens.add({
      targets: [titleBg, this.titleText, subtitle],
      y: "+=2",
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  createBackButton() {
    const backBtn = this.add.container(80, 110).setDepth(20);

    const btnBg = this.add
      .rectangle(0, 0, 140, 50, 0xf4af0b, 1.0)
      .setStrokeStyle(3, 0x573a07)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add
      .text(0, 0, "← BACK", {
        fontSize: "14px",
        fontFamily: "Courier New",
        color: "#f9f7f5ff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    backBtn.add([btnBg, btnText]);

    btnBg.on("pointerdown", () => {
      this.clickSound.play();
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.stop();
        this.scene.start("exploreScene");
      });
    });

    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0xf4af0b, 1);
      this.tweens.add({ targets: backBtn, scale: 1.1, duration: 100 });
    });

    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0xf4af0b, 0.95);
      this.tweens.add({ targets: backBtn, scale: 1, duration: 100 });
    });
  }

  createSamSprite() {
    this.sam = this.add
      .sprite(500, sizes.height - 110, "Sam")
      .setScale(0.2)
      .setDepth(12)
      .setAlpha(0);

    this.tweens.add({
      targets: this.sam,
      alpha: 1,
      duration: 1000,
      ease: "Power2",
    });

    this.tweens.add({
      targets: this.sam,
      y: this.sam.y - 10,
      scale: 0.21,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  createDialogBox() {
    this.dialogContainer = this.add
      .container(sizes.width / 2 + 100, sizes.height - 80)
      .setDepth(10)
      .setAlpha(0);

    const dialogBoxBg = this.add
      .rectangle(0, 0, 600, 90, 0x975603, 0.98)
      .setStrokeStyle(4, 0xc46602)
      .setInteractive({ useHandCursor: true }); // Make only the bg interactive

    const speakerBg = this.add.rectangle(-230, -50, 160, 30, 0xf4af0b);
    const speakerText = this.add
      .text(-230, -50, "Sam", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "11px",
        color: "#0a2f4a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.dialogText = this.add
      .text(0, -20, "", {
        fontFamily: "Courier New",
        fontSize: "15px",
        color: "#e0f7ff",
        wordWrap: { width: 560, useAdvancedWrap: true },
        align: "center",
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    this.clickText = this.add
      .text(0, 20, "▼ CLICK TO CONTINUE ▼", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "9px",
        color: "#f46f36d2",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.tweens.add({
      targets: this.clickText,
      alpha: 0.4,
      y: 48,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.dialogContainer.add([
      dialogBoxBg,
      speakerBg,
      speakerText,
      this.dialogText,
      this.clickText,
    ]);

    this.tweens.add({
      targets: this.dialogContainer,
      alpha: 1,
      duration: 800,
      ease: "Power2",
    });

    // Store reference to the interactive element
    this.dialogInteractiveBg = dialogBoxBg;

    dialogBoxBg.on("pointerdown", () => {
      this.clickSound.play();
      if (this.isTyping) {
        this.completeTypewriter();
      } else if (this.clickText.visible) {
        this.advanceDialog();
      }
    });
  }

  addDecorativeElements() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    for (let i = 0; i < 10; i++) {
      const x = 40 + i * 20;
      const wave = this.add
        .circle(x, height - 35, 5, 0x4499dd, 0.6)
        .setDepth(2);

      this.tweens.add({
        targets: wave,
        alpha: 0.3,
        y: wave.y - 3,
        duration: 1200 + i * 100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }
  }

  showMap() {
    const { width, height } = sizes;
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    const borderThickness = 20;
    const borderColor = 0xe39711;
    const borderAlpha = 0.3;

    this.mapImage = this.add
      .image(centerX, centerY, "map")
      .setOrigin(0.5)
      .setAlpha(0);
    this.mapImage.displayWidth = width / 2;
    this.mapImage.displayHeight = height / 2;
    this.mapImage.setDepth(1);

    this.mapBorder = this.add
      .rectangle(
        centerX,
        centerY,
        this.mapImage.displayWidth + borderThickness,
        this.mapImage.displayHeight + borderThickness,
        borderColor,
        0
      )
      .setOrigin(0.5)
      .setDepth(0.9);

    this.mapBorder.setStrokeStyle(4, borderColor, 0);

    this.tweens.add({
      targets: [this.mapImage, this.mapBorder],
      alpha: 0.95,
      duration: 1000,
      ease: "Power2",
    });

    this.currentMapDialog = true;
  }

  hideMap() {
    if (this.mapImage && this.mapBorder) {
      this.tweens.add({
        targets: [this.mapImage, this.mapBorder],
        alpha: 0,
        duration: 500,
        ease: "Power2",
        onComplete: () => {
          if (this.mapImage) {
            this.mapImage.destroy();
            this.mapImage = null;
          }
          if (this.mapBorder) {
            this.mapBorder.destroy();
            this.mapBorder = null;
          }
        },
      });
    }
    this.currentMapDialog = false;
  }

  advanceDialog() {
    if (this.currentMapDialog && this.dialogIndex >= 0) {
      const currentText = dialogPhases.introduction[this.dialogIndex];
      if (!currentText.startsWith("Here's a map showing drought conditions")) {
        this.hideMap();
      }
    }

    this.dialogIndex++;

    if (this.dialogIndex >= dialogPhases.introduction.length) {
      this.hideMap();

      // COMPLETELY disable dialog interactions
      this.dialogActive = false;
      if (this.dialogInteractiveBg) {
        this.dialogInteractiveBg.disableInteractive();
      }

      // Hide dialog container
      this.tweens.add({
        targets: this.dialogContainer,
        alpha: 0,
        duration: 500,
        ease: "Power2",
        onComplete: () => {
          this.dialogContainer.setVisible(false);
        },
      });

      this.showPlayButton();
      return;
    }
    this.typewriteDialog(dialogPhases.introduction[this.dialogIndex]);
  }

  typewriteDialog(text) {
    this.isTyping = true;
    this.currentTypewriterText = text;
    this.dialogText.setText("");
    this.clickText.setVisible(false);

    let i = 0;

    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
    }

    if (
      text.startsWith(
        "Here’s a map showing drought conditions in USA region \n As you can see, many areas are marked in red — a clear sign of severe drought."
      )
    ) {
      this.showMap();
    }

    this.typewriterTimer = this.time.addEvent({
      delay: 45,
      callback: () => {
        this.dialogText.text += text[i];
        i++;
        if (i >= text.length) {
          this.typewriterTimer.remove();
          this.isTyping = false;
          this.clickText.setVisible(true);
        }
      },
      loop: true,
    });
  }

  completeTypewriter() {
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
    }
    this.dialogText.setText(this.currentTypewriterText);
    this.isTyping = false;
    this.clickText.setVisible(true);
  }

  showPlayButton() {
    if (this.playButtonCreated) return;
    this.playButtonCreated = true;

    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    this.buttonContainer = this.add
      .container(width / 2, height / 2 - 20)
      .setDepth(20)
      .setAlpha(0);

    const buttonBg = this.add
      .rectangle(0, 0, 220, 70, 0xe39711)
      .setStrokeStyle(5, 0xe39711)
      .setInteractive({ useHandCursor: true });

    const buttonText = this.add
      .text(0, 0, "▶ START GAME", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const glow = this.add
      .rectangle(0, 0, 230, 80, 0xe39711, 0.3)
      .setStrokeStyle(2, 0xe39711);

    this.buttonContainer.add([glow, buttonBg, buttonText]);

    this.tweens.add({
      targets: this.buttonContainer,
      alpha: 1,
      scale: 1.05,
      duration: 600,
      ease: "Back.easeOut",
    });

    this.tweens.add({
      targets: this.buttonContainer,
      scale: 1.12,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Store reference to the button for cleanup
    this.startButtonBg = buttonBg;

    buttonBg.on("pointerdown", () => {
      this.startGameTransition();
    });

    buttonBg.on("pointerover", () => {
      buttonBg.setFillStyle(0xf1b447);
      buttonText.setColor("#000000");
      this.tweens.add({
        targets: this.buttonContainer,
        scale: 1.15,
        duration: 150,
      });
    });

    buttonBg.on("pointerout", () => {
      buttonBg.setFillStyle(0xe39711);
      buttonText.setColor("#ffffff");
    });
  }

  startGameTransition() {
    console.log("🎮 Starting game transition to PlayScene");

    // Disable the start button to prevent multiple clicks
    if (this.startButtonBg) {
      this.startButtonBg.disableInteractive();
    }

    this.cameras.main.shake(100, 0.002);
    this.cameras.main.fade(800, 0, 0, 0);

    this.time.delayedCall(800, () => {
      console.log("🚀 Loading PlayScene");
      this.scene.start("PlayScene");
      this.scene.stop();
    });
  }
}
// --- PLAY SCENE ---
// --- PLAY SCENE ---
// --- PLAY SCENE ---
// --- PLAY SCENE ---
export class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
  }

  preload() {
    this.load.image(
      "drop",
      "https://png.pngtree.com/png-vector/20221028/ourmid/pngtree-water-drop-pixel-art-design-logo-water-leaf-leaf-vector-png-image_39882438.png"
    );
    this.load.spritesheet("farmer", "./assets/farmerr.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.image("Sam", "./assets/sam2.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    // Load click sound
    this.load.audio("clickSound", "./assets/click.mp3");

    // Load wrong and right soundtrack sounds
    this.load.audio("wrongSound", "./assets/sound/wrong_soundtrack.mp3");
    this.load.audio("rightSound", "./assets/sound/right-soundtrack.mp3");

    // No background music loading
  }

  create() {
    const { width, height } = sizes;

    // Initialize audio
    this.clickSound = this.sound.add("clickSound", { volume: 0.3 });
    this.wrongSound = this.sound.add("wrongSound", { volume: 0.4 });
    this.rightSound = this.sound.add("rightSound", { volume: 0.4 });

    // No background music - only click sounds

    this.createOliveBackground(width, height);

    this.dialogPhases = [
      "Welcome to the Water Challenge, Henry! 💧",
      "Hi Sam, I would like to reduce the drought in my crops, could you help?",
      "Yes, of course!\nYour goal is to find the correct amount of water usage to revive the crops.",
      "If you choose correctly the soil turns green, otherwise brown.\nLet's start and make the farm green again! Good Luck Henry.",

    ];

    this.dialogIndex = 0;

    // Add spacebar input for dialog continuation
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.createFarmerSprite(); // Henry - positioned left of dialog
    this.createSamSprite(); // Sam - positioned right of dialog
    this.createDialogBox();

    this.time.delayedCall(500, () => {
      this.typewriteDialog(this.dialogPhases[0]);
    });
  }

  update() {
    // Check for spacebar press to advance dialog
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.dialogContainer && this.dialogContainer.alpha > 0) {
        if (this.isTyping) {
          this.completeTypewriter();
        } else if (this.clickText && this.clickText.visible) {
          this.advanceDialog();
        }
      }
    }
  }

  createSamSprite() {
    const { width, height } = sizes;

    // Position Sam on the RIGHT side of the dialog box
    this.sam = this.add
      .sprite(width - 200, height - 150, "Sam")
      .setScale(0.2)
      .setDepth(12)
      .setAlpha(0);

    this.tweens.add({
      targets: this.sam,
      alpha: 1,
      duration: 1000,
      ease: "Power2",
    });

    this.tweens.add({
      targets: this.sam,
      y: this.sam.y - 8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  createFarmerSprite() {
    const { width, height } = sizes;

    // NEW: Position Henry on the LEFT side of the dialog box (fixed position)
    this.farmer = this.add
      .sprite(150, height - 150, "farmer")
      .setScale(0.2)
      .setDepth(12)
      .setAlpha(0);

    // REMOVED: Draggable functionality and pointer events
    // this.farmer.setInteractive({ draggable: true }); // REMOVE THIS LINE

    this.tweens.add({
      targets: this.farmer,
      alpha: 1,
      duration: 1000,
      ease: "Power2",
    });

    this.tweens.add({
      targets: this.farmer,
      y: this.farmer.y - 8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // REMOVED: Pointer move and pointer down handlers for dragging
    // this.input.on('pointermove', (pointer) => {
    //   if (pointer.isDown) {
    //     this.farmer.x = Phaser.Math.Clamp(pointer.x, 50, sizes.width - 50);
    //     this.farmer.y = Phaser.Math.Clamp(pointer.y, 100, sizes.height - 100);
    //   }
    // });

    // REMOVED: Drop selection via farmer position
    // this.input.on('pointerdown', (pointer) => {
    //   if (this.options && !this.isTyping && this.gameStarted) {
    //     this.options.forEach((option, index) => {
    //       const drop = option.drop;
    //       const distance = Phaser.Math.Distance.Between(
    //         this.farmer.x, this.farmer.y,
    //         drop.x, drop.y
    //       );
    //       if (distance < 100) {
    //         const value = parseInt(option.label.text);
    //         if (value === this.correctWater) {
    //           this.handleCorrect();
    //         } else {
    //           this.handleWrong();
    //         }
    //       }
    //     });
    //   }
    // });
  }

  createOliveBackground(width, height) {
    this.farmBg = this.add.container(0, 0);
    this.tiles = [];
    const tileSize = 40;
    const soilShades = [0xded7c1, 0xcfc6a8, 0xb8b088, 0xeae4cd];

    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        const color = Phaser.Utils.Array.GetRandom(soilShades);
        const rect = this.add.rectangle(
          x + tileSize / 2,
          y + tileSize / 2,
          tileSize,
          tileSize,
          color
        );
        this.farmBg.add(rect);
        this.tiles.push(rect);
      }
    }
  }

  setBackgroundDark(isDark) {
    const darkShades = [0x6e5c3d, 0x5a4631, 0x4a3929, 0x3b2e21];
    const soilShades = [0xded7c1, 0xcfc6a8, 0xb8b088, 0xeae4cd];
    this.tiles.forEach((rect) => {
      rect.fillColor = isDark
        ? Phaser.Utils.Array.GetRandom(darkShades)
        : Phaser.Utils.Array.GetRandom(soilShades);
    });
  }

  setBackgroundGreen() {
    const oliveShades = [0xc5e384, 0xb4d88c, 0xa3cfa4, 0xd0e6a5];
    this.tiles.forEach((rect) => {
      rect.fillColor = Phaser.Utils.Array.GetRandom(oliveShades);
    });
  }

  createDialogBox() {
    const { width, height } = sizes;
    this.dialogContainer = this.add
      .container(width / 2, height - 80)
      .setDepth(10)
      .setAlpha(0);

    const dialogBoxBg = this.add.rectangle(0, 0, 600, 90, 0x975603, 0.98);
    dialogBoxBg.setStrokeStyle(4, 0xc46602);

    // UPDATED: Changed speaker to SAM and positioned it properly
    const speakerBg = this.add.rectangle(-230, -50, 160, 30, 0xf4af0b);
    const speakerText = this.add
      .text(-230, -50, "SAM", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "11px",
        color: "#0a2f4a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.dialogText = this.add
      .text(0, -20, "", {
        fontFamily: "Courier New",
        fontSize: "15px",
        color: "#e0f7ff",
        wordWrap: { width: 560, useAdvancedWrap: true },
        align: "center",
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    this.clickText = this.add
      .text(0, 20, "▼ CLICK TO CONTINUE ▼", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "9px",
        color: "#f46f36d2",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.dialogContainer.add([
      dialogBoxBg,
      speakerBg,
      this.speakerText = speakerText,
      this.dialogText,
      this.clickText,
    ]);

    this.tweens.add({
      targets: this.dialogContainer,
      alpha: 1,
      duration: 800,
      ease: "Power2",
    });

    dialogBoxBg.setInteractive();
    dialogBoxBg.on("pointerdown", () => {
      this.clickSound.play();
      if (this.isTyping) {
        this.completeTypewriter();
      } else if (this.clickText.visible) {
        this.advanceDialog();
      }
    });

    this.tweens.add({
      targets: this.dialogContainer,
      y: this.dialogContainer.y - 4,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  advanceDialog() {
    this.dialogIndex++;
    if (this.dialogIndex >= this.dialogPhases.length) {
      this.dialogContainer.destroy();
      this.startGame();
      return;
    }
    this.typewriteDialog(this.dialogPhases[this.dialogIndex]);
  }

  typewriteDialog(text) {



    this.isTyping = true;
    this.currentTypewriterText = text;
    this.dialogText.setText("");
    this.clickText.setVisible(false);

    if (text.startsWith("Hi Sam")){
    this.speakerText.setText("HENRY");
    this.speakerText.setColor("#ffffffff");
  } else  {
    this.speakerText.setText("SAM");
    this.speakerText.setColor("#1c1717"); 
  }

    let i = 0;
    if (this.typewriterTimer) this.typewriterTimer.remove();

    this.typewriterTimer = this.time.addEvent({
      delay: 45,
      callback: () => {
        this.dialogText.text += text[i];
        i++;
        if (i >= text.length) {
          this.typewriterTimer.remove();
          this.isTyping = false;
          this.clickText.setVisible(true);
        }
      },
      loop: true,
    });
  }

  completeTypewriter() {
    if (this.typewriterTimer) this.typewriterTimer.remove();
    this.dialogText.setText(this.currentTypewriterText);
    this.isTyping = false;
    this.clickText.setVisible(true);
  }

startGame() {
  const { width, height } = sizes;
  this.score = 0;
  this.round = 0;
  this.maxRounds = 5;
  this.gameStarted = true;

  if (this.farmer) {
    this.farmer.x = 150;
    this.farmer.y = height - 150;
  }

  // === SCORE BOX ===
  const scoreBg = this.add.rectangle(110, 50, 180, 55, 0x975603, 0.98);
  scoreBg.setStrokeStyle(4, 0xc46602);
  scoreBg.setDepth(15);

  this.scoreText = this.add.text(110, 50, "Score: 0", {
    fontFamily: "'Press Start 2P', Courier New",
    fontSize: "16px",
    color: "#ffffff",
    align: "center",
  })
  .setOrigin(0.5)
  .setDepth(16);

  // === TIMER BOX ===
  const timerBg = this.add.rectangle(width - 110, 50, 180, 55, 0x975603, 0.98);
  timerBg.setStrokeStyle(4, 0xc46602);
  timerBg.setDepth(15);

  this.timerText = this.add.text(width - 110, 50, "Time: 0", {
    fontFamily: "'Press Start 2P', Courier New",
    fontSize: "16px",
    color: "#ffffff",
    align: "center",
  })
  .setOrigin(0.5)
  .setDepth(16);

  // === ROUND BOX ===
  const roundBg = this.add.rectangle(width / 2, 50, 180, 55, 0x975603, 0.98);
  roundBg.setStrokeStyle(4, 0xc46602);
  roundBg.setDepth(15);

  this.roundText = this.add.text(width / 2, 50, "Round: 1", {
    fontFamily: "'Press Start 2P', Courier New",
    fontSize: "16px",
    color: "#ffffff",
    align: "center",
  })
  .setOrigin(0.5)
  .setDepth(16);

  // === EQUATION BOX (styled like title) ===
  const eqBg = this.add.rectangle(width / 2, 140, 700, 90, 0x975603, 0.98);
  eqBg.setStrokeStyle(4, 0xc46602);
  eqBg.setDepth(15);

  this.equationText = this.add.text(width / 2, 140, "", {
    fontFamily: "'Press Start 2P', Courier New",
    fontSize: "14px",
    color: "#ffffff",
    align: "center",
    wordWrap: { width: 650 },
    lineSpacing: 6,
  })
  .setOrigin(0.5)
  .setDepth(16);

  // Subtle float animation
  this.tweens.add({
    targets: [scoreBg, timerBg, roundBg, eqBg],
    y: "+=3",
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.inOut",
  });

  this.startNewRound();
}



  startNewRound() {
    if (this.round >= this.maxRounds) {
      this.scene.start("ResultScene", { score: this.score });
      return;
    }

    this.round++;
    this.clearOptions();
    this.tweens.add({
  targets: [this.equationBox, this.equationText],
  alpha: { from: 0, to: 1 },
  duration: 800,
  ease: "Power2",
});


    const { width, height } = sizes;
    this.temp = Phaser.Math.Between(20, 40);
    this.vegIndex = Phaser.Math.Between(1, 10);
    this.correctWater = Math.round(10 + this.temp * 0.5 - this.vegIndex * 2);

    this.roundText.setText(`Round ${this.round}`);
    this.equationText.setText(
  `💧 Water = 10 + (Temp × 0.5) – (Veg × 2)\n🌡️ Temp = ${this.temp}     🌿 Veg = ${this.vegIndex}`
);


    let wrong1 = Math.max(1, this.correctWater + Phaser.Math.Between(-5, 5));
    let wrong2 = Math.max(1, this.correctWater + Phaser.Math.Between(-10, 10));
    if (wrong1 === this.correctWater) wrong1++;
    if (wrong2 === this.correctWater || wrong2 === wrong1) wrong2 += 2;

    let answers = Phaser.Utils.Array.Shuffle([
      this.correctWater,
      wrong1,
      wrong2,
    ]);
    this.options = [];

    const spacing = 200;
    const startX = width / 2 - spacing;
    const yPos = height / 2;

    answers.forEach((val, i) => {
      const drop = this.add
        .image(startX + i * spacing, yPos, "drop")
        .setScale(0.3)
        .setDepth(10)
        .setAlpha(0.9)
        .setInteractive(); // ADDED: Make drops clickable

      const label = this.add
        .text(drop.x, drop.y + 70, val.toString(), {
          fontSize: "32px",
          color: "#1c1717ff",
          fontFamily: "Courier New",
          stroke: "#fff",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(11);

      // NEW: Add click handler to drops directly
      drop.on("pointerdown", () => {
        this.clickSound.play();
        if (this.gameStarted && !this.isTyping) {
          const value = parseInt(label.text);
          if (value === this.correctWater) {
            this.handleCorrect();
          } else {
            this.handleWrong();
          }
        }
      });

      this.tweens.add({
        targets: drop,
        scale: 0.32,
        alpha: 1,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });

      this.options.push({ drop, label, value: val });
    });

    this.startRoundTimer(20);
  }

  startRoundTimer(seconds) {
    if (this.roundTimer) this.roundTimer.remove();
    this.timeLeft = seconds;
    this.timerText.setText("Time: " + this.timeLeft);

    this.roundTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText("Time: " + this.timeLeft);
        if (this.timeLeft <= 0) {
          this.roundTimer.remove();
          this.handleWrong();
        }
      },
      loop: true,
    });
  }

  clearOptions() {
    if (this.options) {
      this.options.forEach((obj) => {
        obj.drop.destroy();
        obj.label.destroy();
      });
      this.options = [];
    }
  }

  handleCorrect() {
    this.rightSound.play();
    if (this.roundTimer) this.roundTimer.remove();
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    // Visual feedback for correct answer

    // Celebration particles
    // this.createCelebrationParticles(this.farmer.x, this.farmer.y);

    this.setBackgroundGreen();
    this.time.delayedCall(1200, () => {
      this.setBackgroundDark(false);
      this.startNewRound();
    });
  }

  handleWrong() {
    this.wrongSound.play();
    if (this.roundTimer) this.roundTimer.remove();
    this.score -= 5;
    if (this.score < 0) this.score = 0;
    this.scoreText.setText("Score: " + this.score);

    // Visual feedback for wrong answer

    this.setBackgroundDark(true);
    this.time.delayedCall(1200, () => {
      this.setBackgroundDark(false);
      this.startNewRound();
    });
  }

  createCelebrationParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      const particle = this.add.circle(x, y, 4, 0x00ff00, 0.8).setDepth(13);

      this.tweens.add({
        targets: particle,
        x: x + (Math.random() - 0.5) * 100,
        y: y - Math.random() * 80,
        alpha: 0,
        scale: 0,
        duration: 800,
        ease: "Power2",
      });
    }
  }
}
// --- RESULT SCENE ---
export class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }
  preload() {
    this.load.image("dbg", "./assets/drought.png");

    // Load click sound
    this.load.audio("clickSound", "./assets/click.mp3");

    // Load wrong and right soundtrack sounds
    this.load.audio("wrongSound", "./assets/sound/wrong_soundtrack.mp3");
    this.load.audio("rightSound", "./assets/sound/right-soundtrack.mp3");

    // No background music loading
  }

  create(data) {
    const { width, height } = this.scale;

    // Initialize audio
    this.clickSound = this.sound.add("clickSound", { volume: 0.3 });
    this.wrongSound = this.sound.add("wrongSound", { volume: 0.4 });
    this.rightSound = this.sound.add("rightSound", { volume: 0.4 });

    // No background music - only click sounds

    this.add
      .image(width / 2, height / 2, "dbg")
      .setOrigin(0.5)
      .setDisplaySize(width, height); // make it stretch to full screen

    // Get score passed from PlayScene
    let score = data.score ?? 0;

    // Background overlay (semi-transparent)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

    // Title
    this.add
      .text(width / 2, height / 2 - 180, "🌾 Game Over 🌾", {
        fontSize: "48px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Score
    this.add
      .text(width / 2, height / 2 - 80, `Your Score: ${score}`, {
        fontSize: "36px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Feedback message
    let feedback =
      score > 5
        ? "🌟 Great job,Henry! You saved your crops!"
        : "😢 Try again! Your crops need more water.";

    this.add
      .text(width / 2, height / 2 - 20, feedback, {
        fontSize: "24px",
        color: "#ffccff",
        wordWrap: { width: width - 100 },
      })
      .setOrigin(0.5);

    // --- Buttons ---
    // Play Again
    let playBtn = this.add
      .text(width / 2, height / 2 + 80, "▶ Play Again", {
        fontSize: "28px",
        backgroundColor: "#81460c",
        color: "#000000",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    playBtn.on("pointerover", () =>
      playBtn.setStyle({ backgroundColor: "#a86b2c" })
    );
    playBtn.on("pointerout", () =>
      playBtn.setStyle({ backgroundColor: "#81460c" })
    );

    playBtn.on("pointerdown", () => {
      this.scene.start("PlayScene");
    });

    // Main Menu
    let menuBtn = this.add
      .text(width / 2, height / 2 + 150, "🏠 Main Menu", {
        fontSize: "28px",
        backgroundColor: "#444444",
        color: "#ffffff",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    menuBtn.on("pointerover", () =>
      menuBtn.setStyle({ backgroundColor: "#666666" })
    );
    menuBtn.on("pointerout", () =>
      menuBtn.setStyle({ backgroundColor: "#444444" })
    );

    menuBtn.on("pointerdown", () => {
      this.clickSound.play();
      this.scene.start("exploreScene"); // Make sure you have a MainMenu scene
    });
  }
}