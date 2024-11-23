import { useState, useEffect, useRef, useMemo } from "react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

const VideoPlayer = ({
  selectedVideo,
  captionText,
  textSettings,
  containerRef,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState("");

  // Split text into chunks of 3-4 words
  const textChunks = useMemo(() => {
    const words = captionText.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += 3) {
      chunks.push(words.slice(i, i + 3).join(" "));
    }
    return chunks;
  }, [captionText]);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;

    const handleTimeUpdate = () => {
      const currentTime = videoElement.currentTime;
      // Show new text every second (adjust 1000 to control speed)
      const chunkIndex = Math.floor(currentTime);

      if (chunkIndex < textChunks.length) {
        setCurrentText(textChunks[chunkIndex]);
      } else {
        setCurrentText("");
        if (currentTime >= textChunks.length) {
          videoElement.pause();
          setIsPlaying(false);
        }
      }
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [textChunks]);

  const togglePlay = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pause();
      } else {
        videoRef.current.currentTime = 0;
        setCurrentText("");
        await videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error toggling video playback:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <div
        className="relative w-[350px] aspect-[9/16] bg-neutral-900 rounded-xl overflow-hidden"
        ref={containerRef}
      >
        {selectedVideo && (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              src={selectedVideo.path}
              loop={false}
              playsInline
            />

            {/* Overlay for play/pause */}
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/30 transition-colors"
            >
              <div
                className={`w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110 ${
                  isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
                }`}
              >
                {isPlaying ? (
                  <svg
                    className="w-12 h-12 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg
                    className="w-12 h-12 text-white translate-x-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Text overlay */}
            <div
              className={`absolute inset-0 flex ${
                textSettings.position === "top"
                  ? "items-start pt-8"
                  : textSettings.position === "center"
                  ? "items-center"
                  : "items-end pb-8"
              } justify-center`}
            >
              {currentText && (
                <p
                  className="text-center px-4 transition-opacity duration-300 max-w-[90%]"
                  style={{
                    color: textSettings.color || "#fff",
                    fontSize: `${textSettings.fontSize || 24}px`,
                    fontWeight: textSettings.fontWeight || "bold",
                    textShadow: `${textSettings.outlineWidth}px ${textSettings.outlineWidth}px 0 ${textSettings.outlineColor},
                                -${textSettings.outlineWidth}px -${textSettings.outlineWidth}px 0 ${textSettings.outlineColor},
                                ${textSettings.outlineWidth}px -${textSettings.outlineWidth}px 0 ${textSettings.outlineColor},
                                -${textSettings.outlineWidth}px ${textSettings.outlineWidth}px 0 ${textSettings.outlineColor}`,
                  }}
                >
                  {currentText}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Play button */}
      {selectedVideo && (
        <button
          onClick={togglePlay}
          className="w-full flex justify-center items-center px-6 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          {isPlaying ? (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              Pause Video
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play Video
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
