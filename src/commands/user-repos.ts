import { Repository, AlfredItem } from '../types';
import { GitHubClient } from '../client/github';
import { downloadIcon } from '../utils/cache';

export class UserReposCommand {
  private client: GitHubClient;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  async execute(args: string[]): Promise<AlfredItem[]> {
    const query = args.join(' ').trim();
    
    try {
      const repos = await this.client.getUserRepos();
      
      if (repos.length === 0) {
        return [{
          title: 'No repositories found',
          subtitle: 'You don\'t have any repositories or there might be an authentication issue',
          arg: '',
          text: {
            copy: '',
            largetype: ''
          }
        }];
      }

      const filtered = query 
        ? this.filterRepos(repos, query)
        : repos;

      if (filtered.length === 0) {
        return [{
          title: 'No matching repositories found',
          subtitle: `No repositories match "${query}"`,
          arg: '',
          text: {
            copy: '',
            largetype: ''
          }
        }];
      }

      const items = await Promise.all(filtered.map(repo => this.toAlfredItem(repo)));
      return items;
    } catch (error) {
      return [{
        title: 'Failed to fetch repositories',
        subtitle: error instanceof Error ? error.message : 'Please check your authentication and try again',
        arg: '',
        text: {
          copy: '',
          largetype: ''
        }
      }];
    }
  }

  private filterRepos(repos: Repository[], query: string): Repository[] {
    const filter = new RegExp(query.split('').join('.*'), 'i');
    return repos.filter(repo => 
      filter.test(repo.name) || 
      filter.test(repo.fullName)
    );
  }

  private async toAlfredItem(repo: Repository): Promise<AlfredItem> {
    const iconPath = repo.ownerAvatar 
      ? await downloadIcon(repo.ownerAvatar, this.client.config.cacheDir)
      : undefined;

    return {
      title: repo.fullName,
      subtitle: repo.htmlUrl,
      arg: repo.htmlUrl,
      text: {
        copy: repo.sshUrl,
        largetype: repo.fullName
      },
      icon: iconPath ? {
        path: iconPath
      } : undefined
    };
  }
}