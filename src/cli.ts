#!/usr/bin/env node
require('dotenv').config();

const { GitHubClient } = require('./client/github');
const { SearchCommand } = require('./commands/search');
const { UserReposCommand } = require('./commands/user-repos');
const { UserPullsCommand } = require('./commands/user-pulls');
const { HelpCommand } = require('./commands/help');
const { TokenCommand } = require('./commands/token');
const { ClearCacheCommand } = require('./commands/clear-cache');

interface Commands {
  search: InstanceType<typeof SearchCommand>;
  'user-repos': InstanceType<typeof UserReposCommand>;
  'user-pulls': InstanceType<typeof UserPullsCommand>;
  help: InstanceType<typeof HelpCommand>;
  token: InstanceType<typeof TokenCommand>;
  'clear-cache': InstanceType<typeof ClearCacheCommand>;
}

const client = new GitHubClient({
  host: process.env.GITHUB_API_HOST,
  accessToken: process.env.GITHUB_ACCESS_TOKEN,
  meAccount: process.env.GITHUB_ME_ACCOUNT,
  prAllInvolveMe: process.env.PR_ALL_INVOLVE_ME === 'true',
  cacheDir: process.env.ALFRED_WORKFLOW_CACHE,
  cacheTtlSecRepo: parseInt(process.env.CACHE_TTL_SEC_REPO || '86400'),
  cacheTtlSecOrg: parseInt(process.env.CACHE_TTL_SEC_ORG || '86400'),
  cacheTtlSecPr: parseInt(process.env.CACHE_TTL_SEC_PR || '300')
});

const commands: Commands = {
  search: new SearchCommand(client),
  'user-repos': new UserReposCommand(client),
  'user-pulls': new UserPullsCommand(client, process.env.GITHUB_HOST || 'github.com'),
  help: new HelpCommand(),
  token: new TokenCommand(),
  'clear-cache': new ClearCacheCommand()
};

type CommandKey = keyof Commands;

async function main() {
  const [command, ...args] = process.argv.slice(2);

  // If no command is provided or help is requested, show help
  if (!command || command === 'help') {
    const result = await commands.help.execute();
    console.log(JSON.stringify({ items: result }));
    if (!command) {
      process.exit(1);
    }
    return;
  }

  if (!(command in commands)) {
    console.error('Unknown command:', command);
    console.error('Run "github-workflow help" to see available commands');
    process.exit(1);
  }

  try {
    const result = await commands[command as CommandKey].execute(args);
    console.log(JSON.stringify({ items: result }));
  } catch (error) {
    console.error('Error executing command:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});