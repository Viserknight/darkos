import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Home, Star, Shield, Search } from "lucide-react";

const BrowserApp = () => {
  const [url, setUrl] = useState("darkgalaxy://home");
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="h-full flex flex-col bg-card/30">
      {/* Browser Toolbar */}
      <div className="h-12 border-b border-border/50 flex items-center gap-2 px-3">
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button 
            onClick={handleNavigate}
            className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <RotateCw className={`w-4 h-4 text-muted-foreground ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
            <Home className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50">
          <Shield className="w-3.5 h-3.5 text-green-400" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <Star className="w-3.5 h-3.5 text-muted-foreground hover:text-amber-400 cursor-pointer" />
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 overflow-auto">
        <div className="h-full flex flex-col items-center justify-center p-8">
          {/* Logo */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 animate-float">
            <span className="text-5xl">🌌</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gradient mb-2">Dark Galaxy Search</h1>
          <p className="text-muted-foreground mb-8">Explore the cosmic web</p>

          {/* Search Box */}
          <div className="w-full max-w-lg flex items-center gap-3 px-5 py-3 rounded-2xl bg-muted/20 border border-border/50 focus-within:border-primary/50 transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search the galaxy..."
              className="flex-1 bg-transparent outline-none"
            />
          </div>

          {/* Quick Links */}
          <div className="flex gap-4 mt-8">
            {["Nebula", "Cosmos", "Stars", "Planets"].map((link) => (
              <button
                key={link}
                className="px-4 py-2 rounded-xl bg-muted/20 hover:bg-muted/30 text-sm transition-colors"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserApp;
