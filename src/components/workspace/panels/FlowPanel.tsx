import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RefreshCw } from "lucide-react";

export default function FlowPanel() {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real implementation, we would dynamically load mermaid.js
    // and render the diagram based on the app structure
    const renderMermaid = async () => {
      try {
        // This is a placeholder for actual mermaid.js integration
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full">
              <div class="text-center">
                <div class="text-sm text-muted-foreground mb-2">Flow Diagram Preview</div>
                <div class="border rounded-lg p-4 bg-muted/30">
                  <pre class="text-xs text-left">
                    graph TD
                      A[Landing Page] --> B{User Logged In?}
                      B -->|Yes| C[Dashboard]
                      B -->|No| D[Login Page]
                      D --> E[Sign Up]
                      D --> C
                      C --> F[Create Project]
                      C --> G[View Projects]
                      F --> H[App Builder]
                      G --> H
                  </pre>
                </div>
              </div>
            </div>
          `;
        }
      } catch (error) {
        console.error("Error rendering mermaid diagram:", error);
      }
    };

    renderMermaid();
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      <div className="p-3 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium text-lg">Flow Diagram</h3>
          <p className="text-sm text-muted-foreground">
            Visualize app structure
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="diagram" className="flex-1">
        <div className="px-3 pt-2">
          <TabsList>
            <TabsTrigger value="diagram">Diagram</TabsTrigger>
            <TabsTrigger value="code">Mermaid Code</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="diagram" className="flex-1 p-3">
          <div ref={mermaidRef} className="h-full overflow-auto" />
        </TabsContent>

        <TabsContent value="code" className="p-3">
          <div className="border rounded bg-muted p-3">
            <pre className="text-xs overflow-auto">
              {`graph TD
  A[Landing Page] --> B{User Logged In?}
  B -->|Yes| C[Dashboard]
  B -->|No| D[Login Page]
  D --> E[Sign Up]
  D --> C
  C --> F[Create Project]
  C --> G[View Projects]
  F --> H[App Builder]
  G --> H`}
            </pre>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Edit the Mermaid code above to customize your flow diagram.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
