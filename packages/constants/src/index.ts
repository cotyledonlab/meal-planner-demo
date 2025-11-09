// Shared constants for the meal planner application

export const APP_NAME = "MealMind AI";
export const APP_VERSION = "0.1.0";

// Database constants
export const DEFAULT_DB_POOL_SIZE = 10;
export const DB_CONNECTION_TIMEOUT = 5000;

// Placeholder export
export const CONSTANTS_VERSION = "0.1.0";

export const VALID_MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

// Titles containing any of these keywords should almost never be classified as breakfast
export const SUSPICIOUS_BREAKFAST_KEYWORDS = [
  "curry",
  "stew",
  "roast",
  "pasta",
  "bolognese",
  "chili",
] as const;

export type PlanTier = "basic" | "premium";

type PlanMetadata = {
  id: PlanTier;
  name: string;
  badge?: string;
  price: string;
  period?: string;
  description: string;
  spotlight: string;
  features: readonly string[];
};

export const PLAN_METADATA: Record<PlanTier, PlanMetadata> = {
  premium: {
    id: "premium",
    name: "Premium",
    badge: "Most Popular",
    price: "€4.99",
    period: "/month",
    description: "For families who want to save time and money",
    spotlight:
      "Advanced plan settings, 7-day plans, and supermarket comparisons.",
    features: [
      "Everything in Free",
      "Best value supermarket finder",
      "Advanced customisation",
      "Multiple meal plans",
      "Priority support",
      "Export and share plans",
    ],
  },
  basic: {
    id: "basic",
    name: "Free Tier",
    price: "€0",
    description: "Perfect for getting started with meal planning",
    spotlight: "Weekly recipes, shopping lists, and core dietary filters.",
    features: [
      "Weekly meal-prep recipes",
      "Automatic shopping list",
      "Basic dietary preferences",
      "Email support",
    ],
  },
} as const;

export const PLAN_DISPLAY_ORDER: PlanTier[] = ["premium", "basic"];
