/**
 * Vitest setup file. Extends global `expect` with @testing-library/jest-dom matchers
 * so component tests can use `toBeInTheDocument`, `toHaveClass`, `toHaveTextContent`, etc.
 *
 * Auto-loaded via test.setupFiles in vitest.config.ts.
 */
import '@testing-library/jest-dom/vitest';
