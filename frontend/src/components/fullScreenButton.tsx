import { useState } from "react";

type LockableScreenOrientation = ScreenOrientation & {
  lock: (orientation: OrientationType) => Promise<void>;
};

export function FullScreenButton({ className }: { className?: string }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const onButtonClick = () => {
    const isMobile = window.innerWidth < 868;
    setIsFullScreen(!isFullScreen);
    if (isFullScreen) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }

    if (isMobile) {
      if (isFullScreen) {
        window.screen.orientation.unlock();
      } else if ("lock" in window.screen.orientation) {
        const orientation = window.screen.orientation as LockableScreenOrientation;
        void orientation.lock("landscape-primary").catch(() => {
          // Orientation locking is not supported in every fullscreen context.
        });
      }
    }
  };
  return (
    <button
      className={`flex items-center justify-center w-6 h-6 rounded-lg bg-white border-gray-500 border-2 ${className}`}
      onClick={onButtonClick}>
      <img className="w-4 h-4" src="/assets/icon/fullscreen.png" />
    </button>
  );
}
