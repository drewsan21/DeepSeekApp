import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import type {
  ApprovalResponse,
  Harness,
  HarnessEvent,
  HarnessRequest
} from '@deepseek/shared';

export class DeepSeekHarnessAdapter extends EventEmitter implements Harness {
  private proc: ChildProcess | null = null;
  private buffer = '';

  async start() {
    if (this.proc) return;

    this.proc = spawn('deepseek-harness', ['--stdio'], {
      env: { ...process.env }
    });

    this.proc.stdout?.on('data', chunk => this.onData(chunk));
    this.proc.stderr?.on('data', chunk =>
      console.error(`[harness] ${chunk.toString()}`)
    );

    this.proc.on('exit', code => {
      this.proc = null;
      this.emit('exit', code);
    });
  }

  async stop() {
    this.proc?.kill('SIGTERM');
    this.proc = null;
  }

  async status() {
    return this.proc ? 'running' : 'stopped';
  }

  async respondApproval(id: string, response: ApprovalResponse) {
    this.proc?.stdin?.write(
      JSON.stringify({ type: 'approval_response', id, ...response }) + '\n'
    );
  }

  async stream(request: HarnessRequest): Promise<AsyncIterable<HarnessEvent>> {
    if (!this.proc) await this.start();

    this.proc?.stdin?.write(JSON.stringify(request) + '\n');

    return {
      [Symbol.asyncIterator]: () => {
        const queue: HarnessEvent[] = [];
        let resolve: ((v: IteratorResult<HarnessEvent>) => void) | null = null;
        let done = false;

        const onEvent = (event: HarnessEvent) => {
          if (resolve) {
            resolve({ value: event, done: false });
            resolve = null;
          } else {
            queue.push(event);
          }

          if (event.type === 'completed' || event.type === 'error') {
            done = true;
            this.removeListener('event', onEvent);
          }
        };

        this.on('event', onEvent);

        return {
          next: () => {
            if (queue.length) {
              return Promise.resolve({ value: queue.shift()!, done: false });
            }

            if (done) {
              return Promise.resolve({ value: undefined, done: true });
            }

            return new Promise(r => (resolve = r));
          },
          return: () => {
            this.removeListener('event', onEvent);
            return Promise.resolve({ value: undefined, done: true });
          }
        };
      }
    };
  }

  private onData(chunk: Buffer) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const event = JSON.parse(line) as HarnessEvent;
        this.emit('event', event);
      } catch {
        console.error('Invalid harness output:', line);
      }
    }
  }
}
