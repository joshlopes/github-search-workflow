import { describe, it, expect } from '@jest/globals';
import { HelpCommand } from '../help';

describe('HelpCommand', () => {
  it('returns all available commands', async () => {
    const command = new HelpCommand();
    const result = await command.execute();
    
    expect(result).toHaveLength(4);
    expect(result.map(item => item.title)).toEqual([
      'search <query>',
      'user-repos [query]',
      'user-pulls [query]',
      'help'
    ]);
  });
});