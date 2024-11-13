import { AlfredItem } from '../types';

export class HelpCommand {
  async execute(): Promise<AlfredItem[]> {
    return [
      {
        title: 'search <query>',
        subtitle: 'Search GitHub repositories (e.g., search vite, search react stars:>1000)',
        arg: '',
        text: {
          copy: 'github-workflow search',
          largetype: 'Search GitHub repositories'
        }
      },
      {
        title: 'user-repos [query]',
        subtitle: 'Search your repositories (optional query to filter results)',
        arg: '',
        text: {
          copy: 'github-workflow user-repos',
          largetype: 'Search your repositories'
        }
      },
      {
        title: 'user-pulls [query]',
        subtitle: 'Search your pull requests (optional query to filter results)',
        arg: '',
        text: {
          copy: 'github-workflow user-pulls',
          largetype: 'Search your pull requests'
        }
      },
      {
        title: 'clear-cache',
        subtitle: 'Clear the local cache (icons and API responses)',
        arg: '',
        text: {
          copy: 'github-workflow clear-cache',
          largetype: 'Clear local cache'
        }
      },
      {
        title: 'help',
        subtitle: 'Show this help message',
        arg: '',
        text: {
          copy: 'github-workflow help',
          largetype: 'Show help message'
        }
      }
    ];
  }
}