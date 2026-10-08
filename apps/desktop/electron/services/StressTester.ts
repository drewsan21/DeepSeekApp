// ============================================================================
// Stress Test Suite - Load testing and stress scenarios
// ============================================================================

import { EventEmitter } from 'events';

export interface StressTestResult {
  testName: string;
  duration: number;
  operationsPerSecond: number;
  errorRate: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  success: boolean;
}

export class StressTester extends EventEmitter {
  private results: StressTestResult[] = [];

  constructor() {
    super();
  }

  async runAllTests(): Promise<StressTestResult[]> {
    this.results = [];

    // Run all stress tests
    await this.testConcurrentTabs(50);
    await this.testToolExecution(100);
    await this.testLargeFileOperations();
    await this.testMultipleMCPServers(10);
    await this.testComplexHarnessTasks(20);

    return this.results;
  }

  async testConcurrentTabs(count: number): Promise<StressTestResult> {
    const testName = `Concurrent Tabs (${count})`;
    const startTime = Date.now();
    const latencies: number[] = [];
    let errors = 0;

    try {
      // Simulate creating multiple tabs concurrently
      const promises = Array.from({ length: count }, async (_, i) => {
        const opStart = Date.now();
        try {
          // Simulate tab creation
          await this.simulateTabCreation(`https://example${i}.com`);
          latencies.push(Date.now() - opStart);
        } catch (error) {
          errors++;
        }
      });

      await Promise.all(promises);

      const duration = (Date.now() - startTime) / 1000;
      const result: StressTestResult = {
        testName,
        duration,
        operationsPerSecond: count / duration,
        errorRate: errors / count,
        avgLatency: this.average(latencies),
        p95Latency: this.percentile(latencies, 95),
        p99Latency: this.percentile(latencies, 99),
        success: errors === 0,
      };

      this.results.push(result);
      this.emit('test-complete', result);
      return result;
    } catch (error) {
      const result: StressTestResult = {
        testName,
        duration: (Date.now() - startTime) / 1000,
        operationsPerSecond: 0,
        errorRate: 1,
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        success: false,
      };
      this.results.push(result);
      return result;
    }
  }

  async testToolExecution(count: number): Promise<StressTestResult> {
    const testName = `Tool Execution (${count} ops/min)`;
    const startTime = Date.now();
    const latencies: number[] = [];
    let errors = 0;

    try {
      // Simulate rapid tool execution
      for (let i = 0; i < count; i++) {
        const opStart = Date.now();
        try {
          await this.simulateToolExecution();
          latencies.push(Date.now() - opStart);
        } catch (error) {
          errors++;
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      const result: StressTestResult = {
        testName,
        duration,
        operationsPerSecond: count / duration,
        errorRate: errors / count,
        avgLatency: this.average(latencies),
        p95Latency: this.percentile(latencies, 95),
        p99Latency: this.percentile(latencies, 99),
        success: errors === 0,
      };

      this.results.push(result);
      this.emit('test-complete', result);
      return result;
    } catch (error) {
      const result: StressTestResult = {
        testName,
        duration: (Date.now() - startTime) / 1000,
        operationsPerSecond: 0,
        errorRate: 1,
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        success: false,
      };
      this.results.push(result);
      return result;
    }
  }

  async testLargeFileOperations(): Promise<StressTestResult> {
    const testName = 'Large File Operations (100MB+)';
    const startTime = Date.now();
    const latencies: number[] = [];
    let errors = 0;

    try {
      // Simulate large file operations
      for (let i = 0; i < 10; i++) {
        const opStart = Date.now();
        try {
          await this.simulateLargeFileOperation(100 * 1024 * 1024); // 100MB
          latencies.push(Date.now() - opStart);
        } catch (error) {
          errors++;
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      const result: StressTestResult = {
        testName,
        duration,
        operationsPerSecond: 10 / duration,
        errorRate: errors / 10,
        avgLatency: this.average(latencies),
        p95Latency: this.percentile(latencies, 95),
        p99Latency: this.percentile(latencies, 99),
        success: errors === 0,
      };

      this.results.push(result);
      this.emit('test-complete', result);
      return result;
    } catch (error) {
      const result: StressTestResult = {
        testName,
        duration: (Date.now() - startTime) / 1000,
        operationsPerSecond: 0,
        errorRate: 1,
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        success: false,
      };
      this.results.push(result);
      return result;
    }
  }

  async testMultipleMCPServers(count: number): Promise<StressTestResult> {
    const testName = `Multiple MCP Servers (${count})`;
    const startTime = Date.now();
    const latencies: number[] = [];
    let errors = 0;

    try {
      // Simulate starting multiple MCP servers
      const promises = Array.from({ length: count }, async (_, i) => {
        const opStart = Date.now();
        try {
          await this.simulateMCPServerStart(`server-${i}`);
          latencies.push(Date.now() - opStart);
        } catch (error) {
          errors++;
        }
      });

      await Promise.all(promises);

      const duration = (Date.now() - startTime) / 1000;
      const result: StressTestResult = {
        testName,
        duration,
        operationsPerSecond: count / duration,
        errorRate: errors / count,
        avgLatency: this.average(latencies),
        p95Latency: this.percentile(latencies, 95),
        p99Latency: this.percentile(latencies, 99),
        success: errors === 0,
      };

      this.results.push(result);
      this.emit('test-complete', result);
      return result;
    } catch (error) {
      const result: StressTestResult = {
        testName,
        duration: (Date.now() - startTime) / 1000,
        operationsPerSecond: 0,
        errorRate: 1,
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        success: false,
      };
      this.results.push(result);
      return result;
    }
  }

  async testComplexHarnessTasks(count: number): Promise<StressTestResult> {
    const testName = `Complex Harness Tasks (${count})`;
    const startTime = Date.now();
    const latencies: number[] = [];
    let errors = 0;

    try {
      // Simulate complex harness tasks
      for (let i = 0; i < count; i++) {
        const opStart = Date.now();
        try {
          await this.simulateComplexHarnessTask();
          latencies.push(Date.now() - opStart);
        } catch (error) {
          errors++;
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      const result: StressTestResult = {
        testName,
        duration,
        operationsPerSecond: count / duration,
        errorRate: errors / count,
        avgLatency: this.average(latencies),
        p95Latency: this.percentile(latencies, 95),
        p99Latency: this.percentile(latencies, 99),
        success: errors === 0,
      };

      this.results.push(result);
      this.emit('test-complete', result);
      return result;
    } catch (error) {
      const result: StressTestResult = {
        testName,
        duration: (Date.now() - startTime) / 1000,
        operationsPerSecond: 0,
        errorRate: 1,
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        success: false,
      };
      this.results.push(result);
      return result;
    }
  }

  // Simulation methods (placeholders for actual implementations)
  private async simulateTabCreation(url: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
  }

  private async simulateToolExecution(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 50));
  }

  private async simulateLargeFileOperation(size: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  }

  private async simulateMCPServerStart(serverId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  }

  private async simulateComplexHarnessTask(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  }

  // Utility methods
  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }

  getResults(): StressTestResult[] {
    return [...this.results];
  }

  exportReport(): string {
    const report = this.results.map(result => `
Test: ${result.testName}
Duration: ${result.duration.toFixed(2)}s
Operations/sec: ${result.operationsPerSecond.toFixed(2)}
Error Rate: ${(result.errorRate * 100).toFixed(2)}%
Avg Latency: ${result.avgLatency.toFixed(2)}ms
P95 Latency: ${result.p95Latency.toFixed(2)}ms
P99 Latency: ${result.p99Latency.toFixed(2)}ms
Status: ${result.success ? '✓ PASS' : '✗ FAIL'}
`).join('\n---\n');

    return `
Stress Test Report
==================
Total Tests: ${this.results.length}
Passed: ${this.results.filter(r => r.success).length}
Failed: ${this.results.filter(r => !r.success).length}

${report}
    `.trim();
  }
}

// Singleton instance
export const stressTester = new StressTester();
