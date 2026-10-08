// ============================================================================
// Utility Tools - Screenshot, clipboard, notifications
// ============================================================================

import { exec } from 'child_process';
import { promisify } from 'util';
import type { Tool } from '../ToolRegistry';

const execAsync = promisify(exec);

async function screenshotToolHandler(args: unknown): Promise<unknown> {
  const { region, format = 'png' } = args as {
    region?: { x: number; y: number; width: number; height: number };
    format?: 'png' | 'jpg' | 'jpeg';
  };

  try {
    const platform = process.platform;
    const outputPath = `/tmp/screenshot-${Date.now()}.${format}`;
    let command: string;

    if (platform === 'darwin') {
      if (region) {
        command = `screencapture -R${region.x},${region.y},${region.width},${region.height} ${outputPath}`;
      } else {
        command = `screencapture ${outputPath}`;
      }
    } else if (platform === 'win32') {
      command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::PrimaryScreen | ForEach-Object { $bitmap = New-Object System.Drawing.Bitmap($_.Bounds.Width, $_.Bounds.Height); $graphics = [System.Drawing.Graphics]::FromImage($bitmap); $graphics.CopyFromScreen($_.Bounds.Location, [System.Drawing.Point]::Empty, $_.Bounds.Size); $bitmap.Save('${outputPath}') }"`;
    } else {
      if (region) {
        command = `import -window root -crop ${region.width}x${region.height}+${region.x}+${region.y} ${outputPath}`;
      } else {
        command = `scrot ${outputPath}`;
      }
    }

    await execAsync(command);

    const fs = await import('fs/promises');
    const imageBuffer = await fs.readFile(outputPath);
    const base64 = imageBuffer.toString('base64');
    await fs.unlink(outputPath).catch(() => {});

    return { success: true, image: base64, format };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function clipboardReadHandler(): Promise<unknown> {
  try {
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
      command = 'pbpaste';
    } else if (platform === 'win32') {
      command = 'powershell -Command "Get-Clipboard"';
    } else {
      command = 'xclip -selection clipboard -o';
    }

    const { stdout } = await execAsync(command);
    return { success: true, content: stdout };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function clipboardWriteHandler(args: unknown): Promise<unknown> {
  const { content } = args as { content: string };

  try {
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
      command = `echo "${content.replace(/"/g, '\\"')}" | pbcopy`;
    } else if (platform === 'win32') {
      command = `powershell -Command "Set-Clipboard -Value '${content.replace(/'/g, "''")}'"`;
    } else {
      command = `echo "${content.replace(/"/g, '\\"')}" | xclip -selection clipboard`;
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

async function sendNotificationHandler(args: unknown): Promise<unknown> {
  const { title, message, urgency = 'normal' } = args as {
    title: string;
    message: string;
    urgency?: 'low' | 'normal' | 'critical';
  };

  try {
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
      command = `osascript -e 'display notification "${message}" with title "${title}"'`;
    } else if (platform === 'win32') {
      command = `powershell -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); $n = New-Object System.Windows.Forms.NotifyIcon; $n.Icon = [System.Drawing.SystemIcons]::Information; $n.Visible = $true; $n.ShowBalloonTip(5000, '${title}', '${message}', [System.Windows.Forms.ToolTipIcon]::Info)"`;
    } else {
      command = `notify-send -u ${urgency} "${title}" "${message}"`;
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

async function showAlertHandler(args: unknown): Promise<unknown> {
  const { title, message } = args as { title: string; message: string };

  try {
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
      command = `osascript -e 'display alert "${title}" message "${message}"'`;
    } else if (platform === 'win32') {
      command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('${message}', '${title}', 'OK', 'Information')"`;
    } else {
      command = `zenity --info --title="${title}" --text="${message}"`;
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

async function openUrlHandler(args: unknown): Promise<unknown> {
  const { url } = args as { url: string };

  try {
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
      command = `open "${url}"`;
    } else if (platform === 'win32') {
      command = `start "${url}"`;
    } else {
      command = `xdg-open "${url}"`;
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

async function getSystemInfoHandler(): Promise<unknown> {
  try {
    const platform = process.platform;
    const arch = process.arch;
    const nodeVersion = process.version;
    
    let osInfo = '';
    if (platform === 'darwin') {
      const { stdout } = await execAsync('sw_vers -productVersion');
      osInfo = `macOS ${stdout.trim()}`;
    } else if (platform === 'win32') {
      const { stdout } = await execAsync('ver');
      osInfo = stdout.trim();
    } else {
      const { stdout } = await execAsync('lsb_release -d | cut -f2');
      osInfo = stdout.trim();
    }

    return {
      success: true,
      info: {
        platform,
        arch,
        os: osInfo,
        nodeVersion,
        hostname: require('os').hostname(),
        username: require('os').userInfo().username,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// Tool Definitions
// ============================================================================

export const utilityTools: Tool[] = [
  {
    id: 'utility.screenshot',
    name: 'screenshot_tool',
    description: 'Take a screenshot',
    category: 'utility',
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
        format: {
          type: 'string',
          enum: ['png', 'jpg', 'jpeg'],
          description: 'Image format',
        },
      },
    },
    handler: screenshotToolHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'utility.clipboard_read',
    name: 'clipboard_read',
    description: 'Read from clipboard',
    category: 'utility',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: clipboardReadHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'utility.clipboard_write',
    name: 'clipboard_write',
    description: 'Write to clipboard',
    category: 'utility',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Content to write' },
      },
      required: ['content'],
    },
    handler: clipboardWriteHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'utility.notification',
    name: 'send_notification',
    description: 'Send a system notification',
    category: 'utility',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Notification title' },
        message: { type: 'string', description: 'Notification message' },
        urgency: {
          type: 'string',
          enum: ['low', 'normal', 'critical'],
          description: 'Notification urgency',
        },
      },
      required: ['title', 'message'],
    },
    handler: sendNotificationHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'utility.alert',
    name: 'show_alert',
    description: 'Show an alert dialog',
    category: 'utility',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Alert title' },
        message: { type: 'string', description: 'Alert message' },
      },
      required: ['title', 'message'],
    },
    handler: showAlertHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'utility.open_url',
    name: 'open_url',
    description: 'Open a URL in the default browser',
    category: 'utility',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to open' },
      },
      required: ['url'],
    },
    handler: openUrlHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'utility.system_info',
    name: 'get_system_info',
    description: 'Get system information',
    category: 'utility',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: getSystemInfoHandler,
    requiresApproval: false,
    isEnabled: true,
  },
];
