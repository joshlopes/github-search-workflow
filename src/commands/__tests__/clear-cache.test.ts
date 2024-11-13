import { describe, it, expect } from '@jest/globals';
import { ClearCacheCommand } from '../clear-cache';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

describe('ClearCacheCommand', () => {
  const cacheDir = join(process.cwd(), '.cache');
  const testFile = join(cacheDir, 'test.txt');

  beforeEach(() => {
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(testFile, 'test data');
  });

  it('clears cache directory', async () => {
    expect(existsSync(cacheDir)).toBe(true);
    
    const command = new ClearCacheCommand();
    const result = await command.execute();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Cache cleared successfully');
    expect(existsSync(cacheDir)).toBe(false);
  });
});