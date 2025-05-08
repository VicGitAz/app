import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2 } from "lucide-react";

export default function PromptPanel() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4");

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      <div className="p-3 border-b">
        <h3 className="font-medium text-lg">App Generator</h3>
        <p className="text-sm text-muted-foreground">
          Describe the web app you want to build
        </p>
      </div>

      <Tabs defaultValue="prompt" className="flex-1 flex flex-col">
        <div className="px-3 pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="prompt"
          className="flex-1 flex flex-col p-3 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">OpenAI GPT-4</SelectItem>
                  <SelectItem value="claude-3">Anthropic Claude 3</SelectItem>
                  <SelectItem value="gemini-pro">Google Gemini Pro</SelectItem>
                  <SelectItem value="azure-gpt4">Azure OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the web app you want to build..."
            className="flex-1 min-h-[200px] text-base"
          />

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin mr-2">⚙️</span> Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" /> Generate App
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="p-3 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">App Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Framework</label>
                <Select defaultValue="react">
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="next">Next.js</SelectItem>
                    <SelectItem value="vue">Vue.js</SelectItem>
                    <SelectItem value="svelte">Svelte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Styling</label>
                <Select defaultValue="tailwind">
                  <SelectTrigger>
                    <SelectValue placeholder="Select styling" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                    <SelectItem value="css">Plain CSS</SelectItem>
                    <SelectItem value="scss">SCSS</SelectItem>
                    <SelectItem value="styled">Styled Components</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Features</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start"
                data-selected="true"
              >
                Authentication
              </Button>
              <Button variant="outline" className="justify-start">
                Database
              </Button>
              <Button variant="outline" className="justify-start">
                API Integration
              </Button>
              <Button variant="outline" className="justify-start">
                File Upload
              </Button>
              <Button variant="outline" className="justify-start">
                Dark Mode
              </Button>
              <Button variant="outline" className="justify-start">
                Responsive Design
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
