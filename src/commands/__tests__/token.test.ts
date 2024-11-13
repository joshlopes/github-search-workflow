import { describe, it, expect } from '@jest/globals';
import { TokenCommand } from '../token';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('TokenCommand', () => {
  const envPath = join(process.cwd(), '.env');

  afterEach(() => {
    if (existsSync(envPath)) {
      unlinkSync(envPath);
    }
  });

  it('prompts for token when none provided', async () => {
    const command = new TokenCommand();
    const result = await command.execute([]);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Please provide a GitHub token');
  });

  it('saves token to .env file', async () => {
    const command = new TokenCommand();
    const token = 'test-token-123';
    const result = await command.execute([token]);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('GitHub token saved successfully');
    
    expect(existsSync(envPath)).toBe(true);
    const envContent = readFileSync(envPath, 'utf-8');
    expect(envContent).toContain(`GITHUB_ACCESS_TOKEN=${token}`);
  });
});