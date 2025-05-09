import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, FileCode } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function CodePanel() {
  const [selectedFile, setSelectedFile] = useState("index.html");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [parsedFiles, setParsedFiles] = useState<Record<string, string>>({
    "index.html": "<!-- No code generated yet -->",
  });
  const { toast } = useToast();

  useEffect(() => {
    // Listen for code updates from the prompt panel
    const handleAppPreviewUpdate = (event: CustomEvent) => {
      setGeneratedCode(event.detail.code);
      parseCodeIntoFiles(event.detail.code);
    };

    window.addEventListener(
      "app-preview-update",
      handleAppPreviewUpdate as EventListener,
    );
    return () => {
      window.removeEventListener(
        "app-preview-update",
        handleAppPreviewUpdate as EventListener,
      );
    };
  }, []);

  const parseCodeIntoFiles = (code: string) => {
    // Default to a single HTML file if no clear separation
    const files: Record<string, string> = {
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
    setSelectedFile("index.html"); // Reset to index.html when new code is generated
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

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      <div className="p-3 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium text-lg">Code Editor</h3>
          <p className="text-sm text-muted-foreground">View generated code</p>
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-48 border-r p-2 overflow-auto">
          <h4 className="text-sm font-medium mb-2 px-2">Files</h4>
          <div className="space-y-1">
            {Object.keys(parsedFiles).map((file) => (
              <Button
                key={file}
                variant={selectedFile === file ? "secondary" : "ghost"}
                className="w-full justify-start text-sm h-8"
                onClick={() => setSelectedFile(file)}
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

        <div className="flex-1 overflow-auto bg-muted/10">
          <pre className="p-4 text-sm font-mono overflow-auto h-full">
            <code>{parsedFiles[selectedFile]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
