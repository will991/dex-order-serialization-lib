import { Freeable } from './types';

/**
 * A scope to ease the management of objects that require manual resource management.
 *
 */
export class ManagedFreeableScope {
  private scopeStack: Freeable[] = [];
  private disposed = false;

  /**
   * Objects passed to this method will then be managed by the instance.
   *
   * @param freeable An object with a free function, or undefined. This makes it suitable for wrapping functions that
   * may or may not return a value, to minimise the implementation logic.
   * @returns The freeable object passed in, which can be undefined.
   */
  public manage<T extends Freeable | undefined>(freeable: T): T {
    if (freeable === undefined) return freeable;
    if (this.disposed) throw new Error('This scope is already disposed.');
    this.scopeStack.push(freeable);
    return freeable;
  }

  /**
   * Once the freeable objects being managed are no longer being accessed, call this method.
   */
  public dispose(): void {
    if (this.disposed) return;
    for (const resource of this.scopeStack) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((resource as any)?.ptr === 0 || !resource?.free) {
        continue;
      }

      resource?.free();
    }
    this.disposed = true;
  }
}
