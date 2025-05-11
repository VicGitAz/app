import { ProjectSession } from "./project-generator";

export interface TerminalCommand {
  command: string;
  session: ProjectSession;
}

export interface TerminalResponse {
  output: string;
  success: boolean;
  error?: string;
}

export class TerminalService {
  static async executeCommand(
    command: TerminalCommand,
  ): Promise<TerminalResponse> {
    try {
      // In a real implementation, this would execute the command in the user's terminal session
      // For now, we'll simulate the response
      console.log(
        `Executing in session ${command.session.id}: ${command.command}`,
      );

      // Simulate command execution
      const output = await this.simulateCommandExecution(command);

      return {
        output,
        success: true,
      };
    } catch (error) {
      return {
        output: "",
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  static async executeCommands(
    commands: string[],
    session: ProjectSession,
  ): Promise<TerminalResponse[]> {
    const responses: TerminalResponse[] = [];

    for (const cmd of commands) {
      const response = await this.executeCommand({ command: cmd, session });
      responses.push(response);

      // Stop execution if a command fails
      if (!response.success) {
        break;
      }
    }

    return responses;
  }

  private static async simulateCommandExecution(
    command: TerminalCommand,
  ): Promise<string> {
    // This is a placeholder for actual command execution
    // In a real implementation, this would connect to a backend service
    // that executes commands in the user's terminal session

    const { command: cmd } = command;

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (cmd.startsWith("mkdir")) {
      return `Created directory ${cmd.split(" ")[1]}`;
    }

    if (cmd.startsWith("cd")) {
      return `Changed directory to ${cmd.split(" ")[1]}`;
    }

    if (cmd.includes("npm init")) {
      return "Initialized package.json";
    }

    if (cmd.includes("npm install")) {
      const packages = cmd.replace("npm install", "").trim();
      return `Installed packages: ${packages || "none"}`;
    }

    if (cmd.includes("create-react-app")) {
      return "Created React application with create-react-app";
    }

    if (cmd.includes("create-next-app")) {
      return "Created Next.js application with create-next-app";
    }

    if (cmd.includes("vue create")) {
      return "Created Vue application";
    }

    if (cmd.includes("tailwindcss init")) {
      return "Initialized Tailwind CSS configuration";
    }

    if (cmd.includes("tsc --init")) {
      return "Initialized TypeScript configuration";
    }

    return `Executed: ${cmd}`;
  }

  static async createFile(
    session: ProjectSession,
    filePath: string,
    content: string,
  ): Promise<TerminalResponse> {
    try {
      // In a real implementation, this would create a file in the user's session directory
      console.log(`Creating file in session ${session.id}: ${filePath}`);

      // Simulate file creation
      await new Promise((resolve) => setTimeout(resolve, 200));

      return {
        output: `Created file: ${filePath}`,
        success: true,
      };
    } catch (error) {
      return {
        output: "",
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  static async createFiles(
    session: ProjectSession,
    files: Record<string, string>,
  ): Promise<TerminalResponse[]> {
    const responses: TerminalResponse[] = [];

    for (const [filePath, content] of Object.entries(files)) {
      const response = await this.createFile(session, filePath, content);
      responses.push(response);

      // Stop execution if a file creation fails
      if (!response.success) {
        break;
      }
    }

    return responses;
  }
}
