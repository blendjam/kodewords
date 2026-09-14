import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

const assets = [
  "/texture.png",
  "/assets/agent/blue.png",
  "/assets/agent/gray.png",
  "/assets/agent/red.png",
  "/assets/bg/black.png",
  "/assets/bg/blue.png",
  "/assets/bg/gray.png",
  "/assets/bg/red.png",
  "/assets/card/black.png",
  "/assets/card/blue.png",
  "/assets/card/gray.png",
  "/assets/card/red.png",
  "/assets/icon/fullscreen.png",
];

function AssetLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const preloadAssets = async () => {
      try {
        const promises = assets.map(asset => {
          return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.src = asset;
            img.onload = () => resolve();
            img.onerror = () => reject(`Failed to load asset: ${asset}`);
          });
        });
        await Promise.all(promises);
        setLoading(false);
      } catch (error) {
        console.error(error);
        // Handle asset loading error, maybe show an error message
      }
    };

    preloadAssets();
  }, []);

  if (loading) {
    return <div className="LoadingScreen">Loading Assets...</div>;
  }

  return <Outlet />;
}

export default AssetLoader;
