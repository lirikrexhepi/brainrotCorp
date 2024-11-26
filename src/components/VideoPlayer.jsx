import ReactPlayer from "react-player";
import { useRef, useState, useEffect } from "react";

function VideoPlayer({
  containerRef,
  selectedVideo,
  captionText,
  textSettings,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const youtubeRef = useRef(null);
  const videoRef = useRef(null);
  const backgroundVideoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const [showBothVideos, setShowBothVideos] = useState(true);
  const [currentChunk, setCurrentChunk] = useState(null);

  useEffect(() => {
    setIsPlaying(false);
    setPlayed(0);
  }, [selectedVideo]);

  const calculateTotalDuration = (text) => {
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const chunks = Math.ceil(words.length / 3);
    // 1 second per chunk, plus 2 seconds buffer (1 at start, 1 at end)
    return chunks + 2;
  };

  const getVisibleChunk = (currentTime) => {
    if (!captionText) return null;

    // Split text into chunks
    const words = captionText.split(/\s+/).filter((word) => word.length > 0);
    const wordsPerChunk = 3;
    const chunks = [];

    for (let i = 0; i < words.length; i += wordsPerChunk) {
      chunks.push(words.slice(i, i + wordsPerChunk).join(" "));
    }

    // Calculate which chunk to show
    const startBuffer = 1;
    const textTime = currentTime - startBuffer;
    const currentChunkIndex = Math.floor(textTime);

    return currentChunkIndex >= 0 && currentChunkIndex < chunks.length
      ? chunks[currentChunkIndex]
      : null;
  };

  useEffect(() => {
    if (youtubeRef.current && captionText) {
      const totalDuration = calculateTotalDuration(captionText);

      const checkTime = () => {
        const currentTime = youtubeRef.current.getCurrentTime();
        if (currentTime >= totalDuration) {
          handlePause();
          youtubeRef.current?.seekTo(0);
          if (backgroundVideoRef.current) {
            backgroundVideoRef.current.currentTime = 0;
          }
        }
      };

      const interval = setInterval(checkTime, 100);
      return () => clearInterval(interval);
    }
  }, [captionText, isPlaying]);

  const handleProgress = (state) => {
    if (!isPlaying) return;
    setPlayed(state.played);
    if (youtubeRef.current) {
      const currentTime = youtubeRef.current.getCurrentTime();
      setCurrentChunk(getVisibleChunk(currentTime));
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (selectedVideo.isYouTube) {
      if (youtubeRef.current) {
        youtubeRef.current.getInternalPlayer().playVideo();
      }
      if (backgroundVideoRef.current) {
        backgroundVideoRef.current.play();
      }
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (selectedVideo.isYouTube) {
      if (youtubeRef.current) {
        youtubeRef.current.getInternalPlayer().pauseVideo();
      }
      if (backgroundVideoRef.current) {
        backgroundVideoRef.current.pause();
      }
    }
  };

  const handleSeek = (seconds) => {
    if (selectedVideo.isYouTube) {
      youtubeRef.current?.seekTo(seconds, "seconds");
    }
  };

  const captionStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    color: textSettings.color,
    fontSize: `${textSettings.fontSize}px`,
    fontWeight: textSettings.fontWeight,
    textAlign: "center",
    maxWidth: "90%",
    WebkitTextStroke: `${textSettings.outlineWidth}px ${textSettings.outlineColor}`,
    ...(textSettings.position === "top" && { top: "10%" }),
    ...(textSettings.position === "center" && {
      top: "50%",
      transform: "translate(-50%, -50%)",
    }),
    ...(textSettings.position === "bottom" && { bottom: "10%" }),
  };

  if (!selectedVideo) {
    return (
      <div
        ref={containerRef}
        className="w-full aspect-[9/16] bg-neutral-900 rounded-xl flex items-center justify-center"
      >
        <p className="text-neutral-500">Select a video to get started</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[9/16] bg-neutral-900 rounded-xl relative overflow-hidden"
    >
      {selectedVideo.isYouTube ? (
        <div className="relative w-full h-full">
          <video
            ref={backgroundVideoRef}
            src="/videos/minecraft.mp4"
            className={`absolute w-full object-cover ${
              showBothVideos
                ? "bottom-0 h-1/2 object-center"
                : "inset-0 h-full opacity-30"
            }`}
            loop
            muted
            playsInline
          />
          <div
            className={`absolute inset-0 z-10 ${showBothVideos ? "h-1/2" : ""}`}
          >
            <ReactPlayer
              ref={youtubeRef}
              url={selectedVideo.path}
              width="100%"
              height="100%"
              playing={isPlaying}
              controls={true}
              onProgress={handleProgress}
              onDuration={setDuration}
              onPlay={handlePlay}
              onPause={handlePause}
              config={{
                youtube: {
                  playerVars: {
                    controls: 1,
                    showinfo: 0,
                    modestbranding: 1,
                    rel: 0,
                    iv_load_policy: 3,
                  },
                },
              }}
            />
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={selectedVideo.path}
          className="w-full h-full object-cover"
          controls
          loop
          onPlay={handlePlay}
          onPause={handlePause}
        />
      )}
      {captionText && (
        <div style={captionStyle} className="pointer-events-none z-20">
          {currentChunk}
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
