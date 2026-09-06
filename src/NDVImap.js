import * as Phaser from "https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.esm.js";

export default class NDVIMapScene extends Phaser.Scene {
  constructor() {
    super({ key: "NDVIMapScene" });
    this.selectedDate = null;
  }

  preload() {
    this.load.image("ndvi_legend", "./assets/btn.png");

    // No background music loading

    const { width, height } = this.scale;

    // Add "loading..." text
    this.loadingText = this.add
      .text(width / 2, height / 2, "⏳ Loading NDVI data...", {
        fontSize: "18px",
        fontFamily: "Courier New",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const baseUrl =
      "https://98e2zjiicz.us-west-2.awsapprunner.com/tiles/vnp09h1-ndvi/";
    const today = new Date();

    // Find latest tile first
    this.findLatestTile(baseUrl, today, 30).then(({ url, date }) => {
      if (url) {
        this.selectedDate = date;
        this.load.image("ndvi", url);
        this.load.once("complete", () => {
          this.loadingText.destroy();
          this.addMap();
        });
        this.load.start(); // run the loader again
      } else {
        this.loadingText.setText("⚠️ No NDVI tiles found (last 30 days)");
      }
    });
  }

  async findLatestTile(baseUrl, today, daysBack) {
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      const url = `${baseUrl}${dateString}/preview.png`;

      const ok = await this.checkImage(url);
      if (ok) {
        console.log(`✅ Found NDVI tile: ${dateString}`);
        return { url, date: dateString };
      } else {
        console.log(`❌ No tile for ${dateString}`);
      }
    }
    return { url: null, date: null };
  }

  async checkImage(url) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      return res.ok;
    } catch {
      return false;
    }
  }

  addMap() {
    const { width, height } = this.scale;

    const map = this.add.image(width / 2, height / 2, "ndvi");
    map.setDisplaySize(width, height);

    this.add
      .text(width / 2, 30, `🌍 Global NDVI (NASA) – ${this.selectedDate}`, {
        fontSize: "20px",
        fontFamily: "Courier New",
        color: "#00ff00",
      })
      .setOrigin(0.5);

    // 🔹 Info Box: NDVI description
    const infoContainer = this.add.container(width / 2, height - 120);

    const infoBg = this.add
      .rectangle(0, 0, 400, 80, 0x1a1a2e)
      .setStrokeStyle(2, 0x00ccff)
      .setOrigin(0.5);

    const infoText = this.add
      .text(
        0,
        0,
        "🌱 NDVI from NASA VIIRS satellite\n" +
          "Measures plant health using red & infrared light.\n" +
          "0 = barren soil  | 1 = dense green \n" +
          "Averaged over 8 days to reduce clouds effects.",
        {
          fontSize: "14px",
          fontFamily: "Courier New",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: 400 },
        }
      )
      .setOrigin(0.5);

    const legend = this.add
      .image(450, 20, "ndvi_legend")
      .setDisplaySize(250, 130) // scale down to fit
      .setOrigin(0.5);

    infoContainer.add([infoBg, infoText, legend]);

    // this.add.text(width / 2, height - 30, "Click to return", {
    //     fontSize: "14px",
    //     fontFamily: "Courier New",
    //     color: "#ffffff"
    // }).setOrigin(0.5);

    // this.input.once("pointerdown", () => {
    //     this.scene.start("Game");
    // });
    const buttonContainer = this.add.container(width / 2, height - 50);

    const buttonBg = this.add
      .rectangle(0, 0, 180, 40, 0x1a1a2e)
      .setStrokeStyle(2, 0x00ccff)
      .setInteractive({ useHandCursor: true });

    const buttonText = this.add
      .text(0, 0, "Return", {
        fontSize: "16px",
        fontFamily: "Courier New",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    buttonContainer.add([buttonBg, buttonText]);

    // 🔹 Hover effects
    buttonBg.on("pointerover", () => {
      buttonBg.setFillStyle(0x33334d);
    });
    buttonBg.on("pointerout", () => {
      buttonBg.setFillStyle(0x1a1a2e);
    });

    // 🔹 Click
    buttonBg.on("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
