import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";

class FinalScene extends Phaser.Scene {
  constructor() {
    super({ key: "FinalScene" });
    this.currentDialogIndex = 0;
    this.isTyping = false;
  }

  preload() {
    // Load final background
    this.load.image("final_bg", "./assets/final.jpg");

    // Load all farmer characters
    this.load.image("henry", "./assets/farmerr.png");
    this.load.image("joao", "./assets/brazilian_farmer.png");
    this.load.image("raj", "./assets/indian_farmer.png");
    this.load.image("sam", "./assets/sam2.png");
    this.load.image("bilal", "./assets/pakifarmer.png");
    this.load.image("Mohammed", "./assets/fala7.png");

    // Load click sound
    this.load.audio("click", "./assets/click.mp3");
  }

  create() {
    console.log("Final Scene - All farmers meeting!");

    // Set background
    this.cameras.main.setBackgroundColor(0x2d1810);

    // Add final background image
    const bg = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2,
      "final_bg"
    );
    bg.setDisplaySize(this.scale.width, this.scale.height);
    bg.setAlpha(0.8);

    // Position farmers
    this.setupFarmers();

    // Create dialog system
    this.setupDialogSystem();

    // Start the conversation
    this.startConversation();

    // Fade in
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  setupFarmers() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Henry on the left - moved further left
    this.henry = this.add
      .image(centerX - 300, centerY + 150, "henry")
      .setScale(0.3)
      .setOrigin(0.5, 1);

    // Other farmers on the right - spread out more
    this.joao = this.add
      .image(centerX + 100, centerY + 150, "joao")
      .setScale(0.2)
      .setOrigin(0.5, 1);

    this.raj = this.add
      .image(centerX + 250, centerY + 150, "raj")
      .setScale(0.2)
      .setOrigin(0.5, 1);

    this.sam = this.add
      .image(centerX + 400, centerY + 150, "sam")
      .setScale(0.3) // Made Sam bigger
      .setOrigin(0.5, 1);

    this.bilal = this.add
      .image(centerX + 550, centerY + 150, "bilal")
      .setScale(0.2)
      .setOrigin(0.5, 1);

    // Mohammed (fala7) - add him to the group
    this.mohammed = this.add
      .image(centerX + 700, centerY + 150, "Mohammed")
      .setScale(7)
      .setOrigin(0.5, 1);

    // Add subtle animations
    this.addFarmerAnimations();
  }

  addFarmerAnimations() {
    // Gentle floating animation for all farmers
    this.tweens.add({
      targets: [
        this.henry,
        this.joao,
        this.raj,
        this.sam,
        this.bilal,
        this.mohammed,
      ],
      y: "+=3",
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  setupDialogSystem() {
    // Create dialog container
    this.dialogContainer = this.add.container(0, 0).setDepth(20);

    // Dialog background
    this.dialogBg = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 120,
      600,
      200,
      0x1a1a2e,
      0.95
    );
    this.dialogBg.setStrokeStyle(4, 0x00ff00);

    // Speaker name
    this.speakerText = this.add
      .text(this.scale.width / 2 - 250, this.scale.height - 180, "", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "12px",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);

    // Dialog text
    this.dialogText = this.add
      .text(this.scale.width / 2, this.scale.height - 120, "", {
        fontFamily: "Courier New",
        fontSize: "16px",
        color: "#e0f7ff",
        wordWrap: { width: 550, useAdvancedWrap: true },
        align: "center",
      })
      .setOrigin(0.5);

    // Click to continue indicator
    this.clickIndicator = this.add
      .text(
        this.scale.width / 2,
        this.scale.height - 50,
        "▼ CLICK TO CONTINUE ▼",
        {
          fontFamily: "'Press Start 2P', Courier New",
          fontSize: "8px",
          color: "#66ccff",
        }
      )
      .setOrigin(0.5);

    this.tweens.add({
      targets: this.clickIndicator,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.dialogContainer.add([
      this.dialogBg,
      this.speakerText,
      this.dialogText,
      this.clickIndicator,
    ]);

    // Make dialog clickable
    this.dialogBg.setInteractive();
    this.dialogBg.on("pointerdown", () => {
      if (this.isTyping) {
        this.completeTypewriter();
      } else {
        this.nextDialog();
      }
    });
  }

  startConversation() {
    this.conversation = [
      {
        speaker: "Henry",
        text: "Thanks guys! You really helped me save my farm!",
        farmer: this.henry,
      },
      {
        speaker: "João",
        text: "De nada, Henry! We're all in this together!",
        farmer: this.joao,
      },
      {
        speaker: "Bilal",
        text: "So what was the problem exactly?",
        farmer: this.bilal,
      },
      {
        speaker: "Henry",
        text: "Oh, I just forgot to water my crops yesterday! 😅",
        farmer: this.henry,
      },
      {
        speaker: "Ramesh",
        text: "Haha! That's the most common mistake, my friend!",
        farmer: this.raj,
      },
      {
        speaker: "Sam",
        text: "But now you know all the climate challenges farmers face!",
        farmer: this.sam,
      },
      {
        speaker: "Mohammed",
        text: "Exactly! Knowledge is the best fertilizer for success!",
        farmer: this.mohammed,
      },
      {
        speaker: "Henry",
        text: "Absolutely! Thanks to you all, I'm ready for anything!",
        farmer: this.henry,
      },
      {
        speaker: "All Farmers",
        text: "🌱 Together we grow! 🌱",
        farmer: null,
      },
    ];

    this.currentDialogIndex = 0;
    this.showDialog();
  }

  showDialog() {
    if (this.currentDialogIndex >= this.conversation.length) {
      this.showEnding();
      return;
    }

    const dialog = this.conversation[this.currentDialogIndex];

    // Highlight the speaking farmer
    this.highlightFarmer(dialog.farmer);

    // Set speaker name
    this.speakerText.setText(dialog.speaker + ":");

    // Typewriter effect
    this.typewriteText(dialog.text);
  }

  highlightFarmer(farmer) {
    // Reset all farmers to their original scale and normal tint
    [
      this.henry,
      this.joao,
      this.raj,
      this.sam,
      this.bilal,
      this.mohammed,
    ].forEach((f) => {
      if (f) {
        f.setTint(0xffffff);
        // Reset to original scale based on farmer type
        if (f === this.sam) {
          f.setScale(0.6); // Sam's original scale
        } else if (f === this.mohammed) {
          f.setScale(7); // Mohammed's original scale (much larger due to small source image)
        } else {
          f.setScale(0.4); // Other farmers' original scale
        }
      }
    });

    // Highlight the speaking farmer
    if (farmer) {
      farmer.setTint(0xffff00);
      // Scale up from the original scale
      if (farmer === this.sam) {
        farmer.setScale(0.66); // 0.6 * 1.1
      } else if (farmer === this.mohammed) {
        farmer.setScale(7.7); // 7 * 1.1
      } else {
        farmer.setScale(0.44); // 0.4 * 1.1
      }
    }
  }

  typewriteText(text) {
    this.isTyping = true;
    this.dialogText.setText("");
    this.clickIndicator.setVisible(false);

    let i = 0;
    this.typewriterTimer = this.time.addEvent({
      delay: 50,
      callback: () => {
        this.dialogText.text += text[i];
        i++;
        if (i >= text.length) {
          this.typewriterTimer.remove();
          this.isTyping = false;
          this.clickIndicator.setVisible(true);
        }
      },
      loop: true,
    });
  }

  completeTypewriter() {
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
    }
    const dialog = this.conversation[this.currentDialogIndex];
    this.dialogText.setText(dialog.text);
    this.isTyping = false;
    this.clickIndicator.setVisible(true);
  }

  nextDialog() {
    this.currentDialogIndex++;
    this.showDialog();
  }

  showEnding() {
    // Hide dialog
    this.dialogContainer.setVisible(false);

    // Show ending message
    const endingText = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 +200,
        "🌱 Thank you for playing NASA Farming Game! 🌱\n\nYou've learned about climate challenges\nand sustainable farming practices!",
        {
          fontFamily: "'Press Start 2P', Courier New",
          fontSize: "16px",
          color: "rgba(0, 0, 0, 1)ff",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Add restart button
    this.createRestartButton();

    // Celebration animation
    this.addCelebrationEffects();
  }

  createRestartButton() {
    const restartBtn = this.add.container(
      this.scale.width / 2,
      this.scale.height - 100
    );

    const btnBg = this.add
      .rectangle(0, 0, 200, 60, 0x00ff00, 0.8)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add
      .text(0, 0, "PLAY AGAIN", {
        fontFamily: "'Press Start 2P', Courier New",
        fontSize: "12px",
        color: "#000000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    restartBtn.add([btnBg, btnText]);

    // Hover effects
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x00cc00, 0.9);
      this.tweens.add({
        targets: restartBtn,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: "Power2",
      });
    });

    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x00ff00, 0.8);
      this.tweens.add({
        targets: restartBtn,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Power2",
      });
    });

    // Click handler
    btnBg.on("pointerdown", () => {
      this.sound.play("click");
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start("scene-intro");
      });
    });
  }

  addCelebrationEffects() {
    // Add floating particles
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, this.scale.width),
        Phaser.Math.Between(0, this.scale.height),
        Phaser.Math.Between(2, 6),
        0x00ff00,
        0.7
      );

      this.tweens.add({
        targets: particle,
        y: particle.y - 100,
        alpha: 0,
        duration: 2000 + Math.random() * 1000,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });
    }
  }
}

export default FinalScene;