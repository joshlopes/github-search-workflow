import { AlfredItem } from '../types';
import { rmSync } from 'fs';
import { join } from 'path';

export class ClearCacheCommand {
  async execute(): Promise<AlfredItem[]> {
    try {
      const cacheDir = join(process.cwd(), '.cache');
      rmSync(cacheDir, { recursive: true, force: true });

      return [{
        title: 'Cache cleared successfully',
        subtitle: 'All cached data has been removed',
        arg: '',
        text: {
          copy: '',
          largetype: ''
        }
      }];
    } catch (error) {
      return [{
        title: 'Failed to clear cache',
        subtitle: error instanceof Error ? error.message : 'Unknown error occurred',
        arg: '',
        text: {
          copy: '',
          largetype: ''
        }
      }];
    }
  }
}