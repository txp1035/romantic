import { defineConfig } from 'umi';

export default defineConfig({
  npmClient: 'pnpm',
  headScripts: [{ src: '/baidu.js', defer: true }],
  history: {
    type: 'browser',
  },
});
