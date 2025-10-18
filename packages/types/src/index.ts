// Shared type definitions for the meal planner application
// This package is intended for types used across multiple apps/packages

export type AppEnvironment = "development" | "production" | "test";

export interface DatabaseConfig {
  url: string;
  poolSize?: number;
}

// Export placeholder to ensure this package can be imported
export const VERSION = "0.1.0";
