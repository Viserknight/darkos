import { 
  Terminal, 
  Settings, 
  FolderOpen, 
  Calculator,
  Music,
  Image,
  MessageCircle,
  Globe,
  User,
  Power,
  Moon
} from "lucide-react";

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
}

const apps = [
  { id: "terminal", name: "Terminal", icon: Terminal, description: "Command line interface" },
  { id: "files", name: "Files", icon: FolderOpen, description: "Browse your files" },
  { id: "browser", name: "Browser", icon: Globe, description: "Explore the cosmos" },
  { id: "calculator", name: "Calculator", icon: Calculator, description: "Quick calculations" },
  { id: "music", name: "Music", icon: Music, description: "Play your tunes" },
  { id: "gallery", name: "Gallery", icon: Image, description: "View images" },
  { id: "messages", name: "Messages", icon: MessageCircle, description: "Chat with others" },
  { id: "settings", name: "Settings", icon: Settings, description: "System preferences" },
];

const StartMenu = ({ isOpen, onClose, onOpenApp }: StartMenuProps) => {
  if (!isOpen) return null;

  const handleAppClick = (appId: string) => {
    onOpenApp(appId);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[480px] glass-strong rounded-2xl p-4 z-50 animate-slide-up shadow-2xl">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search apps..."
            className="w-full px-4 py-2 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => handleAppClick(app.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium">{app.name}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50 my-3" />

        {/* User & Power */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Space Explorer</p>
              <p className="text-xs text-muted-foreground">Local Account</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <Moon className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-destructive/20 transition-colors group">
              <Power className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StartMenu;
