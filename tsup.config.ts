import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  noExternal: ['dotenv', 'axios'],
  minify: true,
  bundle: true,
  platform: 'node',
  target: 'node18'
});