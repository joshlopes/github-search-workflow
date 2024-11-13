import { existsSync, mkdirSync, readFileSync, writeFileSync, createWriteStream, statSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

export async function readCache<T>(
  key: string, 
  cacheDir: string | null, 
  ttlSeconds: number
): Promise<T | null> {
  if (!cacheDir) return null;

  const cachePath = join(cacheDir, key);
  
  try {
    if (!existsSync(cachePath)) {
      return null;
    }

    const stats = statSync(cachePath);
    const age = (Date.now() - stats.mtimeMs) / 1000;
    
    if (age >= ttlSeconds) {
      return null;
    }

    const data = readFileSync(cachePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function writeCache<T>(
  key: string, 
  data: T, 
  cacheDir: string | null
): Promise<void> {
  if (!cacheDir) return;

  try {
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    const cachePath = join(cacheDir, key);
    writeFileSync(cachePath, JSON.stringify(data));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

export async function downloadIcon(
  url: string,
  cacheDir: string | null
): Promise<string | undefined> {
  if (!cacheDir || !url) return undefined;

  try {
    const iconDir = join(cacheDir, 'icons');
    if (!existsSync(iconDir)) {
      mkdirSync(iconDir, { recursive: true });
    }

    // Create a filename from the URL
    const filename = `${Buffer.from(url).toString('base64').replace(/[/+=]/g, '_')}.png`;
    const iconPath = join(iconDir, filename);

    // If icon exists and is less than 24 hours old, use cached version
    if (existsSync(iconPath)) {
      const stats = statSync(iconPath);
      const age = (Date.now() - stats.mtimeMs) / 1000;
      if (age < 86400) {
        return iconPath;
      }
    }

    // Download the icon
    const response = await axios({
      url,
      responseType: 'stream',
      timeout: 5000
    });

    const writer = createWriteStream(iconPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(iconPath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Icon download error:', error);
    return undefined;
  }
}