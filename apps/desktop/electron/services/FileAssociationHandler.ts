// ============================================================================
// File Associations - Handle file open events
// ============================================================================

import { app } from 'electron';
import path from 'path';
import { EventEmitter } from 'events';

export class FileAssociationHandler extends EventEmitter {
  private pendingFilePath: string | null = null;

  constructor() {
    super();
    this.setupFileHandlers();
  }

  private setupFileHandlers() {
    // macOS: Handle open-file event
    app.on('open-file', (event, filePath) => {
      event.preventDefault();
      
      if (app.isReady()) {
        this.handleFileOpen(filePath);
      } else {
        this.pendingFilePath = filePath;
      }
    });

    // Windows/Linux: Handle command line arguments
    app.on('ready', () => {
      if (this.pendingFilePath) {
        this.handleFileOpen(this.pendingFilePath);
        this.pendingFilePath = null;
      }

      // Check command line arguments
      const args = process.argv;
      if (args.length > 1) {
        const filePath = args[args.length - 1];
        if (this.isSupportedFile(filePath)) {
          this.handleFileOpen(filePath);
        }
      }
    });

    // Windows: Handle second-instance event
    app.on('second-instance', (event, commandLine) => {
      if (commandLine.length > 1) {
        const filePath = commandLine[commandLine.length - 1];
        if (this.isSupportedFile(filePath)) {
          this.handleFileOpen(filePath);
        }
      }
    });
  }

  private isSupportedFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const supportedExtensions = [
      '.deepseek',      // DeepSeek project file
      '.dsp',           // DeepSeek session
      '.dsc',           // DeepSeek configuration
      '.md',            // Markdown files
      '.txt',           // Text files
      '.json',          // JSON files
    ];
    
    return supportedExtensions.includes(ext);
  }

  private handleFileOpen(filePath: string) {
    console.log('Opening file:', filePath);
    
    const ext = path.extname(filePath).toLowerCase();
    
    // Emit event based on file type
    switch (ext) {
      case '.deepseek':
      case '.dsp':
        this.emit('open-project', filePath);
        break;
      case '.dsc':
        this.emit('open-config', filePath);
        break;
      case '.md':
      case '.txt':
        this.emit('open-document', filePath);
        break;
      case '.json':
        this.emit('open-json', filePath);
        break;
      default:
        this.emit('open-file', filePath);
    }
  }

  // Register file associations (must be called before app.ready)
  static registerFileAssociations() {
    // macOS
    if (process.platform === 'darwin') {
      app.setAsDefaultProtocolClient('deepseek');
    }

    // Windows/Linux
    if (process.platform === 'win32' || process.platform === 'linux') {
      app.setAsDefaultProtocolClient('deepseek');
    }
  }

  // Check if a file is a DeepSeek project file
  static isDeepSeekFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.deepseek' || ext === '.dsp';
  }
}
