// import "./style.css"; // Commented out to avoid CSS loading issues
import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Enhanced dialog system with better pacing
const dialogPhases = {
  introduction: [
    "Hello, I am Henry! A local Farmer.",
    "This is my farm, and the crops keep wilting...",
    "I've tried everything, but nothing seems to work.",
    "The soil, the water, the weather... something's wrong.",
    "Can you help me figure out what's happening?",
    "Let's explore different crop problems and their solutions!",
    "Together, we can save the farm!",
  ],
};

export default class introScene extends Phaser.Scene {
  constructor() {
    super("scene-intro");
    this.dialogIndex = 0;
    this.displayedImages = [];
  }

  preload() {
    console.log("Intro scene preload started");

    this.load.image("bg", "./assets/introbg.jpg");
    this.load.image("farmer", "./assets/farmerr.png");
    this.load.image("wiltedcrop", "./assets/wiltedcrops.jpg");

    // Load click sound
    this.load.audio("clickSound", "./assets/click.mp3");

    // Load main background soundtrack
    this.load.audio("mainSoundtrack", "./assets/sound/main_soundtrack.mp3");

    // Add load event listeners
    this.load.on("complete", () => {
      console.log("Intro scene assets loaded successfully");
    });

    this.load.on("loaderror", (file) => {
      console.error("Failed to load asset:", file.key, file.url);
    });
  }

  create() {
    console.log("Intro scene create() called");

    // Initialize click sound
    this.clickSound = this.sound.add("clickSound", { volume: 0.3 });

    // Initialize and play main background soundtrack (only if not already playing)
    if (!this.game.registry.get("mainSoundtrackPlaying")) {
      this.mainSoundtrack = this.sound.add("mainSoundtrack", {
        volume: 0.15,
        loop: true,
      });
      
      // Try to play with user interaction fallback
      this.tryPlaySoundtrack();
      
      this.game.registry.set("mainSoundtrackPlaying", true);
      this.game.registry.set("mainSoundtrackInstance", this.mainSoundtrack);
    } else {
      // Use the existing soundtrack instance
      this.mainSoundtrack = this.game.registry.get("mainSoundtrackInstance");
    }

    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    // Layered background setup
    this.createPixelatedBackground();
    this.createMainBackground(centerX, centerY);
    this.createParticleEffects();

    // UI Elements
    this.createTitle();
    this.createSkipButton();
    this.createAudioPrompt();

    // Characters and dialog
    this.createFarmerSprite();
    this.createDialogBox();
    this.addDecorativeElements();

    // Start the story with a fade in
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.typewriteDialog(dialogPhases.introduction[0]);
    });
  }

  createMainBackground(centerX, centerY) {
    this.bg = this.add.image(centerX, centerY, "bg").setOrigin(0.5);
    this.bg.displayWidth = this.sys.game.config.width;
    this.bg.displayHeight = this.sys.game.config.height;
    this.bg.setDepth(0);
    this.bg.setAlpha(0.7);

    // Gentle pulsing effect
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

    // More efficient pixel generation
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

          // Animate some pixels
          if (Math.random() > 0.8) {
            this.tweens.add({
              targets: pixel,
              alpha: 0.05,
              duration: 2000 + Math.random() * 2000,
              yoyo: true,
              repeat: -1,
              ease: "Sine.inOut",
            });
          }
        }
      }
    }
  }

  createParticleEffects() {
    // Floating particles for atmosphere
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
      0x0f3d0f,
      0.9
    );
    titleBg.setStrokeStyle(4, 0x00ff00);
    titleBg.setDepth(15);

    this.titleText = this.add
      .text(width / 2, 40, "FARMING CRISIS", {
        fontSize: "24px",
        fontFamily: "'Press Start 2P', Courier New",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(15);

    const subtitle = this.add
      .text(width / 2, 62, "A Learning Adventure", {
        fontSize: "10px",
        fontFamily: "Courier New",
        color: "#88ff88",
        fontStyle: "italic",
      })
      .setOrigin(0.5)
      .setDepth(15);

    // Title animation
    this.tweens.add({
      targets: [titleBg, this.titleText, subtitle],
      y: "+=2",
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Decorative elements
    this.createTitleDecorations(width);
  }

  createTitleDecorations(width) {
    const leftDecor = this.add.container(100, 40).setDepth(15);
    const rightDecor = this.add.container(width - 100, 40).setDepth(15);

    for (let i = 0; i < 3; i++) {
      // Wheat stalks decoration
      const leftStalk = this.add.rectangle(i * 14, -12, 6, 20, 0xffdd00);
      const leftLeaf = this.add.circle(i * 14, -20, 4, 0x00cc00);
      leftDecor.add([leftStalk, leftLeaf]);

      const rightStalk = this.add.rectangle(-i * 14, -12, 6, 20, 0xffdd00);
      const rightLeaf = this.add.circle(-i * 14, -20, 4, 0x00cc00);
      rightDecor.add([rightStalk, rightLeaf]);
    }

    this.tweens.add({
      targets: [leftDecor, rightDecor],
      angle: 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  createSkipButton() {
    const width = this.sys.game.config.width;

    const skipBtn = this.add.container(width - 80, 120).setDepth(20);
    const btnBg = this.add
      .rectangle(0, 0, 140, 50, 0x3d2f1f, 0.95)
      .setStrokeStyle(3, 0x8b4513)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add
      .text(0, 0, "SKIP ⏭", {
        fontSize: "14px",
        fontFamily: "Courier New",
        color: "#deb887",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    skipBtn.add([btnBg, btnText]);

    btnBg.on("pointerdown", () => {
      this.clickSound.play();
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start("exploreScene");
      });
    });

    // Hover effects matching back button style
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x8b4513, 0.95);
      btnText.setColor("#ffffff");
      this.tweens.add({
        targets: skipBtn,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: "Power2",
      });
    });

    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x3d2f1f, 0.95);
      btnText.setColor("#deb887");
      this.tweens.add({
        targets: skipBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Power2",
      });
    });
  }

  shutdown() {
    // Don't stop the music when leaving intro scene - let it continue playing
    // The music should only stop when explicitly requested or when game ends
    console.log("Intro scene shutdown - keeping music playing");
  }

  createFarmerSprite() {
    this.farmer = this.add
      .sprite(400, sizes.height - 100, "farmer")
      .setScale(0.18)
      .setDepth(12)
      .setAlpha(0);

    // Fade in farmer
    this.tweens.add({
      targets: this.farmer,
      alpha: 1,
      duration: 1000,
      ease: "Power2",
    });

    // Breathing animation
    this.tweens.add({
      targets: this.farmer,
      y: this.farmer.y - 8,
      scale: 0.19,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  createDialogBox() {
    this.dialogContainer = this.add
      .container(sizes.width / 2 + 100, sizes.height - 100)
      .setDepth(10)
      .setAlpha(0);

    // More prominent dialog box
    const dialogBoxBg = this.add.rectangle(0, 0, 500, 120, 0x1a1a2e, 0.95);
    dialogBoxBg.setStrokeStyle(4, 0x00cc00);

    // Speaker name plate
    const namePlate = this.add.rectangle(-180, -45, 120, 25, 0x00cc00);
    const nameText = this.add
      .text(-180, -45, "HENRY", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "10px",
        color: "#1a1a2e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.dialogText = this.add
      .text(0, -20, "", {
        fontFamily: "Courier New",
        fontSize: "16px",
        color: "#e0ffe0",
        wordWrap: { width: 460, useAdvancedWrap: true },
        align: "center",
        lineSpacing: 5,
      })
      .setOrigin(0.5);

    // Animated continue indicator
    this.clickText = this.add
      .text(0, 45, "▼ CLICK TO CONTINUE ▼", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "8px",
        color: "#00ff00",
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
      namePlate,
      nameText,
      this.dialogText,
      this.clickText,
    ]);

    // Fade in dialog box
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

    dialogBoxBg.on("pointerover", () => {
      dialogBoxBg.setStrokeStyle(4, 0x00ff00);
    });

    dialogBoxBg.on("pointerout", () => {
      dialogBoxBg.setStrokeStyle(4, 0x00cc00);
    });

    // Subtle float animation
    this.tweens.add({
      targets: this.dialogContainer,
      y: this.dialogContainer.y - 3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  addDecorativeElements() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Bottom decorative border
    const decorColors = [0x00ff00, 0x228b22, 0x32cd32];

    for (let i = 0; i < 8; i++) {
      const color = decorColors[i % 3];
      const leftDecor = this.add
        .rectangle(40 + i * 15, height - 35, 10, 10, color)
        .setDepth(2);
      const rightDecor = this.add
        .rectangle(width - 40 - i * 15, height - 35, 10, 10, color)
        .setDepth(2);

      // Animate decorations
      this.tweens.add({
        targets: [leftDecor, rightDecor],
        alpha: 0.5,
        duration: 800 + i * 100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }
  }

  advanceDialog() {
    this.dialogIndex++;

    if (this.dialogIndex >= dialogPhases.introduction.length) {
      // Show play button with delay for dramatic effect
      this.time.delayedCall(500, () => {
        this.showPlayButton();
      });
    } else {
      this.typewriteDialog(dialogPhases.introduction[this.dialogIndex]);
    }
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

    // Show wilted crops image at appropriate moment
    if (text === "This is my farm, and the crops keep wilting...") {
      this.time.delayedCall(800, () => {
        this.displayPictures();
      });
    }

    // Hide pictures before solutions dialog
    if (text === "Can you help me figure out what's happening?") {
      this.hidePictures();
    }
  }

  showPlayButton() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    const buttonContainer = this.add
      .container(width / 2, height / 2 - 20)
      .setDepth(20)
      .setAlpha(0);

    const buttonBg = this.add
      .rectangle(0, 0, 220, 70, 0x00cc00)
      .setStrokeStyle(5, 0x00ff00)
      .setInteractive({ useHandCursor: true });

    const buttonText = this.add
      .text(0, 0, "▶ START ADVENTURE", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "14px",
        color: "#1a1a2e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Glow effect
    const glow = this.add
      .rectangle(0, 0, 230, 80, 0x00ff00, 0.3)
      .setStrokeStyle(2, 0x88ff88);

    buttonContainer.add([glow, buttonBg, buttonText]);

    // Create back button
    this.createNewBackButton();

    // Fade in button
    this.tweens.add({
      targets: buttonContainer,
      alpha: 1,
      scale: 1.05,
      duration: 600,
      ease: "Back.easeOut",
    });

    // Pulse animation
    this.tweens.add({
      targets: buttonContainer,
      scale: 1.12,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Glow pulse
    this.tweens.add({
      targets: glow,
      alpha: 0.1,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    buttonBg.on("pointerdown", () => {
      this.clickSound.play();
      this.cameras.main.shake(100, 0.002);
      this.cameras.main.fade(800, 0, 0, 0);

      this.time.delayedCall(800, () => {
        this.scene.stop("scene-intro"); // ← Add this line
        this.scene.start("exploreScene");
      });
    });

    buttonBg.on("pointerover", () => {
      buttonBg.setFillStyle(0x00ff00);
      buttonText.setColor("#000000");
      this.tweens.add({
        targets: buttonContainer,
        scale: 1.15,
        duration: 150,
      });
    });

    buttonBg.on("pointerout", () => {
      buttonBg.setFillStyle(0x00cc00);
      buttonText.setColor("#1a1a2e");
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

  displayPictures() {
    this.hidePictures();

    const width = sizes.width;
    const height = sizes.height;

    // Create picture container with frame
    const pictureContainer = this.add
      .container(width / 2, height / 2 - 60)
      .setDepth(9);

    const frame = this.add.rectangle(0, 0, 520, 280, 0x0a0a0a);
    frame.setStrokeStyle(5, 0x8b4513);

    const innerFrame = this.add.rectangle(0, 0, 500, 260, 0x1a4d1a);
    innerFrame.setStrokeStyle(3, 0x00cc00);

    this.image = this.add.image(0, 0, "wiltedcrop");
    this.image.setDisplaySize(480, 240);

    // Warning label
    const warningBg = this.add.rectangle(0, -110, 200, 30, 0xff4444);
    const warningText = this.add
      .text(0, -110, "⚠ CROP FAILURE ⚠", {
        fontSize: "11px",
        fontFamily: "'Press Start 2P', Courier New",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    pictureContainer.add([
      frame,
      innerFrame,
      this.image,
      warningBg,
      warningText,
    ]);

    // Fade in with scale
    pictureContainer.setAlpha(0).setScale(0.8);
    this.tweens.add({
      targets: pictureContainer,
      alpha: 1,
      scale: 1,
      duration: 600,
      ease: "Back.easeOut",
    });

    // Gentle floating
    this.tweens.add({
      targets: pictureContainer,
      y: height / 2 - 55,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.displayedImages = [pictureContainer];
  }

  hidePictures() {
    if (this.displayedImages.length > 0) {
      this.displayedImages.forEach((el) => {
        this.tweens.add({
          targets: el,
          alpha: 0,
          scale: 0.8,
          duration: 400,
          onComplete: () => el.destroy(),
        });
      });
      this.displayedImages = [];
    }
  }

  createNewBackButton() {
    const { width, height } = this.scale;

    // Position exactly on top of the farmer (fala7)
    const farmerX = 400;
    const farmerY = height - 100;

    // Create button container on top of farmer
    const buttonContainer = this.add.container(farmerX, farmerY - 50);

    // Button background
    const buttonBg = this.add
      .rectangle(0, 0, 200, 40, 0x0f3d0f)
      .setStrokeStyle(2, 0x00ff00);

    // Button text
    const buttonText = this.add
      .text(0, 0, "Back", {
        fontSize: "16px",
        fontFamily: "Courier New",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    buttonContainer.add([buttonBg, buttonText]);
    buttonContainer.setInteractive(
      new Phaser.Geom.Rectangle(-100, -20, 200, 40),
      Phaser.Geom.Rectangle.Contains
    );
    buttonContainer.setDepth(100); // High depth to appear on top of farmer

    // Hover effect
    buttonContainer.on("pointerover", () => {
      buttonBg.setFillStyle(0x1a4d1a); // Slightly lighter green
    });
    buttonContainer.on("pointerout", () => {
      buttonBg.setFillStyle(0x0f3d0f); // Original green
    });

    // Click effect
    buttonContainer.on("pointerdown", () => {
      this.clickSound.play();
      this.scene.start("Game"); // Navigate to main scene
    });

    // Pulsing animation
    this.tweens.add({
      targets: buttonContainer,
      scale: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  shutdown() {
    // Stop main soundtrack when leaving intro scene
    if (this.mainSoundtrack) {
      this.mainSoundtrack.stop();
    }
  }

  tryPlaySoundtrack() {
    // Try to play the soundtrack
    try {
      const playPromise = this.mainSoundtrack.play();
      
      // Handle promise-based play
      if (playPromise && playPromise.catch) {
        playPromise.catch(error => {
          console.log("🎵 Audio autoplay blocked, will play on user interaction:", error.message);
          // Set up click handler to start audio
          this.setupAudioOnInteraction();
        });
      }
    } catch (error) {
      console.log("🎵 Audio play failed:", error.message);
      this.setupAudioOnInteraction();
    }
  }

  setupAudioOnInteraction() {
    // Show audio prompt
    this.showAudioPrompt();
    
    // Play audio on first user interaction
    const playOnClick = () => {
      try {
        this.mainSoundtrack.play();
        console.log("🎵 Soundtrack started on user interaction");
        this.hideAudioPrompt();
      } catch (error) {
        console.log("🎵 Still can't play audio:", error.message);
      }
      // Remove the listener after first interaction
      document.removeEventListener('click', playOnClick);
      document.removeEventListener('touchstart', playOnClick);
    };
    
    document.addEventListener('click', playOnClick);
    document.addEventListener('touchstart', playOnClick);
  }

  createAudioPrompt() {
    // Create audio prompt that will be shown if needed
    this.audioPrompt = this.add.container(0, 0);
    this.audioPrompt.setDepth(1000);
    
    const bg = this.add.rectangle(
      this.sys.game.config.width / 2,
      100,
      300,
      60,
      0x000000,
      0.8
    ).setStrokeStyle(2, 0x00ff00);
    
    const text = this.add.text(
      this.sys.game.config.width / 2,
      100,
      "Click anywhere to enable audio",
      {
        fontSize: "16px",
        fontFamily: "Courier New",
        color: "#00ff00",
        align: "center"
      }
    ).setOrigin(0.5);
    
    this.audioPrompt.add([bg, text]);
    this.audioPrompt.setVisible(false);
  }

  showAudioPrompt() {
    if (this.audioPrompt) {
      this.audioPrompt.setVisible(true);
      // Fade in animation
      this.tweens.add({
        targets: this.audioPrompt,
        alpha: 1,
        duration: 500
      });
    }
  }

  hideAudioPrompt() {
    if (this.audioPrompt) {
      this.tweens.add({
        targets: this.audioPrompt,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.audioPrompt.setVisible(false);
        }
      });
    }
  }
}
