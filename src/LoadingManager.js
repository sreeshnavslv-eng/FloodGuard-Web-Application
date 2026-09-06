// Loading Manager for optimized asset loading
export class LoadingManager {
  constructor(scene) {
    this.scene = scene;
    this.loadedAssets = new Set();
    this.loadingQueue = [];
    this.isLoading = false;
  }

  // Preload only essential assets for initial scene
  preloadEssentialAssets() {
    console.log("Loading essential assets...");

    // Load only what's needed for the intro scene
    this.scene.load.image("bg", "./assets/introbg.jpg");
    this.scene.load.image("farmer", "./assets/farmerr.png");
    this.scene.load.image("wiltedcrop", "./assets/wiltedcrops.jpg");
    this.scene.load.audio("clickSound", "./assets/click.mp3");
    this.scene.load.audio(
      "mainSoundtrack",
      "./assets/sound/main_soundtrack.mp3"
    );

    this.loadedAssets.add("essential");
  }

  // Load explore scene assets when needed
  preloadExploreAssets() {
    if (this.loadedAssets.has("explore")) return;

    console.log("Loading explore scene assets...");

    // Load explore scene images
    this.scene.load.image("heatmap_icon", "./assets/heat.png");
    this.scene.load.image("float_icon", "./assets/flood.png");
    this.scene.load.image("drought_icon", "./assets/drought.png");
    this.scene.load.image("salinized_icon", "./assets/watering_gif.png");
    this.scene.load.image("water_icon", "./assets/water.png");
    this.scene.load.image("animals_icon", "./assets/animal.png");
    this.scene.load.image("farmer", "./assets/farmerr.png");

    this.loadedAssets.add("explore");
  }

  // Load specific scene assets on demand
  preloadSceneAssets(sceneName) {
    if (this.loadedAssets.has(sceneName)) return;

    console.log(`Loading ${sceneName} assets...`);

    switch (sceneName) {
      case "flood":
        this.scene.load.video("flood_video", "./assets/flood_video.mp4");
        this.scene.load.image("flood_icon", "./assets/flood.png");
        break;
      case "drought":
        this.scene.load.video("drought_video", "./assets/drought_video.mp4");
        this.scene.load.image("drought_icon", "./assets/drought.png");
        this.scene.load.image("sam", "./assets/sam2.png");
        break;
      case "heatmap":
        this.scene.load.video("heatmap_video", "./assets/heat_video.mp4");
        this.scene.load.image("heatmap_icon", "./assets/heat.png");
        this.scene.load.image("indian_farmer", "./assets/indian_farmer.png");
        break;
      case "water":
        this.scene.load.video("water_video", "./assets/water_video.mp4");
        this.scene.load.image("water_icon", "./assets/water.png");
        break;
      case "salinized":
        this.scene.load.video("salinized_video", "./assets/salt_vid.mp4");
        this.scene.load.image("salinized_icon", "./assets/watering_gif.png");
        break;
      case "animals":
        this.scene.load.video("animals_video", "./assets/animal_video.mp4");
        this.scene.load.image("animals_icon", "./assets/animal.png");
        break;
    }

    this.loadedAssets.add(sceneName);
  }

  // Load assets with compression hints
  preloadWithCompression() {
    // Add compression hints for better loading
    this.scene.load.setPath("./assets/");
    this.scene.load.setCORS("anonymous");
  }

  // Preload next scene assets in background
  preloadNextScene(currentScene) {
    const nextScenes = {
      intro: ["explore"],
      explore: ["flood", "drought", "heatmap", "water", "salinized", "animals"],
      flood: ["level1flood", "level2flood"],
      drought: ["PlayScene"],
    };

    const nextSceneList = nextScenes[currentScene] || [];

    // Load next scene assets in background
    nextSceneList.forEach((scene) => {
      if (!this.loadedAssets.has(scene)) {
        this.preloadSceneAssets(scene);
      }
    });
  }
}

// Asset optimization utilities
export const AssetOptimizer = {
  // Compress images before loading
  compressImage(imagePath, quality = 0.8) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.src = imagePath;
    });
  },

  // Lazy load videos
  lazyLoadVideo(videoPath) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => resolve(video);
      video.onerror = reject;
      video.src = videoPath;
    });
  },

  // Preload critical assets only
  preloadCriticalAssets() {
    const criticalAssets = [
      "./assets/introbg.jpg",
      "./assets/farmerr.png",
      "./assets/click.mp3",
      "./assets/sound/main_soundtrack.mp3",
    ];

    return Promise.all(
      criticalAssets.map((asset) => {
        if (asset.endsWith(".mp3")) {
          return new Promise((resolve) => {
            const audio = new Audio();
            audio.preload = "metadata";
            audio.onloadedmetadata = () => resolve();
            audio.src = asset;
          });
        } else {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.src = asset;
          });
        }
      })
    );
  },
};
