import { useState } from "react";
import { 
  Image, 
  Grid3X3, 
  LayoutGrid, 
  ZoomIn, 
  Heart, 
  Download,
  Trash2,
  Star,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Photo {
  id: string;
  name: string;
  date: string;
  gradient: string;
  favorite: boolean;
}

const photos: Photo[] = [
  { id: "1", name: "Nebula Sunrise", date: "Jan 15, 2024", gradient: "from-purple-600 via-pink-500 to-red-500", favorite: true },
  { id: "2", name: "Galaxy Core", date: "Jan 14, 2024", gradient: "from-blue-600 via-cyan-500 to-teal-400", favorite: false },
  { id: "3", name: "Cosmic Dust", date: "Jan 13, 2024", gradient: "from-amber-500 via-orange-500 to-red-600", favorite: true },
  { id: "4", name: "Black Hole", date: "Jan 12, 2024", gradient: "from-slate-900 via-purple-900 to-slate-800", favorite: false },
  { id: "5", name: "Star Field", date: "Jan 11, 2024", gradient: "from-indigo-900 via-blue-800 to-purple-900", favorite: false },
  { id: "6", name: "Solar Flare", date: "Jan 10, 2024", gradient: "from-yellow-400 via-orange-500 to-red-600", favorite: true },
  { id: "7", name: "Aurora", date: "Jan 9, 2024", gradient: "from-green-400 via-cyan-500 to-blue-600", favorite: false },
  { id: "8", name: "Supernova", date: "Jan 8, 2024", gradient: "from-pink-500 via-purple-500 to-indigo-600", favorite: false },
  { id: "9", name: "Asteroid Belt", date: "Jan 7, 2024", gradient: "from-stone-600 via-amber-700 to-stone-800", favorite: false },
  { id: "10", name: "Pulsar", date: "Jan 6, 2024", gradient: "from-cyan-400 via-blue-500 to-purple-600", favorite: true },
  { id: "11", name: "Quasar", date: "Jan 5, 2024", gradient: "from-violet-600 via-fuchsia-500 to-pink-500", favorite: false },
  { id: "12", name: "Wormhole", date: "Jan 4, 2024", gradient: "from-emerald-500 via-teal-600 to-cyan-700", favorite: false },
];

const GalleryApp = () => {
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [photoList, setPhotoList] = useState(photos);

  const filteredPhotos = filter === "favorites" 
    ? photoList.filter((p) => p.favorite) 
    : photoList;

  const toggleFavorite = (id: string) => {
    setPhotoList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p))
    );
  };

  return (
    <div className="h-full flex flex-col bg-background/50">
      {/* Toolbar */}
      <div className="p-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            <Image className="w-4 h-4 mr-2" />
            All Photos
          </Button>
          <Button
            variant={filter === "favorites" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("favorites")}
          >
            <Star className="w-4 h-4 mr-2" />
            Favorites
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "large" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("large")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Gallery Grid */}
      <ScrollArea className="flex-1 p-4">
        <div
          className={`grid gap-3 ${
            viewMode === "grid" 
              ? "grid-cols-4" 
              : "grid-cols-3"
          }`}
        >
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${photo.gradient}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image className="w-8 h-8 text-white/30" />
                </div>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="w-8 h-8 text-white" />
              </div>

              {/* Favorite Badge */}
              {photo.favorite && (
                <div className="absolute top-2 right-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
              )}

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white font-medium truncate">{photo.name}</p>
                <p className="text-[10px] text-white/70">{photo.date}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Star className="w-12 h-12 mb-2 opacity-50" />
            <p>No favorites yet</p>
          </div>
        )}
      </ScrollArea>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col">
          {/* Lightbox Header */}
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-semibold text-white">{selectedPhoto.name}</h3>
              <p className="text-sm text-white/70">{selectedPhoto.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFavorite(selectedPhoto.id)}
                className="text-white hover:text-white hover:bg-white/10"
              >
                <Heart className={`w-5 h-5 ${selectedPhoto.favorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10">
                <Download className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10">
                <Trash2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPhoto(null)}
                className="text-white hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Lightbox Image */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className={`w-full max-w-2xl aspect-video rounded-2xl bg-gradient-to-br ${selectedPhoto.gradient} flex items-center justify-center shadow-2xl`}>
              <Image className="w-24 h-24 text-white/30" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryApp;
