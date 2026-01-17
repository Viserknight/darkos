import { 
  Terminal, 
  Settings, 
  FolderOpen, 
  Calculator,
  Music,
  Image,
  MessageCircle,
  Globe
} from "lucide-react";
import { useState } from "react";

interface DockProps {
  onOpenApp: (appId: string) => void;
  openApps: string[];
}

const apps = [
  { id: "terminal", name: "Terminal", icon: Terminal, color: "from-green-500 to-emerald-600" },
  { id: "files", name: "Files", icon: FolderOpen, color: "from-amber-500 to-orange-600" },
  { id: "browser", name: "Browser", icon: Globe, color: "from-blue-500 to-cyan-600" },
  { id: "calculator", name: "Calculator", icon: Calculator, color: "from-purple-500 to-violet-600" },
  { id: "music", name: "Music", icon: Music, color: "from-pink-500 to-rose-600" },
  { id: "gallery", name: "Gallery", icon: Image, color: "from-teal-500 to-cyan-600" },
  { id: "messages", name: "Messages", icon: MessageCircle, color: "from-indigo-500 to-purple-600" },
  { id: "settings", name: "Settings", icon: Settings, color: "from-slate-500 to-zinc-600" },
];

const Dock = ({ onOpenApp, openApps }: DockProps) => {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-strong rounded-2xl px-3 py-2 flex items-center gap-2">
        {apps.map((app) => {
          const Icon = app.icon;
          const isOpen = openApps.includes(app.id);
          const isHovered = hoveredApp === app.id;

          return (
            <div
              key={app.id}
              className="relative group"
              onMouseEnter={() => setHoveredApp(app.id)}
              onMouseLeave={() => setHoveredApp(null)}
            >
              {/* Tooltip */}
              <div
                className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 glass rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                {app.name}
              </div>

              {/* App Icon */}
              <button
                onClick={() => onOpenApp(app.id)}
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 bg-gradient-to-br ${app.color} ${
                  isHovered ? "scale-125 -translate-y-3" : "scale-100"
                }`}
              >
                <Icon className="w-6 h-6 text-primary-foreground" />
                
                {/* Glow effect */}
                {isHovered && (
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${app.color} blur-xl opacity-50 -z-10`} />
                )}
              </button>

              {/* Open indicator */}
              {isOpen && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dock;
