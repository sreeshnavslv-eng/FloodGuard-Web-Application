// import "./style.css"; // Commented out to avoid CSS loading issues
import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const dialogPhases = {
  introduction: [
    "Hey, Henry! Let's Explore Flooding Problems in my country!",
    "This is Pakistan before and after the 2022 Flood!",
    "Let's look at the crops during the flood...",
    "Oh?! The crops are super damaged!",
    "Let's play a mini-game to recover crops and soil.",
  ],
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.dialogIndex = 0;
    this.displayedImages = [];
  }

  preload() {
    this.load.image("bged", "assets/bgrain.jpg");
    this.load.image("farmer", "assets/farmerr.png");
    this.load.image("pakibef", "assets/pakibef.jpg");
    this.load.image("pakiafter", "assets/pakiafter.jpg");
    this.load.image("flood1", "assets/midwestflooding_pho_2025_lrg.jpg");
    this.load.image("flood3", "assets/midwestfloodingwide_pho_2025_lrg.jpg");
    this.load.image("pakifarmer", "assets/pakifarmer.png");
  }

  create() {
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    // Enhanced background with overlay
    this.cameras.main.setBackgroundColor("#0a1f2e");
    this.createAtmosphericBackground();

    this.bg = this.add.image(centerX, centerY, "bged").setOrigin(0.5);
    this.bg.displayWidth = this.sys.game.config.width;
    this.bg.displayHeight = this.sys.game.config.height;
    this.bg.setDepth(0);
    this.bg.setAlpha(0.5);

    this.createTitle();
    this.createBackButton();
    this.createFarmerSprite();
    this.createDialogBox();
    this.addDecorativeElements();

    // Fade in entrance
    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.typewriteDialog(dialogPhases.introduction[0]);
    });
  }

  createAtmosphericBackground() {
    // Subtle rain particles for atmosphere
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * this.sys.game.config.width;
      const y = Math.random() * this.sys.game.config.height;
      const raindrop = this.add
        .rectangle(x, y, 2, 8, 0x6699cc, 0.3)
        .setDepth(0.3);

      this.tweens.add({
        targets: raindrop,
        y: y + 200 + Math.random() * 100,
        alpha: 0,
        duration: 1500 + Math.random() * 1000,
        repeat: -1,
        delay: Math.random() * 2000,
        ease: "Linear",
      });
    }
  }

  createTitle() {
    const width = this.sys.game.config.width;

    const titleBg = this.add.rectangle(
      width / 2,
      40,
      width - 60,
      70,
      0x0a2f4a,
      0.95
    );
    titleBg.setStrokeStyle(4, 0x4499dd);
    titleBg.setDepth(15);

    this.titleText = this.add
      .text(width / 2, 35, "Flood Stories", {
        fontSize: "26px",
        fontFamily: "'Press Start 2P', Courier New",
        color: "#66ccff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(15);

    const subtitle = this.add
      .text(width / 2, 58, "From Around The World", {
        fontSize: "12px",
        fontFamily: "Courier New",
        color: "#88ddff",
        fontStyle: "italic",
      })
      .setOrigin(0.5)
      .setDepth(15);

    // Subtle pulse animation
    this.tweens.add({
      targets: [titleBg, this.titleText, subtitle],
      y: "+=2",
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Water drop decorations
    this.createTitleDecorations(width);
  }

  createTitleDecorations(width) {
    const leftDecor = this.add.container(90, 40).setDepth(15);
    const rightDecor = this.add.container(width - 90, 40).setDepth(15);

    for (let i = 0; i < 3; i++) {
      // Water drops instead of wheat
      const leftDrop = this.add.circle(i * 16, -10, 6, 0x4499dd);
      const leftRipple = this.add.circle(i * 16, 0, 8, 0x6699ff, 0.4);
      leftDecor.add([leftDrop, leftRipple]);

      const rightDrop = this.add.circle(-i * 16, -10, 6, 0x4499dd);
      const rightRipple = this.add.circle(-i * 16, 0, 8, 0x6699ff, 0.4);
      rightDecor.add([rightDrop, rightRipple]);
    }

    this.tweens.add({
      targets: [leftDecor, rightDecor],
      y: "+=5",
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  createBackButton() {
    const backBtn = this.add.container(80, 40).setDepth(20);

    const btnBg = this.add
      .rectangle(0, 0, 140, 50, 0x0a2f4a, 0.95)
      .setStrokeStyle(3, 0x4499dd)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add
      .text(0, 0, "← BACK", {
        fontSize: "14px",
        fontFamily: "Courier New",
        color: "#66ccff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    backBtn.add([btnBg, btnText]);

    btnBg.on("pointerdown", () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.stop();
        this.scene.start("exploreScene");
      });
    });

    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x1a4d6d, 1);
      this.tweens.add({ targets: backBtn, scale: 1.1, duration: 100 });
    });

    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x0a2f4a, 0.95);
      this.tweens.add({ targets: backBtn, scale: 1, duration: 100 });
    });
  }

  createFarmerSprite() {
    this.farmer = this.add
      .sprite(300, sizes.height - 110, "pakifarmer")
      .setScale(0.2)
      .setDepth(12)
      .setAlpha(0);

    // Fade in
    this.tweens.add({
      targets: this.farmer,
      alpha: 1,
      duration: 1000,
      ease: "Power2",
    });

    // Floating animation
    this.tweens.add({
      targets: this.farmer,
      y: this.farmer.y - 10,
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

    // Enhanced dialog box with better styling
    const dialogBoxBg = this.add.rectangle(0, 0, 500, 80, 0x0a2f4a, 0.98);
    dialogBoxBg.setStrokeStyle(4, 0x4499dd);

    // Speaker indicator
    const speakerBg = this.add.rectangle(-230, -50, 160, 30, 0x4499dd);
    const speakerText = this.add
      .text(-230, -50, "BILAL", {
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
        wordWrap: {
          width: 460, // Reduced from 560 to fit within the 500px box with padding
          useAdvancedWrap: true,
        },
        align: "center",
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    this.clickText = this.add
      .text(0, 55, "▼ CLICK TO CONTINUE ▼", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "9px",
        color: "#66ccff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.tweens.add({
      targets: this.clickText,
      alpha: 0.4,
      y: 58,
      duration: 700,
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

    // Fade in
    this.tweens.add({
      targets: this.dialogContainer,
      alpha: 1,
      duration: 800,
      ease: "Power2",
    });

    dialogBoxBg.setInteractive();
    dialogBoxBg.on("pointerdown", () => {
      if (this.isTyping) {
        this.completeTypewriter();
      } else if (this.clickText.visible) {
        this.advanceDialog();
      }
    });

    dialogBoxBg.on("pointerover", () => {
      dialogBoxBg.setStrokeStyle(4, 0x66ccff);
    });

    dialogBoxBg.on("pointerout", () => {
      dialogBoxBg.setStrokeStyle(4, 0x4499dd);
    });

    // Gentle float
    this.tweens.add({
      targets: this.dialogContainer,
      y: this.dialogContainer.y - 4,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  addDecorativeElements() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Bottom water-themed decorations
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

      const wave2 = this.add
        .circle(width - x, height - 35, 5, 0x4499dd, 0.6)
        .setDepth(2);
      this.tweens.add({
        targets: wave2,
        alpha: 0.3,
        y: wave2.y - 3,
        duration: 1200 + i * 100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }
  }

  advanceDialog() {
    this.dialogIndex++;

    if (this.dialogIndex >= dialogPhases.introduction.length) {
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

    if (text === "This is Pakistan before and after the 2022 Flood!") {
      this.time.delayedCall(600, () => this.displayRicePictures());
    }

    if (text === "Let's look at the crops during the flood...") {
      this.time.delayedCall(600, () => this.displayCrops());
    }

    if (text === "Let's play a mini-game to recover crops and soil.") {
      this.cameras.main.fade(800, 0, 0, 0);
      this.time.delayedCall(800, () => {
        this.scene.stop();
        this.scene.start("scene-flood");
      });
    }
  }

  completeTypewriter() {
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
    }
    this.dialogText.setText(this.currentTypewriterText);
    this.isTyping = false;
    this.clickText.setVisible(true);
  }

  displayRicePictures() {
    this.hideRicePictures();
    const width = sizes.width;
    const height = sizes.height;

    const container = this.add
      .container(width / 2, height / 2 - 40)
      .setDepth(9)
      .setAlpha(0);

    // Frame
    const outerFrame = this.add.rectangle(0, 0, 550, 320, 0x0a2f4a, 0.95);
    outerFrame.setStrokeStyle(5, 0x4499dd);

    const innerFrame = this.add.rectangle(0, 0, 520, 290, 0x1a3d5a);
    innerFrame.setStrokeStyle(3, 0x66ccff);

    // Title
    const titleBg = this.add.rectangle(0, -130, 280, 45, 0x4499dd);
    const titleText = this.add
      .text(0, -130, "Pakistan 2022 Flood", {
        fontSize: "16px",
        fontFamily: "'Press Start 2P', Courier New",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Image setup
    const imageWidth = 480;
    const imageHeight = 240;

    // Create both images positioned in the same place
    const beforeImage = this.add
      .image(0, 10, "pakibef")
      .setDisplaySize(imageWidth, imageHeight)
      .setAlpha(1); // Start with before image visible

    const afterImage = this.add
      .image(0, 10, "pakiafter")
      .setDisplaySize(imageWidth, imageHeight)
      .setAlpha(0); // Start with after image hidden

    // Simple slider bar
    const sliderBar = this.add
      .rectangle(0, 150, 300, 8, 0x666666)
      .setInteractive({ useHandCursor: true });

    const sliderHandle = this.add
      .circle(-150, 150, 12, 0x4499dd)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ draggable: true, useHandCursor: true });

    // Labels
    const beforeLabel = this.add
      .text(-180, 150, "BEFORE", {
        fontSize: "12px",
        fontFamily: "Courier New",
        color: "#66ccff",
      })
      .setOrigin(0.5);

    const afterLabel = this.add
      .text(180, 150, "AFTER", {
        fontSize: "12px",
        fontFamily: "Courier New",
        color: "#66ccff",
      })
      .setOrigin(0.5);

    // Slider functionality
    const onDrag = (pointer, dragX) => {
      const minX = -150;
      const maxX = 150;
      const newX = Phaser.Math.Clamp(dragX, minX, maxX);

      sliderHandle.x = newX;

      // Calculate alpha values based on slider position
      const progress = (newX - minX) / (maxX - minX);
      beforeImage.setAlpha(1 - progress);
      afterImage.setAlpha(progress);
    };

    sliderHandle.on("drag", onDrag);

    // Also make the slider bar clickable
    sliderBar.on("pointerdown", (pointer) => {
      const localX = pointer.x - width / 2;
      onDrag(pointer, localX);
    });

    container.add([
      outerFrame,
      innerFrame,
      titleBg,
      titleText,
      beforeImage,
      afterImage,
      sliderBar,
      sliderHandle,
      beforeLabel,
      afterLabel,
    ]);

    this.displayedImages = [container];

    // Fade in
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: { from: 0.9, to: 1 },
      duration: 600,
      ease: "Back.easeOut",
    });
  }
  hideRicePictures() {
    if (this.displayedImages.length > 0) {
      this.displayedImages.forEach((el) => {
        this.tweens.add({
          targets: el,
          alpha: 0,
          scale: 0.9,
          duration: 400,
          onComplete: () => el.destroy(),
        });
      });
      this.displayedImages = [];
    }

    // Clean up mask graphics
    if (this.currentMaskGraphics) {
      this.currentMaskGraphics.destroy();
      this.currentMaskGraphics = null;
    }
  }
  displayCrops() {
    this.hideCrops();
    const width = sizes.width;
    const height = sizes.height;

    const container = this.add
      .container(width / 2, height / 2 - 40)
      .setDepth(9)
      .setAlpha(0);

    // Enhanced frame
    const outerFrame = this.add.rectangle(0, 0, 650, 320, 0x0a2f4a, 0.95);
    outerFrame.setStrokeStyle(5, 0x4499dd);

    const titleBg = this.add.rectangle(0, -130, 240, 45, 0x4499dd);
    const titleText = this.add
      .text(0, -130, "Flooded Crops", {
        fontSize: "16px",
        fontFamily: "'Press Start 2P', Courier New",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Image containers with frames
    const pic1Container = this.add.container(-160, 10);
    const pic1Frame = this.add.rectangle(0, 0, 260, 260, 0x1a3d5a);
    pic1Frame.setStrokeStyle(3, 0x66ccff);
    const pic1 = this.add.image(0, 0, "flood1").setDisplaySize(240, 240);
    pic1Container.add([pic1Frame, pic1]);

    const pic2Container = this.add.container(160, 10);
    const pic2Frame = this.add.rectangle(0, 0, 260, 260, 0x1a3d5a);
    pic2Frame.setStrokeStyle(3, 0x66ccff);
    const pic2 = this.add.image(0, 0, "flood3").setDisplaySize(240, 240);
    pic2Container.add([pic2Frame, pic2]);

    container.add([
      outerFrame,
      titleBg,
      titleText,
      pic1Container,
      pic2Container,
    ]);

    this.displayedImages = [container];

    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: { from: 0.9, to: 1 },
      duration: 600,
      ease: "Back.easeOut",
    });

    this.tweens.add({
      targets: container,
      y: height / 2 - 35,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  hideCrops() {
    if (this.displayedImages.length > 0) {
      this.displayedImages.forEach((el) => {
        this.tweens.add({
          targets: el,
          alpha: 0,
          scale: 0.9,
          duration: 400,
          onComplete: () => el.destroy(),
        });
      });
      this.displayedImages = [];
    }
  }
}
