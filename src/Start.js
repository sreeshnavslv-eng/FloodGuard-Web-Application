import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";
import { SalinizedFarmScene } from "./SalinizedFarmScene.js";
import NDVIMapScene from "./NDVImap.js";

export class Game extends Phaser.Scene {
  constructor() {
    super({ key: "Game" });
  }

  preload() {
    //load audios
    this.load.audio("buttonClick", "./assets/click.mp3");

    // No background music loading

    // Load Egypt images
    this.load.image("egypt_before", "./assets/farm_1984.jpg");
    this.load.image("egypt_after", "./assets/farm_2021.jpg");
    this.load.image("fala7", "./assets/fala7.png");
    // Load farmer spritesheet
    this.load.spritesheet("farmerMen", "./assets/farmerMen.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("fala7_spritesheet", "./assets/farmerr.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const { width, height } = this.scale;

    // Create pixelated farmland background
    this.createPixelatedBackground();

    // Main title with farming theme
    this.createTitle();

    // Create pixel-themed text boxes for the images
    this.createImageTextBoxes();

    // Add background story text
    this.createStoryText();

    this.createFarmer();
    this.createNDVIButton();
    this.createExploreButton();
    this.createBackButton();
    this.buttonSound = this.sound.add("buttonClick");

    // No background music - only click sounds
  }

  createPixelatedBackground() {
    const { width, height } = this.scale;

    // Dark soil base
    this.add.rectangle(width / 2, height / 2, width, height, 0x2d1810);

    // Create pixelated dirt/soil pattern
    for (let x = 0; x < width; x += 16) {
      for (let y = 0; y < height; y += 16) {
        const rand = Math.random();
        let color = 0x2d1810; // Dark brown

        if (rand > 0.8) color = 0x3d2818; // Lighter brown
        else if (rand > 0.9) color = 0x1a0f08; // Darker brown

        this.add.rectangle(x + 8, y + 8, 16, 16, color);
      }
    }

    // Add some scattered pixel "rocks"
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      this.add.rectangle(x, y, 8, 8, 0x5c5c5c);
    }
  }

  createTitle() {
    const { width } = this.scale;

    // Title background box
    const titleBg = this.add.rectangle(width / 2, 40, width - 40, 60, 0x0f3d0f);
    titleBg.setStrokeStyle(4, 0x00ff00);

    // Pixel decorations around title with animation
    const leftDecor = this.add.container(width / 2 - 200, 40);
    this.addPixelDecorationsToContainer(leftDecor, 0, 0, 8);
    this.tweens.add({
      targets: leftDecor,
      scale: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    const rightDecor = this.add.container(width / 2 + 200, 40);
    this.addPixelDecorationsToContainer(rightDecor, 0, 0, 8);
    this.tweens.add({
      targets: rightDecor,
      scale: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.add
      .text(width / 2, 40, "EGYPT FARMLAND CRISIS", {
        fontSize: "24px",
        fontFamily: "Courier New",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // NASA Landsat Images text
    this.add
      .text(width / 2, 100, "NASA Landsat Satellite Imagery", {
        fontSize: "20px",
        fontFamily: "Courier New",
        color: "#0b3d91", // NASA blue
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setStroke("#ffffff", 3); // white outline for contrast
  }

  createImageTextBoxes() {
    const { width, height } = this.scale;
    // Move boxes down by 20 pixels
    const yOffset = 20;

    // Left box - Before
    const leftBox = this.add.rectangle(
      width / 4,
      height / 2 - 50 + yOffset,
      280,
      320,
      0x1a4d1a
    );
    leftBox.setStrokeStyle(3, 0x00cc00);

    // Animate left box scale for movement
    this.tweens.add({
      targets: leftBox,
      scale: 1.02,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Left box title
    const leftTitleBg = this.add.rectangle(
      width / 4,
      height / 2 - 180 + yOffset,
      200,
      40,
      0x00cc00
    );
    this.add
      .text(width / 4, height / 2 - 180 + yOffset, "1984 - FERTILE LAND", {
        fontSize: "14px",
        fontFamily: "Courier New",
        color: "#000000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Before image
    // Before image (shifted lower by +20px)
    const beforeImageBg = this.add.rectangle(
      width / 4,
      height / 2 - 80 + yOffset,
      200,
      150,
      0x2d5016
    );
    beforeImageBg.setStrokeStyle(2, 0x00cc00);
    this.add
      .image(width / 4, height / 2 - 80 + yOffset, "egypt_before")
      .setDisplaySize(200, 150);

    // Animate before image bg scale
    this.tweens.add({
      targets: beforeImageBg,
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
        height / 2 + 50 + yOffset,
        "Rich green farmland\nalong the Nile Delta.\n\nFertile soil supported\nmillions of people.",
        {
          fontSize: "12px",
          fontFamily: "Courier New",
          color: "#ccffcc",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Right box - After
    const rightBox = this.add.rectangle(
      (3 * width) / 4,
      height / 2 - 50 + yOffset,
      280,
      320,
      0x4d1a1a
    );
    rightBox.setStrokeStyle(3, 0xcc0000);

    // Animate right box scale
    this.tweens.add({
      targets: rightBox,
      scale: 1.02,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Right box title
    const rightTitleBg = this.add.rectangle(
      (3 * width) / 4,
      height / 2 - 180 + yOffset,
      200,
      40,
      0xcc0000
    );
    this.add
      .text(
        (3 * width) / 4,
        height / 2 - 180 + yOffset,
        "2021 - SALT DAMAGED",
        {
          fontSize: "14px",
          fontFamily: "Courier New",
          color: "#ffffff",
          fontStyle: "bold",
        }
      )
      .setOrigin(0.5);

    // After image
    // After image (shifted lower by +20px)
    const afterImageBg = this.add.rectangle(
      (3 * width) / 4,
      height / 2 - 80 + yOffset,
      200,
      150,
      0x502d16
    );
    afterImageBg.setStrokeStyle(2, 0xcc0000);
    this.add
      .image((3 * width) / 4, height / 2 - 80 + yOffset, "egypt_after")
      .setDisplaySize(200, 150);

    // Animate after image bg scale
    this.tweens.add({
      targets: afterImageBg,
      scale: 1.02,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Right box description
    this.add
      .text(
        (3 * width) / 4,
        height / 2 + 50 + yOffset,
        "White salt covers\nonce fertile fields.\n\nCrops fail to grow explains low \nNVDI in some areas around delta.",
        {
          fontSize: "12px",
          fontFamily: "Courier New",
          color: "#ffcccc",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Add pixel decorations around boxes
    this.addCropPixels(width / 4 - 140, height / 2 - 180 + yOffset, 0x00ff00); // Green crops for before
    this.addSaltPixels((3 * width) / 4 + 140, height / 2 - 180 + yOffset); // Salt crystals for after
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
    // Add farmer sprite on the left side of the story box
    const farmerTalk = this.add
      .image(width / 2 - (width / 2 - 200), height - 80, "fala7")
      .setScale(2.8) // bigger farmer
      .setOrigin(0.5);

    const speakerTagBg =   this.add.rectangle(width / 2 - 240, height - 140, 120, 30, 0x3d2f1f)
  speakerTagBg.setStrokeStyle(2, 0xffd700);
 ;

    this.add
    .text(width / 2 - 240, height - 140, "MOHAMED", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "14px",
        color: "#fff200ff",
        fontStyle: "bold",
    })
    .setOrigin(0.5);


    // Optionally animate farmer (little bounce)
    this.tweens.add({
      targets: farmerTalk,
      y: height - 90,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    const storyText =
      "Salam Alikum Henry, يا خواجة, theres a salt buildup from poor irrigation that has destroyed Egypt's farmland...\n\n" +
      "IMPACT: The Nile Delta, feeding millions, faces collapse...\n\n" +
      "MISSION: Help save Egypt's agricultural future!";

    this.typewriteText(width / 2, height - 80, storyText, () => {
      this.createExploreButton();
    });
  }

  createExploreButton() {
    const { width, height } = this.scale;

    const buttonY = height - 230;

    // Create button container
    const buttonContainer = this.add.container(width / 2, buttonY);

    // Button background
    const buttonBg = this.add
      .rectangle(0, 0, 200, 40, 0x0f3d0f)
      .setStrokeStyle(2, 0x00ff00);

    // Button text
    const buttonText = this.add
      .text(0, 0, " SAVE the farm", {
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
      this.buttonSound.play(); // instant, no decode delay
      this.scene.start("SalinizedFarmScene");
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

 createFarmer() {
                const { width, height } = this.scale;
                
                // Create farmer animations
                this.anims.create({
                    key: 'walk',
                    frames: this.anims.generateFrameNumbers('farmerMen', { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: -1
                });

                // Create farmer sprite in the middle, between images
                const farmer = this.add.sprite(width/2, height/2 - 200, 'farmerMen').setScale(2);
                
                // Move up and down between images
                this.tweens.add({
                    targets: farmer,
                    y: height/2 + 10,
                    duration: 3000,
                    ease: 'Linear',
                    yoyo: true,
                    repeat: -1
                });

                // Play walking animation
                farmer.play('walk');
            }  

  typewriteText(x, y, text, onComplete) {
    const content = this.add
      .text(x, y, "", {
        fontSize: "14px",
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
            this.time.delayedCall(500, onComplete); // Small delay after typing
          }
        }
      },
      loop: true,
    });
  }

  addPixelDecorationsToContainer(container, x, y, size) {
    for (let i = 0; i < 3; i++) {
      container.add(
        this.add.rectangle(x + i * 12, y - 15, size, size * 2, 0xffff00)
      );
      container.add(
        this.add.rectangle(x + i * 12, y + 15, size, size, 0x00cc00)
      );
    }
  }

  addCropPixels(x, y, color) {
    for (let i = 0; i < 5; i++) {
      this.add.rectangle(x, y + i * 8, 8, 8, color);
      this.add.rectangle(x + 8, y + i * 8, 8, 8, 0x228b22);
    }
  }

  addSaltPixels(x, y) {
    for (let i = 0; i < 5; i++) {
      this.add.rectangle(x, y + i * 8, 8, 8, 0xffffff);
      this.add.rectangle(x - 8, y + i * 8, 8, 8, 0xeeeeee);
    }
  }

  createNDVIButton() {
    const { width, height } = this.scale;
    const buttonY = height - 80;

    const buttonContainer = this.add.container(width / 2, buttonY - 100);
    // Brown background with yellow border
    const buttonBg = this.add
      .rectangle(0, 0, 220, 40, 0x3b2f2f) // SaddleBrown
      .setStrokeStyle(2, 0xffd700); // Yellow border

    // Yellow text
    const buttonText = this.add
      .text(0, 0, "EXPLORE GLOBAL NDVI", {
        fontSize: "13px",
        fontFamily: "Courier New",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    buttonContainer.add([buttonBg, buttonText]);
    buttonContainer.setInteractive(
      new Phaser.Geom.Rectangle(-110, -20, 220, 40),
      Phaser.Geom.Rectangle.Contains
    );

    // Hover effect: lighter brown
    buttonContainer.on("pointerover", () => buttonBg.setFillStyle(0xa0522d)); // sienna
    buttonContainer.on("pointerout", () => buttonBg.setFillStyle(0x3b2f2f)); // back to brown

    buttonContainer.on("pointerdown", () => {
      this.buttonSound.play(); // instant, no decode delay
      this.scene.start("NDVIMapScene");
    });

    // Create popup container (initially hidden)
    const popupContainer = this.add.container(240, 0);
    const popupBg = this.add
      .rectangle(0, 0, 250, 100, 0x8b4513)
      .setStrokeStyle(2, 0xffd700)
      .setOrigin(0.5);

    const popupText = this.add
      .text(
        15,
        0,
        "NDVI (Normalized Difference Vegetation Index)\nmeasures plant health from satellite data.\nExplore recent global NDVI map!",
        {
          fontSize: "11px",
          fontFamily: "Courier New",
          color: "#FFD700",
          align: "center",
          wordWrap: { width: 220 },
        }
      )
      .setOrigin(0.5);

    // Removed farmer from popup
      // Add smaller farmer to popup
      const farmerPopup = this.add.sprite(-100, 0, 'farmer').setScale(1.5);
      farmerPopup.play('walk');
      popupContainer.add([popupBg, popupText, farmerPopup]);

    popupContainer.add([popupBg, popupText]);

    popupContainer.setVisible(false);
    buttonContainer.add(popupContainer);

    // Show popup on hover
    buttonContainer.on("pointerover", () => {
      buttonBg.setFillStyle(0xa0522d); // lighter brown
      popupContainer.setVisible(true);
    });

    // Hide popup on out
    buttonContainer.on("pointerout", () => {
      buttonBg.setFillStyle(0x3b2f2f); // back to brown
      popupContainer.setVisible(false);
    });

    // Button pulse animation
    this.tweens.add({
      targets: buttonContainer,
      scale: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  createBackButton() {
    const backBtn = this.add.container(80, 40).setDepth(20);

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
      btnBg.setFillStyle(0x4a3c2a);
      this.tweens.add({
        targets: backBtn,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: "Power2",
      });
    });

    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x3d2f1f);
      this.tweens.add({
        targets: backBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Power2",
      });
    });

    btnBg.on("pointerdown", () => {
      this.buttonSound.play();
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start("exploreScene");
      });
    });
  }
}

// const config = {
//     type: Phaser.AUTO,
//     width: 800,
//     height: 600,
//     parent: 'game',
//     backgroundColor: '#0f0f23',
//     scene: [Game, SalinizedFarmScene,NDVIMapScene], // add ,NDVIMapScene
//     pixelArt: true,
//     scale: {
//         mode: Phaser.Scale.FIT,
//         autoCenter: Phaser.Scale.CENTER_BOTH
//     }

// };

// const game = new Phaser.Game(config);
