import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";

const dialogPhases = {
  introduction: [
    "Crop failure can happen due to various environmental stresses.",
    "It's important to identify the specific issue affecting the crops.",
    "Let's take a closer look at the different factors at play.",
  ],
};

class exploreScene extends Phaser.Scene {
  constructor() {
    super({ key: "exploreScene" });
    this.sceneBoxes = [];
    this.sceneStates = {
      heatmap: true, // All scenes unlocked
      flood: true,
      drought: true,
      salinized: true,
      water: true,
      animals: true,
    };
  }

  preload() {
    // Load static images for each scene
    this.load.image("heatmap_icon", "./assets/heat.png");
    this.load.image("float_icon", "./assets/flood.png");
    this.load.image("drought_icon", "./assets/drought.png");
    this.load.image("salinized_icon", "./assets/watering_gif.png");
    this.load.image("water_icon", "./assets/water.png");
    this.load.image("animals_icon", "./assets/animal.png");

    // Load farmer character
    this.load.image("farmer", "./assets/farmerr.png");

    // Load video for animals scene
    this.load.video("animals_video", "./assets/animal_video.mp4");
this.load.video("flood_video", "./assets/flood2video.mp4");
    this.load.video("drought_video", "./assets/drought0video.mp4");
    this.load.video("salinized_video", "./assets/salt4vid.mp4");
    this.load.video("water_video", "./assets/water2video.mp4");
    this.load.video("heatmap_video", "./assets/heat2video.mp4");

    // No background music loading
  }

  create() {
    console.log("Play button clicked!");

    // No background music - only click sounds

    // Set pixel art background similar to heatmap scene
    this.cameras.main.setBackgroundColor(0x2d1810);

    // Add scattered brown patches for pixel art effect
    this.addPixelPatches();

    // Unlock audio context on first user interaction
    this.input.on("pointerdown", () => {
      if (
        this.sound &&
        this.sound.context &&
        this.sound.context.state === "suspended"
      ) {
        this.sound.context.resume();
      }
    });

    // Listen for scene completion events
    this.events.on("sceneComplete", this.onSceneComplete, this);

    this.createTitle();

    // Adjust grid to be more left-aligned to make space for dialog
    const boxWidth = 160;
    const boxHeight = 200;
    const spacingX = 150;
    const spacingY = 50;

    // Position grid more to the right - increased right shift
    const totalWidth = 3 * boxWidth + 2 * spacingX; // Width for 3 boxes
    const totalHeight = 2 * boxHeight + spacingY; // Height for 2 rows
    const startX = (this.scale.width - totalWidth) / 2 + 80; // Center horizontally + shift right by 150
    const startY = (this.scale.height - totalHeight) / 2; // Center vertically

    // Define scenes with their explanations
    this.sceneExplanations = {
      heatmap:
        "Heat stress affects crop growth by damaging plant cells and reducing photosynthesis efficiency.",
      flood:
        "Flooding deprives roots of oxygen and can lead to root rot and nutrient leaching.",
      drought:
        "Drought stress causes water deficiency, leading to wilting and reduced crop yields.",
      salinized:
        "Salinized soil reduces water uptake and can be toxic to many crop species.",
      water:
        "Proper crops  management ensures optimal growth while conserving precious resources.",
    };

    const scenes = [
      {
        key: "heatmap",
        name: "Heat",
        icon: "heatmap_icon",
        animKey: "heatmap_video",
        scene: "HeatmapScene",
        explanation: this.sceneExplanations.heatmap,
      },
      {
        key: "flood",
        name: "Flood",
        icon: "float_icon",
        animKey: "flood_video",
        scene: "scene-game",
        explanation: this.sceneExplanations.flood,
      },
      {
        key: "drought",
        name: "Drought",
        icon: "drought_icon",
        animKey: "drought_video",
        scene: "droughtScene",
        explanation: this.sceneExplanations.drought,
      },
      {
        key: "salinized",
        name: "Salinized Soil",
        icon: "salinized_icon",
        animKey: "salinized_video",
        scene: "Game",
        explanation: this.sceneExplanations.salinized,
      },
      {
        key: "water",
        name: "Crops Management",
        icon: "water_icon",
        animKey: "water_video",
        scene: "WaterScene",
        explanation: this.sceneExplanations.water,
      },
    ];

    // Create 3 boxes on top row, 2 boxes on bottom row (centered)
    scenes.forEach((scene, index) => {
      let x, y;

      if (index < 3) {
        // Top row - 3 boxes
        const col = index;
        x = startX + col * (boxWidth + spacingX) + boxWidth / 2;
        y = startY + boxHeight / 2;
      } else {
        // Bottom row - 2 boxes, centered
        const col = index - 3;
        // Center the two boxes by adding half the width of a box + spacing
        const centerOffset = (boxWidth + spacingX) / 2;
        x = startX + col * (boxWidth + spacingX) + boxWidth / 2 + centerOffset;
        y = startY + boxHeight + spacingY + boxHeight / 2;
      }

      this.createSceneBox(x, y, scene, boxWidth, boxHeight);
    });

    // Update the connecting lines for the new arrangement
    this.drawConnectingLines(
      scenes,
      startX,
      startY,
      boxWidth,
      boxHeight,
      spacingX,
      spacingY
    );

    this.createDialogBox();
    this.addDecorativeElements();
    this.createBackButton();

    // Fade in entrance
    this.cameras.main.fadeIn(800, 0, 0, 0);

    // Initialize dialog
    this.dialogIndex = 0;
    this.currentSceneExplanation = null;
    this.isShowingHover = false; // Add this flag

    this.time.delayedCall(500, () => {
      this.typewriteDialog(dialogPhases.introduction[0]);
    });
  }

  createSceneBox(x, y, sceneData, width, height) {
    // Create main box
    const box = this.add.rectangle(x, y, width + 100, height, 0x3d2f1f);
    box.setStrokeStyle(3, 0x8b4513);
    box.setInteractive();
    box.setData("sceneData", sceneData);

    // Create image placeholder - bigger size
    const imageY = y - 20;
    const imageSize = 180; // Increased from 60 to 100

    // Try to load the actual image, fallback to colored rectangle
    let sceneImage;
    try {
      // Use static icon for all scenes
      console.log(
        "Creating scene image with texture:",
        sceneData.icon,
        "for scene:",
        sceneData.name
      );
      sceneImage = this.add.image(x, imageY, sceneData.icon);
      sceneImage.setDisplaySize(imageSize, imageSize);
      console.log("Scene image created successfully");
    } catch (e) {
      console.log("Error creating scene image:", e);
      // Fallback to colored rectangle if image not found
      sceneImage = this.add.rectangle(
        x,
        imageY,
        imageSize,
        imageSize,
        0x8b4513
      );
    }

    // Add pixelated rendering
    sceneImage.setData("originalTexture", sceneData.icon);
    sceneImage.setData("animKey", sceneData.animKey);
    sceneImage.setData("isAnimating", false);

    // Create scene name text
    const nameText = this.add
      .text(x, y + 90, sceneData.name, {
        fontSize: "16px",
        color: "#deb887",
        fontFamily: "'Press Start 2P', Courier New",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Create status text - all scenes are available
    const statusText = this.add.text().setOrigin(0.5);

    // Hover effects with sprite sheet animations - all scenes always available
    box.on("pointerover", () => {
      this.tweens.add({
        targets: box,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        ease: "Sine.easeInOut",
      });

      // Show scene-specific explanation in dialog
      if (sceneData.explanation) {
        this.showSceneExplanation(sceneData.explanation);
      }

      // Start video on hover (for all scenes with videos)
      if (sceneData.animKey) {
        console.log(
          "Starting video for",
          sceneData.name,
          "scene:",
          sceneData.animKey
        );

        // Clean up any existing video first
        if (sceneImage.getData("videoObject")) {
          const existingVideo = sceneImage.getData("videoObject");
          existingVideo.destroy();
          sceneImage.setData("videoObject", null);
        }

        try {
          const video = this.add.video(
            sceneImage.x,
            sceneImage.y,
            sceneData.animKey
          );
          // Individual scaling for each video
          let videoWidth, videoHeight;
          switch (sceneData.key) {
            case "heatmap":
              videoWidth = 65;
              videoHeight = 75;
              break;
            case "flood":
              videoWidth = 110;
              videoHeight = 70;
              break;
            case "drought":
              videoWidth = 145;
              videoHeight = 145;
              break;
            case "salinized":
              videoWidth = 120;
              videoHeight = 100;
              break;
            case "water":
              videoWidth = 160;
              videoHeight = 160;
              break;
            default:
              videoWidth = 180;
              videoHeight = 180;
          }

         
          video.setMute(true); // Mute videos to avoid autoplay restrictions
          video.play(true); // Loop the video
          video.setData("isVideo", true);
          sceneImage.setVisible(false); // Hide the static image
          sceneImage.setData("videoObject", video);
          sceneImage.setData("isAnimating", true);
          console.log("Video created and playing for", sceneData.name);
          video.setDisplaySize(videoWidth, videoHeight);
        } catch (e) {
          console.log("Video error for", sceneData.name, ":", e);
        }
      }
    });

    box.on("pointerout", () => {
      this.tweens.add({
        targets: box,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Sine.easeInOut",
      });

      // Return to introduction text when not hovering
      if (this.isShowingHover) {
        this.showIntroductionText();
      }

      // Stop video and switch back to static image
      if (sceneImage.getData("isAnimating")) {
        console.log("Stopping video for", sceneData.name, "scene");
        const video = sceneImage.getData("videoObject");
        if (video) {
          video.stop();
          video.destroy();
          console.log("Video stopped and destroyed for", sceneData.name);
        }
        sceneImage.setVisible(true); // Show the static image again
        sceneImage.setData("videoObject", null);
        sceneImage.setData("isAnimating", false);
        console.log("Static image made visible again for", sceneData.name);
      }
    });

    // Click handler - all scenes always available
    box.on("pointerdown", () => {
      const sceneData = box.getData("sceneData");
      console.log(`Clicked on scene: ${sceneData.name}`);

      if (sceneData.scene) {
        this.scene.stop("scene-intro"); // Stop intro
        this.scene.stop("exploreScene"); // Stop explore scene too!
        this.scene.start(sceneData.scene); // Start the game scene
      }
    });

    // Store reference
    this.sceneBoxes.push({
      box,
      sceneData,
      image: sceneImage,
      nameText,
      statusText,
    });
  }

  // Method to be called when returning from a scene (no longer needed for unlocking)
  onSceneComplete(sceneKey) {
    // All scenes are always available now
    console.log(`Completed scene: ${sceneKey}`);
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
      .text(width / 2, 40, "CRISIS SCENARIOS", {
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

  addPixelPatches() {
    // Add scattered brown pixel patches for pixel art effect
    const colors = [0x3d2f1f, 0x4a3c2a, 0x5a4a3a, 0x2a1f15];

    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);
      const size = Phaser.Math.Between(2, 8);
      const color = Phaser.Utils.Array.GetRandom(colors);

      this.add.rectangle(x, y, size, size, color);
    }
  }

  createDialogBox() {
    // Position dialog box to the right of the grid but closer
    // const gridRightEdge = this.scale.width / 2 + 150; // Adjusted to be closer
    // const dialogX = gridRightEdge + 300; // Reduced from 150 to 100
    const dialogX = this.scale.width / 2 - 400; // center horizontally, moved a bit to the right

    // const dialogY = this.scale.height-150;
    const dialogY = this.scale.height - 180;

    this.dialogContainer = this.add
      .container(dialogX, dialogY)
      .setDepth(10)
      .setAlpha(0);

    // Smaller dialog box dimensions
    // const dialogBoxBg = this.add.rectangle(0, 0, 300, 120, 0x1a1a2e, 0.98); // Reduced from 400x200 to 320x150
    const dialogBoxBg = this.add.rectangle(0, 0, 260, 190, 0x1a1a2e, 0.98);

    dialogBoxBg.setStrokeStyle(3, 0x00cc00); // Slightly thinner border

    // Add farmer character to the left of the dialog
    const farmerX = -(260 / 2 + 60); // Position to the left of the dialog box
    const farmerY = 0; // Vertically centered
    this.farmer = this.add
      .image(farmerX, farmerY, "farmer")
      .setOrigin(0.5)
      .setScale(0.3); // Made way smaller

    // Smaller speaker indicator
    const speakerBg = this.add.rectangle(0, -70, 80, 20, 0x00cc00);
    const speakerText = this.add
      .text(0, -70, "GUIDE", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "9px",
        color: "#0a2f4a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Adjusted text with smaller dimensions
    this.dialogText = this.add
      .text(0, -30, "", {
        // Adjusted vertical position
        fontFamily: "Courier New",
        fontSize: "15px", // Slightly smaller font
        color: "#e0f7ff",
        wordWrap: { width: 250, useAdvancedWrap: true }, // Reduced wrap width
        align: "left",
        lineSpacing: 4, // Reduced spacing
      })
      .setOrigin(0.5, 0);

    // Smaller click indicator
    this.clickText = this.add
      .text(0, 55, "▼ CLICK TO CONTINUE ▼", {
        // Adjusted vertical position
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "7px", // Smaller font
        color: "#66ccff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.tweens.add({
      targets: this.clickText,
      alpha: 0.4,
      y: 58, // Adjusted to match new position
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.dialogContainer.add([
      this.farmer,
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
      dialogBoxBg.setStrokeStyle(3, 0x00ff00);
    });

    dialogBoxBg.on("pointerout", () => {
      dialogBoxBg.setStrokeStyle(3, 0x00cc00);
    });

    // Gentle float (unchanged)
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

  createBackButton() {
    const backBtn = this.add.container(80, 120).setDepth(20);

    const btnBg = this.add
      .rectangle(0, 0, 140, 50, 0x3d2f1f, 0.95)
      .setStrokeStyle(3, 0x8b4513)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add
      .text(0, 0, "← BACK", {
        fontSize: "14px",
        fontFamily: "Courier New",
        color: "#deb887",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    backBtn.add([btnBg, btnText]);

    // Hover effects
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x8b4513, 0.95);
      btnText.setColor("#ffffff");
      this.tweens.add({
        targets: backBtn,
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
        targets: backBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Power2",
      });
    });

    // Click handler
    btnBg.on("pointerdown", () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start("scene-intro");
      });
    });
  }

  advanceDialog() {
    // Only advance if we're not showing a hover explanation
    if (!this.isShowingHover) {
      this.dialogIndex++;

      if (this.dialogIndex >= dialogPhases.introduction.length) {
        // All introduction dialogs completed
        this.typewriteDialog(
          "Select a scenario to learn about different crop challenges."
        );
        return;
      }
      this.typewriteDialog(dialogPhases.introduction[this.dialogIndex]);
    }
  }

  typewriteDialog(text) {
    // Don't start typing if we're showing a hover explanation
    if (this.isShowingHover) return;

    this.isTyping = true;
    this.currentTypewriterText = text;
    this.dialogText.setText("");
    this.clickText.setVisible(false);

    let i = 0;

    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
    }

    // Start talking animation for farmer
    if (this.farmer) {
      this.talkingTween = this.tweens.add({
        targets: this.farmer,
        angle: { from: -2, to: 2 },
        duration: 200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }

    this.typewriterTimer = this.time.addEvent({
      delay: 45,
      callback: () => {
        // Stop typing if hover started
        if (this.isShowingHover) {
          this.typewriterTimer.remove();
          return;
        }

        this.dialogText.text += text[i];
        i++;
        if (i >= text.length) {
          this.typewriterTimer.remove();
          this.isTyping = false;
          this.clickText.setVisible(true);
          if (this.talkingTween) {
            this.talkingTween.stop();
          }
        }
      },
      loop: true,
    });
  }

  // Update the completeTypewriter method:
  completeTypewriter() {
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
    }
    this.dialogText.setText(this.currentTypewriterText);
    this.isTyping = false;
    this.clickText.setVisible(true);
    if (this.talkingTween) {
      this.talkingTween.stop();
    }
  }

  showDialog(text) {
    this.dialogText.setText(text);
    this.dialogText.setAlpha(0);

    this.tweens.add({
      targets: this.dialogText,
      alpha: 1,
      duration: 600,
      ease: "Power2",
    });
  }

  //explanatons

  createHoverDialog() {
    const dialogX = this.scale.width * 0.75; // right side
    const dialogY = this.scale.height / 2 + 120; // under main box

    this.hoverDialog = this.add
      .container(dialogX, dialogY)
      .setDepth(11)
      .setAlpha(0)
      .setVisible(false);

    const hoverBg = this.add.rectangle(0, 0, 320, 100, 0x2a2a40, 0.95);
    hoverBg.setStrokeStyle(2, 0x00ccff);

    this.hoverText = this.add
      .text(0, 0, "", {
        fontFamily: "Courier New",
        fontSize: "13px",
        color: "#ffffff",
        wordWrap: { width: 300, useAdvancedWrap: true },
        align: "center",
      })
      .setOrigin(0.5);

    this.hoverDialog.add([hoverBg, this.hoverText]);
  }

  showHoverDialog(text) {
    this.hoverText.setText(text);
    this.hoverDialog.setVisible(true).setAlpha(0);
    this.tweens.add({
      targets: this.hoverDialog,
      alpha: 1,
      duration: 300,
    });
  }

  hideHoverDialog() {
    this.tweens.add({
      targets: this.hoverDialog,
      alpha: 0,
      duration: 200,
      onComplete: () => this.hoverDialog.setVisible(false),
    });
  }

  drawConnectingLines(
    scenes,
    startX,
    startY,
    boxWidth,
    boxHeight,
    spacingX,
    spacingY
  ) {
    // Calculate center positions for all 5 scenes
    const positions = [];
    scenes.forEach((scene, index) => {
      let x, y;

      if (index < 3) {
        // Top row - 3 boxes
        const col = index;
        x = startX + col * (boxWidth + spacingX) + boxWidth / 2;
        y = startY + boxHeight / 2;
      } else {
        // Bottom row - 2 boxes, centered
        const col = index - 3;
        const centerOffset = (boxWidth + spacingX) / 2;
        x = startX + col * (boxWidth + spacingX) + boxWidth / 2 + centerOffset;
        y = startY + boxHeight + spacingY + boxHeight / 2;
      }
      positions.push({ x, y });
    });

    // Define connecting order: top row left->right, then connect to bottom row
    const connectingOrder = [0, 1, 2, 3, 4]; // Simple linear order

    // Create graphics object for drawing lines
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0x8b4513, 0.8); // Brown dotted line

    // Draw dotted lines connecting scenes in order
    for (let i = 0; i < connectingOrder.length - 1; i++) {
      const fromIndex = connectingOrder[i];
      const toIndex = connectingOrder[i + 1];

      const fromPos = positions[fromIndex];
      const toPos = positions[toIndex];

      // Create dotted line effect
      this.drawDottedLine(graphics, fromPos.x, fromPos.y, toPos.x, toPos.y);
    }

    // Optional: Connect last box back to first for a complete loop
    this.drawDottedLine(
      graphics,
      positions[4].x,
      positions[4].y,
      positions[0].x,
      positions[0].y
    );
  }

  drawDottedLine(graphics, x1, y1, x2, y2, dashLength = 10, gapLength = 5) {
    const distance = Phaser.Math.Distance.Between(x1, y1, x2, y2);
    const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);

    const totalLength = dashLength + gapLength;
    const dashCount = Math.floor(distance / totalLength);

    for (let i = 0; i < dashCount; i++) {
      const startRatio = (i * totalLength) / distance;
      const endRatio = (i * totalLength + dashLength) / distance;

      const startX = Phaser.Math.Interpolation.Linear([x1, x2], startRatio);
      const startY = Phaser.Math.Interpolation.Linear([y1, y2], startRatio);
      const endX = Phaser.Math.Interpolation.Linear([x1, x2], endRatio);
      const endY = Phaser.Math.Interpolation.Linear([y1, y2], endRatio);

      graphics.moveTo(startX, startY);
      graphics.lineTo(endX, endY);
    }
  }
  showSceneExplanation(explanation) {
    this.isShowingHover = true;
    this.currentSceneExplanation = explanation;

    // Stop any current typing
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
    }

    // Hide the click text during hover
    this.clickText.setVisible(false);

    // Set the text immediately for hover
    this.dialogText.setText(explanation);
    this.dialogText.setAlpha(1);
  }

  showIntroductionText() {
    this.isShowingHover = false;
    this.currentSceneExplanation = null;

    // Show the last introduction dialog or a default message
    if (this.dialogIndex < dialogPhases.introduction.length) {
      const currentIntro = dialogPhases.introduction[this.dialogIndex];
      this.typewriteDialog(currentIntro);
    } else {
      // All introduction dialogs completed, show default message
      this.typewriteDialog(
        "Select a scenario to learn about different crop challenges."
      );
    }
  }

  shutdown() {
    // Clean up any audio when leaving explore scene, but preserve main soundtrack
    if (this.sound && this.sound.context) {
      // Stop all sounds except the main soundtrack
      const mainSoundtrack = this.game.registry.get("mainSoundtrackInstance");
      if (mainSoundtrack) {
        // Temporarily stop all, then restart main soundtrack
        this.sound.stopAll();
        mainSoundtrack.play();
      } else {
        this.sound.stopAll();
      }
    }
  }
}

export default exploreScene;
