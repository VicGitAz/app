import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Download,
  FileCode,
  Terminal as TerminalIcon,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TerminalPanel from "./TerminalPanel";
import dynamic from "next/dynamic";

// Dynamically import Monaco Editor to prevent SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      Loading editor...
    </div>
  ),
});

// File type icons mapping
const fileIcons = {
  html: "html",
  css: "css",
  js: "javascript",
  jsx: "react",
  ts: "typescript",
  tsx: "typescript-react",
  json: "json",
  md: "markdown",
};

export default function CodePanel() {
  const [selectedFile, setSelectedFile] = useState("index.html");
  const [openFiles, setOpenFiles] = useState(["index.html"]);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [parsedFiles, setParsedFiles] = useState({
    "index.html": "<!-- No code generated yet -->",
  });
  const [activeTab, setActiveTab] = useState("code");
  const [editorTheme, setEditorTheme] = useState("vs-light");
  const { toast } = useToast();
  const editorRef = useRef(null);

  // Get language based on file extension
  const getLanguage = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    if (ext === "html") return "html";
    if (ext === "css") return "css";
    if (ext === "js") return "javascript";
    if (ext === "jsx") return "javascript";
    if (ext === "ts") return "typescript";
    if (ext === "tsx") return "typescript";
    if (ext === "json") return "json";
    if (ext === "md") return "markdown";
    return "plaintext";
  };

  // Get file icon class based on file extension
  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    return fileIcons[ext] || "document";
  };

  useEffect(() => {
    // Listen for code updates from the prompt panel
    const handleAppPreviewUpdate = (event) => {
      setGeneratedCode(event.detail.code);
      parseCodeIntoFiles(event.detail.code);
    };

    document.addEventListener("app-preview-update", handleAppPreviewUpdate);
    return () => {
      document.removeEventListener(
        "app-preview-update",
        handleAppPreviewUpdate
      );
    };
  }, []);

  const parseCodeIntoFiles = (code) => {
    // Default to a single HTML file if no clear separation
    const files = {
      "index.html": code,
    };

    // Try to extract CSS and JavaScript if they're in separate blocks
    const cssMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const jsMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);

    if (cssMatch && cssMatch[1]) {
      files["styles.css"] = cssMatch[1].trim();
    }

    if (jsMatch && jsMatch[1]) {
      files["script.js"] = jsMatch[1].trim();
    }

    setParsedFiles(files);
    setSelectedFile("index.html");
    setOpenFiles(["index.html"]);
  };

  const handleCopyCode = () => {
    if (!parsedFiles[selectedFile]) return;

    navigator.clipboard.writeText(parsedFiles[selectedFile]);
    toast({
      title: "Code copied",
      description: `${selectedFile} copied to clipboard`,
    });
  };

  const handleDownloadCode = () => {
    if (!parsedFiles[selectedFile]) return;

    const blob = new Blob([parsedFiles[selectedFile]], {
      type: selectedFile.endsWith(".html")
        ? "text/html"
        : selectedFile.endsWith(".css")
        ? "text/css"
        : "application/javascript",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    if (!generatedCode) return;

    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-app.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // Handle code changes in the editor
  const handleEditorChange = (value) => {
    setParsedFiles((prev) => ({
      ...prev,
      [selectedFile]: value,
    }));
  };

  // Toggle editor theme
  const toggleTheme = () => {
    setEditorTheme((prev) => (prev === "vs-light" ? "vs-dark" : "vs-light"));
  };

  // Get file extension abbreviation
  const getFileExtAbbr = (filename) => {
    return filename.split(".").pop().toUpperCase();
  };

  // Open a file in editor
  const openFile = (filename) => {
    setSelectedFile(filename);
    if (!openFiles.includes(filename)) {
      setOpenFiles((prev) => [...prev, filename]);
    }
  };

  // Close a file tab but keep the file in the files list
  const closeFileTab = (filename, e) => {
    e.stopPropagation();

    // Remove the file from open files
    const newOpenFiles = openFiles.filter((file) => file !== filename);
    setOpenFiles(newOpenFiles);

    // If we're closing the currently selected file, select another one
    if (selectedFile === filename && newOpenFiles.length > 0) {
      setSelectedFile(newOpenFiles[0]);
    } else if (
      newOpenFiles.length === 0 &&
      Object.keys(parsedFiles).length > 0
    ) {
      // If no tabs are open but files exist, open the first file
      const firstFile = Object.keys(parsedFiles)[0];
      setOpenFiles([firstFile]);
      setSelectedFile(firstFile);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      <div className="p-3 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium text-lg">Code Editor</h3>
          <p className="text-sm text-muted-foreground">
            View generated code and terminal
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "code" && (
            <>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {editorTheme === "vs-light" ? "Dark Mode" : "Light Mode"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                disabled={!generatedCode}
              >
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCode}
                disabled={!generatedCode}
              >
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mx-3 mt-2">
          <TabsTrigger value="code" className="flex items-center">
            <FileCode className="h-4 w-4 mr-2" />
            Code
          </TabsTrigger>
          <TabsTrigger value="terminal" className="flex items-center">
            <TerminalIcon className="h-4 w-4 mr-2" />
            Terminal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="flex-1 flex p-0 m-0 border-none">
          <div className="w-48 border-r p-2 overflow-auto">
            <h4 className="text-sm font-medium mb-2 px-2">Files</h4>
            <div className="space-y-1">
              {Object.keys(parsedFiles).map((file) => (
                <Button
                  key={file}
                  variant={selectedFile === file ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm h-8"
                  onClick={() => openFile(file)}
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  {file}
                </Button>
              ))}
            </div>

            {generatedCode && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  onClick={handleDownloadAll}
                >
                  <Download className="h-4 w-4 mr-1" /> Download All
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {/* File tabs */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 overflow-x-auto">
              {openFiles.map((file) => (
                <div
                  key={file}
                  className={`flex items-center h-8 px-3 text-xs ${
                    selectedFile === file
                      ? "bg-white dark:bg-gray-900 border-t border-r border-l border-gray-200 dark:border-gray-700 border-b-0 rounded-t"
                      : "text-gray-600 dark:text-gray-400"
                  } cursor-pointer`}
                  onClick={() => setSelectedFile(file)}
                >
                  <span
                    className={`flex items-center ${
                      selectedFile === file
                        ? "text-blue-600 dark:text-blue-400"
                        : ""
                    }`}
                  >
                    <span className="mr-1 text-[0.7rem] uppercase">
                      {getFileExtAbbr(file)}
                    </span>
                    {file}
                  </span>
                  <button
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={(e) => closeFileTab(file, e)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Monaco editor */}
            <div className="flex-1">
              {openFiles.length > 0 && parsedFiles[selectedFile] && (
                <MonacoEditor
                  height="100%"
                  language={getLanguage(selectedFile)}
                  value={parsedFiles[selectedFile]}
                  theme={editorTheme}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                    readOnly: false,
                    lineNumbers: "on",
                    folding: true,
                    renderLineHighlight: "all",
                    scrollbar: {
                      useShadows: false,
                      verticalHasArrows: false,
                      horizontalHasArrows: false,
                      vertical: "visible",
                      horizontal: "visible",
                    },
                    lineNumbersMinChars: 3,
                    padding: {
                      top: 12,
                      bottom: 12,
                    },
                  }}
                />
              )}
              {openFiles.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>
                    No files open. Select a file from the sidebar to begin
                    editing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="terminal" className="flex-1 p-0 m-0 border-none">
          <TerminalPanel className="h-full" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
