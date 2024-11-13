import { describe, it, expect } from '@jest/globals';
import { SearchCommand } from '../search';
import { GitHubClient } from '../../client/github';

describe('SearchCommand', () => {
  it('returns help message for empty query', async () => {
    const client = new GitHubClient();
    const command = new SearchCommand(client);
    
    const result = await command.execute([]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Please enter a search term');
  });

  it('returns repositories for valid search', async () => {
    const mockRepo = {
      id: 1,
      name: 'test-repo',
      fullName: 'user/test-repo',
      htmlUrl: 'https://github.com/user/test-repo',
      sshUrl: 'git@github.com:user/test-repo.git',
      ownerAvatar: 'https://avatars.githubusercontent.com/u/1?v=4'
    };

    const client = new GitHubClient();
    jest.spyOn(client, 'searchRepos').mockResolvedValue([mockRepo]);

    const command = new SearchCommand(client);
    const result = await command.execute(['test']);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('user/test-repo');
    expect(result[0].arg).toBe('https://github.com/user/test-repo');
  });

  it('handles search errors gracefully', async () => {
    const client = new GitHubClient();
    jest.spyOn(client, 'searchRepos').mockRejectedValue(new Error('API error'));

    const command = new SearchCommand(client);
    const result = await command.execute(['test']);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Search failed');
  });
});