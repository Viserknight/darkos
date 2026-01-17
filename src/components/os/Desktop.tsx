import { useState, useCallback } from "react";
import { Terminal, Settings, FolderOpen, Calculator, Globe, Music, Image, MessageCircle, Sparkles, FileText, Cloud, Calendar } from "lucide-react";
import StarField from "./StarField";
import TopBar from "./TopBar";
import Dock from "./Dock";
import Window from "./Window";
import StartMenu from "./StartMenu";
import TerminalApp from "./apps/TerminalApp";
import CalculatorApp from "./apps/CalculatorApp";
import SettingsApp from "./apps/SettingsApp";
import FilesApp from "./apps/FilesApp";
import BrowserApp from "./apps/BrowserApp";
import MusicApp from "./apps/MusicApp";
import GalleryApp from "./apps/GalleryApp";
import MessagesApp from "./apps/MessagesApp";
import AIAssistantApp from "./apps/AIAssistantApp";
import NotesApp from "./apps/NotesApp";
import WeatherApp from "./apps/WeatherApp";
import CalendarApp from "./apps/CalendarApp";

interface OpenWindow {
  id: string;
  appId: string;
  title: string;
  zIndex: number;
}

const appConfig: Record<string, { title: string; icon: React.ReactNode; component: React.ReactNode; size?: { width: number; height: number } }> = {
  terminal: { title: "Terminal", icon: <Terminal className="w-4 h-4" />, component: <TerminalApp />, size: { width: 650, height: 420 } },
  calculator: { title: "Calculator", icon: <Calculator className="w-4 h-4" />, component: <CalculatorApp />, size: { width: 320, height: 480 } },
  settings: { title: "Settings", icon: <Settings className="w-4 h-4" />, component: <SettingsApp />, size: { width: 750, height: 500 } },
  files: { title: "Files", icon: <FolderOpen className="w-4 h-4" />, component: <FilesApp />, size: { width: 700, height: 450 } },
  browser: { title: "Browser", icon: <Globe className="w-4 h-4" />, component: <BrowserApp />, size: { width: 900, height: 600 } },
  music: { title: "Music", icon: <Music className="w-4 h-4" />, component: <MusicApp />, size: { width: 750, height: 500 } },
  gallery: { title: "Gallery", icon: <Image className="w-4 h-4" />, component: <GalleryApp />, size: { width: 800, height: 550 } },
  messages: { title: "Messages", icon: <MessageCircle className="w-4 h-4" />, component: <MessagesApp />, size: { width: 800, height: 550 } },
  ai: { title: "Nova AI", icon: <Sparkles className="w-4 h-4" />, component: <AIAssistantApp />, size: { width: 500, height: 600 } },
  notes: { title: "Notes", icon: <FileText className="w-4 h-4" />, component: <NotesApp />, size: { width: 750, height: 500 } },
  weather: { title: "Weather", icon: <Cloud className="w-4 h-4" />, component: <WeatherApp />, size: { width: 400, height: 600 } },
  calendar: { title: "Calendar", icon: <Calendar className="w-4 h-4" />, component: <CalendarApp />, size: { width: 850, height: 550 } },
};

const Desktop = () => {
  const [windows, setWindows] = useState<OpenWindow[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const openApp = useCallback((appId: string) => {
    const existingWindow = windows.find((w) => w.appId === appId);
    if (existingWindow) {
      setWindows((prev) => prev.map((w) => w.id === existingWindow.id ? { ...w, zIndex: maxZIndex + 1 } : w));
      setMaxZIndex((prev) => prev + 1);
      return;
    }
    const config = appConfig[appId];
    if (!config) return;
    const newWindow: OpenWindow = { id: `${appId}-${Date.now()}`, appId, title: config.title, zIndex: maxZIndex + 1 };
    setWindows((prev) => [...prev, newWindow]);
    setMaxZIndex((prev) => prev + 1);
  }, [windows, maxZIndex]);

  const closeWindow = useCallback((windowId: string) => setWindows((prev) => prev.filter((w) => w.id !== windowId)), []);
  const focusWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.map((w) => w.id === windowId ? { ...w, zIndex: maxZIndex + 1 } : w));
    setMaxZIndex((prev) => prev + 1);
  }, [maxZIndex]);

  const getRandomPosition = (index: number) => ({ x: 80 + (index % 5) * 50, y: 60 + (index % 4) * 40 });

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <StarField />
      <TopBar onOpenStartMenu={() => setIsStartMenuOpen(!isStartMenuOpen)} />
      {windows.map((window, index) => {
        const config = appConfig[window.appId];
        if (!config) return null;
        return (
          <Window key={window.id} id={window.id} title={window.title} icon={config.icon} onClose={closeWindow} onFocus={focusWindow} zIndex={window.zIndex} initialPosition={getRandomPosition(index)} initialSize={config.size}>
            {config.component}
          </Window>
        );
      })}
      <StartMenu isOpen={isStartMenuOpen} onClose={() => setIsStartMenuOpen(false)} onOpenApp={openApp} />
      <Dock onOpenApp={openApp} openApps={windows.map((w) => w.appId)} />
    </div>
  );
};

export default Desktop;
