import { useState } from "react";

const YouTubeInput = ({ onVideoSelect }) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      // Get video details from YouTube oEmbed API
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );

      if (!response.ok) {
        throw new Error("Could not fetch video details");
      }

      const data = await response.json();

      onVideoSelect({
        id: `youtube-${videoId}`,
        title: data.title,
        path: url, // Original URL for ReactPlayer
        image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        isYouTube: true,
      });

      setUrl("");
    } catch (error) {
      console.error("Error processing YouTube URL:", error);
      alert("Invalid YouTube URL or video not found");
    } finally {
      setIsLoading(false);
    }
  };

  const extractVideoId = (url) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2 text-xs text-neutral-400">
          YouTube URL
        </label>
        <div className="gap-2 flex flex-col justify-center items-center ">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full flex-1 bg-neutral-800 text-white rounded-lg p-2 text-sm border border-neutral-700 focus:ring-2 focus:ring-white outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !url}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isLoading ? "Loading..." : "Import"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default YouTubeInput;
