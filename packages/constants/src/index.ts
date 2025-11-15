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

// Pricing and tier information
export const PRICING = {
  FREE: {
    name: "Free Tier",
    price: "€0",
    description: "Perfect for getting started with meal planning",
    features: [
      "Weekly meal-prep recipes",
      "Automatic shopping list",
      "Basic dietary preferences",
      "Email support",
    ],
  },
  PREMIUM: {
    name: "Premium",
    price: "€4.99",
    period: "/month",
    description: "For families who want to save time and money",
    features: [
      "Everything in Free",
      "Best value supermarket finder",
      "Advanced customisation",
      "Multiple meal plans",
      "Priority support",
      "Export and share plans",
    ],
  },
} as const;
