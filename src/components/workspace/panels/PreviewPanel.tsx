import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Laptop, Smartphone, RefreshCw, ExternalLink } from "lucide-react";

export default function PreviewPanel() {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      <div className="p-3 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium text-lg">Live Preview</h3>
          <p className="text-sm text-muted-foreground">
            See your app in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setViewMode("desktop")}
            >
              <Laptop className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setViewMode("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-muted/30 p-4 flex items-center justify-center overflow-auto">
        <div
          className={`bg-white border rounded-md shadow-sm overflow-hidden transition-all duration-300 ${viewMode === "mobile" ? "w-[375px] h-[667px]" : "w-full h-full"}`}
        >
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
              <div className="mb-4 text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 17h6" />
                  <path d="M12 11v6" />
                  <path d="M11 7h.01" />
                  <path d="M17 7h.01" />
                  <path d="M7 7h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-medium">No Preview Available</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Generate an app using the prompt panel to see a live preview
                here.
              </p>
              <Button className="mt-4">Generate Sample App</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
