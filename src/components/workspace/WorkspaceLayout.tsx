import React, { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Code,
  FileCode,
  Layout,
  MessageSquare,
  Play,
  Settings,
  Workflow,
} from "lucide-react";
import ChatPanel from "./panels/ChatPanel";
import PromptPanel from "./panels/PromptPanel";
import FlowPanel from "./panels/FlowPanel";
import PreviewPanel from "./panels/PreviewPanel";
import CodePanel from "./panels/CodePanel";

export default function WorkspaceLayout() {
  const [activeTab, setActiveTab] = useState("prompt");

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-16 h-full bg-muted/30 border-r flex flex-col items-center py-4 space-y-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Layout className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <FileCode className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === "prompt" ? "secondary" : "ghost"}
          size="icon"
          className="rounded-full"
          onClick={() => setActiveTab("prompt")}
        >
          <Code className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === "chat" ? "secondary" : "ghost"}
          size="icon"
          className="rounded-full"
          onClick={() => setActiveTab("chat")}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === "flow" ? "secondary" : "ghost"}
          size="icon"
          className="rounded-full"
          onClick={() => setActiveTab("flow")}
        >
          <Workflow className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === "preview" ? "secondary" : "ghost"}
          size="icon"
          className="rounded-full"
          onClick={() => setActiveTab("preview")}
        >
          <Play className="h-5 w-5" />
        </Button>

        <div className="mt-auto">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content Area with Resizable Panels */}
      <ResizablePanelGroup direction="horizontal" className="w-full">
        {/* Left Panel - Chat */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full p-4 bg-background">
            <ChatPanel />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Middle Panel - Prompt & Flow */}
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60}>
              <div className="h-full p-4 bg-background">
                <PromptPanel />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={40}>
              <div className="h-full p-4 bg-background">
                <FlowPanel />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Preview & Code */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <Tabs defaultValue="preview" className="h-full">
            <div className="flex justify-between items-center p-2 border-b">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="preview"
              className="h-[calc(100%-40px)] p-0 m-0"
            >
              <PreviewPanel />
            </TabsContent>
            <TabsContent value="code" className="h-[calc(100%-40px)] p-0 m-0">
              <CodePanel />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
