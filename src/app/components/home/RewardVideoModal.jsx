"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

const YT_SRC = "https://www.youtube.com/iframe_api";

function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const tag = document.createElement("script");
    tag.src = YT_SRC;
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
}

const RewardVideoModal = ({ open, videoIds, onComplete, onClose }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);

  const getRandomVideoId = useCallback(() => {
    if (!videoIds || videoIds.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * videoIds.length);
    return videoIds[randomIndex];
  }, [videoIds]);

  const initPlayer = useCallback(
    async (id) => {
      const YT = await loadYouTubeAPI();
      if (playerRef.current?.destroy) playerRef.current.destroy();
      if (!id) return;

      playerRef.current = new YT.Player(containerRef.current, {
        videoId: id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          fs: 0,
          disablekb: 1,
        },
        events: {
          onReady: (ev) => {
            ev.target.getIframe()?.setAttribute("allow", "autoplay");
            ev.target.unMute();
            ev.target.setVolume(100);
            ev.target.playVideo();
          },
          onStateChange: (ev) => {
            if (ev.data === window.YT.PlayerState.ENDED) {
              onComplete?.();
              onClose?.();
            }
            if (ev.data === window.YT.PlayerState.PAUSED) ev.target.playVideo();
          },
        },
      });
    },
    [onComplete, onClose]
  );

  useEffect(() => {
    if (!open) {
      setStarted(false);
      setCurrentVideoId(null);
      return;
    }

    setCurrentVideoId(getRandomVideoId());

    return () => {
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [open, getRandomVideoId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-[900px] p-6 relative text-center">
        <h3 className="mb-4 text-xl font-bold">
          Tonton video untuk dapat saldo gratis
        </h3>

        <div className="w-full mb-4 overflow-hidden bg-black rounded-lg aspect-video">
          {!started ? (
            <div className="flex items-center justify-center w-full h-full text-white">
              <span>Video akan mulai setelah kamu klik tombol</span>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <div ref={containerRef} className="w-full h-full" />
              <div className="absolute inset-0 z-10"></div>
            </div>
          )}
        </div>

        {!started && (
          <button
            onClick={() => {
              const id = getRandomVideoId();
              if (!id) return;
              setCurrentVideoId(id);
              setStarted(true);
              initPlayer(id);
            }}
            className="px-6 py-3 rounded-full bg-[#FF9D23] hover:bg-orange-500 text-black font-medium transition"
          >
            Mulai Tonton
          </button>
        )}
      </div>
    </div>
  );
};

export default RewardVideoModal;
