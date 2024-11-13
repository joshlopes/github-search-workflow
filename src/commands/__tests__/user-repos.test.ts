import { describe, it, expect } from '@jest/globals';
import { UserReposCommand } from '../user-repos';
import { GitHubClient } from '../../client/github';

describe('UserReposCommand', () => {
  it('returns all user repos when no query provided', async () => {
    const mockRepo = {
      id: 1,
      name: 'test-repo',
      fullName: 'user/test-repo',
      htmlUrl: 'https://github.com/user/test-repo',
      sshUrl: 'git@github.com:user/test-repo.git',
      ownerAvatar: 'https://avatars.githubusercontent.com/u/1?v=4'
    };

    const client = new GitHubClient();
    jest.spyOn(client, 'getUserRepos').mockResolvedValue([mockRepo]);

    const command = new UserReposCommand(client);
    const result = await command.execute([]);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('user/test-repo');
  });

  it('filters repositories by query', async () => {
    const mockRepos = [
      {
        id: 1,
        name: 'test-repo',
        fullName: 'user/test-repo',
        htmlUrl: 'https://github.com/user/test-repo',
        sshUrl: 'git@github.com:user/test-repo.git',
        ownerAvatar: 'https://avatars.githubusercontent.com/u/1?v=4'
      },
      {
        id: 2,
        name: 'other-repo',
        fullName: 'user/other-repo',
        htmlUrl: 'https://github.com/user/other-repo',
        sshUrl: 'git@github.com:user/other-repo.git',
        ownerAvatar: 'https://avatars.githubusercontent.com/u/1?v=4'
      }
    ];

    const client = new GitHubClient();
    jest.spyOn(client, 'getUserRepos').mockResolvedValue(mockRepos);

    const command = new UserReposCommand(client);
    const result = await command.execute(['test']);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('user/test-repo');
  });

  it('handles empty results gracefully', async () => {
    const client = new GitHubClient();
    jest.spyOn(client, 'getUserRepos').mockResolvedValue([]);

    const command = new UserReposCommand(client);
    const result = await command.execute([]);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('No repositories found');
  });

  it('handles errors gracefully', async () => {
    const client = new GitHubClient();
    jest.spyOn(client, 'getUserRepos').mockRejectedValue(new Error('API error'));

    const command = new UserReposCommand(client);
    const result = await command.execute([]);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Failed to fetch repositories');
  });
});