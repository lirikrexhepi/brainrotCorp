import { useState, useRef } from "react";
import { Toaster } from "react-hot-toast";
import VideoPlayer from "./components/VideoPlayer";
import CaptionInput from "./components/CaptionInput";
import ExportButton from "./components/ExportButton";
import YouTubeInput from "./components/YouTubeInput";

const videoOptions = [
  {
    id: "gta",
    title: "GTA V",
    path: "/videos/gta.mp4",
    image:
      "https://i0.wp.com/picjumbo.com/wp-content/uploads/grand-theft-auto-style-los-angeles-vibes-wallpaper-free-photo.jpg?w=2210&quality=70",
  },
  {
    id: "minecraft",
    title: "Minecraft",
    path: "/videos/minecraft.mp4",
    image:
      "https://www.pcgamesn.com/wp-content/sites/pcgamesn/2023/04/minecraft-mods-miny-golems-550x309.jpg",
  },
];

function App() {
  const containerRef = useRef(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [captionText, setCaptionText] = useState("");
  const [textSettings, setTextSettings] = useState({
    position: "bottom",
    fontSize: 24,
    color: "#ffffff",
    outlineColor: "#000000",
    outlineWidth: 2,
    fontWeight: "bold",
  });

  const handleUpdateTextSettings = (setting, value) => {
    setTextSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left Sidebar */}
      <div className="w-80 min-w-[320px] border-r border-neutral-800 p-8 space-y-8">
        <div className="space-y-8">
          <h1 className="text-2xl font-bold tracking-tight">brainrot corp.</h1>
          <div>
            <h1 className="text-lg font-medium tracking-tight">
              TikTok Generator
            </h1>
            <p className="text-sm text-neutral-400">
              Create engaging videos with custom text
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Choose Background</h2>
          <div className="grid grid-cols-2 gap-3">
            {videoOptions.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={`relative group overflow-hidden rounded-xl aspect-video ${
                  selectedVideo?.id === video.id
                    ? "ring-2 ring-white"
                    : "hover:ring-2 hover:ring-neutral-500"
                }`}
              >
                <img
                  src={video.image}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium">{video.title}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Import YouTube Video</h2>
          <YouTubeInput onVideoSelect={setSelectedVideo} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Text Settings</h2>
          <div className="space-y-4 p-4 rounded-xl bg-neutral-900">
            {/* Position */}
            <div>
              <label className="block mb-2 text-xs text-neutral-400">
                Position
              </label>
              <select
                value={textSettings.position}
                onChange={(e) =>
                  handleUpdateTextSettings("position", e.target.value)
                }
                className="w-full bg-neutral-800 text-white rounded-lg p-2 text-sm border border-neutral-700 focus:ring-2 focus:ring-white outline-none"
              >
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block mb-2 text-xs text-neutral-400">
                Font Size
              </label>
              <input
                type="range"
                min="16"
                max="48"
                value={textSettings.fontSize}
                onChange={(e) =>
                  handleUpdateTextSettings("fontSize", parseInt(e.target.value))
                }
                className="w-full accent-white"
              />
            </div>

            {/* Outline Stroke Size */}
            <div>
              <label className="block mb-2 text-xs text-neutral-400">
                Outline Stroke Size
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={textSettings.outlineWidth}
                onChange={(e) =>
                  handleUpdateTextSettings(
                    "outlineWidth",
                    parseInt(e.target.value)
                  )
                }
                className="w-full accent-white"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-xs text-neutral-400">
                  Text Color
                </label>
                <input
                  type="color"
                  value={textSettings.color}
                  onChange={(e) =>
                    handleUpdateTextSettings("color", e.target.value)
                  }
                  className="w-full h-8 rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs text-neutral-400">
                  Outline Color
                </label>
                <input
                  type="color"
                  value={textSettings.outlineColor}
                  onChange={(e) =>
                    handleUpdateTextSettings("outlineColor", e.target.value)
                  }
                  className="w-full h-8 rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Main Content - updated layout */}
      <div className="flex-1 flex flex-col h-screen">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-6 w-full max-w-[400px]">
            <VideoPlayer
              containerRef={containerRef}
              selectedVideo={selectedVideo}
              captionText={captionText}
              textSettings={textSettings}
            />
            <div className="w-full space-y-4">
              <CaptionInput
                captionText={captionText}
                onCaptionChange={setCaptionText}
              />
              <ExportButton
                containerRef={containerRef}
                captionText={captionText}
                textSettings={textSettings}
              />
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;
