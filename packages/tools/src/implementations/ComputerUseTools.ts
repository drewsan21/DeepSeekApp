// ============================================================================
// Computer Use Tools - Desktop automation
// ============================================================================

import { exec } from 'child_process';
import { promisify } from 'util';
import type { Tool, ToolHandler } from '../ToolRegistry';
import type { ComputerUseAction, ComputerUseResult, ScreenInfo } from '@deepseek/shared';

const execAsync = promisify(exec);

// ============================================================================
// Tool Implementations
// ============================================================================

async function clickHandler(args: unknown): Promise<ComputerUseResult> {
  const { x, y, button = 'left', doubleClick = false } = args as {
    x: number;
    y: number;
    button?: 'left' | 'right' | 'middle';
    doubleClick?: boolean;
  };

  try {
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
      // macOS - use cliclick or AppleScript
      const clickType = doubleClick ? 'dc' : 'c';
      command = `osascript -e 'tell application "System Events" to click at {${x}, ${y}}'`;
    } else if (platform === 'win32') {
      // Windows - use PowerShell
      command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y}); Start-Sleep -Milliseconds 100"`;
    } else {
      // Linux - use xdotool
      command = `xdotool mousemove ${x} ${y} click ${button === 'left' ? '1' : button === 'right' ? '3' : '2'}`;
    }

    await execAsync(command);
    return { success: true, coordinates: { x, y } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function typeHandler(args: unknown): Promise<ComputerUseResult> {
  const { text, delay = 50 } = args as { text: string; delay?: number };

  try {
    const platform = process.platform;
    let command: string;

    // Escape special characters for shell
    const escapedText = text.replace(/'/g, "'\\''");

    if (platform === 'darwin') {
      command = `osascript -e 'tell application "System Events" to keystroke "${escapedText}"'`;
    } else if (platform === 'win32') {
      command = `powershell -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('${escapedText}')"`;
    } else {
      command = `xdotool type --delay ${delay} "${escapedText}"`;
    }

    await execAsync(command);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function keyHandler(args: unknown): Promise<ComputerUseResult> {
  const { key, modifiers = [] } = args as {
    key: string;
    modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  };

  try {
    const platform = process.platform;
    let command: string;

    const modPrefix = modifiers
      .map((m) => {
        if (platform === 'linux') {
          return m === 'ctrl' ? 'ctrl' : m === 'alt' ? 'alt' : m === 'shift' ? 'shift' : 'super';
        }
        return m;
      })
      .join('+');

    const keyCombo = modPrefix ? `${modPrefix}+${key}` : key;

    if (platform === 'darwin') {
      command = `osascript -e 'tell application "System Events" to key code ${key}'`;
    } else if (platform === 'win32') {
      command = `powershell -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys('{${key}}')"`;
    } else {
      command = `xdotool key ${keyCombo}`;
    }

    await execAsync(command);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function screenshotHandler(args: unknown): Promise<ComputerUseResult> {
  const { region, fullScreen = true } = args as {
    region?: { x: number; y: number; width: number; height: number };
    fullScreen?: boolean;
  };

  try {
    const platform = process.platform;
    let command: string;
    const outputPath = `/tmp/screenshot-${Date.now()}.png`;

    if (platform === 'darwin') {
      if (region) {
        command = `screencapture -R${region.x},${region.y},${region.width},${region.height} ${outputPath}`;
      } else {
        command = `screencapture ${fullScreen ? '' : '-i'} ${outputPath}`;
      }
    } else if (platform === 'win32') {
      // Use PowerShell with .NET
      command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::PrimaryScreen | ForEach-Object { $bitmap = New-Object System.Drawing.Bitmap($_.Bounds.Width, $_.Bounds.Height); $graphics = [System.Drawing.Graphics]::FromImage($bitmap); $graphics.CopyFromScreen($_.Bounds.Location, [System.Drawing.Point]::Empty, $_.Bounds.Size); $bitmap.Save('${outputPath}') }"`;
    } else {
      // Linux - use scrot or gnome-screenshot
      if (region) {
        command = `import -window root -crop ${region.width}x${region.height}+${region.x}+${region.y} ${outputPath}`;
      } else {
        command = `scrot ${outputPath}`;
      }
    }

    await execAsync(command);

    // Read the file and convert to base64
    const fs = await import('fs/promises');
    const imageBuffer = await fs.readFile(outputPath);
    const base64 = imageBuffer.toString('base64');

    // Clean up
    await fs.unlink(outputPath).catch(() => {});

    return { success: true, screenshot: base64 };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function scrollHandler(args: unknown): Promise<ComputerUseResult> {
  const { x, y, deltaX = 0, deltaY = 0 } = args as {
    x: number;
    y: number;
    deltaX?: number;
    deltaY?: number;
  };

  try {
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
      command = `osascript -e 'tell application "System Events" to scroll area 1 of window 1 of process "SystemUIServer"'`;
    } else if (platform === 'win32') {
      command = `powershell -Command "[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})"`;
    } else {
      const direction = deltaY > 0 ? '4' : '5';
      const clicks = Math.abs(deltaY) || 3;
      command = `xdotool mousemove ${x} ${y} click ${direction} repeat ${clicks}`;
    }

    await execAsync(command);
    return { success: true, coordinates: { x, y } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function moveHandler(args: unknown): Promise<ComputerUseResult> {
  const { x, y } = args as { x: number; y: number };

  try {
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
      command = `osascript -e 'tell application "System Events" to set mouse user preferences to {${x}, ${y}}'`;
    } else if (platform === 'win32') {
      command = `powershell -Command "[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})"`;
    } else {
      command = `xdotool mousemove ${x} ${y}`;
    }

    await execAsync(command);
    return { success: true, coordinates: { x, y } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function getScreenInfoHandler(): Promise<ScreenInfo> {
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      const { stdout } = await execAsync(
        "system_profiler SPDisplaysDataType | grep Resolution | head -1"
      );
      const match = stdout.match(/(\d+)\s*x\s*(\d+)/);
      return {
        width: match ? parseInt(match[1]) : 1920,
        height: match ? parseInt(match[2]) : 1080,
        scale: 1,
        displays: [],
      };
    } else if (platform === 'win32') {
      const { stdout } = await execAsync(
        'powershell -Command "Get-CimInstance Win32_VideoController | Select-Object CurrentHorizontalResolution, CurrentVerticalResolution"'
      );
      return {
        width: 1920,
        height: 1080,
        scale: 1,
        displays: [],
      };
    } else {
      const { stdout } = await execAsync('xrandr | grep "*" | head -1');
      const match = stdout.match(/(\d+)x(\d+)/);
      return {
        width: match ? parseInt(match[1]) : 1920,
        height: match ? parseInt(match[2]) : 1080,
        scale: 1,
        displays: [],
      };
    }
  } catch {
    return {
      width: 1920,
      height: 1080,
      scale: 1,
      displays: [],
    };
  }
}

// ============================================================================
// Tool Definitions
// ============================================================================

export const computerUseTools: Tool[] = [
  {
    id: 'computer-use.click',
    name: 'click',
    description: 'Click at specified coordinates',
    category: 'computer-use',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'number', description: 'X coordinate' },
        y: { type: 'number', description: 'Y coordinate' },
        button: {
          type: 'string',
          enum: ['left', 'right', 'middle'],
          description: 'Mouse button',
        },
        doubleClick: { type: 'boolean', description: 'Double click' },
      },
      required: ['x', 'y'],
    },
    handler: clickHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'computer-use.type',
    name: 'type',
    description: 'Type text at current cursor position',
    category: 'computer-use',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to type' },
        delay: { type: 'number', description: 'Delay between keystrokes (ms)' },
      },
      required: ['text'],
    },
    handler: typeHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'computer-use.key',
    name: 'key_press',
    description: 'Press a keyboard key',
    category: 'computer-use',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Key to press' },
        modifiers: {
          type: 'array',
          items: { type: 'string', enum: ['ctrl', 'alt', 'shift', 'meta'] },
          description: 'Modifier keys',
        },
      },
      required: ['key'],
    },
    handler: keyHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'computer-use.screenshot',
    name: 'screenshot',
    description: 'Take a screenshot of the screen or region',
    category: 'computer-use',
    inputSchema: {
      type: 'object',
      properties: {
        region: {
          type: 'object',
          properties: {
            x: { type: 'number' },
            y: { type: 'number' },
            width: { type: 'number' },
            height: { type: 'number' },
          },
        },
        fullScreen: { type: 'boolean', description: 'Capture full screen' },
      },
    },
    handler: screenshotHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'computer-use.scroll',
    name: 'scroll',
    description: 'Scroll at specified coordinates',
    category: 'computer-use',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        deltaX: { type: 'number', description: 'Horizontal scroll' },
        deltaY: { type: 'number', description: 'Vertical scroll' },
      },
      required: ['x', 'y'],
    },
    handler: scrollHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'computer-use.move',
    name: 'move_mouse',
    description: 'Move mouse to coordinates',
    category: 'computer-use',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
      },
      required: ['x', 'y'],
    },
    handler: moveHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'computer-use.screen_info',
    name: 'get_screen_info',
    description: 'Get screen dimensions and display info',
    category: 'computer-use',
    inputSchema: { type: 'object' },
    handler: getScreenInfoHandler,
    requiresApproval: false,
    isEnabled: true,
  },
];
