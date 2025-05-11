import React, { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import PreviewPanel from "./panels/PreviewPanel";
import CodePanel from "./panels/CodePanel";
import FlowPanel from "./panels/FlowPanel";
import ChatPanel from "./panels/ChatPanel";
import TerminalPanel from "./panels/TerminalPanel";
import Sidebar from "./Sidebar";
import {
  ProjectGenerator,
  ProjectConfig,
  ProjectSession,
} from "@/lib/project-generator";
import { TerminalService } from "@/lib/terminal-service";

export default function WorkspaceLayout() {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "responsive",
  ]);
  const [currentSession, setCurrentSession] = useState<ProjectSession | null>(
    null,
  );

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  };

  // Listen for project creation events
  useEffect(() => {
    const handleProjectCreate = (event: CustomEvent) => {
      const { config } = event.detail;
      const session = ProjectGenerator.createSession(config as ProjectConfig);
      setCurrentSession(session);

      // Generate and execute initialization commands
      const commands = ProjectGenerator.generateInitCommands(session);
      TerminalService.executeCommands(commands, session);

      // Generate file structure
      const files = ProjectGenerator.generateFileStructure(session);
      TerminalService.createFiles(session, files);
    };

    document.addEventListener(
      "project-create",
      handleProjectCreate as EventListener,
    );
    return () => {
      document.removeEventListener(
        "project-create",
        handleProjectCreate as EventListener,
      );
    };
  }, []);

  return (
    <div className="h-screen w-full bg-muted/20 dark:bg-gray-950 overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Sidebar */}
        <ResizablePanel defaultSize={5} minSize={5} maxSize={5}>
          <Sidebar
            selectedFeatures={selectedFeatures}
            toggleFeature={toggleFeature}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Main Content */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <ChatPanel />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={40}>
              <PreviewPanel />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={60}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70}>
                  <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={50}>
                      <CodePanel />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50}>
                      <FlowPanel />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={30}>
                  <TerminalPanel />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
