import { useState, useRef, useEffect } from "react";

const TerminalApp = () => {
  const [history, setHistory] = useState<{ input: string; output: string }[]>([
    { input: "", output: "Welcome to Dark Galaxy Terminal v1.0.0\nType 'help' for available commands.\n" },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [history]);

  const executeCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    let output = "";

    switch (command) {
      case "help":
        output = `Available commands:
  help     - Show this help message
  clear    - Clear the terminal
  whoami   - Display current user
  date     - Show current date and time
  echo     - Echo a message
  galaxy   - Show galaxy info
  neofetch - Display system info`;
        break;
      case "clear":
        setHistory([]);
        setCurrentInput("");
        return;
      case "whoami":
        output = "space_explorer";
        break;
      case "date":
        output = new Date().toString();
        break;
      case "galaxy":
        output = `
  ✨ Dark Galaxy OS ✨
  Version: 1.0.0
  Theme: Cosmic Night
  Stars: Infinite`;
        break;
      case "neofetch":
        output = `
       ⠀⠀⠀⠀⠀⢀⣀⣀⣀⡀⠀⠀⠀⠀⠀        space_explorer@darkgalaxy
    ⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀       -------------------------
   ⠀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀       OS: Dark Galaxy 1.0.0
   ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀       Kernel: Web 6.0
   ⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀       Shell: dg-terminal
    ⠀⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀⠀       Theme: Cosmic Night
     ⠀⠀⠈⠛⠿⣿⣿⠿⠛⠁⠀⠀⠀⠀⠀       Resolution: ${window.innerWidth}x${window.innerHeight}
                                    Terminal: Dark Galaxy Term`;
        break;
      default:
        if (command.startsWith("echo ")) {
          output = cmd.slice(5);
        } else if (command) {
          output = `Command not found: ${command}\nType 'help' for available commands.`;
        }
    }

    setHistory((prev) => [...prev, { input: cmd, output }]);
    setCurrentInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(currentInput);
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-full bg-void-black p-4 font-mono text-sm overflow-auto"
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((entry, i) => (
        <div key={i} className="mb-2">
          {entry.input && (
            <div className="flex items-center gap-2">
              <span className="text-primary">❯</span>
              <span className="text-nebula-blue">{entry.input}</span>
            </div>
          )}
          <pre className="text-muted-foreground whitespace-pre-wrap">{entry.output}</pre>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="text-primary">❯</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-nebula-blue caret-primary"
          autoFocus
        />
      </div>
    </div>
  );
};

export default TerminalApp;
