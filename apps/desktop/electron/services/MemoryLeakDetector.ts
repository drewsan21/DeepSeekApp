// ============================================================================
// Memory Leak Detector - Track and identify memory leaks
// ============================================================================

export interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

export interface MemoryLeakWarning {
  type: 'growth' | 'threshold' | 'pattern';
  message: string;
  severity: 'warning' | 'critical';
  snapshots: MemorySnapshot[];
}

export class MemoryLeakDetector {
  private snapshots: MemorySnapshot[] = [];
  private warnings: MemoryLeakWarning[] = [];
  private interval: NodeJS.Timeout | null = null;
  private maxSnapshots = 100;
  private growthThreshold = 1.2; // 20% growth threshold
  private absoluteThreshold = 500 * 1024 * 1024; // 500MB

  constructor() {}

  start(intervalMs: number = 5000) {
    this.takeSnapshot();
    
    this.interval = setInterval(() => {
      this.takeSnapshot();
      this.analyzeForLeaks();
    }, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  takeSnapshot(): MemorySnapshot {
    const mem = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
      rss: mem.rss,
      arrayBuffers: mem.arrayBuffers,
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  private analyzeForLeaks() {
    if (this.snapshots.length < 10) return; // Need enough data

    const recent = this.snapshots.slice(-10);
    const oldest = recent[0];
    const newest = recent[recent.length - 1];

    // Check for continuous growth
    const growth = newest.heapUsed / oldest.heapUsed;
    if (growth > this.growthThreshold) {
      this.addWarning({
        type: 'growth',
        message: `Memory grew by ${((growth - 1) * 100).toFixed(2)}% in recent snapshots`,
        severity: 'warning',
        snapshots: recent,
      });
    }

    // Check absolute threshold
    if (newest.heapUsed > this.absoluteThreshold) {
      this.addWarning({
        type: 'threshold',
        message: `Memory usage exceeded ${this.absoluteThreshold / 1024 / 1024}MB`,
        severity: 'critical',
        snapshots: recent,
      });
    }

    // Check for patterns (e.g., consistent increase)
    let increasing = 0;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].heapUsed > recent[i - 1].heapUsed) {
        increasing++;
      }
    }

    if (increasing >= recent.length * 0.8) {
      this.addWarning({
        type: 'pattern',
        message: 'Consistent memory growth pattern detected',
        severity: 'warning',
        snapshots: recent,
      });
    }
  }

  private addWarning(warning: MemoryLeakWarning) {
    // Avoid duplicate warnings
    const exists = this.warnings.some(
      w => w.type === warning.type && w.message === warning.message
    );

    if (!exists) {
      this.warnings.push(warning);
      console.warn(`[MemoryLeakDetector] ${warning.severity.toUpperCase()}: ${warning.message}`);
    }
  }

  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  getWarnings(): MemoryLeakWarning[] {
    return [...this.warnings];
  }

  getLatestSnapshot(): MemorySnapshot | null {
    return this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
  }

  getMemoryTrend(): {
    direction: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
  } {
    if (this.snapshots.length < 2) {
      return { direction: 'stable', percentage: 0 };
    }

    const first = this.snapshots[0].heapUsed;
    const last = this.snapshots[this.snapshots.length - 1].heapUsed;
    const change = ((last - first) / first) * 100;

    let direction: 'increasing' | 'decreasing' | 'stable';
    if (change > 5) direction = 'increasing';
    else if (change < -5) direction = 'decreasing';
    else direction = 'stable';

    return { direction, percentage: change };
  }

  exportReport(): string {
    const latest = this.getLatestSnapshot();
    const trend = this.getMemoryTrend();

    return `
Memory Leak Detection Report
=============================
Timestamp: ${new Date().toISOString()}

Current Memory Usage:
- Heap Used: ${latest ? (latest.heapUsed / 1024 / 1024).toFixed(2) : 0} MB
- Heap Total: ${latest ? (latest.heapTotal / 1024 / 1024).toFixed(2) : 0} MB
- External: ${latest ? (latest.external / 1024 / 1024).toFixed(2) : 0} MB
- RSS: ${latest ? (latest.rss / 1024 / 1024).toFixed(2) : 0} MB
- Array Buffers: ${latest ? (latest.arrayBuffers / 1024 / 1024).toFixed(2) : 0} MB

Memory Trend:
- Direction: ${trend.direction}
- Change: ${trend.percentage.toFixed(2)}%

Warnings: ${this.warnings.length}
${this.warnings.map(w => `- [${w.severity.toUpperCase()}] ${w.message}`).join('\n')}

Snapshots Collected: ${this.snapshots.length}
    `.trim();
  }

  reset() {
    this.snapshots = [];
    this.warnings = [];
  }
}

// Singleton instance
export const memoryLeakDetector = new MemoryLeakDetector();
