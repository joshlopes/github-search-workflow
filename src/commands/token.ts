import { AlfredItem } from '../types';
import { writeFileSync } from 'fs';
import { join } from 'path';

export class TokenCommand {
  async execute(args: string[]): Promise<AlfredItem[]> {
    const token = args[0];

    if (!token) {
      return [{
        title: 'Please provide a GitHub token',
        subtitle: 'Usage: gh-login <token>',
        arg: '',
        text: {
          copy: '',
          largetype: ''
        }
      }];
    }

    try {
      // Update .env file with the new token
      const envPath = join(process.cwd(), '.env');
      const envContent = `GITHUB_API_HOST=api.github.com
GITHUB_HOST=github.com
GITHUB_ACCESS_TOKEN=${token}
GITHUB_ME_ACCOUNT=@me

PR_ALL_INVOLVE_ME=false

ALFRED_WORKFLOW_CACHE=.cache
CACHE_TTL_SEC_REPO=86400
CACHE_TTL_SEC_ORG=86400
CACHE_TTL_SEC_PR=300`;

      writeFileSync(envPath, envContent);

      return [{
        title: 'GitHub token saved successfully',
        subtitle: 'You can now use the workflow commands',
        arg: '',
        text: {
          copy: '',
          largetype: ''
        }
      }];
    } catch (error) {
      return [{
        title: 'Failed to save token',
        subtitle: error instanceof Error ? error.message : 'Unknown error occurred',
        arg: '',
        text: {
          copy: '',
          largetype: ''
        }
      }];
    }
  }
}