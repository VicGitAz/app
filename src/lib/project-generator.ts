import { v4 as uuidv4 } from 'uuid';

export interface ProjectConfig {
  type: 'frontend' | 'backend' | 'fullstack';
  language: 'javascript' | 'typescript';
  frontend?: {
    framework: 'react' | 'nextjs' | 'vue' | 'angular' | 'svelte' | 'vanilla';
    styling: 'css' | 'scss' | 'tailwind' | 'bootstrap';
    features?: string[];
  };
  backend?: {
    framework: 'express' | 'nest' | 'fastify' | 'koa' | 'hapi';
    database?: 'mongodb' | 'postgres' | 'mysql' | 'sqlite' | 'supabase' | 'none';
  };
  name: string;
  description?: string;
}

export interface ProjectSession {
  id: string;
  config: ProjectConfig;
  terminalPath: string;
  createdAt: Date;
}

export class ProjectGenerator {
  private static sessions: Map<string, ProjectSession> = new Map();

  static createSession(config: ProjectConfig): ProjectSession {
    const sessionId = uuidv4();
    const terminalPath = `/private/tmp/term-users/${sessionId}/`;
    
    const session: ProjectSession = {
      id: sessionId,
      config,
      terminalPath,
      createdAt: new Date()
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  static getSession(sessionId: string): ProjectSession | undefined {
    return this.sessions.get(sessionId);
  }

  static getAllSessions(): ProjectSession[] {
    return Array.from(this.sessions.values());
  }

  static generateInitCommands(session: ProjectSession): string[] {
    const commands: string[] = [
      `mkdir -p ${session.terminalPath}`,
      `cd ${session.terminalPath}`
    ];

    const { config } = session;
    const { type, language, name } = config;

    if (type === 'frontend' || type === 'fullstack') {
      const { framework, styling } = config.frontend!;
      
      if (framework === 'react') {
        if (language === 'typescript') {
          commands.push(`npx create-react-app ${name} --template typescript`);
        } else {
          commands.push(`npx create-react-app ${name}`);
        }
        
        if (styling === 'tailwind') {
          commands.push(
            `cd ${name}`,
            'npm install -D tailwindcss postcss autoprefixer',
            'npx tailwindcss init -p',
            'echo "/** @type {import(\'tailwindcss\').Config} */\nmodule.exports = {\n  content: [\"./src/**/*.{js,jsx,ts,tsx}\"],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}" > tailwind.config.js',
            'echo "@tailwind base;\n@tailwind components;\n@tailwind utilities;" > ./src/index.css'
          );
        }
      } else if (framework === 'nextjs') {
        const createNextAppCmd = language === 'typescript' 
          ? `npx create-next-app@latest ${name} --typescript --tailwind --eslint --app --src-dir` 
          : `npx create-next-app@latest ${name} --tailwind --eslint --app --src-dir`;
        
        commands.push(createNextAppCmd);
        
        // Add additional setup for Next.js if needed
        if (config.frontend?.features?.includes('auth')) {
          commands.push(
            `cd ${name}`,
            'npm install next-auth'
          );
        }
        
        if (config.frontend?.features?.includes('api')) {
          commands.push(
            `cd ${name}`,
            'mkdir -p src/app/api'
          );
        }
      } else if (framework === 'vue') {
        commands.push(
          'npm install -g @vue/cli',
          `vue create ${name} -d ${language === 'typescript' ? '-p typescript' : ''}`
        );
      } else if (framework === 'svelte') {
        commands.push(
          `npx degit sveltejs/template ${name}`,
          `cd ${name}`,
          'npm install'
        );
        if (language === 'typescript') {
          commands.push('node scripts/setupTypeScript.js');
        }
      }
    }

    if (type === 'backend' || type === 'fullstack') {
      const backendDir = type === 'fullstack' ? `${name}-backend` : name;
      const { framework, database } = config.backend!;
      
      commands.push(`mkdir -p ${backendDir}`);
      commands.push(`cd ${backendDir}`);
      commands.push('npm init -y');
      
      if (framework === 'express') {
        commands.push(
          'npm install express cors dotenv',
          language === 'typescript' ? 'npm install -D typescript @types/express @types/node @types/cors ts-node-dev' : 'npm install -D nodemon'
        );
        
        if (language === 'typescript') {
          commands.push(
            'npx tsc --init --target es6 --module commonjs --outDir ./dist --strict true --esModuleInterop true --skipLibCheck true --forceConsistentCasingInFileNames true',
            'mkdir -p src',
            'mkdir -p src/routes',
            'mkdir -p src/controllers',
            'mkdir -p src/models'
          );
        } else {
          commands.push(
            'mkdir -p src',
            'mkdir -p src/routes',
            'mkdir -p src/controllers',
            'mkdir -p src/models'
          );
        }
      } else if (framework === 'nest' && language === 'typescript') {
        commands.push(
          'npm i -g @nestjs/cli',
          `nest new ${backendDir} --package-manager npm`
        );
      }
      
      if (database && database !== 'none') {
        if (database === 'mongodb') {
          commands.push('npm install mongoose');
          if (language === 'typescript') {
            commands.push('npm install -D @types/mongoose');
          }
        } else if (database === 'postgres') {
          commands.push('npm install pg');
          if (language === 'typescript') {
            commands.push('npm install -D @types/pg');
          }
        } else if (database === 'supabase') {
          commands.push('npm install @supabase/supabase-js');
        }
      }
    }

    return commands.filter(cmd => cmd !== '');
  }

  static generateFileStructure(session: ProjectSession): Record<string, string> {
    const files: Record<string, string> = {};
    const { config } = session;
    const { type, language, name } = config;
    
    // Generate frontend files if needed
    if ((type === 'frontend' || type === 'fullstack') && config.frontend) {
      const { framework } = config.frontend;
      
      if (framework === 'react') {
        // For React, create some basic components
        const ext = language === 'typescript' ? 'tsx' : 'jsx';
        
        // App component with routing
        files[`${name}/src/App.${ext}`] = this.generateReactAppCode(language);
        
        // Home component
        files[`${name}/src/components/Home.${ext}`] = this.generateReactHomeComponent(language);
        
        // About component
        files[`${name}/src/components/About.${ext}`] = this.generateReactAboutComponent(language);
        
        // Navbar component
        files[`${name}/src/components/Navbar.${ext}`] = this.generateReactNavbarComponent(language);
        
        if (config.frontend.styling === 'tailwind') {
          // Add tailwind config
          files[`${name}/tailwind.config.js`] = this.generateTailwindConfig();
          files[`${name}/src/index.css`] = this.generateTailwindCSS();
        }
      } else if (framework === 'nextjs') {
        // For Next.js, create app directory structure
        const ext = language === 'typescript' ? 'tsx' : 'jsx';
        
        // Layout
        files[`${name}/src/app/layout.${ext}`] = this.generateNextjsLayoutCode(language);
        
        // Page
        files[`${name}/src/app/page.${ext}`] = this.generateNextjsPageCode(language);
        
        // About page
        files[`${name}/src/app/about/page.${ext}`] = this.generateNextjsAboutPageCode(language);
        
        // Components
        files[`${name}/src/components/Navbar.${ext}`] = this.generateNextjsNavbarComponent(language);
        
        // Add API route if needed
        if (config.frontend.features?.includes('api')) {
          files[`${name}/src/app/api/hello/route.${ext}`] = this.generateNextjsApiRouteCode(language);
        }
      }
    }
    
    // Generate backend files
    if (type === 'backend' || type === 'fullstack') {
      const backendDir = type === 'fullstack' ? `${name}-backend` : name;
      const { framework } = config.backend!;
      const ext = language === 'typescript' ? 'ts' : 'js';
      
      if (framework === 'express') {
        // Main server file
        files[`${backendDir}/src/index.${ext}`] = this.generateExpressServerCode(language);
        
        // Routes directory
        files[`${backendDir}/src/routes/index.${ext}`] = this.generateExpressRoutesCode(language);
        
        // Controllers directory
        files[`${backendDir}/src/controllers/index.${ext}`] = this.generateExpressControllersCode(language);
        
        // Add .env file
        files[`${backendDir}/.env`] = "PORT=3000\nNODE_ENV=development\n";
        
        // Add .gitignore
        files[`${backendDir}/.gitignore`] = "node_modules\ndist\n.env\n";
        
        if (language === 'typescript') {
          files[`${backendDir}/tsconfig.json`] = JSON.stringify({
            "compilerOptions": {
              "target": "es6",
              "module": "commonjs",
              "outDir": "./dist",
              "strict": true,
              "esModuleInterop": true,
              "skipLibCheck": true,
              "forceConsistentCasingInFileNames": true
            },
            "include": ["src/**/*"],
            "exclude": ["node_modules"]
          }, null, 2);
        }
        
        // Package.json scripts
        files[`${backendDir}/package.json`] = JSON.stringify({
          "name": backendDir,
          "version": "1.0.0",
          "description": config.description || "Generated Express server",
          "main": language === 'typescript' ? "dist/index.js" : "src/index.js",
          "scripts": {
            "start": language === 'typescript' ? "node dist/index.js" : "node src/index.js",
            "dev": language === 'typescript' ? "ts-node-dev --respawn src/index.ts" : "nodemon src/index.js",
            "build": language === 'typescript' ? "tsc" : "echo 'No build step required'"
          },
          "keywords": [],
          "author": "",
          "license": "ISC"
        }, null, 2);
      }
    }
    
    return files;
  }
  
  private static generateExpressServerCode(language: 'javascript' | 'typescript'): string {
    if (language === 'typescript') {
      return `import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
`;
    } else {
      return `const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Express Server is running');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
`;
    }
  }
  
  private static generateExpressRoutesCode(language: 'javascript' | 'typescript'): string {
    if (language === 'typescript') {
      return `import { Router } from 'express';
import { getItems, getItemById, createItem, updateItem, deleteItem } from '../controllers';

const router = Router();

router.get('/items', getItems);
router.get('/items/:id', getItemById);
router.post('/items', createItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

export default router;
`;
    } else {
      return `const { Router } = require('express');
const { getItems, getItemById, createItem, updateItem, deleteItem } = require('../controllers');

const router = Router();

router.get('/items', getItems);
router.get('/items/:id', getItemById);
router.post('/items', createItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

module.exports = router;
`;
    }
  }
  
  private static generateExpressControllersCode(language: 'javascript' | 'typescript'): string {
    if (language === 'typescript') {
      return `import { Request, Response } from 'express';

// Mock data
let items: any[] = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
];

export const getItems = (req: Request, res: Response) => {
  res.json(items);
};

export const getItemById = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const item = items.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  res.json(item);
};

export const createItem = (req: Request, res: Response) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
  const newItem = { id: newId, name };
  
  items.push(newItem);
  res.status(201).json(newItem);
};

export const updateItem = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  items[itemIndex] = { ...items[itemIndex], name };
  res.json(items[itemIndex]);
};

export const deleteItem = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  const deletedItem = items[itemIndex];
  items = items.filter(item => item.id !== id);
  
  res.json(deletedItem);
};
`;
    } else {
      return `// Mock data
let items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
];

const getItems = (req, res) => {
  res.json(items);
};

const getItemById = (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  res.json(item);
};

const createItem = (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  
  const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
  const newItem = { id: newId, name };
  
  items.push(newItem);
  res.status(201).json(newItem);
};

const updateItem = (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  items[itemIndex] = { ...items[itemIndex], name };
  res.json(items[itemIndex]);
};

const deleteItem = (req, res) => {
  const id = parseInt(req.params.id);
  
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  const deletedItem = items[itemIndex];
  items = items.filter(item => item.id !== id);
  
  res.json(deletedItem);
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
`;
    }
  }
}
