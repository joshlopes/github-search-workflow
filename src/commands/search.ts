import { Repository, AlfredItem } from '../types';
import { GitHubClient } from '../client/github';
import { downloadIcon } from '../utils/cache';

export class SearchCommand {
  private client: GitHubClient;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  async execute(args: string[]): Promise<AlfredItem[]> {
    const query = args.join(' ').trim();
    
    if (!query) {
      return [{
        title: 'Please enter a search term',
        subtitle: 'For example: vite, react, or typescript',
        arg: '',
        text: {
          copy: '',
          largetype: ''
        }
      }];
    }

    try {
      const repos = await this.client.searchRepos(query);
      
      if (repos.length === 0) {
        return [{
          title: 'No repositories found',
          subtitle: `No results for "${query}"`,
          arg: '',
          text: {
            copy: '',
            largetype: ''
          }
        }];
      }
      
      const items = await Promise.all(repos.map(repo => this.toAlfredItem(repo)));
      return items;
    } catch (error) {
      return [{
        title: 'Search failed',
        subtitle: error instanceof Error ? error.message : 'Please check your connection and try again',
        arg: '',
        text: {
          copy: '',
          largetype: ''
        }
      }];
    }
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