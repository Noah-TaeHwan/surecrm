#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';

const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
);

console.log(`📦 Current version: v${packageJson.version}`);
console.log(
  `🚀 Next push will bump to: v${packageJson.version
    .split('.')
    .map((v: string, i: number) => (i === 2 ? String(Number(v) + 1) : v))
    .join('.')}`
);
