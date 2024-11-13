export interface Repository {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  sshUrl: string;
  ownerAvatar: string;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  htmlUrl: string;
  avatarUrl: string;
}

export interface Organization {
  login: string;
  id: number;
  url: string;
}

export interface AlfredItem {
  title: string;
  subtitle: string;
  arg: string;
  text: {
    copy: string;
    largetype: string;
  };
  icon?: {
    type?: 'fileicon' | 'filetype' | 'url';
    path: string;
  };
}

export interface Config {
  host: string;
  accessToken: string | null;
  meAccount: string;
  prAllInvolveMe: boolean;
  cacheDir: string | null;
  cacheTtlSecRepo: number;
  cacheTtlSecOrg: number;
  cacheTtlSecPr: number;
}