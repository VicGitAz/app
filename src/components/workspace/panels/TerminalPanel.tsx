import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { Button } from "@/components/ui/button";
import { Terminal as TerminalIcon, X, Minimize, Maximize } from "lucide-react";
import "xterm/css/xterm.css";

interface TerminalPanelProps {
  className?: string;
}

export default function TerminalPanel({ className }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [fitAddon, setFitAddon] = useState<FitAddon | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Initialize terminal on component mount
  useEffect(() => {
    // Create terminal instance
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: "#1a1a1a",
        foreground: "#ffffff",
      },
      fontSize: 14,
      fontFamily: "monospace",
      scrollback: 1000,
    });

    // Create fit addon to resize terminal
    const fit = new FitAddon();
    term.loadAddon(fit);

    // Mount terminal to DOM
    if (terminalRef.current) {
      term.open(terminalRef.current);
      fit.fit();

      // Store terminal and fit addon in state
      setTerminal(term);
      setFitAddon(fit);

      // Initial greeting
      term.writeln("\x1b[1;32mWeb Terminal\x1b[0m");
      term.writeln("Type \x1b[1;34mhelp\x1b[0m for available commands.");
      term.write("\r\n$ ");

      // Handle terminal input
      let currentCommand = "";
      term.onData((data) => {
        switch (data) {
          case "\r": // Enter
            term.writeln("");
            processCommand(currentCommand, term);
            currentCommand = "";
            term.write("$ ");
            break;
          case "\u007F": // Backspace
            if (currentCommand.length > 0) {
              currentCommand = currentCommand.slice(0, -1);
              term.write("\b \b");
            }
            break;
          case "\u0003": // Ctrl+C
            term.writeln("^C");
            currentCommand = "";
            term.write("$ ");
            break;
          default:
            // Print printable characters
            if (data >= " " || data === "\t") {
              currentCommand += data;
              term.write(data);
            }
        }
      });
    }

    // Clean up
    return () => {
      term.dispose();
    };
  }, []);

  // Handle terminal resize when window size changes
  useEffect(() => {
    const handleResize = () => {
      if (fitAddon) {
        setTimeout(() => {
          fitAddon.fit();
        }, 0);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [fitAddon]);

  // Process commands entered in the terminal
  const processCommand = (command: string, term: Terminal) => {
    const trimmedCommand = command.trim();

    if (!trimmedCommand) return;

    const [cmd, ...args] = trimmedCommand.split(" ");

    switch (cmd.toLowerCase()) {
      case "help":
        term.writeln("Available commands:");
        term.writeln("  help         - Show this help message");
        term.writeln("  clear        - Clear the terminal");
        term.writeln("  echo [text]  - Echo text back to the terminal");
        term.writeln(
          "  ls           - List files in current directory (simulation)"
        );
        term.writeln("  date         - Show current date and time");
        term.writeln("  whoami       - Show current user");
        term.writeln("  exit         - Minimize the terminal");
        break;

      case "clear":
        term.clear();
        break;

      case "echo":
        term.writeln(args.join(" "));
        break;

      case "ls":
        term.writeln("index.html");
        term.writeln("styles.css");
        term.writeln("script.js");
        term.writeln("package.json");
        break;

      case "date":
        term.writeln(new Date().toString());
        break;

      case "whoami":
        term.writeln("web-user");
        break;

      case "exit":
        setIsMinimized(true);
        break;

      default:
        term.writeln(`Command not found: ${cmd}`);
    }
  };

  // Handle terminal window state changes
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    setTimeout(() => {
      if (fitAddon) fitAddon.fit();
    }, 0);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    setTimeout(() => {
      if (fitAddon) fitAddon.fit();
    }, 0);
  };

  return (
    <div
      className={`flex flex-col ${className || ""} ${
        isMinimized ? "h-10" : "h-full"
      } bg-gray-900 rounded-lg border border-gray-700 shadow-lg transition-all duration-300 overflow-hidden ${
        isMaximized ? "fixed inset-4 z-50" : ""
      }`}
    >
      {/* Terminal header */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-gray-200">Terminal</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={toggleMinimize}
          >
            {isMinimized ? (
              <Maximize className="h-3 w-3 text-gray-400" />
            ) : (
              <Minimize className="h-3 w-3 text-gray-400" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={toggleMaximize}
            disabled={isMinimized}
          >
            <Maximize className="h-3 w-3 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsMinimized(true)}
          >
            <X className="h-3 w-3 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Terminal content */}
      {!isMinimized && <div ref={terminalRef} className="flex-1" />}

      {/* Minimized terminal button */}
      {isMinimized && (
        <Button
          variant="ghost"
          className="w-full h-6 text-xs text-gray-300"
          onClick={() => setIsMinimized(false)}
        >
          <TerminalIcon className="h-3 w-3 mr-1" /> Click to open terminal
        </Button>
      )}
    </div>
  );
}
