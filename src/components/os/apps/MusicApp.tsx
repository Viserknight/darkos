import { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle,
  Music,
  Heart
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  color: string;
}

const tracks: Track[] = [
  { id: "1", title: "Cosmic Voyage", artist: "Stellar Dreams", album: "Nebula", duration: "3:42", color: "from-purple-500 to-blue-600" },
  { id: "2", title: "Event Horizon", artist: "Black Hole Sun", album: "Singularity", duration: "4:18", color: "from-red-500 to-orange-600" },
  { id: "3", title: "Andromeda", artist: "Galaxy Core", album: "Deep Space", duration: "5:01", color: "from-cyan-500 to-teal-600" },
  { id: "4", title: "Quantum Beats", artist: "Particle Wave", album: "Entangled", duration: "3:55", color: "from-pink-500 to-rose-600" },
  { id: "5", title: "Solar Flare", artist: "Corona Burst", album: "Heliosphere", duration: "4:32", color: "from-yellow-500 to-amber-600" },
  { id: "6", title: "Dark Matter", artist: "Invisible Force", album: "Unknown", duration: "6:12", color: "from-slate-500 to-zinc-600" },
  { id: "7", title: "Supernova", artist: "Stellar Dreams", album: "Nebula", duration: "4:45", color: "from-violet-500 to-purple-600" },
  { id: "8", title: "Warp Speed", artist: "Light Years", album: "Hyperspace", duration: "3:28", color: "from-blue-500 to-indigo-600" },
];

const MusicApp = () => {
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 0.5;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentTrack]);

  const handleNext = () => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = isShuffled 
      ? Math.floor(Math.random() * tracks.length) 
      : (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setProgress(0);
  };

  const handlePrev = () => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    setCurrentTrack(tracks[prevIndex]);
    setProgress(0);
  };

  const toggleLike = (trackId: string) => {
    setLikedTracks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full flex bg-background/50">
      {/* Now Playing */}
      <div className="w-72 p-6 flex flex-col items-center border-r border-border/50">
        {/* Album Art */}
        <div className={`w-48 h-48 rounded-2xl bg-gradient-to-br ${currentTrack.color} flex items-center justify-center shadow-2xl relative overflow-hidden`}>
          <Music className="w-16 h-16 text-white/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {isPlaying && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="mt-6 text-center">
          <h3 className="font-semibold text-lg text-foreground">{currentTrack.title}</h3>
          <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
          <p className="text-xs text-muted-foreground mt-1">{currentTrack.album}</p>
        </div>

        {/* Progress */}
        <div className="w-full mt-6 space-y-2">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={(val) => setProgress(val[0])}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.floor((progress / 100) * 240 / 60)}:{String(Math.floor((progress / 100) * 240 % 60)).padStart(2, "0")}</span>
            <span>{currentTrack.duration}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsShuffled(!isShuffled)}
            className={isShuffled ? "text-primary" : "text-muted-foreground"}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePrev}>
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext}>
            <SkipForward className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsRepeat(!isRepeat)}
            className={isRepeat ? "text-primary" : "text-muted-foreground"}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 mt-6 w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="shrink-0"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            onValueChange={(val) => {
              setVolume(val[0]);
              setIsMuted(false);
            }}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Playlist */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-semibold text-foreground">Cosmic Playlist</h2>
          <p className="text-xs text-muted-foreground">{tracks.length} tracks</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => {
                  setCurrentTrack(track);
                  setProgress(0);
                  setIsPlaying(true);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  currentTrack.id === track.id 
                    ? "bg-primary/20" 
                    : "hover:bg-white/5"
                }`}
              >
                <span className="w-6 text-xs text-muted-foreground text-center">
                  {currentTrack.id === track.id && isPlaying ? (
                    <Music className="w-4 h-4 mx-auto text-primary animate-pulse" />
                  ) : (
                    index + 1
                  )}
                </span>
                <div className={`w-10 h-10 rounded bg-gradient-to-br ${track.color} flex items-center justify-center`}>
                  <Music className="w-4 h-4 text-white/80" />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-medium ${currentTrack.id === track.id ? "text-primary" : "text-foreground"}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{track.artist}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(track.id);
                  }}
                  className="shrink-0"
                >
                  <Heart
                    className={`w-4 h-4 ${likedTracks.has(track.id) ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
                <span className="text-xs text-muted-foreground w-10 text-right">{track.duration}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MusicApp;
