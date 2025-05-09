// Gemini API integration
export interface GeminiResponse {
  text: string;
  code?: string;
  error?: string;
}

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export class GeminiProvider {
  private apiKey: string;
  private model: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || "gemini-2.5-flash-preview-04-17";
  }

  async generateContent(prompt: string): Promise<GeminiResponse> {
    try {
      const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          text: "",
          error: data.error?.message || "Failed to generate content",
        };
      }

      const text = data.candidates[0]?.content?.parts[0]?.text || "";

      // Extract code blocks if present
      const codeRegex = /```([\s\S]*?)```/g;
      const codeMatches = text.match(codeRegex);
      let code = "";

      if (codeMatches && codeMatches.length > 0) {
        code = codeMatches
          .map((match) =>
            match
              .replace(/```(?:html|jsx|javascript|js|tsx|ts)?\n?/g, "")
              .replace(/```/g, ""),
          )
          .join("\n\n");
      }

      return {
        text,
        code: code || undefined,
      };
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return {
        text: "",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async generateWebApp(prompt: string): Promise<GeminiResponse> {
    const enhancedPrompt = `Create a complete web application based on the following requirements. 
    Return the code in properly formatted code blocks with HTML, CSS, and JavaScript.
    Make sure the application is fully functional and responsive.
    
User requirements: ${prompt}

Provide the complete code for a single-page application with the following structure:
1. HTML structure
2. CSS styles (preferably using Tailwind classes)
3. JavaScript functionality

Make sure all components work together and the application is ready to use.

IMPORTANT: Return the complete code in a single HTML file with embedded CSS and JavaScript.`;

    return this.generateContent(enhancedPrompt);
  }
}
