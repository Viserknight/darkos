import { 
  User, 
  Wifi, 
  Bluetooth, 
  Monitor, 
  Volume2, 
  Bell, 
  Lock, 
  Palette,
  HardDrive,
  Info
} from "lucide-react";
import { useState } from "react";

const settingsItems = [
  { id: "account", name: "Account", icon: User, description: "Profile, sign-in options" },
  { id: "network", name: "Network", icon: Wifi, description: "Wi-Fi, connections" },
  { id: "bluetooth", name: "Bluetooth", icon: Bluetooth, description: "Devices, pairing" },
  { id: "display", name: "Display", icon: Monitor, description: "Brightness, resolution" },
  { id: "sound", name: "Sound", icon: Volume2, description: "Volume, output devices" },
  { id: "notifications", name: "Notifications", icon: Bell, description: "Alerts, focus assist" },
  { id: "privacy", name: "Privacy", icon: Lock, description: "Security, permissions" },
  { id: "appearance", name: "Appearance", icon: Palette, description: "Themes, colors" },
  { id: "storage", name: "Storage", icon: HardDrive, description: "Disk usage, cleanup" },
  { id: "about", name: "About", icon: Info, description: "System information" },
];

const SettingsApp = () => {
  const [selectedSetting, setSelectedSetting] = useState("about");

  const renderContent = () => {
    if (selectedSetting === "about") {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-2xl">🌌</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Dark Galaxy OS</h2>
              <p className="text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-muted/20">
              <p className="text-sm text-muted-foreground">Device Name</p>
              <p className="font-medium">Space Explorer's Desktop</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/20">
              <p className="text-sm text-muted-foreground">Processor</p>
              <p className="font-medium">Quantum Core X1</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/20">
              <p className="text-sm text-muted-foreground">Memory</p>
              <p className="font-medium">∞ GB Cosmic RAM</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/20">
              <p className="text-sm text-muted-foreground">System Type</p>
              <p className="font-medium">64-bit Web Operating System</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Settings for "{selectedSetting}" coming soon...</p>
      </div>
    );
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-56 border-r border-border/50 p-3 space-y-1 overflow-auto">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedSetting === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedSetting(item.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">{renderContent()}</div>
    </div>
  );
};

export default SettingsApp;
