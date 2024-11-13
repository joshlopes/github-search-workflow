import axios, { AxiosInstance } from 'axios';
import { Repository, PullRequest, Organization, Config } from '../types';
import { readCache, writeCache } from '../utils/cache';

export class GitHubClient {
  private client: AxiosInstance;
  public config: Config;

  constructor(config: Partial<Config> = {}) {
    this.config = {
      host: 'api.github.com',
      accessToken: null,
      meAccount: '@me',
      prAllInvolveMe: false,
      cacheDir: null,
      cacheTtlSecRepo: 24 * 60 * 60,
      cacheTtlSecOrg: 24 * 60 * 60,
      cacheTtlSecPr: 5 * 60,
      ...config
    };

    this.client = axios.create({
      baseURL: `https://${this.config.host}`,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/vnd.github.v3+json',
        ...(this.config.accessToken && {
          'Authorization': `Bearer ${this.config.accessToken}`
        })
      }
    });
  }

  async searchRepos(query: string): Promise<Repository[]> {
    try {
      const modifiers = ['in:name'];
      const params = { q: `${query} ${modifiers.join(' ')}`, per_page: 10 };
      
      const response = await this.client.get('/search/repositories', { params });
      return response.data.items.map(this.mapRepository);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Authentication required. Please set up your GitHub token using gh-login');
      }
      throw error;
    }
  }

  async getUserRepos(): Promise<Repository[]> {
    try {
      const cacheKey = 'user_repos';
      const cached = await readCache<Repository[]>(cacheKey, this.config.cacheDir, this.config.cacheTtlSecRepo);
      
      if (cached) return cached;

      const params = {
        sort: 'pushed',
        direction: 'desc',
        per_page: 100
      };

      const response = await this.client.get('/user/repos', { params });
      const repos = response.data.map(this.mapRepository);
      
      await writeCache(cacheKey, repos, this.config.cacheDir);
      return repos;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Authentication required. Please set up your GitHub token using gh-login');
      }
      throw error;
    }
  }

  async getUserPulls(): Promise<PullRequest[]> {
    try {
      const cacheKey = 'user_pulls';
      const cached = await readCache<PullRequest[]>(cacheKey, this.config.cacheDir, this.config.cacheTtlSecPr);
      
      if (cached) return cached;

      const modifiers = [
        'is:pr',
        'state:open',
        `involves:${this.config.meAccount}`
      ];

      if (!this.config.prAllInvolveMe) {
        modifiers.push(`user:${this.config.meAccount}`);
        const orgs = await this.getUserOrgs();
        orgs.forEach(org => modifiers.push(`org:${org.login}`));
      }

      const params = {
        q: modifiers.join(' '),
        per_page: 100
      };

      const response = await this.client.get('/search/issues', { params });
      const pulls = response.data.items.map(this.mapPullRequest);
      
      await writeCache(cacheKey, pulls, this.config.cacheDir);
      return pulls;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Authentication required. Please set up your GitHub token using gh-login');
      }
      throw error;
    }
  }

  private async getUserOrgs(): Promise<Organization[]> {
    const cacheKey = 'user_orgs';
    const cached = await readCache<Organization[]>(cacheKey, this.config.cacheDir, this.config.cacheTtlSecOrg);
    
    if (cached) return cached;

    const response = await this.client.get('/user/orgs');
    const orgs = response.data;
    
    await writeCache(cacheKey, orgs, this.config.cacheDir);
    return orgs;
  }

  private mapRepository(item: any): Repository {
    return {
      id: item.id,
      name: item.name,
      fullName: item.full_name,
      htmlUrl: item.html_url,
      sshUrl: item.ssh_url,
      ownerAvatar: item.owner?.avatar_url
    };
  }

  private mapPullRequest(item: any): PullRequest {
    return {
      id: item.id,
      number: item.number,
      title: item.title,
      htmlUrl: item.html_url,
      avatarUrl: item.user?.avatar_url
    };
  }
}