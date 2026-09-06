import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";

// Enhanced dialog content with clearer instructions
const dialogPhases = {
  introduction: [
    "🚨 URGENT MISSION! 🚨\n\nHeavy rain is flooding the farm! The RED tiles show where crops will be destroyed first.\n\nYOUR MISSION: Use arrow keys to move the farmer → Pick up straw from the pile → Cover all red danger zones before the crops flood!\n\nPress SPACEBAR to grab and drop straw. Save the harvest!",
  ],
  victory: [
    "MISSION ACCOMPLISHED! 🎉\nYou protected the farm from flooding and saved the crops!",
  ],
};

export default class Level1Scene extends Phaser.Scene {
  constructor() {
    super("scene-level1");
  }

  preload() {
    // Farm background & assets
    this.load.image("bged", "/assets/bgrain.jpg");
    this.load.image("farm", "/assets/farmflood.jpg");
    this.load.image("farmer", "/assets/farmerr.png");
    this.load.image("straw", "/assets/straw.png");
    // Load arrow keys assets (you can replace these with actual arrow images if available)
    this.load.image("arrowUp", "/assets/arrow_up.png"); // Add your arrow images
    this.load.image("arrowDown", "/assets/arrow_down.png");
    this.load.image("arrowLeft", "/assets/arrow_left.png");
    this.load.image("arrowRight", "/assets/arrow_right.png");

    // Load the JSON rain grid (using same approach as level 2)
    this.load.json("rainGrid", "/raingrid.json");
  }

  create() {
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    this.dialogIndex = 0;
    this.heldMulch = null;
    this.holdOffsetX = 30;
    this.holdOffsetY = -10;

    // Enhanced background with overlay
    this.cameras.main.setBackgroundColor("#0a1f2e");
    this.createAtmosphericBackground();

    this.bg = this.add.image(centerX, centerY, "bged").setOrigin(0.5);
    this.bg.displayWidth = width;
    this.bg.displayHeight = height;
    this.bg.setDepth(0);
    this.bg.setAlpha(0.85);

    this.createTitle();
    this.createBackButton();
    this.createFarmAndRainGrid();
    this.createFarmerSprite();
    this.createMulchPile();
    this.createArrowKeysDisplay(); // Add arrow keys visualization
    this.createEnhancedInstructions(); // Add clear instructions
    this.createDialogBox();

    this.addDecorativeElements();

    // MULTIPLE INPUT METHODS - Try them all
    this.initializeAllInputMethods();

    // Fade in entrance
    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.typewriteDialog(dialogPhases.introduction[0]);
    });
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

    // Create arrow keys (using rectangles as placeholders - replace with images if available)
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
      .rectangle(0, 0, 500, 80, 0x8b0000, 0.9)
      .setStrokeStyle(3, 0xff4444);

    const missionText = this.add
      .text(0, -10, "🚨 URGENT: COVER RED ZONES! 🚨", {
        fontSize: "16px",
        fontFamily: "'Press Start 2P', Courier New",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const missionSubtext = this.add
      .text(0, 15, "Heavy rain areas will destroy crops!", {
        fontSize: "12px",
        fontFamily: "Courier New",
        color: "#FFAAAA",
      })
      .setOrigin(0.5);

    missionPanel.add([missionBg, missionText, missionSubtext]);

    // Add controls explanation
    const controlsPanel = this.add
      .container(width / 2, height - 120)
      .setDepth(20);

    const controlsBg = this.add
      .rectangle(0, 0, 400, 60, 0x0a2f4a, 0.9)
      .setStrokeStyle(2, 0x4499dd);

    const controlsText = this.add
      .text(0, 0, "ARROWS: Move Farmer    SPACEBAR: Pick Up/Drop Straw", {
        fontSize: "12px",
        fontFamily: "Courier New",
        color: "#66ccff",
      })
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

  // ... rest of your existing methods remain exactly the same ...

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

    // Click to pick up/drop mulch
    this.input.on("pointerdown", (pointer) => {
      if (this.heldMulch) {
        this.tryDropMulch();
      } else {
        this.tryPickUpMulch();
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

    // Update held mulch position
    if (this.heldMulch) {
      this.heldMulch.x = this.farmer.x + this.holdOffsetX;
      this.heldMulch.y = this.farmer.y + this.holdOffsetY;
    }

    // Spacebar for pick/drop
    if (this.checkSpacePressed()) {
      if (this.heldMulch) {
        this.tryDropMulch();
      } else {
        this.tryPickUpMulch();
      }
    }
  }

  handleMovement() {
    if (!this.cursors) return;

    let velocityX = 0;
    let velocityY = 0;

    // Horizontal movement (copying from level 2)
    if (this.cursors.left.isDown) {
      velocityX = -5;
      this.farmer.flipX = true;
    } else if (this.cursors.right.isDown) {
      velocityX = 5;
      this.farmer.flipX = false;
    }

    // Vertical movement - INDEPENDENT checks (no else if) (copying from level 2)
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

    // Clamp position (copying from level 2)
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

  tryDropMulch() {
    for (let tile of this.heavyRainTiles) {
      const dist = Phaser.Math.Distance.Between(
        this.heldMulch.x,
        this.heldMulch.y,
        tile.rect.x,
        tile.rect.y
      );
      if (dist < this.tileWidth * 0.7) {
        // Place mulch on tile
        this.heldMulch.x = tile.rect.x;
        this.heldMulch.y = tile.rect.y;
        this.heldMulch.setDepth(10);
        this.heldMulch.placed = true;
        tile.covered = true;

        // Visual feedback
        this.tweens.add({
          targets: this.heldMulch,
          scale: 0.25,
          duration: 200,
          ease: "Back.out",
        });

        this.heldMulch = null;
        this.checkWin();
        return;
      }
    }

    // If not placed on any tile, return to pile
    this.returnMulchToPile();
  }

  tryPickUpMulch() {
    for (let mulch of this.mulches.getChildren()) {
      if (!mulch.placed) {
        const dist = Phaser.Math.Distance.Between(
          this.farmer.x,
          this.farmer.y,
          mulch.x,
          mulch.y
        );
        if (dist < 80) {
          this.heldMulch = mulch;
          this.heldMulch.setDepth(20);

          // Visual feedback
          this.tweens.add({
            targets: this.heldMulch,
            scale: 0.15,
            duration: 150,
            ease: "Back.out",
          });
          break;
        }
      }
    }
  }

  returnMulchToPile() {
    if (this.heldMulch) {
      // Return to a random position in the pile area
      this.heldMulch.x = this.pileArea.x + (Math.random() - 0.5) * 40;
      this.heldMulch.y = this.pileArea.y + (Math.random() - 0.5) * 30;
      this.heldMulch.setDepth(5);
      this.heldMulch.placed = false;
      this.heldMulch = null;
    }
  }

  checkWin() {
    const allCovered = this.heavyRainTiles.every((tile) => tile.covered);
    if (allCovered) {
      console.log("Level Complete! All heavy rain areas mulched.");
      this.showVictory();
      this.scene.start("scene-level2"); // Proceed to next level
    }
  }

  showVictory() {
    const victoryText = this.add
      .text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2,
        "LEVEL COMPLETE!",
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
      .text(width / 2, 35, "Flood Stories - Level 1", {
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

  createFarmAndRainGrid() {
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

    // --- Load rain grid (using default grid like level 2) ---
    // Temporarily use default grid to match level 2 behavior
    this.rainGrid = this.createDefaultGrid();
    console.log("Using default rain grid for consistency with level 2");

    this.rows = this.rainGrid.length;
    this.cols = this.rainGrid[0].length;

    // Compute tile size based on farm size
    this.tileWidth = farmW / this.cols;
    this.tileHeight = farmH / this.rows;

    const offsetX = centerX - farmW / 2;
    const offsetY = centerY - farmH / 2;

    // --- Create visible rain tiles ---
    this.heavyRainTiles = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const rainValue = this.rainGrid[r][c];
        const x = offsetX + c * this.tileWidth + this.tileWidth / 2;
        const y = offsetY + r * this.tileHeight + this.tileHeight / 2;

        let color, alpha, isHeavy;

        if (rainValue > 0.7) {
          // Heavy rain - bright red
          color = 0xff4444;
          alpha = 0.8;
          isHeavy = true;
        } else if (rainValue > 0.3) {
          // Medium rain - orange
          color = 0xffaa44;
          alpha = 0.5;
          isHeavy = false;
        } else {
          // Light rain - keep light blue but more visible
          color = 0x66ccff;
          alpha = 0.3;
          isHeavy = false;
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

        if (isHeavy) {
          this.heavyRainTiles.push({ r, c, rect: tile, covered: false });

          // Add pulsing animation to heavy rain tiles
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

    console.log("Heavy Rain Tiles Count:", this.heavyRainTiles.length);

    // Add border around farm area
    this.add
      .rectangle(centerX, centerY, farmW, farmH, 0x000000, 0)
      .setStrokeStyle(3, 0x4499dd, 0.8)
      .setDepth(1.5);
  }

  createDefaultGrid() {
    // Create a 8x8 grid with some heavy rain spots for testing
    const grid = [];
    for (let r = 0; r < 8; r++) {
      const row = [];
      for (let c = 0; c < 8; c++) {
        // Create some heavy rain spots
        if (
          (r === 2 && c === 2) ||
          (r === 5 && c === 5) ||
          (r === 3 && c === 6)
        ) {
          row.push(0.8);
        } else if ((r + c) % 3 === 0) {
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

    // Make farmer smaller (copying from level 2)
    this.farmer = this.add
      .sprite(width * 0.15, height * 0.8 - 70, "farmer")
      .setScale(0.08) // Same scale as level 2
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

  createMulchPile() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Define pile area
    this.pileArea = { x: width * 0.1, y: height * 0.85 - 100 };

    // Add visual indicator for mulch pile
    const pileBg = this.add
      .rectangle(this.pileArea.x, this.pileArea.y, 100, 80, 0x8b4513, 0.3)
      .setDepth(4)
      .setStrokeStyle(2, 0xcd853f, 0.5);

    const pileLabel = this.add
      .text(this.pileArea.x, this.pileArea.y - 50, "STRAW PILE", {
        fontSize: "12px",
        fontFamily: "Courier New",
        color: "#CD853F",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(4);

    // Create mulch sprites
    const mulchCount = Math.max(this.heavyRainTiles.length, 5);
    this.mulches = this.add.group();

    for (let i = 0; i < mulchCount; i++) {
      const mulch = this.add
        .sprite(
          this.pileArea.x + (Math.random() - 0.5) * 30,
          this.pileArea.y + (Math.random() - 0.5) * 20,
          "straw"
        )
        .setScale(0.1) // Visible size
        .setDepth(5)
        .setAlpha(1)
        .setRotation((Math.random() - 0.5) * 0.5); // Random rotation for natural look

      mulch.placed = false;
      this.mulches.add(mulch);
    }

    console.log(`Created ${mulchCount} mulch pieces`);
  }

  createDialogBox() {
    // Simple dialog box implementation
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    this.dialogBox = this.add
      .rectangle(width / 2, height - 60, width - 100, 100, 0x000000, 0.8)
      .setDepth(30)
      .setStrokeStyle(2, 0xffffff)
      .setAlpha(0);

    this.dialogText = this.add
      .text(width / 2, height - 60, "", {
        fontSize: "14px",
        fontFamily: "Courier New",
        color: "#ffffff",
        wordWrap: { width: width - 140 },
      })
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
        "Use ARROW KEYS to move • SPACEBAR to pick/drop straw",
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
