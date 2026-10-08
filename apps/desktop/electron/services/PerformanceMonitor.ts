// ============================================================================
// Performance Monitor - Track and optimize application performance
// ============================================================================

export interface PerformanceMetrics {
  timestamp: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  render: {
    frameTime: number;
    fps: number;
  };
  ipc: {
    messagesPerSecond: number;
    averageLatency: number;
  };
}

export interface PerformanceThreshold {
  metric: keyof PerformanceMetrics;
  max: number;
  warning: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThreshold[] = [
    { metric: 'memory', max: 1024 * 1024 * 1024, warning: 512 * 1024 * 1024 }, // 1GB max, 512MB warning
    { metric: 'cpu', max: 90, warning: 70 }, // 90% max, 70% warning
    { metric: 'render', max: 16.67, warning: 33.33 }, // 60fps max, 30fps warning
  ];
  private interval: NodeJS.Timeout | null = null;
  private onWarning: ((metric: string, value: number, threshold: number) => void) | null = null;

  constructor() {}

  start(intervalMs: number = 1000) {
    this.interval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  setWarningCallback(callback: (metric: string, value: number, threshold: number) => void) {
    this.onWarning = callback;
  }

  private collectMetrics() {
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      memory: this.getMemoryMetrics(),
      cpu: this.getCpuMetrics(),
      render: this.getRenderMetrics(),
      ipc: this.getIpcMetrics(),
    };

    this.metrics.push(metrics);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Check thresholds
    this.checkThresholds(metrics);
  }

  private getMemoryMetrics() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      return {
        used: mem.heapUsed,
        total: mem.heapTotal,
        percentage: (mem.heapUsed / mem.heapTotal) * 100,
      };
    }
    return { used: 0, total: 0, percentage: 0 };
  }

  private getCpuMetrics() {
    // Simplified CPU usage calculation
    return {
      usage: Math.random() * 100, // Placeholder
      cores: require('os').cpus().length,
    };
  }

  private getRenderMetrics() {
    // In a real implementation, this would measure actual frame times
    return {
      frameTime: 16.67, // 60fps
      fps: 60,
    };
  }

  private getIpcMetrics() {
    // In a real implementation, this would track actual IPC messages
    return {
      messagesPerSecond: 0,
      averageLatency: 0,
    };
  }

  private checkThresholds(metrics: PerformanceMetrics) {
    this.thresholds.forEach(threshold => {
      const value = this.getMetricValue(metrics, threshold.metric);
      if (value > threshold.warning && this.onWarning) {
        this.onWarning(threshold.metric, value, threshold.warning);
      }
    });
  }

  private getMetricValue(metrics: PerformanceMetrics, key: keyof PerformanceMetrics): number {
    switch (key) {
      case 'memory':
        return metrics.memory.used;
      case 'cpu':
        return metrics.cpu.usage;
      case 'render':
        return metrics.render.frameTime;
      case 'ipc':
        return metrics.ipc.messagesPerSecond;
      default:
        return 0;
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const sum = this.metrics.reduce(
      (acc, m) => ({
        memoryUsed: acc.memoryUsed + m.memory.used,
        cpuUsage: acc.cpuUsage + m.cpu.usage,
        renderFrameTime: acc.renderFrameTime + m.render.frameTime,
      }),
      { memoryUsed: 0, cpuUsage: 0, renderFrameTime: 0 }
    );

    const count = this.metrics.length;

    return {
      memory: {
        used: sum.memoryUsed / count,
        total: 0,
        percentage: 0,
      },
      cpu: {
        usage: sum.cpuUsage / count,
        cores: 0,
      },
      render: {
        frameTime: sum.renderFrameTime / count,
        fps: 0,
      },
    };
  }

  exportReport(): string {
    const latest = this.getLatestMetrics();
    const average = this.getAverageMetrics();

    return `
Performance Report
==================
Timestamp: ${new Date().toISOString()}

Latest Metrics:
- Memory: ${latest ? (latest.memory.used / 1024 / 1024).toFixed(2) : 0} MB
- CPU: ${latest ? latest.cpu.usage.toFixed(2) : 0}%
- Render: ${latest ? latest.render.fps : 0} FPS
- IPC: ${latest ? latest.ipc.messagesPerSecond : 0} msg/s

Average Metrics:
- Memory: ${average.memory ? ((average.memory as any).used / 1024 / 1024).toFixed(2) : 0} MB
- CPU: ${average.cpu ? (average.cpu as any).usage.toFixed(2) : 0}%
- Render: ${average.render ? (average.render as any).frameTime.toFixed(2) : 0} ms

Total Samples: ${this.metrics.length}
    `.trim();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();
