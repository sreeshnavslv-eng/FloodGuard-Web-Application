import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";
import { Game } from "./Start.js";

export class SalinizedFarmScene extends Phaser.Scene {
  constructor() {
    super({ key: "SalinizedFarmScene" });
    this.explanations = [
      "Irrigation is simply to water plants artifically not through rainfall BUT irrigated water contains salt! can cause salinization of soil",
      "Too much salt in soil will lower farm yields, crops like wheat are sensitive to salinity! so use..... Drip irrigation",
      "delivers water directly to the roots, minimizing waste, helps prevent soil salinization by avoiding over-watering.",
      "Implementing it can save your farm and increase yields!",
      "Use arrow keys to move the farmer. Press space bar near salty wheat plots to install drip irrigation and save crops. Connect all plots before time runs out to save the farm! You have 20 seconds!",
    ];
  }

  preload() {
    // Load all sprite sheets in preload
    this.load.spritesheet("farmerMen", "./assets/farmerMen.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("salty_wheat", "./assets/salty_wheat.png", {
      frameWidth: 384,
      frameHeight: 1024,
    });
    this.load.spritesheet("water_wheat", "./assets/water_wheat.png", {
      frameWidth: 384,
      frameHeight: 1024,
    });
    this.load.spritesheet("green_wheat", "./assets/green_wheat.png", {
      frameWidth: 384,
      frameHeight: 1024,
    });
    // Removed dead_wheat to avoid missing asset error; using tint instead for "dead" effect

    // Load explanation images
    this.load.image("drip1", "./assets/drip1.jpg");
    this.load.image("drip2", "./assets/drip2.jpg");
    this.load.image("drip3", "./assets/drip3.jpg");
    this.load.image("drip4", "./assets/drip4.jpg");

    //load audios
    this.load.audio("buttonClick", "./assets/click.mp3");
    this.load.audio("boing", "./assets/audios/boing.mp3");
    this.load.audio("right", "./assets/audios/right-soundtrack.mp3");
    this.load.audio("wrong", "./assets/audios/wrong_soundtrack.mp3");

    // No background music loading
  }

  create() {
    const { width, height } = this.scale;

    // Create wheat animations (single frame to avoid frame not found errors)
    if (!this.anims.exists("salty_wheat")) {
      this.anims.create({
        key: "salty_wheat",
        frames: [{ key: "salty_wheat", frame: 0 }],
        frameRate: 1,
        repeat: 0,
      });
    }

    if (!this.anims.exists("water_wheat")) {
      this.anims.create({
        key: "water_wheat",
        frames: [{ key: "water_wheat", frame: 0 }],
        frameRate: 1,
        repeat: 0,
      });
    }

    if (!this.anims.exists("green_wheat")) {
      this.anims.create({
        key: "green_wheat",
        frames: [{ key: "green_wheat", frame: 0 }],
        frameRate: 1,
        repeat: 0,
      });
    }

    // Create salinized background
    this.createSalinizedBackground();

    // Create farmer
    this.createFarmer();

    // Show popup
    this.showPopup();
    //     if (data && data.skipExplanation) {
    //     // Jump straight into game mode
    //     this.startDripIrrigationMode();
    // } else {
    //     // First-time play → show tutorial popup
    //     this.showExplanation(1);

    // }
    this.createBackButton();
    this.buttonSound = this.sound.add("buttonClick");
    this.buttonB = this.sound.add("boing");
    this.buttonR = this.sound.add("right");
    this.buttonW = this.sound.add("wrong");

    // No background music - only click sounds
  }

  //back button
  createBackButton() {
    const { width, height } = this.scale;

    const buttonY = height - 70; // Below the story text

    // Create button container
    const buttonContainer = this.add.container(width / 2 - 150, buttonY);

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

    // Hover effect
    buttonContainer.on("pointerover", () => {
      buttonBg.setFillStyle(0x1a4d1a); // Slightly lighter green
    });
    buttonContainer.on("pointerout", () => {
      buttonBg.setFillStyle(0x0f3d0f); // Original green
    });

    // Click effect
    buttonContainer.on("pointerdown", () => {
      this.buttonSound.play();
      this.scene.start("exploreScene");
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

  //Try button
  createTryButton() {
    const { width, height } = this.scale;

    const buttonY = height - 70;

    // Create button container
    const buttonContainer = this.add.container(width / 2 + 200, buttonY);

    // Button background
    const buttonBg = this.add
      .rectangle(0, 0, 200, 40, 0x0f3d0f)
      .setStrokeStyle(2, 0x00ff00);

    // Button text
    const buttonText = this.add
      .text(0, 0, "Try Again", {
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

    // Hover effect
    buttonContainer.on("pointerover", () => {
      buttonBg.setFillStyle(0x1a4d1a); // Slightly lighter green
    });
    buttonContainer.on("pointerout", () => {
      buttonBg.setFillStyle(0x0f3d0f); // Original green
    });

    // Click effect
    buttonContainer.on("pointerdown", () => {
      this.buttonSound.play();
      this.scene.restart();
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
  createSalinizedBackground() {
    const { width, height } = this.scale;

    // Dark soil base
    this.add.rectangle(width / 2, height / 2, width, height, 0x2d1810);

    // Pixelated dirt patterns
    for (let x = 0; x < width; x += 16) {
      for (let y = 0; y < height; y += 16) {
        const rand = Math.random();
        let color = 0x2d1810;
        if (rand > 0.7) color = 0x3d2818;
        else if (rand > 0.85) color = 0x1a0f08;
        this.add.rectangle(x + 8, y + 8, 16, 16, color);
      }
    }

    // Add scattered salt pixels
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      this.add.rectangle(x, y, 8, 8, 0xffffff);
    }
  }

  createFarmer() {
    const { width, height } = this.scale;

    // Create farmer animations (single frame to avoid frame not found)
    if (!this.anims.exists("walk")) {
      this.anims.create({
        key: "walk",
        frames: [{ key: "farmerMen", frame: 0 }],
        frameRate: 8,
        repeat: -1,
      });
    }

    // Create farmer sprite
    this.farmer = this.add
      .sprite(width / 2, height / 2 - 200, "farmerMen")
      .setScale(3.5);

    // Move up and down
    this.farmerTween = this.tweens.add({
      targets: this.farmer,
      y: height / 2 + 100,
      duration: 3000,
      ease: "Linear",
      yoyo: true,
      repeat: -1,
    });

    // Play walking animation
    this.farmer.play("walk");
  }

  showPopup() {
    const { width, height } = this.scale;

    this.popup = this.add.container(width / 2, height / 2);
    this.popup.setDepth(10);

    const bg = this.add
      .rectangle(0, 0, 600, 300, 0x1a1a2e)
      .setStrokeStyle(3, 0xffd700);
    this.popupBg = bg;

    const infoText = this.add
      .text(
        0,
        -40,
        "Possible Solutions:\n" +
          "1) Implement efficient irrigation systems like drip irrigation\n" +
          "2) Plant salt-tolerant crop varieties\n" +
          "3) Improve soil drainage and water management\n" +
          "4) Use gypsum or other amendments to reduce soil salinity\n" +
          "5) Promote sustainable farming practices and education",
        {
          fontSize: "14px",
          fontFamily: "Courier New",
          color: "#ffd700",
          align: "left",
          wordWrap: { width: 580 },
        }
      )
      .setOrigin(0.5);
    infoText.setLineSpacing(10);

    // Next button
    const nextButtonContainer = this.add.container(0, 120);
    const nextButtonBg = this.add
      .rectangle(0, 0, 100, 40, 0x0f3d0f)
      .setStrokeStyle(2, 0x00ff00);
    const nextButtonText = this.add
      .text(0, 0, "Next", {
        fontSize: "16px",
        fontFamily: "Courier New",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    nextButtonContainer.add([nextButtonBg, nextButtonText]);
    nextButtonContainer.setInteractive(
      new Phaser.Geom.Rectangle(-50, -20, 100, 40),
      Phaser.Geom.Rectangle.Contains
    );

    // Hover effect
    nextButtonContainer.on("pointerover", () => {
      nextButtonBg.setFillStyle(0x1a4d1a);
    });
    nextButtonContainer.on("pointerout", () => {
      nextButtonBg.setFillStyle(0x0f3d0f);
    });

    // Click to change to choice
    nextButtonContainer.on("pointerdown", () => {
      this.buttonSound.play();
      this.showChoice(infoText, nextButtonContainer);
    });

    // Pulsing animation
    this.tweens.add({
      targets: nextButtonContainer,
      scale: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.popup.add([bg, infoText, nextButtonContainer]);

    // Animate appearance
    this.popup.setScale(0);
    this.tweens.add({
      targets: this.popup,
      scale: 1,
      duration: 500,
      ease: "Bounce.out",
    });
  }

  showChoice(infoText, nextButtonContainer) {
    infoText.destroy();
    nextButtonContainer.destroy();

    const title = this.add
      .text(0, -100, "What could save the farm?", {
        fontSize: "24px",
        fontFamily: "Courier New",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.popup.add(title);

    const options = [
      { text: "Drip Irrigation", correct: true, y: -20 },
      { text: "Flood Irrigation", correct: false, y: 40 },
      { text: "Chemical Pesticides", correct: false, y: 100 },
    ];

    options.forEach((opt) => {
      const buttonContainer = this.add.container(0, opt.y);

      const buttonBg = this.add
        .rectangle(0, 0, 300, 40, 0x0f3d0f)
        .setStrokeStyle(2, 0x00ff00);

      const buttonText = this.add
        .text(0, 0, opt.text, {
          fontSize: "16px",
          fontFamily: "Courier New",
          color: "#00ff00",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      buttonContainer.add([buttonBg, buttonText]);
      buttonContainer.setInteractive(
        new Phaser.Geom.Rectangle(-150, -20, 300, 40),
        Phaser.Geom.Rectangle.Contains
      );

      // Hover effect
      buttonContainer.on("pointerover", () => {
        buttonBg.setFillStyle(0x1a4d1a);
      });
      buttonContainer.on("pointerout", () => {
        buttonBg.setFillStyle(0x0f3d0f);
      });

      // Click effect
      buttonContainer.on("pointerdown", () => {
        if (opt.correct) {
          this.buttonR.play();
          this.showExplanation(1);
        } else {
          this.buttonW.play();
          const wrongText = this.add
            .text(0, 140, "Wrong choice! That might make it worse.", {
              fontSize: "16px",
              fontFamily: "Courier New",
              color: "#ff0000",
            })
            .setOrigin(0.5);
          this.popup.add(wrongText);
          this.time.delayedCall(2000, () => {
            wrongText.destroy();
          });
        }
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

      this.popup.add(buttonContainer);
    });
  }

  showExplanation(page) {
    // Clear current content except bg
    const children = this.popup.list.slice();
    this.popup.removeAll(false);
    children.forEach((child) => {
      if (child !== this.popupBg) child.destroy();
    });
    this.popup.add(this.popupBg);

    // Add explanation content
    const titleText =
      page < 5 ? "Drip Irrigation Explanation" : "Game Instructions";
    const title = this.add
      .text(0, -120, titleText, {
        fontSize: "24px",
        fontFamily: "Courier New",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.popup.add(title);

    let img;
    let origW, origH;
    if (page < 5) {
      const imgKey = `drip${page}`;
      img = this.add.image(0, -30, imgKey).setOrigin(0.5);
      const texture = this.textures.get(imgKey);
      origW = texture.getSourceImage().width;
      origH = texture.getSourceImage().height;
    } else {
      img = this.add.sprite(0, -30, "farmerMen", 0).setOrigin(0.5); // Use frame 0
      const texture = this.textures.get("farmerMen");
      origW = 32; // Frame width
      origH = 32; // Frame height
    }
    const maxW = 550;
    const maxH = 150; // Reduced max height to fit smaller popup
    const scale = Math.min(maxW / origW, maxH / origH, page < 5 ? 1 : 10); // Allow upscaling for farmer up to 10x
    img.setScale(scale);
    this.popup.add(img);

    // Adjust text y dynamically based on image height after scaling
    const imgHeight = origH * scale;
    const textY = -30 + imgHeight / 2 + 20; // Reduced margin to 20px
    const text = this.add
      .text(0, textY, this.explanations[page - 1], {
        fontSize: "14px", // Reduced font size slightly for better fit
        fontFamily: "Courier New",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 550 },
      })
      .setOrigin(0.5);
    this.popup.add(text);

    // Adjust button y based on text height
    const textBounds = text.getBounds();
    const buttonY = textY + textBounds.height / 2 + 30; // Increased margin to 30px to lower the buttons

    if (page < 5) {
      // Next button
      const nextBtn = this.createButton(-100, 120, "Next", () => {
        this.buttonSound.play();
        this.showExplanation(page + 1);
      });
      this.popup.add(nextBtn);

      // Skip button
      const skipBtn = this.createButton(100, 120, "Skip", () => {
        this.buttonSound.play();
        this.showExplanation(5);
      });

      this.popup.add(skipBtn);
    } else {
      // Start button
      const startBtn = this.createButton(0, buttonY, "Start Timer!", () => {
        this.buttonSound.play();
        this.popup.destroy();
        this.startDripIrrigationMode();
      });
      this.popup.add(startBtn);
    }
  }

  createButton(x, y, text, callback) {
    const container = this.add.container(x, y);
    const bg = this.add
      .rectangle(0, 0, 150, 40, 0x0f3d0f)
      .setStrokeStyle(2, 0x00ff00);
    const txt = this.add
      .text(0, 0, text, {
        fontSize: "16px",
        fontFamily: "Courier New",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    container.add([bg, txt]);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-75, -20, 150, 40),
      Phaser.Geom.Rectangle.Contains
    );
    container.on("pointerover", () => bg.setFillStyle(0x1a4d1a));
    container.on("pointerout", () => bg.setFillStyle(0x0f3d0f));
    container.on("pointerdown", callback);
    this.tweens.add({
      targets: container,
      scale: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
    return container;
  }

  startDripIrrigationMode() {
    if (this.popup) this.popup.destroy();

    const { width, height } = this.scale;

    // Create farmer animations if not already (idle) - single frame
    if (!this.anims.exists("idle")) {
      this.anims.create({
        key: "idle",
        frames: [{ key: "farmerMen", frame: 0 }],
        frameRate: 1,
        repeat: 0,
      });
    }

    // Stop farmer tween and set to idle
    if (this.farmerTween) {
      this.farmerTween.remove();
    }
    this.farmer.play("idle");
    this.farmer.setPosition(width / 2, height - 100);

    // Title and instructions
    this.add
      .text(width / 2, 50, "Save the Farm with Drip Irrigation", {
        fontSize: "24px",
        fontFamily: "Courier New",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Instruction text aligned left, near the top-left
    this.add
      .text(
        50,
        40,
        "Use arrow keys to move the farmer press space near plots\n to install drip irrigation.\nSave crops before time runs out!",
        {
          fontSize: "16px",
          fontFamily: "Courier New",
          color: "#ffffff",
          align: "left",
          wordWrap: { width: 300 },
        }
      )
      .setOrigin(0, 0);
    // Instruction box on the left side
    const boxX = 120;
    const boxY = 250;

    // Draw a background panel
    const panel = this.add
      .rectangle(boxX, boxY, 180, 180, 0x1a1a2e)
      .setStrokeStyle(2, 0x00ff00)
      .setOrigin(0.5);

    // Arrow keys group
    const upKey = this.add
      .rectangle(boxX, boxY - 40, 40, 40, 0x333333)
      .setStrokeStyle(2, 0xffffff);
    this.add
      .text(boxX, boxY - 40, "↑", { fontSize: "20px", color: "#ffffff" })
      .setOrigin(0.5);

    const leftKey = this.add
      .rectangle(boxX - 45, boxY + 5, 40, 40, 0x333333)
      .setStrokeStyle(2, 0xffffff);
    this.add
      .text(boxX - 45, boxY + 5, "←", { fontSize: "20px", color: "#ffffff" })
      .setOrigin(0.5);

    const downKey = this.add
      .rectangle(boxX, boxY + 5, 40, 40, 0x333333)
      .setStrokeStyle(2, 0xffffff);
    this.add
      .text(boxX, boxY + 5, "↓", { fontSize: "20px", color: "#ffffff" })
      .setOrigin(0.5);

    const rightKey = this.add
      .rectangle(boxX + 45, boxY + 5, 40, 40, 0x333333)
      .setStrokeStyle(2, 0xffffff);
    this.add
      .text(boxX + 45, boxY + 5, "→", { fontSize: "20px", color: "#ffffff" })
      .setOrigin(0.5);

    // Space bar
    const spaceKey = this.add
      .rectangle(boxX, boxY + 70, 120, 40, 0x333333)
      .setStrokeStyle(2, 0xffffff);
    this.add
      .text(boxX, boxY + 70, "SPACE", { fontSize: "16px", color: "#ffffff" })
      .setOrigin(0.5);

    // Small label under it
    this.add
      .text(boxX, boxY + 120, "Move + Action", {
        fontSize: "14px",
        color: "#00ff00",
      })
      .setOrigin(0.5);

    // Score setup
    this.score = 0;
    this.scoreText = this.add
      .text(width / 2 - 200, 10, "Score: 0", {
        fontSize: "20px",
        fontFamily: "Courier New",
        color: "#ffd700",
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Timer setup
    this.timeLeft = 20;

    const timerBg = this.add
      .rectangle(width - 200, 80, 160, 60, 0x1a1a2e)
      .setStrokeStyle(3, 0xffffff)
      .setOrigin(0.5)
      .setDepth(9);

    this.timerText = this.add
      .text(width - 200, 80, "⏰ 20", {
        fontSize: "36px",
        fontFamily: "Arial Black",
        color: "#ffd700",
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(`⏰ ${this.timeLeft}`);

        // Flash red when running out
        if (this.timeLeft <= 5) {
          this.timerText.setColor("#ff0000");
        } else {
          this.timerText.setColor("#ffd700");
        }

        if (this.timeLeft <= 0) {
          this.timeUp();
        }
      },
      loop: true,
    });

    // Create plots (2D grid for adjacency)
    this.plots = [];
    this.plotGrid = [];
    this.cols = 4;
    this.rows = 3;
    const plotW = 100;
    const plotH = 100;
    const spacing = 20;
    const startX = (width - (this.cols * (plotW + spacing) - spacing)) / 2;
    const startY = 150;
    const wheatScale = 0.3;
    const baseOffset = 50; // Offset from wheat center to "ground" for pipe connections (adjust if needed)

    for (let row = 0; row < this.rows; row++) {
      this.plotGrid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        const px = startX + col * (plotW + spacing) + plotW / 2;
        const py = startY + row * (plotH + spacing) + plotH / 2;
        const wheat = this.add
          .sprite(px, py, "salty_wheat")
          .setScale(wheatScale)
          .setDepth(2);
        wheat.play("salty_wheat");
        const plot = {
          wheat,
          x: px,
          y: py,
          irrigated: false,
          col,
          row,
          baseY: py + baseOffset, // Precompute for pipes
        };
        this.plots.push(plot);
        this.plotGrid[row][col] = plot;
      }
    }

    // Compute min/max for pipes
    this.minPlotX = Math.min(...this.plots.map((p) => p.x));
    this.maxPlotX = Math.max(...this.plots.map((p) => p.x));
    this.minPlotY = Math.min(...this.plots.map((p) => p.y));
    this.mainY = this.minPlotY - 80;

    // Connection pipes graphics (for all pipes)
    this.connectionGraphics = this.add.graphics().setDepth(1);

    // Initial draw (main pipe only)
    this.redrawPipes();

    // Add label to main pipe
    const mainHeight = 20;
    const mainRectY = this.mainY - mainHeight / 2;
    const mainRectWidth = this.maxPlotX - this.minPlotX + 100;
    const mainRectX = this.minPlotX - 50;
    const labelX = mainRectX + mainRectWidth / 2;
    const labelY = mainRectY + mainHeight / 2;
    this.add
      .text(labelX, labelY, "Main Drip Irrigation Pipe", {
        fontSize: "14px",
        fontFamily: "Courier New",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(3);

    // Input keys
    this.keys = this.input.keyboard.createCursorKeys();
    this.space = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.saved = false;
    this.lost = false;
  }

  redrawPipes() {
    this.connectionGraphics.clear();

    const mainHeight = 20;
    const mainColor = 0x4169e1;
    const pipeColor = 0x00bfff;
    const borderColor = 0x000000;
    const borderWidth = 2;
    const mainRectY = this.mainY - mainHeight / 2;
    const mainRectWidth = this.maxPlotX - this.minPlotX + 100;
    const mainRectX = this.minPlotX - 50;

    // Draw main pipe rect
    this.connectionGraphics.fillStyle(mainColor);
    this.connectionGraphics.lineStyle(borderWidth, borderColor);
    this.connectionGraphics.fillRect(
      mainRectX,
      mainRectY,
      mainRectWidth,
      mainHeight
    );
    this.connectionGraphics.strokeRect(
      mainRectX,
      mainRectY,
      mainRectWidth,
      mainHeight
    );

    // Draw drop pipes for irrigated plots
    const dropWidth = 10;
    this.connectionGraphics.fillStyle(pipeColor);
    this.connectionGraphics.lineStyle(borderWidth, borderColor);
    this.plots.forEach((plot) => {
      if (plot.irrigated) {
        const dropX = plot.x - dropWidth / 2;
        const dropY = mainRectY + mainHeight;
        const dropHeight = plot.baseY - dropY;
        this.connectionGraphics.fillRect(dropX, dropY, dropWidth, dropHeight);
        this.connectionGraphics.strokeRect(dropX, dropY, dropWidth, dropHeight);
      }
    });

    // Draw connections
    const connSize = 10;
    // Horizontal connections
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 1; c++) {
        const p1 = this.plotGrid[r][c];
        const p2 = this.plotGrid[r][c + 1];
        if (p1.irrigated && p2.irrigated) {
          const connY = p1.baseY - connSize / 2;
          const connX = Math.min(p1.x, p2.x);
          const connW = Math.abs(p1.x - p2.x);
          this.connectionGraphics.fillRect(connX, connY, connW, connSize);
          this.connectionGraphics.strokeRect(connX, connY, connW, connSize);
        }
      }
    }
    // Vertical connections
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows - 1; r++) {
        const p1 = this.plotGrid[r][c];
        const p2 = this.plotGrid[r + 1][c];
        if (p1.irrigated && p2.irrigated) {
          const connX = p1.x - connSize / 2;
          const connY = Math.min(p1.baseY, p2.baseY);
          const connH = Math.abs(p1.baseY - p2.baseY);
          this.connectionGraphics.fillRect(connX, connY, connSize, connH);
          this.connectionGraphics.strokeRect(connX, connY, connSize, connH);
        }
      }
    }
  }

  timeUp() {
    this.timerEvent.remove();
    if (!this.saved) {
      this.lost = true;
      this.plots.forEach((p) => {
        if (!p.irrigated) {
          p.wheat.setTint(0x555555); // Gray tint for "dead" effect instead of missing animation
        }
      });
      this.add
        .text(
          this.scale.width / 2,
          this.scale.height / 2,
          "Time's Up! Plants Died!",
          {
            fontSize: "32px",
            fontFamily: "Courier New",
            color: "#ff0000",
            fontStyle: "bold",
          }
        )
        .setOrigin(0.5)
        .setDepth(5);
    }
    this.createTryButton();
  }

  update() {
    if (this.saved || this.lost || !this.keys) return;

    let velocityX = 0;
    let velocityY = 0;

    if (this.keys.left.isDown) {
      velocityX = -3;
      this.farmer.flipX = true;
      this.farmer.play("walk", true);
    } else if (this.keys.right.isDown) {
      velocityX = 3;
      this.farmer.flipX = false;
      this.farmer.play("walk", true);
    }

    if (this.keys.up.isDown) {
      velocityY = -3;
    } else if (this.keys.down.isDown) {
      velocityY = 3;
    }

    if (velocityX !== 0 || velocityY !== 0) {
      this.farmer.x += velocityX;
      this.farmer.y += velocityY;
    } else {
      this.farmer.play("idle", true);
    }

    // Clamp farmer position
    this.farmer.x = Phaser.Math.Clamp(this.farmer.x, 0, this.scale.width);
    this.farmer.y = Phaser.Math.Clamp(this.farmer.y, 0, this.scale.height);

    // Install drip irrigation and change to water wheat
    if (Phaser.Input.Keyboard.JustDown(this.space)) {
      this.plots.forEach((plot) => {
        const dist = Phaser.Math.Distance.Between(
          this.farmer.x,
          this.farmer.y,
          plot.x,
          plot.y
        );
        if (
          dist < 80 &&
          plot.wheat.anims.currentAnim &&
          plot.wheat.anims.currentAnim.key === "salty_wheat"
        ) {
          this.buttonB.play();
          plot.wheat.play("water_wheat");
          plot.irrigated = true;

          // Increment score
          this.score += 100;
          this.scoreText.setText(`Score: ${this.score}`);

          // Update pipes
          this.redrawPipes();

          // Tween for visual feedback
          this.tweens.add({
            targets: plot.wheat,
            scale: 0.33,
            duration: 300,
            yoyo: true,
            ease: "Sine.inOut",
          });
        }
      });
    }

    // Check if all plots are saved
    if (this.plots.every((p) => p.irrigated)) {
      // Transition to green wheat for healthy final state
      this.plots.forEach((p) => p.wheat.play("green_wheat"));

      // Ensure full connections are drawn (already called on last irrigation, but safe)
      this.redrawPipes();

      this.saved = true;
      this.timerEvent.remove();
      this.add
        .text(this.scale.width / 2, this.scale.height / 2, "Farm Saved!", {
          fontSize: "32px",
          fontFamily: "Courier New",
          color: "#00ff00",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(5);

      this.createTryButton();

      // Show final score
      this.add
        .text(
          this.scale.width / 2,
          this.scale.height / 2 + 50,
          `Final Score: ${this.score}`,
          {
            fontSize: "24px",
            fontFamily: "Courier New",
            color: "#ffd700",
          }
        )
        .setOrigin(0.5)
        .setDepth(5);
    }
  }
}
