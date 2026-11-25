import { createHash } from "node:crypto";

export interface SyncRecord {
  id: string;
  data: Record<string, unknown>;
}

export class IdempotencyTracker {
  private readonly stateMap = new Map<string, string>();

  public static computeFingerprint(payload: Record<string, unknown>): string {
    const canonicalJson = JSON.stringify(payload, Object.keys(payload).sort());
    return createHash("sha256").update(canonicalJson).digest("hex");
  }

  public hasChanged(recordId: string, payload: Record<string, unknown>): boolean {
    const newHash = IdempotencyTracker.computeFingerprint(payload);
    const existingHash = this.stateMap.get(recordId);

    if (existingHash === newHash) {
      return false;
    }

    this.stateMap.set(recordId, newHash);
    return true;
  }

  public filterChangedRecords(records: SyncRecord[]): SyncRecord[] {
    return records.filter((r) => this.hasChanged(r.id, r.data));
  }

  public clear(): void {
    this.stateMap.clear();
  }

  public size(): number {
    return this.stateMap.size;
  }
}
