import { useState, useRef, useEffect, ReactNode } from "react";
import { X, Minus, Maximize2, Minimize2 } from "lucide-react";

interface WindowProps {
  id: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  zIndex: number;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

const Window = ({
  id,
  title,
  icon,
  children,
  onClose,
  onFocus,
  zIndex,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 400 },
}: WindowProps) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const prevState = useRef({ position, size });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: Math.max(0, e.clientY - dragOffset.current.y),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    onFocus(id);
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      setPosition(prevState.current.position);
      setSize(prevState.current.size);
    } else {
      prevState.current = { position, size };
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 80 });
    }
    setIsMaximized(!isMaximized);
  };

  if (isMinimized) return null;

  return (
    <div
      className="absolute glass-strong rounded-xl overflow-hidden shadow-2xl cosmic-border animate-slide-up"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
      }}
      onMouseDown={() => onFocus(id)}
    >
      {/* Title Bar */}
      <div
        className="h-10 flex items-center justify-between px-3 bg-muted/30 cursor-move select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 flex items-center justify-center text-muted-foreground">
            {icon}
          </span>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <Minus className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={toggleMaximize}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => onClose(id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/20 transition-colors group"
          >
            <X className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-2.5rem)] overflow-auto">{children}</div>
    </div>
  );
};

export default Window;
