import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { toast } from "react-hot-toast";

const ExportButton = ({ containerRef, captionText, textSettings }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(null);

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;

    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const captureFrames = async () => {
    if (!containerRef.current) return null;

    const container = containerRef.current;
    const video = container.querySelector("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions to match container
    canvas.width = 350;
    canvas.height = Math.round(350 * (16 / 9));

    // Split text into chunks of 3 words
    const words = captionText.split(/\s+/).filter((word) => word.length > 0);
    const wordsPerChunk = 3;
    const chunks = [];

    for (let i = 0; i < words.length; i += wordsPerChunk) {
      chunks.push(words.slice(i, i + wordsPerChunk).join(" "));
    }

    const secondsPerChunk = 1; // Each chunk shows for 1 second
    const fps = 30;
    const totalDuration = chunks.length * secondsPerChunk;
    const frameCount = totalDuration * fps;

    const frames = [];
    let lastProgress = 0;

    // Capture frames
    for (let i = 0; i < frameCount; i++) {
      const time = i / fps;
      video.currentTime = time;

      await new Promise((resolve) => {
        video.addEventListener("seeked", resolve, { once: true });
      });

      // Calculate video positioning
      const videoAspect = video.videoWidth / video.videoHeight;
      const containerAspect = canvas.width / canvas.height;

      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let x = 0;
      let y = 0;

      if (videoAspect > containerAspect) {
        drawWidth = canvas.height * videoAspect;
        x = -(drawWidth - canvas.width) / 2;
      } else {
        drawHeight = canvas.width / videoAspect;
        y = -(drawHeight - canvas.height) / 2;
      }

      // Clear canvas and draw video frame
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, x, y, drawWidth, drawHeight);

      // Calculate which chunk should be shown
      const currentChunkIndex = Math.floor(time / secondsPerChunk);
      const currentChunk = chunks[currentChunkIndex];

      // Add text overlay if we have a current chunk
      if (currentChunk && currentChunkIndex < chunks.length) {
        ctx.font = `${textSettings.fontWeight} ${textSettings.fontSize}px Inter`;
        ctx.textAlign = "center";

        // Calculate text position
        const textY =
          textSettings.position === "top"
            ? canvas.height * 0.2
            : textSettings.position === "center"
            ? canvas.height * 0.5
            : canvas.height * 0.8;

        // Add fade in/out effect
        const fadeInDuration = 0.2; // seconds
        const fadeOutDuration = 0.2; // seconds
        const chunkStartTime = currentChunkIndex * secondsPerChunk;
        const timeIntoChunk = time - chunkStartTime;

        let alpha = 1;
        if (timeIntoChunk < fadeInDuration) {
          alpha = timeIntoChunk / fadeInDuration;
        } else if (timeIntoChunk > secondsPerChunk - fadeOutDuration) {
          alpha = (secondsPerChunk - timeIntoChunk) / fadeOutDuration;
        }

        // Draw text outline
        ctx.strokeStyle = `rgba(${hexToRgb(
          textSettings.outlineColor
        )},${alpha})`;
        ctx.lineWidth = textSettings.outlineWidth * 2;
        ctx.strokeText(currentChunk, canvas.width / 2, textY);

        // Draw main text
        const textColor = hexToRgb(textSettings.color);
        ctx.fillStyle = `rgba(${textColor},${alpha})`;
        ctx.fillText(currentChunk, canvas.width / 2, textY);
      }

      frames.push(canvas.toDataURL("image/jpeg", 0.95));

      // Update progress
      const currentProgress = Math.round((i / frameCount) * 100);
      if (currentProgress !== lastProgress) {
        lastProgress = currentProgress;
        setProgress(currentProgress);
      }
    }

    return frames;
  };

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(
          result[3],
          16
        )}`
      : "255,255,255";
  };

  const exportVideo = async () => {
    try {
      setIsExporting(true);
      setProgress(0);

      toast.loading("Starting export...", { id: "export" });
      const ffmpeg = await loadFFmpeg();

      toast.loading("Capturing frames...", { id: "export" });
      const frames = await captureFrames();
      if (!frames || frames.length === 0)
        throw new Error("Failed to capture frames");

      toast.loading("Processing video...", { id: "export" });

      // Write frames to FFmpeg
      for (let i = 0; i < frames.length; i++) {
        const base64Data = frames[i].split(",")[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }
        await ffmpeg.writeFile(
          `frame${i.toString().padStart(4, "0")}.jpg`,
          bytes
        );
      }

      // Generate video with proper dimensions and framerate
      await ffmpeg.exec([
        "-framerate",
        "30",
        "-i",
        "frame%04d.jpg",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "23",
        "-movflags",
        "+faststart",
        "-pix_fmt",
        "yuv420p",
        "output.mp4",
      ]);

      // Read and download the output file
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "video-with-captions.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Cleanup
      for (let i = 0; i < frames.length; i++) {
        await ffmpeg.deleteFile(`frame${i.toString().padStart(4, "0")}.jpg`);
      }
      await ffmpeg.deleteFile("output.mp4");

      toast.success("Export complete!", { id: "export" });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed: " + error.message, { id: "export" });
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={exportVideo}
        disabled={isExporting}
        className="px-6 py-3 rounded bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isExporting ? "Exporting..." : "Export Video"}
      </button>

      {isExporting && (
        <div className="w-full max-w-xs">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1 text-center">{progress}%</p>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
