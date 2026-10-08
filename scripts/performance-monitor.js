#!/usr/bin/env node

/**
 * Performance Monitor Integration
 * Integrates PerformanceMonitor with actual app metrics
 */

const { PerformanceObserver, performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

class PerformanceMonitorIntegration {
  constructor() {
    this.metrics = {
      startup: [],
      ipc: [],
      render: [],
      memory: [],
      cpu: []
    };
    
    this.observers = [];
    this.logFile = path.join(__dirname, '..', 'benchmarks', 'performance.log');
    
    // Ensure benchmarks directory exists
    const benchmarksDir = path.join(__dirname, '..', 'benchmarks');
    if (!fs.existsSync(benchmarksDir)) {
      fs.mkdirSync(benchmarksDir, { recursive: true });
    }
  }

  /**
   * Start monitoring
   */
  start() {
    console.log('[PerformanceMonitor] Starting monitoring...\n');
    
    // Monitor function calls
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric(entry.name, entry.duration);
      }
    });
    
    observer.observe({ entryTypes: ['measure', 'function'] });
    this.observers.push(observer);
    
    // Monitor memory usage
    this.startMemoryMonitoring();
    
    // Monitor CPU usage
    this.startCPUMonitoring();
    
    console.log('[PerformanceMonitor] Monitoring started\n');
  }

  /**
   * Stop monitoring
   */
  stop() {
    console.log('\n[PerformanceMonitor] Stopping monitoring...');
    
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    this.saveMetrics();
    
    console.log('[PerformanceMonitor] Monitoring stopped\n');
  }

  /**
   * Record a metric
   */
  recordMetric(name, duration) {
    const category = this.categorizeMetric(name);
    
    if (!this.metrics[category]) {
      this.metrics[category] = [];
    }
    
    this.metrics[category].push({
      name,
      duration,
      timestamp: Date.now()
    });
    
    // Log to file
    this.logMetric(name, duration, category);
  }

  /**
   * Categorize metric by name
   */
  categorizeMetric(name) {
    if (name.includes('startup') || name.includes('init')) return 'startup';
    if (name.includes('ipc') || name.includes('message')) return 'ipc';
    if (name.includes('render') || name.includes('component')) return 'render';
    if (name.includes('memory')) return 'memory';
    if (name.includes('cpu')) return 'cpu';
    return 'other';
  }

  /**
   * Log metric to file
   */
  logMetric(name, duration, category) {
    const logEntry = `${new Date().toISOString()} | ${category.padEnd(10)} | ${name.padEnd(30)} | ${duration.toFixed(3)} ms\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring() {
    const interval = setInterval(() => {
      const memUsage = process.memoryUsage();
      
      this.metrics.memory.push({
        timestamp: Date.now(),
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        rss: memUsage.rss,
        external: memUsage.external
      });
      
      // Keep only last 100 measurements
      if (this.metrics.memory.length > 100) {
        this.metrics.memory.shift();
      }
    }, 1000);
    
    this.observers.push({ disconnect: () => clearInterval(interval) });
  }

  /**
   * Start CPU monitoring
   */
  startCPUMonitoring() {
    let lastCpuUsage = process.cpuUsage();
    let lastTime = Date.now();
    
    const interval = setInterval(() => {
      const cpuUsage = process.cpuUsage(lastCpuUsage);
      const currentTime = Date.now();
      const elapsedTime = (currentTime - lastTime) * 1000; // Convert to microseconds
      
      const userPercent = (cpuUsage.user / elapsedTime) * 100;
      const systemPercent = (cpuUsage.system / elapsedTime) * 100;
      const totalPercent = userPercent + systemPercent;
      
      this.metrics.cpu.push({
        timestamp: currentTime,
        user: userPercent,
        system: systemPercent,
        total: totalPercent
      });
      
      lastCpuUsage = process.cpuUsage();
      lastTime = currentTime;
      
      // Keep only last 100 measurements
      if (this.metrics.cpu.length > 100) {
        this.metrics.cpu.shift();
      }
    }, 1000);
    
    this.observers.push({ disconnect: () => clearInterval(interval) });
  }

  /**
   * Save metrics to file
   */
  saveMetrics() {
    const metricsFile = path.join(__dirname, '..', 'benchmarks', 'metrics.json');
    fs.writeFileSync(metricsFile, JSON.stringify(this.metrics, null, 2));
    console.log(`[PerformanceMonitor] Metrics saved to: ${metricsFile}\n`);
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const summary = {};
    
    Object.entries(this.metrics).forEach(([category, entries]) => {
      if (entries.length === 0) return;
      
      if (category === 'memory') {
        const latest = entries[entries.length - 1];
        summary[category] = {
          heapUsed: latest.heapUsed,
          heapTotal: latest.heapTotal,
          rss: latest.rss,
          external: latest.external,
          samples: entries.length
        };
      } else if (category === 'cpu') {
        const avgCpu = entries.reduce((sum, e) => sum + e.total, 0) / entries.length;
        summary[category] = {
          avg: avgCpu,
          max: Math.max(...entries.map(e => e.total)),
          samples: entries.length
        };
      } else {
        const durations = entries.map(e => e.duration);
        summary[category] = {
          avg: durations.reduce((a, b) => a + b, 0) / durations.length,
          min: Math.min(...durations),
          max: Math.max(...durations),
          p95: this.percentile(durations, 95),
          p99: this.percentile(durations, 99),
          samples: entries.length
        };
      }
    });
    
    return summary;
  }

  /**
   * Calculate percentile
   */
  percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = lower + 1;
    const fraction = index - lower;
    
    if (upper >= sorted.length) {
      return sorted[lower];
    }
    
    return sorted[lower] + (sorted[upper] - sorted[lower]) * fraction;
  }

  /**
   * Print summary
   */
  printSummary() {
    const summary = this.getSummary();
    
    console.log('\n========================================');
    console.log('  Performance Summary');
    console.log('========================================\n');
    
    Object.entries(summary).forEach(([category, data]) => {
      console.log(`${category.toUpperCase()}:`);
      
      if (category === 'memory') {
        console.log(`  Heap Used: ${(data.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Heap Total: ${(data.heapTotal / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  RSS: ${(data.rss / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  External: ${(data.external / 1024 / 1024).toFixed(2)} MB`);
      } else if (category === 'cpu') {
        console.log(`  Average: ${data.avg.toFixed(2)}%`);
        console.log(`  Maximum: ${data.max.toFixed(2)}%`);
      } else {
        console.log(`  Average: ${data.avg.toFixed(3)} ms`);
        console.log(`  Min: ${data.min.toFixed(3)} ms`);
        console.log(`  Max: ${data.max.toFixed(3)} ms`);
        console.log(`  P95: ${data.p95.toFixed(3)} ms`);
        console.log(`  P99: ${data.p99.toFixed(3)} ms`);
      }
      
      console.log(`  Samples: ${data.samples}`);
      console.log('');
    });
  }
}

// Export for use in other modules
module.exports = PerformanceMonitorIntegration;

// Run if called directly
if (require.main === module) {
  const monitor = new PerformanceMonitorIntegration();
  
  console.log('\n========================================');
  console.log('  Performance Monitor Integration');
  console.log('========================================\n');
  
  monitor.start();
  
  // Run for 10 seconds
  setTimeout(() => {
    monitor.stop();
    monitor.printSummary();
    process.exit(0);
  }, 10000);
}
