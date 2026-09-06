import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";

// Enhanced dialog content for drainage level
const dialogPhases = {
  introduction: [
    "🚨 FLOOD RECOVERY MISSION! 🚨\n\nThe farm is already flooded! The BLUE tiles show where water has accumulated and needs drainage.\n\nYOUR MISSION: Use arrow keys to move the farmer → Pick up drainage pipes from the pile → Place pipes on flooded areas to drain the water!\n\nPress SPACEBAR to grab and drop pipes. Save the crops from drowning!",
  ],
  victory: [
    "RECOVERY SUCCESSFUL! 🎉\nYou've drained the floodwaters and saved the farm!",
  ],
};

export default class Level2Scene extends Phaser.Scene {
  constructor() {
    super("scene-level2");
  }

  preload() {
    // Farm background & assets - using flooded version
    this.load.image("bged", "./assets/bgrain.jpg");
    this.load.image("farm", "./assets/farmflooded.jpg"); // Different flooded background
    this.load.image("farmer", "./assets/farmerr.png");
    this.load.image("pipe", "./assets/pipe.png"); // New drainage pipe asset

    // Load the JSON flood grid (could be same as rain grid or different)
    this.load.json("floodGrid", "/floodgrid.json");

    // Load click sound
    this.load.audio("clickSound", "./assets/click.mp3");

    // Load wrong and right soundtrack sounds
    this.load.audio("wrongSound", "./assets/sound/wrong_soundtrack.mp3");
    this.load.audio("rightSound", "./assets/sound/right-soundtrack.mp3");

    // No background music loading
  }

  create() {
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;
    const width = this.sys.game.config.width;

    // Initialize click sound
    this.clickSound = this.sound.add("clickSound", { volume: 0.3 });

    // Initialize wrong and right soundtrack sounds
    this.wrongSound = this.sound.add("wrongSound", { volume: 0.4 });
    this.rightSound = this.sound.add("rightSound", { volume: 0.4 });

    // No background music - only click sounds

    const height = this.sys.game.config.height;

    this.dialogIndex = 0;
    this.heldDrainage = null;
    this.holdOffsetX = 30;
    this.holdOffsetY = -10;

    // Enhanced background with water overlay
    this.cameras.main.setBackgroundColor("#0a2f4e");
    this.createWaterBackground();

    this.bg = this.add.image(centerX, centerY, "bged").setOrigin(0.5);
    this.bg.displayWidth = width;
    this.bg.displayHeight = height;
    this.bg.setDepth(0);
    this.bg.setAlpha(0.8);

    this.createTitle();
    this.createBackButton();
    this.createFarmAndFloodGrid();
    this.createFarmerSprite();
    this.createDrainagePile(); // Changed from mulch to drainage
    this.createArrowKeysDisplay();
    this.createEnhancedInstructions();
    this.createDialogBox();

    this.addDecorativeElements();

    // MULTIPLE INPUT METHODS
    this.initializeAllInputMethods();

    // Fade in entrance
    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.typewriteDialog(dialogPhases.introduction[0]);
    });
  }

  createWaterBackground() {
    // Create water ripple effects for flooded atmosphere
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * this.sys.game.config.width;
      const y = Math.random() * this.sys.game.config.height;
      const ripple = this.add
        .circle(x, y, 5 + Math.random() * 15, 0x4499ff, 0.2)
        .setDepth(0.2);

      this.tweens.add({
        targets: ripple,
        radius: ripple.radius + 30 + Math.random() * 20,
        alpha: 0,
        duration: 2000 + Math.random() * 1000,
        repeat: -1,
        delay: Math.random() * 3000,
        ease: "Sine.out",
      });
    }
  }

  createArrowKeysDisplay() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Position arrow keys on the right side of the screen
    const arrowX = width - 200;
    const arrowY = height - 200;

    // Create arrow keys container
    this.arrowKeysContainer = this.add.container(arrowX, arrowY).setDepth(25);

    // Background for arrow keys area
    const arrowBg = this.add
      .rectangle(0, 0, 120, 120, 0x0a2f4a, 0.9)
      .setStrokeStyle(3, 0x4499dd)
      .setInteractive();

    // Title for arrow keys
    const arrowTitle = this.add
      .text(0, -50, "MOVE", {
        fontSize: "12px",
        fontFamily: "Courier New",
        color: "#66ccff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Create arrow keys
    const upArrow = this.add
      .rectangle(0, -25, 40, 40, 0x4499dd, 0.8)
      .setStrokeStyle(2, 0xffffff);
    const upArrowText = this.add
      .text(0, -25, "↑", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const downArrow = this.add
      .rectangle(0, 25, 40, 40, 0x4499dd, 0.8)
      .setStrokeStyle(2, 0xffffff);
    const downArrowText = this.add
      .text(0, 25, "↓", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const leftArrow = this.add
      .rectangle(-40, 0, 40, 40, 0x4499dd, 0.8)
      .setStrokeStyle(2, 0xffffff);
    const leftArrowText = this.add
      .text(-40, 0, "←", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const rightArrow = this.add
      .rectangle(40, 0, 40, 40, 0x4499dd, 0.8)
      .setStrokeStyle(2, 0xffffff);
    const rightArrowText = this.add
      .text(40, 0, "→", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Add all elements to container
    this.arrowKeysContainer.add([
      arrowBg,
      arrowTitle,
      upArrow,
      upArrowText,
      downArrow,
      downArrowText,
      leftArrow,
      leftArrowText,
      rightArrow,
      rightArrowText,
    ]);

    // Add pulsing animation to make arrows more noticeable
    this.tweens.add({
      targets: [upArrow, downArrow, leftArrow, rightArrow],
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  createEnhancedInstructions() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Create urgent mission panel
    const missionPanel = this.add.container(width / 2, 180).setDepth(20);

    const missionBg = this.add
      .rectangle(0, 0, 500, 80, 0x1a4d8b, 0.9) // Blue for water theme
      .setStrokeStyle(3, 0x44aaff);

    const missionText = this.add
      .text(0, -10, "🚨 EMERGENCY: DRAIN FLOODED AREAS! 🚨", {
        fontSize: "16px",
        fontFamily: "'Press Start 2P', Courier New",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const missionSubtext = this.add
      .text(0, 15, "Blue areas are flooded and need drainage pipes!", {
        fontSize: "12px",
        fontFamily: "Courier New",
        color: "#aaddff",
      })
      .setOrigin(0.5);

    missionPanel.add([missionBg, missionText, missionSubtext]);

    // Add controls explanation
    const controlsPanel = this.add
      .container(width / 2, height - 120)
      .setDepth(20);

    const controlsBg = this.add
      .rectangle(0, 0, 450, 60, 0x0a2f4a, 0.9)
      .setStrokeStyle(2, 0x4499dd);

    const controlsText = this.add
      .text(
        0,
        0,
        "ARROWS: Move Farmer    SPACEBAR: Pick Up/Drop Drainage Pipes",
        {
          fontSize: "12px",
          fontFamily: "Courier New",
          color: "#66ccff",
        }
      )
      .setOrigin(0.5);

    controlsPanel.add([controlsBg, controlsText]);

    // Add blinking animation to mission panel for attention
    this.tweens.add({
      targets: missionBg,
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  // ... (keep all the input methods, movement, and utility methods the same as Level1) ...

  initializeAllInputMethods() {
    console.log("=== SETTING UP ALL INPUT METHODS ===");

    // Method 1: Standard cursor keys
    try {
      this.cursors = this.input.keyboard.createCursorKeys();
      console.log("Cursor keys created");
    } catch (e) {
      console.error("Cursor keys failed:", e);
    }

    // Method 2: Individual arrow keys
    try {
      this.keyUp = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.UP
      );
      this.keyDown = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.DOWN
      );
      this.keyLeft = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.LEFT
      );
      this.keyRight = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.RIGHT
      );
      this.keySpace = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      console.log("Individual arrow keys created");
    } catch (e) {
      console.error("Individual keys failed:", e);
    }

    // Method 3: WASD keys as alternative
    try {
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      console.log("WASD keys created");
    } catch (e) {
      console.error("WASD keys failed:", e);
    }

    // Method 4: Global keyboard events as last resort
    try {
      this.setupGlobalKeyboard();
      console.log("Global keyboard events set up");
    } catch (e) {
      console.error("Global keyboard failed:", e);
    }

    // Method 5: Mouse/touch controls
    try {
      this.setupPointerControls();
      console.log("Pointer controls set up");
    } catch (e) {
      console.error("Pointer controls failed:", e);
    }

    // Focus management
    this.setupFocusManagement();

    console.log("=== ALL INPUT METHODS INITIALIZED ===");
  }

  setupGlobalKeyboard() {
    // Use global window events as backup
    this.globalKeys = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false,
    };

    // Global event listeners
    window.addEventListener("keydown", (event) => {
      console.log("GLOBAL KEYDOWN:", event.key, event.code);

      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          this.globalKeys.up = true;
          event.preventDefault();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          this.globalKeys.down = true;
          event.preventDefault();
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          this.globalKeys.left = true;
          event.preventDefault();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          this.globalKeys.right = true;
          event.preventDefault();
          break;
        case " ":
          this.globalKeys.space = true;
          event.preventDefault();
          break;
      }
    });

    window.addEventListener("keyup", (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          this.globalKeys.up = false;
          event.preventDefault();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          this.globalKeys.down = false;
          event.preventDefault();
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          this.globalKeys.left = false;
          event.preventDefault();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          this.globalKeys.right = false;
          event.preventDefault();
          break;
        case " ":
          this.globalKeys.space = false;
          event.preventDefault();
          break;
      }
    });
  }

  setupPointerControls() {
    // Mouse/touch movement
    this.input.on("pointermove", (pointer) => {
      if (pointer.isDown) {
        // Move farmer to pointer position
        this.farmer.x = Phaser.Math.Clamp(
          pointer.x,
          50,
          this.sys.game.config.width - 50
        );
        this.farmer.y = Phaser.Math.Clamp(
          pointer.y,
          100,
          this.sys.game.config.height - 100
        );
      }
    });

    // Click to pick up/drop drainage
    this.input.on("pointerdown", (pointer) => {
      this.clickSound.play();
      if (this.heldDrainage) {
        this.tryDropDrainage();
      } else {
        this.tryPickUpDrainage();
      }
    });
  }

  setupFocusManagement() {
    // Make canvas focusable
    this.game.canvas.setAttribute("tabindex", "0");
    this.game.canvas.style.outline = "none";

    // Focus on click
    this.game.canvas.addEventListener("click", () => {
      console.log("Canvas clicked - focusing");
      this.game.canvas.focus();
    });

    // Auto-focus after a delay
    this.time.delayedCall(1000, () => {
      this.game.canvas.focus();
      console.log("Auto-focused canvas");
    });
  }

  update() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Handle movement with all input methods
    this.handleMovement();

    // Update held drainage position
    if (this.heldDrainage) {
      this.heldDrainage.x = this.farmer.x + this.holdOffsetX;
      this.heldDrainage.y = this.farmer.y + this.holdOffsetY;
    }

    // Spacebar for pick/drop
    if (this.checkSpacePressed()) {
      if (this.heldDrainage) {
        this.tryDropDrainage();
      } else {
        this.tryPickUpDrainage();
      }
    }
  }

  handleMovement() {
    if (!this.cursors) return;

    let velocityX = 0;
    let velocityY = 0;

    // Horizontal movement
    if (this.cursors.left.isDown) {
      velocityX = -5;
      this.farmer.flipX = true;
    } else if (this.cursors.right.isDown) {
      velocityX = 5;
      this.farmer.flipX = false;
    }

    // Vertical movement - INDEPENDENT checks (no else if)
    if (this.cursors.up.isDown) {
      velocityY = -4;
    }
    if (this.cursors.down.isDown) {
      velocityY = 4;
    }

    // Apply movement
    if (velocityX !== 0 || velocityY !== 0) {
      this.farmer.x += velocityX;
      this.farmer.y += velocityY;

      console.log("Moving - Velocity:", { x: velocityX, y: velocityY });
      console.log("New position:", { x: this.farmer.x, y: this.farmer.y });
    }

    // Clamp position
    this.farmer.x = Phaser.Math.Clamp(
      this.farmer.x,
      50,
      this.sys.game.config.width - 50
    );
    this.farmer.y = Phaser.Math.Clamp(
      this.farmer.y,
      100,
      this.sys.game.config.height - 100
    );
  }

  checkSpacePressed() {
    // Safe checking for spacebar across all methods
    let spacePressed = false;

    // Method 1: Standard space key
    if (this.space && Phaser.Input.Keyboard.JustDown(this.space)) {
      spacePressed = true;
      console.log("SPACE: Standard space key");
    }

    // Method 2: Individual space key
    if (this.keySpace && Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      spacePressed = true;
      console.log("SPACE: Individual space key");
    }

    // Method 3: Global space key (reset after checking)
    if (this.globalKeys && this.globalKeys.space) {
      spacePressed = true;
      console.log("SPACE: Global space key");
      this.globalKeys.space = false; // Reset to prevent multiple triggers
    }

    return spacePressed;
  }

  tryDropDrainage() {
    for (let tile of this.floodedTiles) {
      const dist = Phaser.Math.Distance.Between(
        this.heldDrainage.x,
        this.heldDrainage.y,
        tile.rect.x,
        tile.rect.y
      );
      if (dist < this.tileWidth * 0.7) {
        // Place drainage on tile
        this.heldDrainage.x = tile.rect.x;
        this.heldDrainage.y = tile.rect.y;
        this.heldDrainage.setDepth(10);
        this.heldDrainage.placed = true;
        tile.drained = true;

        // Visual feedback - drainage effect
        this.tweens.add({
          targets: this.heldDrainage,
          scale: 0.2,
          duration: 200,
          ease: "Back.out",
        });

        // Play success sound
        this.rightSound.play();

        // Create water draining animation
        this.createDrainEffect(tile.rect.x, tile.rect.y);

        this.heldDrainage = null;
        this.checkWin();
        return;
      }
    }

    // If not placed on any tile, return to pile
    this.returnDrainageToPile();
  }

  createDrainEffect(x, y) {
    // Create water draining particles
    for (let i = 0; i < 8; i++) {
      const drop = this.add.circle(x, y, 2, 0x4499ff, 0.8).setDepth(11);

      this.tweens.add({
        targets: drop,
        y: y + 20 + Math.random() * 10,
        x: x + (Math.random() - 0.5) * 10,
        alpha: 0,
        scale: 0.5,
        duration: 400 + Math.random() * 200,
        ease: "Power2",
        onComplete: () => drop.destroy(),
      });
    }
  }

  tryPickUpDrainage() {
    for (let drainage of this.drainages.getChildren()) {
      if (!drainage.placed) {
        const dist = Phaser.Math.Distance.Between(
          this.farmer.x,
          this.farmer.y,
          drainage.x,
          drainage.y
        );
        if (dist < 80) {
          this.heldDrainage = drainage;
          this.heldDrainage.setDepth(20);

          // Visual feedback
          this.tweens.add({
            targets: this.heldDrainage,
            scale: 0.15,
            duration: 150,
            ease: "Back.out",
          });
          break;
        }
      }
    }
  }

  returnDrainageToPile() {
    if (this.heldDrainage) {
      // Return to a random position in the pile area
      this.heldDrainage.x = this.pileArea.x + (Math.random() - 0.5) * 40;
      this.heldDrainage.y = this.pileArea.y + (Math.random() - 0.5) * 30;
      this.heldDrainage.setDepth(5);
      this.heldDrainage.placed = false;
      this.heldDrainage = null;
    }
  }

  checkWin() {
    const allDrained = this.floodedTiles.every((tile) => tile.drained);
    if (allDrained) {
      console.log("Level Complete! All flooded areas drained.");
      this.rightSound.play(); // Play victory sound
      this.showVictory();
      this.scene.start("exploreScene"); // Proceed to explore scene after victory
    }
  }

  showVictory() {
    const victoryText = this.add
      .text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2,
        "LEVEL 2 COMPLETE!",
        {
          fontSize: "32px",
          fontFamily: "'Press Start 2P', Courier New",
          color: "#4ade80",
          backgroundColor: "#000000",
          padding: { x: 20, y: 15 },
        }
      )
      .setOrigin(0.5)
      .setDepth(100)
      .setAlpha(0);

    this.tweens.add({
      targets: victoryText,
      alpha: 1,
      scale: 1.2,
      duration: 1000,
      ease: "Back.out",
    });

    // Add continue button
    this.time.delayedCall(2000, () => {
      const continueText = this.add
        .text(
          this.sys.game.config.width / 2,
          this.sys.game.config.height / 2 + 80,
          "Press SPACE to continue",
          {
            fontSize: "16px",
            fontFamily: "'Press Start 2P', Courier New",
            color: "#66ccff",
          }
        )
        .setOrigin(0.5)
        .setDepth(100);

      this.tweens.add({
        targets: continueText,
        alpha: 0.5,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    });
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
      .text(width / 2, 35, "Flood Stories - Level 2", {
        fontSize: "26px",
        fontFamily: "'Press Start 2P', Courier New",
        color: "#66ccff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(15);

    const subtitle = this.add
      .text(width / 2, 58, "Drainage Mission", {
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
      this.clickSound.play();
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

  createFarmAndFloodGrid() {
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    // --- Add farm background (flooded version) ---
    const farmSize = 400;
    this.farm = this.add
      .image(centerX, centerY, "farm")
      .setOrigin(0.5)
      .setDisplaySize(farmSize, farmSize)
      .setDepth(1);

    const farmW = farmSize;
    const farmH = farmSize;

    // --- Load flood grid ---
    this.floodGrid = this.cache.json.get("floodGrid");
    console.log("Flood Grid:", this.floodGrid);

    if (!this.floodGrid || !this.floodGrid.length) {
      console.error("Flood grid not loaded properly!");
      // Create a default grid for testing
      this.floodGrid = this.createDefaultFloodGrid();
    }

    this.rows = this.floodGrid.length;
    this.cols = this.floodGrid[0].length;

    // Compute tile size based on farm size
    this.tileWidth = farmW / this.cols;
    this.tileHeight = farmH / this.rows;

    const offsetX = centerX - farmW / 2;
    const offsetY = centerY - farmH / 2;

    // --- Create visible flood tiles ---
    this.floodedTiles = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const floodValue = this.floodGrid[r][c];
        const x = offsetX + c * this.tileWidth + this.tileWidth / 2;
        const y = offsetY + r * this.tileHeight + this.tileHeight / 2;

        let color, alpha, isFlooded;

        if (floodValue > 0.7) {
          // Deep flood - bright blue
          color = 0x4444ff;
          alpha = 0.8;
          isFlooded = true;
        } else if (floodValue > 0.3) {
          // Medium flood - light blue
          color = 0x44aaff;
          alpha = 0.5;
          isFlooded = false;
        } else {
          // Shallow water - very light blue
          color = 0x88ccff;
          alpha = 0.3;
          isFlooded = false;
        }

        const tile = this.add
          .rectangle(
            x,
            y,
            this.tileWidth - 2,
            this.tileHeight - 2,
            color,
            alpha
          )
          .setDepth(2)
          .setStrokeStyle(1, 0xffffff, 0.3);

        if (isFlooded) {
          this.floodedTiles.push({ r, c, rect: tile, drained: false });

          // Add water ripple animation to flooded tiles
          this.tweens.add({
            targets: tile,
            alpha: 0.9,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut",
          });
        }
      }
    }

    console.log("Flooded Tiles Count:", this.floodedTiles.length);

    // Add border around farm area
    this.add
      .rectangle(centerX, centerY, farmW, farmH, 0x000000, 0)
      .setStrokeStyle(3, 0x4499dd, 0.8)
      .setDepth(1.5);
  }

  createDefaultFloodGrid() {
    // Create a 8x8 grid with some flooded spots for testing
    const grid = [];
    for (let r = 0; r < 8; r++) {
      const row = [];
      for (let c = 0; c < 8; c++) {
        // Create some flooded spots (different pattern from level 1)
        if (
          (r === 1 && c === 1) ||
          (r === 6 && c === 6) ||
          (r === 4 && c === 3) ||
          (r === 2 && c === 5)
        ) {
          row.push(0.8);
        } else if ((r + c) % 4 === 0) {
          row.push(0.4);
        } else {
          row.push(0.1);
        }
      }
      grid.push(row);
    }
    return grid;
  }

  createFarmerSprite() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Make farmer smaller
    this.farmer = this.add
      .sprite(width * 0.15, height * 0.8 - 70, "farmer")
      .setScale(0.08)
      .setDepth(8)
      .setAlpha(0);

    // Fade in
    this.tweens.add({
      targets: this.farmer,
      alpha: 1,
      duration: 1000,
      ease: "Power2",
    });
  }

  createDrainagePile() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Define pile area
    this.pileArea = { x: width * 0.1, y: height * 0.85 - 100 };

    // Add visual indicator for drainage pile
    const pileBg = this.add
      .rectangle(this.pileArea.x, this.pileArea.y, 100, 80, 0x2f4f4f, 0.3)
      .setDepth(4)
      .setStrokeStyle(2, 0x5f7f7f, 0.5);

    const pileLabel = this.add
      .text(this.pileArea.x, this.pileArea.y - 50, "DRAINAGE PIPES", {
        fontSize: "12px",
        fontFamily: "Courier New",
        color: "#5f7f7f",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(4);

    // Create drainage sprites
    const drainageCount = Math.max(this.floodedTiles.length, 5);
    this.drainages = this.add.group();

    for (let i = 0; i < drainageCount; i++) {
      const drainage = this.add
        .sprite(
          this.pileArea.x + (Math.random() - 0.5) * 30,
          this.pileArea.y + (Math.random() - 0.5) * 20,
          "pipe"
        )
        .setScale(0.1)
        .setDepth(5)
        .setAlpha(1)
        .setRotation((Math.random() - 0.5) * 0.5);

      drainage.placed = false;
      this.drainages.add(drainage);
    }

    console.log(`Created ${drainageCount} drainage pipes`);
  }

  createDialogBox() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Make dialog box smaller since text is more compact
    this.dialogBox = this.add
      .rectangle(
        width / 2,
        height - 50, // Move up slightly
        width - 100,
        80, // Reduce height from 100 to 80
        0x000000,
        0.8
      )
      .setDepth(30)
      .setStrokeStyle(2, 0xffffff)
      .setAlpha(0);

    this.dialogText = this.add
      .text(
        width / 2,
        height - 50, // Match the new Y position
        "",
        {
          fontSize: "14px",
          fontFamily: "Courier New",
          color: "#ffffff",
          wordWrap: { width: width - 140 },
          lineSpacing: -5, // Reduced line spacing
        }
      )
      .setOrigin(0.5)
      .setDepth(31)
      .setAlpha(0);
  }

  typewriteDialog(text) {
    this.dialogBox.setAlpha(1);
    this.dialogText.setAlpha(1);

    this.dialogText.setText("");
    let i = 0;
    this.typewriterTimer = this.time.addEvent({
      delay: 50,
      callback: () => {
        this.dialogText.setText(text.substring(0, i));
        i++;
        if (i > text.length) {
          this.typewriterTimer.remove();
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  addDecorativeElements() {
    // Add some instructional text
    const instruction = this.add
      .text(
        this.sys.game.config.width / 2,
        120,
        "Use ARROW KEYS to move • SPACEBAR to pick/drop drainage pipes",
        {
          fontSize: "12px",
          fontFamily: "Courier New",
          color: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 },
        }
      )
      .setOrigin(0.5)
      .setDepth(15);
  }
}
