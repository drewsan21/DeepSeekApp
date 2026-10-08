// ============================================================================
// Memory Leak Detector - Track and detect memory leaks
// ============================================================================

export interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

export interface MemoryLeakReport {
  hasLeak: boolean;
  growthRate: number; // bytes per second
  duration: number; // seconds
  snapshots: MemorySnapshot[];
  recommendation: string;
}

export class MemoryLeakDetector {
  private snapshots: MemorySnapshot[] = [];
  private interval: NodeJS.Timeout | null = null;
  private readonly THRESHOLD_GROWTH_RATE = 1024 * 1024; // 1MB per second
  private readonly MIN_DURATION = 60; // 60 seconds minimum

  constructor() {}

  start(intervalMs: number = 1000) {
    this.snapshots = [];
    this.interval = setInterval(() => {
      this.takeSnapshot();
    }, intervalMs);
  }

  stop(): MemoryLeakReport {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    return this.analyze();
  }

  takeSnapshot() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      this.snapshots.push({
        timestamp: Date.now(),
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external,
        rss: mem.rss,
        arrayBuffers: mem.arrayBuffers,
      });
    }
  }

  analyze(): MemoryLeakReport {
    if (this.snapshots.length < 2) {
      return {
        hasLeak: false,
        growthRate: 0,
        duration: 0,
        snapshots: this.snapshots,
        recommendation: 'Not enough data to analyze',
      };
    }

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    const duration = (last.timestamp - first.timestamp) / 1000;

    if (duration < this.MIN_DURATION) {
      return {
        hasLeak: false,
        growthRate: 0,
        duration,
        snapshots: this.snapshots,
        recommendation: `Test duration too short (${duration}s). Need at least ${this.MIN_DURATION}s.`,
      };
    }

    const heapGrowth = last.heapUsed - first.heapUsed;
    const growthRate = heapGrowth / duration;

    const hasLeak = growthRate > this.THRESHOLD_GROWTH_RATE;

    let recommendation = 'No memory leak detected';
    if (hasLeak) {
      recommendation = `Memory leak detected! Growing at ${(growthRate / 1024 / 1024).toFixed(2)} MB/s`;
      
      // Check for common patterns
      if (last.arrayBuffers > first.arrayBuffers * 1.5) {
        recommendation += '\n- ArrayBuffer growth detected. Check for unclosed streams or buffers.';
      }
      if (last.external > first.external * 1.5) {
        recommendation += '\n- External memory growth detected. Check for native resources.';
      }
    }

    return {
      hasLeak,
      growthRate,
      duration,
      snapshots: this.snapshots,
      recommendation,
    };
  }

  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  exportReport(): string {
    const report = this.analyze();
    
    return `
Memory Leak Detection Report
=============================
Duration: ${report.duration.toFixed(2)}s
Snapshots: ${report.snapshots.length}

Memory Usage:
- Start: ${(report.snapshots[0]?.heapUsed / 1024 / 1024).toFixed(2)} MB
- End: ${(report.snapshots[report.snapshots.length - 1]?.heapUsed / 1024 / 1024).toFixed(2)} MB
- Growth: ${((report.snapshots[report.snapshots.length - 1]?.heapUsed - report.snapshots[0]?.heapUsed) / 1024 / 1024).toFixed(2)} MB

Growth Rate: ${(report.growthRate / 1024 / 1024).toFixed(4)} MB/s
Leak Detected: ${report.hasLeak ? 'YES ⚠️' : 'NO ✓'}

Recommendation:
${report.recommendation}
    `.trim();
  }
}

// Singleton instance
export const memoryLeakDetector = new MemoryLeakDetector();
