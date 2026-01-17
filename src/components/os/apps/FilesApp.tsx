import { 
  Folder, 
  File, 
  Image, 
  Music, 
  Video, 
  FileText,
  ChevronRight,
  Home,
  Star,
  Clock,
  Trash2
} from "lucide-react";
import { useState } from "react";

interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file" | "image" | "music" | "video" | "document";
  size?: string;
  modified?: string;
}

const sidebarItems = [
  { id: "home", name: "Home", icon: Home },
  { id: "favorites", name: "Favorites", icon: Star },
  { id: "recent", name: "Recent", icon: Clock },
  { id: "trash", name: "Trash", icon: Trash2 },
];

const mockFiles: FileItem[] = [
  { id: "1", name: "Documents", type: "folder" },
  { id: "2", name: "Pictures", type: "folder" },
  { id: "3", name: "Music", type: "folder" },
  { id: "4", name: "Videos", type: "folder" },
  { id: "5", name: "galaxy-wallpaper.png", type: "image", size: "2.4 MB" },
  { id: "6", name: "notes.txt", type: "document", size: "12 KB" },
  { id: "7", name: "cosmic-beats.mp3", type: "music", size: "8.2 MB" },
  { id: "8", name: "project-demo.mp4", type: "video", size: "156 MB" },
];

const getIcon = (type: string) => {
  switch (type) {
    case "folder": return Folder;
    case "image": return Image;
    case "music": return Music;
    case "video": return Video;
    case "document": return FileText;
    default: return File;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case "folder": return "text-amber-400";
    case "image": return "text-pink-400";
    case "music": return "text-green-400";
    case "video": return "text-purple-400";
    case "document": return "text-blue-400";
    default: return "text-muted-foreground";
  }
};

const FilesApp = () => {
  const [selectedLocation, setSelectedLocation] = useState("home");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-44 border-r border-border/50 p-3 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedLocation === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedLocation(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb */}
        <div className="h-10 border-b border-border/50 flex items-center gap-2 px-4 text-sm">
          <Home className="w-4 h-4 text-muted-foreground" />
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <span className="capitalize">{selectedLocation}</span>
        </div>

        {/* Files Grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-4 gap-3">
            {mockFiles.map((file) => {
              const Icon = getIcon(file.type);
              const iconColor = getIconColor(file.type);
              const isSelected = selectedFile === file.id;

              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file.id)}
                  onDoubleClick={() => console.log("Open:", file.name)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
                    isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/30"
                  }`}
                >
                  <Icon className={`w-10 h-10 ${iconColor}`} />
                  <span className="text-xs text-center truncate w-full">{file.name}</span>
                  {file.size && (
                    <span className="text-[10px] text-muted-foreground">{file.size}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-7 border-t border-border/50 flex items-center justify-between px-4 text-xs text-muted-foreground">
          <span>{mockFiles.length} items</span>
          {selectedFile && <span>1 selected</span>}
        </div>
      </div>
    </div>
  );
};

export default FilesApp;
