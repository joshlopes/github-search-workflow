import { describe, it, expect } from '@jest/globals';
import { UserPullsCommand } from '../user-pulls';
import { GitHubClient } from '../../client/github';

describe('UserPullsCommand', () => {
  it('includes open pulls link when no query provided', async () => {
    const client = new GitHubClient();
    jest.spyOn(client, 'getUserPulls').mockResolvedValue([]);

    const command = new UserPullsCommand(client, 'github.com');
    const result = await command.execute([]);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Open your Pull Requests page...');
  });

  it('returns pull requests', async () => {
    const mockPull = {
      id: 1,
      number: 123,
      title: 'Test PR',
      htmlUrl: 'https://github.com/user/repo/pull/123',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4'
    };

    const client = new GitHubClient();
    jest.spyOn(client, 'getUserPulls').mockResolvedValue([mockPull]);

    const command = new UserPullsCommand(client, 'github.com');
    const result = await command.execute(['test']);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test PR');
    expect(result[0].arg).toBe('https://github.com/user/repo/pull/123');
  });
});