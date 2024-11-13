import { PullRequest, AlfredItem } from '../types';
import { GitHubClient } from '../client/github';
import { downloadIcon } from '../utils/cache';

export class UserPullsCommand {
  private client: GitHubClient;
  private webHost: string;

  constructor(client: GitHubClient, webHost: string) {
    this.client = client;
    this.webHost = webHost;
  }

  async execute(args: string[]): Promise<AlfredItem[]> {
    const query = args.join(' ').trim();
    
    try {
      const pulls = await this.client.getUserPulls();
      const items: AlfredItem[] = [];
      
      // Always add the "Open PRs" link first when no query
      if (!query) {
        items.push(this.createOpenPullsItem());
      }

      // If there are no PRs and we have a query, show "no results" message
      if (pulls.length === 0 && query) {
        return [{
          title: 'No pull requests found',
          subtitle: 'You don\'t have any open pull requests',
          arg: '',
          text: {
            copy: '',
            largetype: ''
          }
        }];
      }

      const filtered = query 
        ? this.filterPulls(pulls, query)
        : pulls;

      if (filtered.length === 0 && query) {
        return [{
          title: 'No matching pull requests found',
          subtitle: `No pull requests match "${query}"`,
          arg: '',
          text: {
            copy: '',
            largetype: ''
          }
        }];
      }

      const pullItems = await Promise.all(filtered.map(pull => this.toAlfredItem(pull)));
      return [...items, ...pullItems];
    } catch (error) {
      return [{
        title: 'Failed to fetch pull requests',
        subtitle: error instanceof Error ? error.message : 'Please check your authentication and try again',
        arg: '',
        text: {
          copy: '',
          largetype: ''
        }
      }];
    }
  }

  private filterPulls(pulls: PullRequest[], query: string): PullRequest[] {
    const filter = new RegExp(query.split('').join('.*'), 'i');
    return pulls.filter(pull => 
      filter.test(pull.title) || 
      filter.test(pull.htmlUrl)
    );
  }

  private createOpenPullsItem(): AlfredItem {
    const url = `https://${this.webHost}/pulls`;
    return {
      title: 'Open your Pull Requests page...',
      subtitle: url,
      arg: url,
      text: {
        copy: url,
        largetype: url
      }
    };
  }

  private async toAlfredItem(pull: PullRequest): Promise<AlfredItem> {
    const iconPath = pull.avatarUrl 
      ? await downloadIcon(pull.avatarUrl, this.client.config.cacheDir)
      : undefined;

    return {
      title: pull.title,
      subtitle: pull.htmlUrl,
      arg: pull.htmlUrl,
      text: {
        copy: pull.htmlUrl,
        largetype: pull.title
      },
      icon: iconPath ? {
        path: iconPath
      } : undefined
    };
  }
}