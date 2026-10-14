/**
 * Universal video autoplay utility ensuring playback across all browsers
 * (iOS Safari, Android Chrome, desktop Safari, Firefox, low-power mode, etc.)
 */

export function configureAutoplayVideo(video: HTMLVideoElement | null): void {
  if (!video) return;

  // WebKit/Safari requires DOM property explicitly set, not just HTML attribute
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', 'true');
}

export function playWithAutoplayFallback(video: HTMLVideoElement | null): () => void {
  if (!video) return () => {};

  configureAutoplayVideo(video);

  const attemptPlay = () => {
    if (!video) return;
    configureAutoplayVideo(video);
    const promise = video.play();
    if (promise !== undefined) {
      promise.catch(() => {
        // Autoplay policy restriction (e.g. iOS low power mode or gesture required)
        const unlock = () => {
          if (video) {
            configureAutoplayVideo(video);
            video.play().catch(() => {});
          }
          cleanupListeners();
        };

        const cleanupListeners = () => {
          window.removeEventListener('touchstart', unlock);
          window.removeEventListener('touchend', unlock);
          window.removeEventListener('click', unlock);
          window.removeEventListener('scroll', unlock);
        };

        window.addEventListener('touchstart', unlock, { once: true, passive: true });
        window.addEventListener('touchend', unlock, { once: true, passive: true });
        window.addEventListener('click', unlock, { once: true, passive: true });
        window.addEventListener('scroll', unlock, { once: true, passive: true });
      });
    }
  };

  attemptPlay();

  // Resume playback when tab returns to focus
  const handleVisibility = () => {
    if (!document.hidden && video) {
      attemptPlay();
    }
  };

  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}
