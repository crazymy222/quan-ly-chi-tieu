import { defineConfig } from 'eslint/config';
import next from '@qlct/eslint-config/next';


export default defineConfig([
  ...next,
  // Override...
  // {
  //   rules: { ... },
  // },
]);
