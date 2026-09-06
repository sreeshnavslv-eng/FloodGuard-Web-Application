import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";

export default class HeatmapScene extends Phaser.Scene {
  constructor() {
    super({ key: "HeatmapScene" });
    this.overlayEl = null;
    this.currentZoom = 1;
    this.isDragging = false;
    this.lastPointer = { x: 0, y: 0 };
  }

  preload() {
    console.log("HeatmapScene preload() called");
    console.log("Current URL:", window.location.href);

    // Load your global heatmap
    this.load.image("heatmap", "./assets/heatmap.png");

    // Load click sound
    this.load.audio("clickSound", "./assets/click.mp3");

    // Load wrong and right soundtrack sounds
    this.load.audio("wrongSound", "./assets/sound/wrong_soundtrack.mp3");
    this.load.audio("rightSound", "./assets/sound/right-soundtrack.mp3");

    // No background music loading
    this.load.image("indian_farmer", "./assets/indian_farmer.png");
    // Debug loading

    // Load world map base (you might need to add this)
    // this.load.image("worldmap", "/assets/world_map.png");

    // Create hotspot markers - use simple colored circle
    // Removed data URI to avoid loading issues

    // Debug loading
    this.load.on("filecomplete-image-heatmap", () => {
      console.log("✅ Heatmap loaded successfully");
    });

    // Removed hotspot marker debug code

    this.load.on("loaderror", (file) => {
      console.error("❌ Failed to load:", file.key, "from path:", file.url);
    });
  }

  create() {
    console.log("HeatmapScene create() called");

    // Initialize click sound
    this.clickSound = this.sound.add("clickSound", { volume: 0.3 });

    // Initialize wrong and right soundtrack sounds
    this.wrongSound = this.sound.add("wrongSound", { volume: 0.4 });
    this.rightSound = this.sound.add("rightSound", { volume: 0.4 });

    // No background music - only click sounds

    // Hide the main UI overlay completely
    const ui = document.getElementById("uiOverlay");
    if (ui) {
      ui.style.display = "none";
      ui.style.visibility = "hidden";
      ui.style.opacity = "0";
      ui.style.pointerEvents = "none";
    }

    const { width, height } = this.scale;

    // Set the game background to match the pixelated theme
    this.cameras.main.setBackgroundColor(0x2d1810);

    // Create pixelated background like the farming theme
    this.createPixelatedBackground();

    // Create title with farming theme
    this.createTitle();

    // Create heatmap in left box with green frame
    this.createHeatmapBox();

    // Create video boxes on the right with red frames
    this.createVideoBoxes();

    // Create farmer character wandering in the middle
    this.createFarmer();

    // Create Indian farmer character on the left
    this.createIndianFarmer();

    // Create story text at bottom
    this.createStoryText();

    // Add back button (same style as water scene)
    this.createBackButton();
  }

  createPixelatedBackground() {
    const { width, height } = this.scale;

    // Dark soil base (ensure it covers the entire screen)
    const baseRect = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x2d1810
    );
    baseRect.setDepth(-1000); // Put it behind everything

    // Create pixelated dirt/soil pattern
    for (let x = 0; x < width; x += 16) {
      for (let y = 0; y < height; y += 16) {
        const rand = Math.random();
        let color = 0x2d1810; // Dark brown

        if (rand > 0.8) color = 0x3d2818; // Lighter brown
        else if (rand > 0.9) color = 0x1a0f08; // Darker brown

        const pixel = this.add.rectangle(x + 8, y + 8, 16, 16, color);
        pixel.setDepth(-999); // Behind everything but above base
      }
    }

    // Add some scattered pixel "rocks"
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const rock = this.add.rectangle(x, y, 8, 8, 0x5c5c5c);
      rock.setDepth(-998); // Above pixels but behind main content
    }
  }

  createTitle() {
    const { width } = this.scale;

    // Title background box
    const titleBg = this.add.rectangle(width / 2, 40, width - 40, 60, 0x0f3d0f);
    titleBg.setStrokeStyle(4, 0x00ff00);

    this.add
      .text(width / 2, 40, "GLOBAL CLIMATE HEATMAP", {
        fontSize: "24px",
        fontFamily: "Courier New",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Subtitle
  }

  createHeatmapBox() {
    const { width, height } = this.scale;

    // Left box - Heatmap with green frame (made bigger)
    const leftBox = this.add.rectangle(
      width / 4,
      height / 2 - 50,
      400,
      450,
      0x1a4d1a
    );
    leftBox.setStrokeStyle(4, 0x00cc00);
    leftBox.setInteractive();

    // Add hover effects to left box
    leftBox.on("pointerover", () => {
      // Stop any existing tweens first
      this.tweens.killTweensOf(leftBox);
      this.tweens.add({
        targets: leftBox,
        scale: 1.15,
        duration: 200,
        ease: "Power2",
      });
    });

    leftBox.on("pointerout", () => {
      // Stop any existing tweens first
      this.tweens.killTweensOf(leftBox);
      this.tweens.add({
        targets: leftBox,
        scale: 1,
        duration: 200,
        ease: "Power2",
      });
    });

    // Breathing animation for left box
    this.tweens.add({
      targets: leftBox,
      scale: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Left box title
    const leftTitleBg = this.add.rectangle(
      width / 4,
      height / 2 - 200,
      300,
      50,
      0x00cc00
    );
    this.add
      .text(width / 4, height / 2 - 200, "GLOBAL HEATMAP", {
        fontSize: "16px",
        fontFamily: "Courier New",
        color: "#000000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Heatmap image (made bigger and zoomable)
    const heatmapBg = this.add.rectangle(
      width / 4,
      height / 2 - 100,
      300,
      250,
      0x2d5016
    );
    heatmapBg.setStrokeStyle(3, 0x00cc00);

    // Add the actual heatmap image
    let heatmap;
    if (this.textures.exists("heatmap")) {
      heatmap = this.add.image(width / 4, height / 2 - 100, "heatmap");
      heatmap.setDisplaySize(300, 250);
      // Make heatmap interactive to open full-screen map
      heatmap.setInteractive();
      heatmap.on("pointerdown", () => {
        this.clickSound.play();
        this.openFullScreenMap();
      });
    } else {
      // Fallback colored rectangle
      heatmap = this.add.rectangle(
        width / 4,
        height / 2 - 100,
        300,
        250,
        0x2c5aa0
      );
      heatmap.setInteractive();
      heatmap.on("pointerdown", () => {
        this.clickSound.play();
        this.openFullScreenMap();
      });
    }

    // Animate heatmap bg scale
    this.tweens.add({
      targets: heatmapBg,
      scale: 1.02,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Left box description
    this.add
      .text(
        width / 4,
        height / 2 + 80,
        "Interactive global heatmap\nshowing extreme temperature\nzones worldwide.\n\nClick hotspots for details\nabout heat stress regions.",
        {
          fontSize: "15px",
          fontFamily: "Courier New",
          color: "#ccffcc",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Add pixel decorations around heatmap
  }

  createVideoBoxes() {
    const { width, height } = this.scale;

    // Right box - Videos with red frame (made bigger)
    const rightBox = this.add.rectangle(
      (3 * width) / 4,
      height / 2 - 50,
      400,
      450,
      0x4d1a1a
    );
    rightBox.setStrokeStyle(4, 0xcc0000);
    rightBox.setInteractive();

    // Add hover effects to right box
    rightBox.on("pointerover", () => {
      // Stop any existing tweens first
      this.tweens.killTweensOf(rightBox);
      this.tweens.add({
        targets: rightBox,
        scale: 1.15,
        duration: 200,
        ease: "Power2",
      });
    });

    rightBox.on("pointerout", () => {
      // Stop any existing tweens first
      this.tweens.killTweensOf(rightBox);
      this.tweens.add({
        targets: rightBox,
        scale: 1,
        duration: 200,
        ease: "Power2",
      });
    });

    // Breathing animation for right box
    this.tweens.add({
      targets: rightBox,
      scale: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Right box title
    const rightTitleBg = this.add.rectangle(
      (3 * width) / 4,
      height / 2 - 200,
      300,
      50,
      0xcc0000
    );
    this.add
      .text((3 * width) / 4, height / 2 - 200, "SOLUTION VIDEOS", {
        fontSize: "16px",
        fontFamily: "Courier New",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Video placeholders (made bigger and clickable)
    const video1 = this.add.rectangle(
      (3 * width) / 4,
      height / 2 - 120,
      250,
      80,
      0x502d16
    );
    video1.setStrokeStyle(3, 0xcc0000);
    video1.setInteractive();
    video1.on("pointerdown", () => {
      console.log("🎬 Video1 (mulching) clicked!");
      this.clickSound.play();
      this.playVideo("mulching");
    });
    video1.on("pointerover", () => {
      video1.setFillStyle(0x6d3d26);
      this.tweens.add({
        targets: video1,
        scale: 1.1,
        duration: 200,
        ease: "Power2",
      });
    });
    video1.on("pointerout", () => {
      video1.setFillStyle(0x502d16);
      this.tweens.add({
        targets: video1,
        scale: 1,
        duration: 200,
        ease: "Power2",
      });
    });

    // Breathing animation for video1
    this.tweens.add({
      targets: video1,
      scale: 1.02,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
    this.add
      .text((3 * width) / 4, height / 2 - 120, "MULCHING VIDEO", {
        fontSize: "14px",
        fontFamily: "Courier New",
        color: "#ffcccc",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const video2 = this.add.rectangle(
      (3 * width) / 4,
      height / 2 - 30,
      250,
      80,
      0x502d16
    );
    video2.setStrokeStyle(3, 0xcc0000);
    video2.setInteractive();
    video2.on("pointerdown", () => {
      console.log("🎬 Video2 (drip) clicked!");
      this.clickSound.play();
      this.playVideo("drip");
    });
    video2.on("pointerover", () => {
      video2.setFillStyle(0x6d3d26);
      this.tweens.add({
        targets: video2,
        scale: 1.1,
        duration: 200,
        ease: "Power2",
      });
    });
    video2.on("pointerout", () => {
      video2.setFillStyle(0x502d16);
      this.tweens.add({
        targets: video2,
        scale: 1,
        duration: 200,
        ease: "Power2",
      });
    });

    // Breathing animation for video2
    this.tweens.add({
      targets: video2,
      scale: 1.02,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
    this.add
      .text((3 * width) / 4, height / 2 - 30, "DRIP IRRIGATION", {
        fontSize: "14px",
        fontFamily: "Courier New",
        color: "#ffcccc",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const video3 = this.add.rectangle(
      (3 * width) / 4,
      height / 2 + 60,
      250,
      80,
      0x502d16
    );
    video3.setStrokeStyle(3, 0xcc0000);
    video3.setInteractive();
    video3.on("pointerdown", () => {
      console.log("🎬 Video3 (shadenet) clicked!");
      this.clickSound.play();
      this.playVideo("shadenet");
    });
    video3.on("pointerover", () => {
      video3.setFillStyle(0x6d3d26);
      this.tweens.add({
        targets: video3,
        scale: 1.1,
        duration: 200,
        ease: "Power2",
      });
    });
    video3.on("pointerout", () => {
      video3.setFillStyle(0x502d16);
      this.tweens.add({
        targets: video3,
        scale: 1,
        duration: 200,
        ease: "Power2",
      });
    });

    // Breathing animation for video3
    this.tweens.add({
      targets: video3,
      scale: 1.02,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
    this.add
      .text((3 * width) / 4, height / 2 + 60, "SHADE NET VIDEO", {
        fontSize: "14px",
        fontFamily: "Courier New",
        color: "#ffcccc",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Right box description
    this.add
      .text(
        (3 * width) / 4,
        height / 2 + 130,
        "\nClick videos to \nLearn farming solutions\n to combat heat stress.",
        {
          fontSize: "15px",
          fontFamily: "Courier New",
          color: "#ffcccc",
          align: "center",
        }
      )
      .setOrigin(0.5);
  }

  createFarmer() {
    const { width, height } = this.scale;

    // Create farmer sprite in the middle (using farmer.png if available)
    let farmer;
    if (this.textures.exists("farmer")) {
      farmer = this.add.image(width / 2, height / 2, "farmer");
      farmer.setDisplaySize(70, 70);
    } else {
      // Fallback farmer sprite
      farmer = this.add.rectangle(width / 2, height / 2, 32, 32, 0x8b4513);
      farmer.setStrokeStyle(2, 0x654321);

      // Add farmer details
      this.add.rectangle(width / 2, height / 2 - 8, 16, 16, 0xffdbac); // Head
      this.add.rectangle(width / 2, height / 2 + 8, 20, 12, 0x228b22); // Body
    }

    // Move farmer up and down in the middle
    this.tweens.add({
      targets: farmer,
      y: height / 2 - 80,
      duration: 2000,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  createIndianFarmer() {
    const { width, height } = this.scale;

    // Create Indian farmer character on the left side, above the dialogue area
    let indianFarmer;
    if (this.textures.exists("indian_farmer")) {
      indianFarmer = this.add.image(330, height - 150, "indian_farmer");
      indianFarmer.setDisplaySize(120, 120);
      indianFarmer.setDepth(10); // Make sure it's on top
    } else {
      // Fallback Indian farmer sprite
      indianFarmer = this.add.rectangle(100, height - 200, 40, 40, 0x8b4513);
      indianFarmer.setStrokeStyle(2, 0x654321);
      indianFarmer.setDepth(10);

      // Add farmer details
      this.add.rectangle(100, height - 200 - 8, 20, 20, 0xffdbac).setDepth(11); // Head
      this.add.rectangle(100, height - 200 + 8, 24, 16, 0x228b22).setDepth(11); // Body
    }

    // Add breathing animation (bigger/smaller scale)
    this.tweens.add({
      targets: indianFarmer,
      scaleX: 0.2,
      scaleY: 0.2,
      duration: 1500,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    // Add subtle floating animation
    // this.tweens.add({
    //   targets: indianFarmer,
    //   y: height - 200 - 10,
    //   duration: 2000,
    //   ease: "Sine.inOut",
    //   yoyo: true,
    //   repeat: -1,
    // });
  }

  createStoryText() {
    const { width, height } = this.scale;

    // Story background box
    const storyBg = this.add.rectangle(
      width / 2,
      height - 80,
      width - 60,
      120,
      0x1a1a2e
    );
    storyBg.setStrokeStyle(3, 0xffd700);

// ✅ Speaker tag (above the story box)
 const speakerBg = this.add.rectangle(width/2-200, height-140, 160, 30, 0xff0000);
  this.speakerTag = this.add.text(
    width / 2-240,  // move left a bit for alignment
    height - 140,     // a little above the box
    "RAMESH",      // change dynamically if needed
    {
      fontSize: "14px",
      fontFamily: "'Press Start 2P', Courier New",
      color: "#ffffffff",
      fontStyle: "bold",
    }
  ).setOrigin(0, 0.5);

    const storyText =
      "Hi I am Ramesh, you arrived at the right time here in India! we have a problem with the crops! \n\n" +
      "CRISIS: Extreme heat is destroying farmland worldwide...\n\n";
    this.typewriteText(width / 2, height - 80, storyText, () => {
      this.createExploreButton();
    });
  }

  createExploreButton() {
    const { width, height } = this.scale;

    const buttonY = height - 20;

    // Create button container
    const buttonContainer = this.add.container(width / 2, buttonY);

    // Button background
    const buttonBg = this.add
      .rectangle(0, 0, 200, 40, 0x0f3d0f)
      .setStrokeStyle(2, 0x00ff00);

    // Button text
    const buttonText = this.add
      .text(0, 0, "EXPLORE SOLUTIONS", {
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
      buttonBg.setFillStyle(0x1a4d1a);
    });
    buttonContainer.on("pointerout", () => {
      buttonBg.setFillStyle(0x0f3d0f);
    });

    // Click effect
    buttonContainer.on("pointerdown", () => {
      this.clickSound.play();
      // Restore the main UI before transitioning
      const ui = document.getElementById("uiOverlay");
      if (ui) {
        ui.style.display = "";
        ui.style.visibility = "visible";
        ui.style.opacity = "1";
        ui.style.pointerEvents = "auto";
      }
      this.scene.start("heat-GameScene");
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

  typewriteText(x, y, text, onComplete) {
    const content = this.add
      .text(x, y, "", {
        fontSize: "18px",
        fontFamily: "Courier New",
        color: "#ffd700",
        align: "center",
        wordWrap: { width: 700 },
      })
      .setOrigin(0.5);

    let i = 0;
    const timer = this.time.addEvent({
      delay: 40,
      callback: () => {
        content.text += text[i];
        i++;
        if (i >= text.length) {
          timer.remove();
          if (onComplete) {
            this.time.delayedCall(500, onComplete);
          }
        }
      },
      loop: true,
    });
  }

  addHeatPixels(x, y, color) {
    for (let i = 0; i < 5; i++) {
      this.add.rectangle(x, y + i * 8, 8, 8, color);
      this.add.rectangle(x + 8, y + i * 8, 8, 8, 0xff4444);
    }
  }

  addSolutionPixels(x, y) {
    for (let i = 0; i < 5; i++) {
      this.add.rectangle(x, y + i * 8, 8, 8, 0x00ff00);
      this.add.rectangle(x - 8, y + i * 8, 8, 8, 0x00cc00);
    }
  }

  createDOMOverlay() {
    console.log("🔧 createDOMOverlay() method called!");
    this.overlayEl = document.createElement("section");
    this.overlayEl.className = "ui-overlay";
    this.overlayEl.id = "heatmapOverlay";
    this.overlayEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #0f0f23;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `;

    // Header with title and controls
    const header = document.createElement("div");
    header.style.cssText = `
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(10px);
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      width: 100%;
      box-sizing: border-box;
    `;

    const titleSection = document.createElement("div");
    const title = document.createElement("h1");
    title.style.cssText = `
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    `;
    title.textContent = "🌍 Global Climate Heatmap Explorer";

    const subtitle = document.createElement("p");
    subtitle.style.cssText = `
      color: #e0e0e0;
      font-size: 14px;
      margin: 5px 0 0 0;
      opacity: 0.9;
    `;
    subtitle.textContent =
      "Explore extreme heat zones worldwide • Click glowing hotspots for details • Drag to pan • Scroll to zoom";

    titleSection.appendChild(title);
    titleSection.appendChild(subtitle);

    // Control buttons
    const controls = document.createElement("div");
    controls.style.cssText = `
      display: flex;
      gap: 12px;
      align-items: center;
    `;

    // Zoom controls
    const zoomIn = this.createControlButton("🔍+", "Zoom In");
    const zoomOut = this.createControlButton("🔍-", "Zoom Out");
    const resetView = this.createControlButton("🎯", "Reset View");

    console.log("🔧 Buttons created:", { zoomIn, zoomOut, resetView });
    console.log("🔧 Controls element:", controls);

    zoomIn.addEventListener("click", () => {
      console.log("🔍+ Zoom In button clicked!");
      this.clickSound.play();
      this.zoomIn();
    });
    zoomOut.addEventListener("click", () => {
      console.log("🔍- Zoom Out button clicked!");
      this.clickSound.play();
      this.zoomOut();
    });
    resetView.addEventListener("click", () => {
      console.log("🎯 Reset View button clicked!");
      this.clickSound.play();
      this.resetView();
    });

    controls.appendChild(zoomOut);
    controls.appendChild(resetView);
    controls.appendChild(zoomIn);

    console.log(
      "🔧 Buttons added to controls. Controls children:",
      controls.children.length
    );
    console.log("🔧 Controls HTML:", controls.innerHTML);

    // More Info button
    const moreInfoBtn = document.createElement("button");
    moreInfoBtn.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    `;
    moreInfoBtn.textContent = "🔍 Check Your Info";
    moreInfoBtn.addEventListener("click", () => {
      console.log("🔍 Check Your Info button clicked!");
      this.clickSound.play();

      // Restore the main UI before transitioning
      const ui = document.getElementById("uiOverlay");
      if (ui) {
        ui.style.display = "";
        ui.style.visibility = "visible";
        ui.style.opacity = "1";
        ui.style.pointerEvents = "auto";
        console.log("✅ UI overlay restored");
      }

      console.log("🚀 Starting GameScene...");
      this.scene.start("heat-GameScene"); // Navigate to the main game scene
    });
    moreInfoBtn.addEventListener("mouseenter", () => {
      moreInfoBtn.style.transform = "translateY(-2px)";
      moreInfoBtn.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
    });
    moreInfoBtn.addEventListener("mouseleave", () => {
      moreInfoBtn.style.transform = "translateY(0)";
      moreInfoBtn.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
    });

    controls.appendChild(moreInfoBtn);

    header.appendChild(titleSection);
    header.appendChild(controls);

    // Game canvas container
    const gameContainer = document.createElement("div");
    gameContainer.style.cssText = `
      flex: 1;
      position: relative;
      overflow: hidden;
      border: 2px solid rgba(255,255,255,0.1);
      margin: 20px;
      border-radius: 12px;
      background: #1a1a2e;
    `;

    // Instructions overlay
    const instructions = document.createElement("div");
    instructions.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(10px);
      padding: 15px;
      border-radius: 10px;
      color: white;
      font-size: 12px;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const instructText = document.createElement("div");
    instructText.innerHTML = `
      <strong>🔥 Hottest Regions:</strong> Middle East (48°C) • Sahara Desert (46°C) • South Asia (45°C) • Australian Outback (44°C) • South America (43°C)<br>
      <strong>Controls:</strong> Click glowing markers for details • Drag map to explore • Mouse wheel to zoom • Use controls for precise navigation
    `;

    const legendContainer = document.createElement("div");
    legendContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const legend = document.createElement("div");
    legend.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      background: linear-gradient(90deg, #0066cc, #00cc66, #ffcc00, #ff6600, #cc0000);
      padding: 4px 8px;
      border-radius: 15px;
      font-size: 10px;
    `;
    legend.innerHTML =
      '<span style="color: #000; font-weight: bold;">COOL → HOT</span>';

    legendContainer.appendChild(legend);
    instructions.appendChild(instructText);
    instructions.appendChild(legendContainer);

    gameContainer.appendChild(instructions);

    // Tooltip container
    this.tooltipEl = document.createElement("div");
    this.tooltipEl.style.cssText = `
      position: absolute;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      pointer-events: none;
      z-index: 100;
      display: none;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    gameContainer.appendChild(this.tooltipEl);

    this.overlayEl.appendChild(header);
    this.overlayEl.appendChild(gameContainer);

    // Move Phaser canvas into our container
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 10px;
      `;
      gameContainer.appendChild(canvas);
    }

    document.body.appendChild(this.overlayEl);
    console.log(
      "🔧 Overlay added to body. Body children:",
      document.body.children.length
    );
    console.log("🔧 Overlay element:", this.overlayEl);
    console.log("🔧 Overlay HTML:", this.overlayEl.innerHTML);

    // Check for conflicting elements
    const allOverlays = document.querySelectorAll(
      '[id*="Overlay"], [class*="overlay"]'
    );
    console.log("🔧 All overlay elements found:", allOverlays);

    // Check if our overlay is actually visible
    const computedStyle = window.getComputedStyle(this.overlayEl);
    console.log("🔧 Overlay computed style:", {
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity,
      zIndex: computedStyle.zIndex,
    });
  }

  createControlButton(text, title) {
    console.log("🔧 Creating button:", text, title);
    const button = document.createElement("button");
    button.style.cssText = `
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.3s ease;
      z-index: 1000;
      position: relative;
    `;
    button.textContent = text;
    button.title = title;
    console.log("🔧 Button created:", button);

    button.addEventListener("mouseenter", () => {
      button.style.background = "rgba(255,255,255,0.2)";
      button.style.transform = "scale(1.1)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.background = "rgba(255,255,255,0.1)";
      button.style.transform = "scale(1)";
    });

    return button;
  }

  showHotspotTooltip(hotspot) {
    this.tooltipEl.style.display = "block";
    this.tooltipEl.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">${hotspot.name}</div>
      <div style="color: #ff6666; font-size: 16px; font-weight: bold;">${hotspot.temp}</div>
      <div style="font-size: 12px; opacity: 0.8;">Click for details</div>
    `;
  }

  hideTooltip() {
    this.tooltipEl.style.display = "none";
  }

  showHotspotDetails(hotspot) {
    // Create detailed popup
    const popup = document.createElement("div");
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #2c3e50, #34495e);
      color: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      z-index: 1001;
      max-width: 400px;
      width: 90%;
      text-align: center;
    `;

    popup.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">🔥 ${
        hotspot.name
      }</div>
      <div style="font-size: 32px; color: #ff6666; font-weight: bold; margin: 15px 0;">${
        hotspot.temp
      }</div>
      <div style="margin: 15px 0; opacity: 0.9;">${hotspot.description}</div>
      <div style="margin: 20px 0;">
        <strong>Affected Countries:</strong><br>
        ${hotspot.countries.join(", ")}
      </div>
      <button onclick="this.parentElement.remove()" style="
        background: #e74c3c;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        margin-top: 15px;
        font-weight: bold;
      ">Close</button>
    `;

    document.body.appendChild(popup);

    // Auto-close after 5 seconds
    setTimeout(() => {
      if (popup.parentElement) {
        popup.remove();
      }
    }, 5000);
  }

  zoomIn() {
    console.log("🔍+ zoomIn() method called, current zoom:", this.currentZoom);
    if (this.currentZoom < 3) {
      this.currentZoom += 0.3;
      this.cameras.main.setZoom(this.currentZoom);
      console.log("✅ Zoom increased to:", this.currentZoom);

      // Add zoom feedback
      this.showZoomFeedback("Zoom In");
    } else {
      console.log("❌ Zoom already at maximum");
    }
  }

  zoomOut() {
    if (this.currentZoom > 0.3) {
      this.currentZoom -= 0.3;
      this.cameras.main.setZoom(this.currentZoom);

      // Add zoom feedback
      this.showZoomFeedback("Zoom Out");
    }
  }

  resetView() {
    this.currentZoom = 1;
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(800, 500);

    // Add reset feedback
    this.showZoomFeedback("View Reset");
  }

  showZoomFeedback(message) {
    // Create temporary feedback text
    const feedback = this.add.text(800, 100, message, {
      fontSize: "18px",
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
    });
    feedback.setOrigin(0.5, 0.5);
    feedback.setAlpha(0);

    // Fade in and out
    this.tweens.add({
      targets: feedback,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 800,
      onComplete: () => feedback.destroy(),
    });
  }

  createHotspotMarkerSVG() {
    return `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="hotGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#ff6666;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#ff4444;stop-opacity:0.9" />
          <stop offset="80%" style="stop-color:#cc0000;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#990000;stop-opacity:0.6" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Outer glow ring -->
      <circle cx="25" cy="25" r="22" fill="none" stroke="#ff4444" stroke-width="2" opacity="0.6" filter="url(#glow)"/>
      <!-- Main marker -->
      <circle cx="25" cy="25" r="18" fill="url(#hotGradient)" stroke="#ffffff" stroke-width="3"/>
      <!-- Inner highlight -->
      <circle cx="25" cy="25" r="12" fill="#ffffff" opacity="0.4"/>
      <!-- Center dot -->
      <circle cx="25" cy="25" r="6" fill="#ffffff"/>
      <!-- Temperature icon -->
      <text x="25" y="30" text-anchor="middle" fill="#000000" font-size="12" font-weight="bold">°</text>
    </svg>`;
  }

  update() {
    // Update tooltip position based on mouse
    this.input.on("pointermove", (pointer) => {
      if (this.tooltipEl && this.tooltipEl.style.display === "block") {
        this.tooltipEl.style.left = pointer.x + 10 + "px";
        this.tooltipEl.style.top = pointer.y - 10 + "px";
      }
    });
  }

  zoomHeatmap(heatmap) {
    // Toggle zoom on heatmap
    if (heatmap.scaleX === 1) {
      this.tweens.add({
        targets: heatmap,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 500,
        ease: "Power2",
      });
      // Enable panning when zoomed
      this.enableHeatmapPanning(heatmap);
    } else {
      this.tweens.add({
        targets: heatmap,
        scaleX: 1,
        scaleY: 1,
        duration: 500,
        ease: "Power2",
      });
      // Reset position when zooming out
      this.tweens.add({
        targets: heatmap,
        x: this.scale.width / 4,
        y: this.scale.height / 2 - 100,
        duration: 500,
        ease: "Power2",
      });
      this.disableHeatmapPanning(heatmap);
    }
  }

  enableHeatmapPanning(heatmap) {
    const { width, height } = this.scale;
    const heatmapBox = {
      x: width / 4,
      y: height / 2 - 100,
      width: 300,
      height: 250,
    };

    heatmap.setInteractive();
    heatmap.on("pointerdown", (pointer) => {
      this.isDragging = true;
      this.lastPointer = { x: pointer.x, y: pointer.y };
    });

    this.input.on("pointermove", (pointer) => {
      if (this.isDragging && heatmap.scaleX > 1) {
        const deltaX = pointer.x - this.lastPointer.x;
        const deltaY = pointer.y - this.lastPointer.y;

        // Calculate new position with bounds checking
        let newX = heatmap.x + deltaX;
        let newY = heatmap.y + deltaY;

        // Keep heatmap within its box bounds
        const maxX = heatmapBox.x + heatmapBox.width / 2;
        const minX = heatmapBox.x - heatmapBox.width / 2;
        const maxY = heatmapBox.y + heatmapBox.height / 2;
        const minY = heatmapBox.y - heatmapBox.height / 2;

        newX = Phaser.Math.Clamp(newX, minX, maxX);
        newY = Phaser.Math.Clamp(newY, minY, maxY);

        heatmap.setPosition(newX, newY);
        this.lastPointer = { x: pointer.x, y: pointer.y };
      }
    });

    this.input.on("pointerup", () => {
      this.isDragging = false;
    });
  }

  disableHeatmapPanning(heatmap) {
    heatmap.removeAllListeners("pointerdown");
    this.input.removeAllListeners("pointermove");
    this.input.removeAllListeners("pointerup");
  }

  playVideo(videoType) {
    console.log("🎬 playVideo called with type:", videoType);

    // Create video modal
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      z-index: 2000;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    const videoContainer = document.createElement("div");
    videoContainer.style.cssText = `
      background: #1a1a2e;
      padding: 20px;
      border-radius: 10px;
      border: 2px solid #cc0000;
      width: 90%;
      height: 90%;
      max-width: 1000px;
      max-height: 700px;
      display: flex;
      flex-direction: column;
      position: relative;
    `;

    const video = document.createElement("video");
    video.controls = true;
    video.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      flex: 1;
    `;

    // Set video source based on type
    let videoSrc = "";
    let title = "";
    switch (videoType) {
      case "mulching":
        videoSrc = "./assets/mulching_video.mp4";
        title = "Mulching Techniques";
        break;
      case "drip":
        videoSrc = "./assets/drip_video.mp4";
        title = "Drip Irrigation System";
        break;
      case "shadenet":
        videoSrc = "./assets/fieldnet_video.mp4";
        title = "Shade Net Installation";
        break;
    }

    video.src = videoSrc;

    const titleEl = document.createElement("h3");
    titleEl.style.cssText = `
      color: #ffffff;
      text-align: center;
      margin: 0 0 15px 0;
      font-family: 'Courier New', monospace;
      flex-shrink: 0;
    `;
    titleEl.textContent = title;

    // Close button in top-right corner
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "✕";
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #cc0000;
      color: white;
      border: none;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    closeBtn.onclick = () => {
      document.body.removeChild(modal);
    };

    // Close on background click
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    };

    // Close on Escape key
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        document.body.removeChild(modal);
        document.removeEventListener("keydown", handleKeyPress);
      }
    };
    document.addEventListener("keydown", handleKeyPress);

    videoContainer.appendChild(titleEl);
    videoContainer.appendChild(video);
    videoContainer.appendChild(closeBtn);
    modal.appendChild(videoContainer);
    document.body.appendChild(modal);

    console.log("🎬 Video modal created and appended to body");
    console.log("🎬 Modal element:", modal);
    console.log("🎬 Video source:", videoSrc);
  }

  openFullScreenMap() {
    // Create full-screen map overlay
    const mapOverlay = document.createElement("div");
    mapOverlay.id = "fullScreenMap";
    mapOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.95);
      z-index: 3000;
      display: flex;
      flex-direction: column;
    `;

    // Header with controls
    const header = document.createElement("div");
    header.style.cssText = `
      background: linear-gradient(135deg, #1a4d1a, #2d5016);
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #00cc00;
    `;

    const title = document.createElement("h2");
    title.style.cssText = `
      color: #00ff00;
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 24px;
    `;
    title.textContent = "🌍 Global Climate Heatmap Explorer";

    // Control buttons
    const controls = document.createElement("div");
    controls.style.cssText = `
      display: flex;
      gap: 10px;
      align-items: center;
    `;

    // Close button
    const closeBtn = this.createMapButton("✕", "Close Map");
    closeBtn.style.background = "#cc0000";
    closeBtn.onclick = () => {
      document.body.removeChild(mapOverlay);
    };

    controls.appendChild(closeBtn);

    header.appendChild(title);
    header.appendChild(controls);

    // Map container
    const mapContainer = document.createElement("div");
    mapContainer.style.cssText = `
      flex: 1;
      position: relative;
      overflow: hidden;
      background: #0f0f23;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    // Add instruction text
    const instruction = document.createElement("div");
    instruction.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0, 255, 0, 0.1);
      color: #00ff00;
      padding: 10px 15px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      border: 1px solid #00ff00;
      z-index: 5;
    `;
    instruction.textContent =
      "🖱 Hover over the map and click the red markers for details";
    mapContainer.appendChild(instruction);

    // Create the interactive map
    this.createInteractiveMap(mapContainer);

    mapOverlay.appendChild(header);
    mapOverlay.appendChild(mapContainer);
    document.body.appendChild(mapOverlay);

    // Close on Escape key
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        document.body.removeChild(mapOverlay);
        document.removeEventListener("keydown", handleKeyPress);
      }
    };
    document.addEventListener("keydown", handleKeyPress);
  }

  createMapButton(text, title) {
    const button = document.createElement("button");
    button.textContent = text;
    button.title = title;
    button.style.cssText = `
      background: #00cc00;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 5px;
      cursor: pointer;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      transition: all 0.3s ease;
    `;
    button.addEventListener("mouseenter", () => {
      button.style.background = "#00ff00";
      button.style.transform = "scale(1.05)";
    });
    button.addEventListener("mouseleave", () => {
      button.style.background = "#00cc00";
      button.style.transform = "scale(1)";
    });
    return button;
  }

  createInteractiveMap(container) {
    // Create a large heatmap image
    const mapImg = document.createElement("img");
    mapImg.src = "./assets/heatmap.png";
    mapImg.style.cssText = `
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 3px solid transparent;
      border-radius: 10px;
    `;

    // Add hover effects to make it obviously clickable
    mapImg.addEventListener("mouseenter", () => {
      mapImg.style.border = "3px solid #00ff00";
      mapImg.style.transform = "scale(1.02)";
      mapImg.style.boxShadow = "0 0 20px rgba(0, 255, 0, 0.5)";
    });

    mapImg.addEventListener("mouseleave", () => {
      mapImg.style.border = "3px solid transparent";
      mapImg.style.transform = "scale(1)";
      mapImg.style.boxShadow = "none";
    });

    // Add hotspot markers
    this.addHotspotMarkers(container);

    container.appendChild(mapImg);
  }

  addHotspotMarkers(container) {
    const hotspots = [
      {
        name: "India - Delhi",
        temp: "48°C",
        x: 65,
        y: 35,
        description:
          "Extreme heat waves in Delhi and northern India. Temperatures reaching 48°C causing severe heat stress.",
        countries: ["India", "Pakistan", "Bangladesh"],
      },

      {
        name: "Sahara Desert",
        temp: "50°C",
        x: 45,
        y: 40,
        description:
          "The Sahara Desert experiences extreme temperatures, affecting millions across North Africa.",
        countries: ["Algeria", "Libya", "Egypt", "Sudan", "Mali", "Niger"],
      },
      {
        name: "Australia - Outback",
        temp: "47°C",
        x: 75,
        y: 60,
        description:
          "Australian Outback faces extreme heat with temperatures reaching 47°C, threatening wildlife and agriculture.",
        countries: ["Australia"],
      },
      {
        name: "South America - Brazil",
        temp: "44°C",
        x: 35,
        y: 50,
        description:
          "Brazilian Amazon and northeastern regions experiencing record-breaking temperatures.",
        countries: ["Brazil", "Venezuela", "Colombia"],
      },
    ];

    hotspots.forEach((hotspot, index) => {
      const marker = document.createElement("div");
      marker.style.cssText = `
        position: absolute;
        left: ${hotspot.x}%;
        top: ${hotspot.y}%;
        width: 30px;
        height: 30px;
        background: radial-gradient(circle, #ff4444, #cc0000);
        border: 3px solid #ffffff;
        border-radius: 50%;
        cursor: pointer;
        z-index: 10;
        animation: pulse 1.5s infinite;
        box-shadow: 0 0 15px rgba(255, 68, 68, 0.9);
        transition: all 0.3s ease;
        transform: translate(-50%, -50%);
      `;

      // Add pulse animation
      const style = document.createElement("style");
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);

      // Tooltip
      const tooltip = document.createElement("div");
      tooltip.style.cssText = `
        position: absolute;
        bottom: 25px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 5px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 20;
      `;
      tooltip.textContent = `${hotspot.name} - ${hotspot.temp}`;

      marker.appendChild(tooltip);
      container.appendChild(marker);

      // Enhanced hover effects to make markers more obvious
      marker.addEventListener("mouseenter", () => {
        tooltip.style.opacity = "1";
        marker.style.transform = "translate(-50%, -50%) scale(1.5)";
        marker.style.boxShadow = "0 0 25px rgba(255, 68, 68, 1)";
        marker.style.border = "4px solid #ffff00";
        marker.style.background = "radial-gradient(circle, #ff6666, #ff0000)";
      });

      marker.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
        marker.style.transform = "translate(-50%, -50%) scale(1)";
        marker.style.boxShadow = "0 0 15px rgba(255, 68, 68, 0.9)";
        marker.style.border = "3px solid #ffffff";
        marker.style.background = "radial-gradient(circle, #ff4444, #cc0000)";
      });

      // Click to show details
      marker.addEventListener("click", () => {
        this.clickSound.play();
        this.showHotspotDetails(hotspot);
      });
    });
  }

  showHotspotDetails(hotspot) {
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #2d1810;
      color: #00ff00;
      padding: 20px;
      border: 4px solid #00ff00;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
      z-index: 4000;
      max-width: 500px;
      width: 90%;
      text-align: center;
      font-family: 'Courier New', monospace;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
    `;

    modal.innerHTML = `
      <div style="
        font-size: 24px; 
        margin-bottom: 15px; 
        color: #ff4444;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        text-shadow: 2px 2px 0px #000000;
      ">🔥 ${hotspot.name}</div>
      
      <div style="
        font-size: 32px; 
        color: #ff6666; 
        font-weight: bold; 
        margin: 15px 0;
        font-family: 'Courier New', monospace;
        text-shadow: 2px 2px 0px #000000;
      ">${hotspot.temp}</div>
      
      <div style="
        margin: 20px 0; 
        line-height: 1.4; 
        font-size: 14px;
        font-family: 'Courier New', monospace;
        color: #ccffcc;
        text-shadow: 1px 1px 0px #000000;
      ">${hotspot.description}</div>
      
      <div style="
        margin: 20px 0; 
        padding: 12px; 
        background: #1a4d1a;
        border: 2px solid #00ff00;
        font-family: 'Courier New', monospace;
      ">
        <strong style="color: #00ff00; font-size: 14px;">AFFECTED COUNTRIES:</strong><br>
        <span style="color: #ccffcc; font-size: 12px;">${hotspot.countries.join(
          ", "
        )}</span>
      </div>
      
      <button onclick="this.parentElement.remove()" style="
        background: #cc0000;
        color: #ffffff;
        border: 3px solid #ff0000;
        padding: 10px 20px;
        cursor: pointer;
        margin-top: 15px;
        font-weight: bold;
        font-size: 14px;
        font-family: 'Courier New', monospace;
        text-shadow: 1px 1px 0px #000000;
        box-shadow: 3px 3px 0px #000000;
        transition: all 0.1s ease;
      " onmouseover="this.style.transform='translate(1px, 1px)'; this.style.boxShadow='2px 2px 0px #000000';" 
         onmouseout="this.style.transform='translate(0px, 0px)'; this.style.boxShadow='3px 3px 0px #000000';">
        CLOSE DETAILS
      </button>
    `;

    document.body.appendChild(modal);

    // Auto-close after 8 seconds
    setTimeout(() => {
      if (modal.parentElement) {
        modal.remove();
      }
    }, 8000);
  }

  createBackButton() {
    const backBtn = this.add.rectangle(50, 50, 120, 40, 0x3d2f1f);
    backBtn.setStrokeStyle(3, 0x8b4513);
    backBtn.setInteractive();

    const backText = this.add
      .text(50, 50, "← Back", {
        fontSize: "14px",
        color: "#deb887",
        fontFamily: "Courier New",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Hover effects
    backBtn.on("pointerover", () => {
      this.tweens.add({
        targets: backBtn,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: "Power2",
      });
      backBtn.setFillStyle(0x4a3c2a);
    });

    backBtn.on("pointerout", () => {
      this.tweens.add({
        targets: backBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Power2",
      });
      backBtn.setFillStyle(0x3d2f1f);
    });

    // Click handler
    backBtn.on("pointerdown", () => {
      this.clickSound.play();
      this.scene.start("exploreScene");
    });
  }

  cleanup() {
    if (this.overlayEl && this.overlayEl.parentNode) {
      this.overlayEl.parentNode.removeChild(this.overlayEl);
    }
    this.overlayEl = null;

    // Ensure main UI is restored when leaving heatmap scene
    const ui = document.getElementById("uiOverlay");
    if (ui) {
      ui.style.display = "";
      ui.style.visibility = "visible";
      ui.style.opacity = "1";
      ui.style.pointerEvents = "auto";
    }
  }
}
