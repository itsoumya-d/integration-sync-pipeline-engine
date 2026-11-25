export class GracefulShutdownManager {
  private isShuttingDown = false;
  private inFlightTasks = 0;
  private readonly drainTimeoutMs: number;

  constructor(drainTimeoutMs: number = 5000) {
    this.drainTimeoutMs = drainTimeoutMs;
  }

  public registerTask(): boolean {
    if (this.isShuttingDown) {
      return false;
    }
    this.inFlightTasks++;
    return true;
  }

  public completeTask(): void {
    if (this.inFlightTasks > 0) {
      this.inFlightTasks--;
    }
  }

  public getInFlightTaskCount(): number {
    return this.inFlightTasks;
  }

  public isTerminating(): boolean {
    return this.isShuttingDown;
  }

  public async initiateShutdown(): Promise<boolean> {
    this.isShuttingDown = true;
    const start = Date.now();

    while (this.inFlightTasks > 0) {
      if (Date.now() - start >= this.drainTimeoutMs) {
        return false; // Timeout elapsed before tasks drained
      }
      await new Promise((res) => setTimeout(res, 50));
    }

    return true; // Drained successfully
  }
}
