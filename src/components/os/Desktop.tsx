import { useState, useCallback } from "react";
import { Terminal, Settings, FolderOpen, Calculator, Globe } from "lucide-react";
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

interface OpenWindow {
  id: string;
  appId: string;
  title: string;
  zIndex: number;
}

const appConfig: Record<string, { title: string; icon: React.ReactNode; component: React.ReactNode; size?: { width: number; height: number } }> = {
  terminal: {
    title: "Terminal",
    icon: <Terminal className="w-4 h-4" />,
    component: <TerminalApp />,
    size: { width: 650, height: 420 },
  },
  calculator: {
    title: "Calculator",
    icon: <Calculator className="w-4 h-4" />,
    component: <CalculatorApp />,
    size: { width: 320, height: 480 },
  },
  settings: {
    title: "Settings",
    icon: <Settings className="w-4 h-4" />,
    component: <SettingsApp />,
    size: { width: 750, height: 500 },
  },
  files: {
    title: "Files",
    icon: <FolderOpen className="w-4 h-4" />,
    component: <FilesApp />,
    size: { width: 700, height: 450 },
  },
  browser: {
    title: "Browser",
    icon: <Globe className="w-4 h-4" />,
    component: <BrowserApp />,
    size: { width: 900, height: 600 },
  },
};

const Desktop = () => {
  const [windows, setWindows] = useState<OpenWindow[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const openApp = useCallback((appId: string) => {
    // Check if app is already open
    const existingWindow = windows.find((w) => w.appId === appId);
    if (existingWindow) {
      // Focus existing window
      setWindows((prev) =>
        prev.map((w) =>
          w.id === existingWindow.id ? { ...w, zIndex: maxZIndex + 1 } : w
        )
      );
      setMaxZIndex((prev) => prev + 1);
      return;
    }

    const config = appConfig[appId];
    if (!config) return;

    const newWindow: OpenWindow = {
      id: `${appId}-${Date.now()}`,
      appId,
      title: config.title,
      zIndex: maxZIndex + 1,
    };

    setWindows((prev) => [...prev, newWindow]);
    setMaxZIndex((prev) => prev + 1);
  }, [windows, maxZIndex]);

  const closeWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId));
  }, []);

  const focusWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, zIndex: maxZIndex + 1 } : w
      )
    );
    setMaxZIndex((prev) => prev + 1);
  }, [maxZIndex]);

  const getRandomPosition = (index: number) => ({
    x: 80 + (index % 5) * 50,
    y: 60 + (index % 4) * 40,
  });

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Animated Star Background */}
      <StarField />

      {/* Top Bar */}
      <TopBar onOpenStartMenu={() => setIsStartMenuOpen(!isStartMenuOpen)} />

      {/* Windows */}
      {windows.map((window, index) => {
        const config = appConfig[window.appId];
        if (!config) return null;

        return (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            icon={config.icon}
            onClose={closeWindow}
            onFocus={focusWindow}
            zIndex={window.zIndex}
            initialPosition={getRandomPosition(index)}
            initialSize={config.size}
          >
            {config.component}
          </Window>
        );
      })}

      {/* Start Menu */}
      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        onOpenApp={openApp}
      />

      {/* Dock */}
      <Dock
        onOpenApp={openApp}
        openApps={windows.map((w) => w.appId)}
      />
    </div>
  );
};

export default Desktop;
