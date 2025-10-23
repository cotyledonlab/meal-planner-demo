/**
 * Prisma configuration file
 * Replaces deprecated package.json#prisma configuration
 * https://www.prisma.io/docs/orm/reference/prisma-cli-reference#prisma-config
 */
import { defineConfig } from 'prisma/config';

export default defineConfig({
  seed: {
    command: 'tsx prisma/seed.ts',
  },
});
