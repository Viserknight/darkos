import { useState, useEffect } from "react";
import { Wifi, Battery, Volume2, Search, Power } from "lucide-react";

interface TopBarProps {
  onOpenStartMenu: () => void;
}

const TopBar = ({ onOpenStartMenu }: TopBarProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-8 glass-strong z-50 flex items-center justify-between px-4">
      {/* Left - Logo & Start */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenStartMenu}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/30 transition-colors"
        >
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-accent" />
          <span className="text-xs font-semibold text-gradient">Dark Galaxy</span>
        </button>
      </div>

      {/* Center - Search */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/20 border border-border/50">
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-xs w-40 outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Right - System Tray */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wifi className="w-3.5 h-3.5" />
          <Volume2 className="w-3.5 h-3.5" />
          <Battery className="w-3.5 h-3.5" />
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="text-xs">
          <span className="text-foreground font-medium">{formatTime(time)}</span>
          <span className="text-muted-foreground ml-2">{formatDate(time)}</span>
        </div>
        <button className="p-1 rounded hover:bg-destructive/20 transition-colors group">
          <Power className="w-3.5 h-3.5 text-muted-foreground group-hover:text-destructive" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
