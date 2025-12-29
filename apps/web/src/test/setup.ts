// Skip env validation in tests to avoid server-side env var access errors
process.env.SKIP_ENV_VALIDATION = 'true';

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});
